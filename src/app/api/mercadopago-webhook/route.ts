import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { mpPayment } from "@/lib/mercadopago";

/**
 * Webhook de pagamento do Mercado Pago.
 *
 * Isso é o que torna o pedido "de verdade": o pagamento só é confirmado
 * quando o Mercado Pago chama esta rota (o redirect do cliente para a
 * página de sucesso NÃO é confiável por si só — o usuário pode fechar a
 * aba antes de voltar, ou o navegador pode falhar no redirect).
 *
 * Configurar a URL desta rota (https://SEU_DOMINIO/api/mercadopago-webhook)
 * no painel do Mercado Pago > Suas integrações > Webhooks, e copiar a
 * "Assinatura secreta" gerada lá para MP_WEBHOOK_SECRET no .env — sem
 * isso, qualquer pessoa poderia forjar uma notificação de "pago".
 */
function isValidSignature(req: NextRequest, dataId: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    console.warn(
      "[webhook] MP_WEBHOOK_SECRET não configurado — pulando validação de assinatura. NÃO use assim em produção."
    );
    return true;
  }

  const signatureHeader = req.headers.get("x-signature");
  const requestId = req.headers.get("x-request-id");
  if (!signatureHeader || !requestId) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k?.trim(), v?.trim()];
    })
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const topic = url.searchParams.get("type") ?? url.searchParams.get("topic");
  const dataId = url.searchParams.get("data.id") ?? url.searchParams.get("id");

  // Sempre responde 200 rápido para notificações que não são de pagamento
  // (o Mercado Pago também manda outros tipos de evento) — evitar retry
  // desnecessário.
  if (topic !== "payment" || !dataId) {
    return NextResponse.json({ received: true });
  }

  if (!isValidSignature(req, dataId)) {
    console.error("[webhook] Assinatura inválida — notificação ignorada");
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
  }

  try {
    const payment = await mpPayment.get({ id: dataId });
    const orderId = payment.external_reference;
    if (!orderId) {
      return NextResponse.json({ received: true });
    }

    const status =
      payment.status === "approved"
        ? "PAID"
        : payment.status === "rejected"
        ? "FAILED"
        : payment.status === "cancelled"
        ? "CANCELLED"
        : "PENDING";

    await prisma.order.update({
      where: { id: orderId },
      data: { status, mpPaymentId: String(payment.id) },
    });

    // Próximo passo natural aqui (fora do escopo do MVP): disparar
    // e-mail/WhatsApp de confirmação para o cliente quando status vira PAID.
  } catch (err) {
    console.error("[webhook] Erro ao processar notificação de pagamento", err);
    // Retorna 200 mesmo assim para não entrar num loop infinito de retry
    // do Mercado Pago por um erro que provavelmente é nosso, não deles.
    // O ideal em produção é also alertar (Sentry) quando isso acontecer.
  }

  return NextResponse.json({ received: true });
}
