import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BoneIcon } from "@/components/BoneIcon";
import { BuyForm } from "@/components/BuyForm";
import { WholesaleForm } from "@/components/WholesaleForm";
import { getFeaturedProduct, formatCentsToBRL } from "@/lib/products";

// Renderiza sempre no momento da requisição (não pré-gera em build): preço
// e disponibilidade vêm direto do banco, então um deploy nunca vai exibir
// um preço desatualizado. Para 1 produto isso é rápido; se o catálogo
// crescer bastante, trocar por `revalidate` (ISR) é uma otimização futura
// simples — não muda a estrutura da página.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const product = await getFeaturedProduct();

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-4 py-16 text-center">
          <BoneIcon className="mx-auto h-16 w-32" />
          <h1 className="mt-6 text-4xl font-bold text-amber-950 sm:text-5xl">
            Huesitos Manugo
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-amber-800">
            Ossinhos de roer para cachorro, feitos de farinha e fritos em banha.
            Receita artesanal, do jeito que seu cachorro merece.
          </p>
        </section>

        {!product ? (
          <section className="mx-auto max-w-2xl px-4 pb-16">
            <div className="rounded-xl border border-dashed border-amber-300 bg-white p-6 text-center text-amber-800">
              Nenhum produto cadastrado ainda. Rode{" "}
              <code className="rounded bg-amber-100 px-1">npm run db:seed</code> para
              cadastrar o Huesito Tradicional, ou cadastre um produto direto no banco.
            </div>
          </section>
        ) : (
          <>
            <section id="comprar" className="mx-auto max-w-2xl px-4 pb-16 scroll-mt-20">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-semibold text-amber-950">{product.name}</h2>
                <p className="mt-2 text-amber-800">{product.description}</p>
                <p className="mt-3 text-2xl font-bold text-amber-900">
                  {formatCentsToBRL(product.retailPriceCents)}{" "}
                  <span className="text-base font-normal text-amber-700">/ unidade</span>
                </p>
              </div>
              <BuyForm
                productSlug={product.slug}
                productName={product.name}
                unitPriceCents={product.retailPriceCents}
              />
            </section>

            <section id="revenda" className="mx-auto max-w-2xl px-4 pb-20 scroll-mt-20">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-semibold text-amber-950">
                  Compra em grande quantidade?
                </h2>
                <p className="mt-2 text-amber-800">
                  Para pedidos a partir de {product.wholesaleMinQty} unidades, fazemos
                  um preço especial de revenda.
                </p>
              </div>
              <WholesaleForm />
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
