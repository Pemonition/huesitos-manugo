import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Busca o produto ativo principal para a landing page.
 *
 * Hoje existe 1 produto só, então pegamos "o primeiro ativo". Quando
 * entrar um segundo produto, o natural é trocar isso por uma página de
 * catálogo (`/produtos`) e uma página por produto (`/produtos/[slug]`) —
 * a modelagem do banco (ver prisma/schema.prisma) já está pronta para
 * isso, só falta a UI.
 */
export async function getFeaturedProduct() {
  return prisma.product.findFirst({
    where: { active: true },
    orderBy: { createdAt: "asc" },
  });
}

export { formatCentsToBRL } from "@/lib/format";
