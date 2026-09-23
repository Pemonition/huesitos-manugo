export function Footer() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  return (
    <footer className="border-t border-amber-200 bg-amber-50 py-8 text-sm text-amber-900">
      <div className="mx-auto max-w-5xl px-4 flex flex-col gap-2">
        <p>Huesitos Manugo — petiscos artesanais para cachorro.</p>
        {whatsapp && (
          <p>
            Fale conosco no WhatsApp:{" "}
            <a
              className="underline"
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {whatsapp}
            </a>
          </p>
        )}
        <p className="text-xs text-amber-700">
          Ao comprar, seus dados (nome, contato, endereço) são usados apenas para
          processar seu pedido e entrega — não compartilhamos com terceiros
          além do necessário para pagamento (Mercado Pago) e envio.
        </p>
      </div>
    </footer>
  );
}
