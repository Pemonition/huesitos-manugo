import "server-only";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Padrão recomendado pela própria Prisma para Next.js: evita criar uma
// nova conexão com o banco a cada hot-reload em desenvolvimento, o que
// rapidamente esgota o limite de conexões do Postgres.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL não está definida. Configure-a no .env (veja .env.example)."
    );
  }

  // Prisma 7 não conecta mais sozinho a partir da URL: é preciso passar um
  // "driver adapter" explícito. Para Postgres (Supabase/Neon/RDS/etc.) é o
  // @prisma/adapter-pg, que usa o driver "pg" (node-postgres) por baixo.
  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
