# Huesitos Manugo

MVP de e-commerce para o primeiro produto: ossinhos de roer para cachorro
(farinha frita em banha). Suporta venda em unidade (checkout direto via
Mercado Pago) e pedido de orçamento para revenda/atacado (captura o lead e
direciona para o WhatsApp).

## Stack

- **Next.js 16** (App Router, TypeScript) — frontend + rotas de API no mesmo projeto
- **PostgreSQL + Prisma 7** — catálogo, pedidos e leads de atacado
- **Mercado Pago (Checkout Pro)** — Pix, cartão e boleto; nenhum dado de cartão passa pelo nosso servidor
- **Tailwind CSS** — estilo
- **Vercel** (sugerido) para deploy + **Supabase** ou **Neon** (sugerido) para o Postgres

## Por que esse Prisma parece diferente do que você talvez conheça

Este projeto usa **Prisma 7**, que mudou bastante desde versões anteriores:
não existe mais `url` dentro de `datasource` no `schema.prisma`, o cliente
gerado fica em `src/generated/prisma` (não em `node_modules/@prisma/client`),
e o `PrismaClient` exige um **driver adapter** explícito (`@prisma/adapter-pg`
para Postgres) em vez de conectar sozinho a partir da `DATABASE_URL`. Isso já
está todo configurado — veja `prisma/schema.prisma`, `prisma7.config.ts` e
`src/lib/prisma.ts` — só é bom saber para não estranhar.

## Rodando localmente

1. **Instalar dependências**

   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente**

   ```bash
   cp .env.example .env
   ```

   Preencha `DATABASE_URL` (um Postgres — pode ser local, Supabase ou Neon),
   `MP_ACCESS_TOKEN` e `MP_WEBHOOK_SECRET` (Mercado Pago — comece com as
   credenciais de **teste** para não mexer com dinheiro real enquanto
   desenvolve), `SITE_URL` e `NEXT_PUBLIC_WHATSAPP_NUMBER`.

3. **Criar as tabelas no banco**

   ```bash
   npm run db:migrate
   ```

4. **Cadastrar o produto inicial**

   ```bash
   npm run db:seed
   ```

   Isso cria o "Huesito Tradicional" com um preço de exemplo (R$ 12,90) —
   edite `prisma/seed.ts` com o preço real antes de rodar, ou ajuste depois
   direto no banco com `npm run db:studio`.

5. **Rodar em desenvolvimento**

   ```bash
   npm run dev
   ```

   Acesse http://localhost:3000.

## Testando o pagamento antes de ir para produção

Use as [credenciais de teste do Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/your-integrations/test/credentials)
e os [cartões de teste](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/your-integrations/test/cards)
deles para simular uma compra completa sem mexer em dinheiro real. Só troque
`MP_ACCESS_TOKEN` pelas credenciais de produção quando estiver tudo validado.

## Configurando o webhook de pagamento

O pedido só é marcado como "pago" (`PAID`) quando o Mercado Pago chama
`/api/mercadopago-webhook` — o redirecionamento do cliente de volta ao site
não é suficiente por si só (ele pode fechar a aba antes). No painel do
Mercado Pago: **Suas integrações > (sua aplicação) > Webhooks**, cadastre
`https://SEU_DOMINIO/api/mercadopago-webhook` e copie a "Assinatura secreta"
para `MP_WEBHOOK_SECRET` no `.env`. Sem isso configurado em produção,
qualquer pessoa poderia forjar uma notificação de pagamento aprovado.

## Deploy (sugestão)

1. Suba o projeto num repositório no GitHub.
2. Crie um banco Postgres gerenciado — [Supabase](https://supabase.com) ou
   [Neon](https://neon.tech) têm tier gratuito suficiente para começar.
3. Importe o repositório na [Vercel](https://vercel.com) e configure as
   mesmas variáveis de ambiente do `.env` (com os valores de produção) em
   **Project Settings > Environment Variables**.
4. Depois do primeiro deploy, rode as migrations contra o banco de produção:
   `npx prisma migrate deploy` (com `DATABASE_URL` de produção no ambiente).
5. Registre um domínio (ex: `.com.br` via [registro.br](https://registro.br))
   e aponte para a Vercel.
6. Configure o webhook do Mercado Pago com a URL final de produção (passo
   acima).

## O que fica de fora deste MVP de propósito

Estas decisões foram tomadas para lançar rápido sem travar em coisas que só
importam quando houver volume real — revisitar quando fizer sentido:

- **Preço de atacado não é self-service.** O formulário de revenda captura o
  lead (nome, quantidade, contato) e direciona para WhatsApp — o preço é
  negociado manualmente. Automatizar faixas de desconto por quantidade é um
  próximo passo natural quando houver dado real de quanto pedido de atacado
  chega.
- **Sem painel de admin.** Editar produto/preço hoje é via
  `npm run db:studio` (abre uma interface visual do banco) ou direto no
  banco. Um painel próprio (mesmo que simples) é o próximo passo quando
  entrar um segundo produto.
- **Sem cálculo de frete automático** (Correios/Melhor Envio) — o endereço é
  capturado no pedido, mas o frete ainda não entra na conta do checkout.
- **Sem emissão automática de nota fiscal** — pode ser plugado depois via
  algum parceiro (ex: NFE.io, Focus NFe) sem mudar a arquitetura.
- **Sem conta de cliente/login.** Cada compra é avulsa; não há histórico de
  pedidos por cliente ainda.
