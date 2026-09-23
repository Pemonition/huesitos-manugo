import "server-only";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

// O Access Token nunca deve ir para o frontend — fica só em variável de
// ambiente do servidor. A chave pública (NEXT_PUBLIC_MP_PUBLIC_KEY) é a
// única que pode ser exposta ao navegador, e nem é usada neste fluxo
// porque estamos com Checkout Pro (redirecionamento), que já é a opção
// mais simples e segura para começar: o Mercado Pago hospeda a página
// de pagamento, então nenhum dado de cartão passa pelo nosso servidor —
// isso tira de nós a responsabilidade de compliance PCI.
const accessToken = process.env.MP_ACCESS_TOKEN;

if (!accessToken && process.env.NODE_ENV !== "test") {
  // Não derruba o build (o Next também executa este arquivo em build time),
  // mas avisa alto no log de runtime se alguém esquecer de configurar.
  console.warn(
    "[mercadopago] MP_ACCESS_TOKEN não está definido. Configure o .env antes de aceitar pagamentos reais."
  );
}

export const mpClient = new MercadoPagoConfig({
  accessToken: accessToken ?? "",
});

export const mpPreference = new Preference(mpClient);
export const mpPayment = new Payment(mpClient);
