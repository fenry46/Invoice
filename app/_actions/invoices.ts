"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { invoiceInputSchema, type InvoiceInput } from "@/lib/schemas";
import { generateInvoiceNumber } from "@/lib/invoice-number";

export type CreateInvoiceResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

/** Thrown inside a transaction when a referenced fish/customer isn't owned by
 *  the current user. Distinct from P2002 so the create retry loop won't retry it. */
class OwnershipError extends Error {}

/** Verifies every referenced fishId and the customerId belong to `userId`.
 *  Prevents a user from referencing another user's master data by id. */
async function assertRefsOwned(
  tx: Prisma.TransactionClient,
  userId: string,
  customerId: string,
  fishIds: string[],
): Promise<void> {
  const uniqueFishIds = [...new Set(fishIds)];
  const ownedFish = await tx.fish.count({
    where: { id: { in: uniqueFishIds }, userId },
  });
  if (ownedFish !== uniqueFishIds.length) throw new OwnershipError();

  const customer = await tx.customer.findFirst({
    where: { id: customerId, userId },
    select: { id: true },
  });
  if (!customer) throw new OwnershipError();
}

export async function createInvoiceAction(
  input: InvoiceInput,
): Promise<CreateInvoiceResult> {
  const userId = await requireUserId();
  const parsed = invoiceInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Masukan tidak valid",
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
        await assertRefsOwned(
          tx,
          userId,
          data.customerId,
          items.map((it) => it.fishId),
        );
        const invoiceNumber = await generateInvoiceNumber(tx, userId);
        return tx.invoice.create({
          data: {
            invoiceNumber,
            userId,
            grossTotal,
            totalDeductions,
            grandTotal,
            customerId: data.customerId,
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
      if (e instanceof OwnershipError) {
        return { ok: false, error: "Ikan atau pelanggan tidak valid" };
      }
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002" &&
        attempt < 2
      ) {
        continue;
      }
      return { ok: false, error: "Gagal membuat faktur" };
    }
  }

  if (!id) return { ok: false, error: "Failed to create invoice" };

  revalidatePath("/invoices");
  revalidatePath("/");
  redirect(`/invoices/${id}`);
}

export type UpdateInvoiceResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function updateInvoiceAction(
  id: string,
  input: InvoiceInput,
): Promise<UpdateInvoiceResult> {
  const userId = await requireUserId();
  if (!id) return { ok: false, error: "ID faktur tidak ada" };

  const parsed = invoiceInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Masukan tidak valid",
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

  try {
    await prisma.$transaction(async (tx) => {
      // Confirm the invoice belongs to this user before touching it.
      const owned = await tx.invoice.findFirst({
        where: { id, userId },
        select: { id: true },
      });
      if (!owned) {
        throw new Prisma.PrismaClientKnownRequestError("Not found", {
          code: "P2025",
          clientVersion: Prisma.prismaVersion.client,
        });
      }
      await assertRefsOwned(
        tx,
        userId,
        data.customerId,
        items.map((it) => it.fishId),
      );
      await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
      await tx.deduction.deleteMany({ where: { invoiceId: id } });
      await tx.invoice.update({
        where: { id },
        data: {
          grossTotal,
          totalDeductions,
          grandTotal,
          customerId: data.customerId,
          items: { create: items },
          deductions: {
            create: data.deductions.map((d) => ({
              description: d.description,
              amount: d.amount,
            })),
          },
        },
      });
    });
  } catch (e) {
    if (e instanceof OwnershipError) {
      return { ok: false, error: "Ikan atau pelanggan tidak valid" };
    }
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2025"
    ) {
      return { ok: false, error: "Faktur tidak ditemukan" };
    }
    return { ok: false, error: "Gagal memperbarui faktur" };
  }

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  revalidatePath("/");
  redirect(`/invoices/${id}`);
}

export type DeleteInvoiceResult =
  | { ok: true }
  | { ok: false; error: string };

export async function deleteInvoiceAction(
  id: string,
): Promise<DeleteInvoiceResult> {
  const userId = await requireUserId();
  if (!id) return { ok: false, error: "ID faktur tidak ada" };
  try {
    const { count } = await prisma.invoice.deleteMany({ where: { id, userId } });
    if (count === 0) return { ok: false, error: "Faktur tidak ditemukan" };
  } catch {
    return { ok: false, error: "Gagal menghapus faktur" };
  }
  revalidatePath("/invoices");
  revalidatePath("/");
  return { ok: true };
}
