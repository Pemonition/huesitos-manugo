/**
 * Popula o produto inicial. Rodar com `npm run db:seed` depois de
 * `npm run db:migrate` (ou sempre que quiser resetar o catálogo de teste).
 *
 * Editar preço/descrição aqui é só para o começo — o objetivo é que, assim
 * que houver um painel de admin (fora do escopo deste MVP), isso passe a
 * ser editado por lá, sem precisar mexer em código.
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const product = await prisma.product.upsert({
    where: { slug: "huesito-tradicional" },
    update: {},
    create: {
      slug: "huesito-tradicional",
      name: "Huesito Tradicional",
      description:
        "Ossinho de roer para cachorro, feito de farinha e frito em banha. Sem conservantes artificiais — receita caseira, produção artesanal.",
      retailPriceCents: 1290, // R$ 12,90 — ajuste para o preço real
      wholesaleMinQty: 20,
      active: true,
    },
  });

  console.log("Produto seedado:", product.slug, "-", product.name);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
