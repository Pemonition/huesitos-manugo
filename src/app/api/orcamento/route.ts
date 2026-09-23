import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Pedido de orçamento de atacado/revenda. Não envolve pagamento — só
// captura o lead. O contato de verdade acontece pelo WhatsApp (ver
// WholesaleForm.tsx), isso aqui é o registro para o time não perder o
// lead se o cliente não seguir para o WhatsApp na hora.
const quoteSchema = z.object({
  name: z.string().min(2),
  companyName: z.string().optional(),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal("")),
  city: z.string().optional(),
  quantity: z.coerce.number().int().min(1).max(100000),
  message: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = quoteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const quote = await prisma.wholesaleQuote.create({
    data: {
      name: data.name,
      companyName: data.companyName || null,
      phone: data.phone,
      email: data.email || null,
      city: data.city || null,
      quantity: data.quantity,
      message: data.message || null,
    },
  });

  return NextResponse.json({ id: quote.id });
}
