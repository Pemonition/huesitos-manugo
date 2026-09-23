// Config do Prisma CLI (migrate, studio, etc.) — separado da instância do
// PrismaClient usada pela aplicação (ver src/lib/prisma.ts). O nome
// "prisma7.config.ts" (com o número da versão) é a convenção desta versão
// do Prisma, não um erro de digitação.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
