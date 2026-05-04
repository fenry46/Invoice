import type { Prisma } from "@prisma/client";

export function dayBounds(d: Date = new Date()): { start: Date; end: Date; ymd: string } {
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const ymd =
    start.getFullYear().toString() +
    String(start.getMonth() + 1).padStart(2, "0") +
    String(start.getDate()).padStart(2, "0");
  return { start, end, ymd };
}

export async function generateInvoiceNumber(
  tx: Prisma.TransactionClient,
  now: Date = new Date(),
): Promise<string> {
  const { start, end, ymd } = dayBounds(now);
  const count = await tx.invoice.count({
    where: { createdAt: { gte: start, lt: end } },
  });
  const seq = String(count + 1).padStart(4, "0");
  return `INV-${ymd}-${seq}`;
}
