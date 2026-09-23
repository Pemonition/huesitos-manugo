// Módulo separado (sem nenhuma dependência de servidor/Prisma) para poder
// ser importado com segurança tanto por Server quanto por Client Components.
// Misturar isso dentro de products.ts fazia o bundler do Next levar o
// Prisma/driver do Postgres (que usa APIs só de Node) para o bundle do
// navegador e quebrar o build — ver histórico se isso for reintroduzido.
export function formatCentsToBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
