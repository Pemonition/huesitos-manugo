import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { mpPreference } from "@/lib/mercadopago";

// Validação de entrada. Nunca confiamos em dado vindo do cliente sem
// validar — especialmente aqui, onde ele influencia um valor de cobrança.
const checkoutSchema = z.object({
  productSlug: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(500),
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(8),
  addressStreet: z.string().min(2),
  addressNumber: z.string().min(1),
  addressComplement: z.string().optional(),
  addressCity: z.string().min(2),
  addressState: z.string().length(2),
  addressZip: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const product = await prisma.product.findUnique({
    where: { slug: data.productSlug, active: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }

  // O preço vem SEMPRE do banco, nunca do que o cliente mandar — do
  // contrário qualquer pessoa poderia editar o valor no navegador antes
  // de enviar o pedido.
  const totalCents = product.retailPriceCents * data.quantity;

  const order = await prisma.order.create({
    data: {
      productId: product.id,
      quantity: data.quantity,
      totalCents,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      addressStreet: data.addressStreet,
      addressNumber: data.addressNumber,
      addressComplement: data.addressComplement,
      addressCity: data.addressCity,
      addressState: data.addressState,
      addressZip: data.addressZip,
      status: "PENDING",
    },
  });

  const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

  try {
    const preference = await mpPreference.create({
      body: {
        items: [
          {
            id: product.id,
            title: product.name,
            quantity: data.quantity,
            unit_price: product.retailPriceCents / 100,
            currency_id: "BRL",
          },
        ],
        payer: {
          name: data.customerName,
          email: data.customerEmail,
          phone: { number: data.customerPhone },
        },
        external_reference: order.id,
        back_urls: {
          success: `${siteUrl}/obrigado?order=${order.id}`,
          pending: `${siteUrl}/obrigado?order=${order.id}`,
          failure: `${siteUrl}/?checkout=falhou`,
        },
        auto_return: "approved",
        notification_url: `${siteUrl}/api/mercadopago-webhook`,
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { mpPreferenceId: preference.id },
    });

    return NextResponse.json({ checkoutUrl: preference.init_point });
  } catch (err) {
    console.error("[checkout] Falha ao criar preferência no Mercado Pago", err);
    // Marca o pedido como falho em vez de deixar órfão em PENDING para sempre.
    await prisma.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
    return NextResponse.json(
      { error: "Não foi possível iniciar o pagamento. Tente novamente em instantes." },
      { status: 502 }
    );
  }
}
