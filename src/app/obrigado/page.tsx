import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { formatCentsToBRL } from "@/lib/format";

export default async function ObrigadoPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;

  const order = orderId
    ? await prisma.order.findUnique({
        where: { id: orderId },
        include: { product: true },
      })
    : null;

  return (
    <>
      <Header />
      <main className="mx-auto flex-1 max-w-2xl px-4 py-16 text-center">
        {!order ? (
          <>
            <h1 className="text-2xl font-bold text-amber-950">Pedido não encontrado</h1>
            <p className="mt-2 text-amber-800">
              Não encontramos os detalhes desse pedido. Se você já pagou, pode nos
              chamar no WhatsApp que confirmamos por lá.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-amber-950">
              {order.status === "PAID" ? "Pagamento confirmado! 🎉" : "Pedido recebido"}
            </h1>
            <p className="mt-2 text-amber-800">
              {order.status === "PAID"
                ? "Já recebemos a confirmação do pagamento. Vamos preparar seu pedido."
                : "Assim que o pagamento for confirmado pelo Mercado Pago, você recebe a confirmação."}
            </p>
            <div className="mt-6 rounded-xl border border-amber-200 bg-white p-5 text-left">
              <p>
                <strong>Produto:</strong> {order.product.name}
              </p>
              <p>
                <strong>Quantidade:</strong> {order.quantity}
              </p>
              <p>
                <strong>Total:</strong> {formatCentsToBRL(order.totalCents)}
              </p>
              <p>
                <strong>Status:</strong> {order.status}
              </p>
            </div>
          </>
        )}
        <Link href="/" className="mt-8 inline-block text-amber-800 underline">
          Voltar para a loja
        </Link>
      </main>
      <Footer />
    </>
  );
}
