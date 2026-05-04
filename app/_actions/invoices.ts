"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { invoiceInputSchema, type InvoiceInput } from "@/lib/schemas";
import { generateInvoiceNumber } from "@/lib/invoice-number";

export type CreateInvoiceResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function createInvoiceAction(
  input: InvoiceInput,
): Promise<CreateInvoiceResult> {
  const parsed = invoiceInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }
  const data = parsed.data;

  const items = data.items.map((it) => ({
    fishId: it.fishId,
    weightKg: it.weightKg,
    pricePerKg: it.pricePerKg,
    subtotal: it.weightKg * it.pricePerKg,
  }));
  const grossTotal = items.reduce((s, it) => s + it.subtotal, 0);
  const totalDeductions = data.deductions.reduce((s, d) => s + d.amount, 0);
  const grandTotal = grossTotal - totalDeductions;

  let id: string | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const created = await prisma.$transaction(async (tx) => {
        const invoiceNumber = await generateInvoiceNumber(tx);
        return tx.invoice.create({
          data: {
            invoiceNumber,
            grossTotal,
            totalDeductions,
            grandTotal,
            items: { create: items },
            deductions: {
              create: data.deductions.map((d) => ({
                description: d.description,
                amount: d.amount,
              })),
            },
          },
          select: { id: true },
        });
      });
      id = created.id;
      break;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002" &&
        attempt < 2
      ) {
        continue;
      }
      return { ok: false, error: "Failed to create invoice" };
    }
  }

  if (!id) return { ok: false, error: "Failed to create invoice" };

  revalidatePath("/invoices");
  revalidatePath("/");
  redirect(`/invoices/${id}`);
}
