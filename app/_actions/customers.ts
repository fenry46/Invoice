"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { customerInputSchema, customerNameSchema } from "@/lib/schemas";

export type ActionResult = { ok: true } | { ok: false; error: string };

function revalidateAll() {
  revalidatePath("/customers");
  revalidatePath("/invoices/new");
  revalidatePath("/invoices");
  revalidatePath("/");
}

export async function createCustomerAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = customerInputSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") ?? undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Masukan tidak valid" };
  }
  try {
    await prisma.customer.create({ data: { ...parsed.data, userId } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "Pelanggan dengan nama itu sudah ada" };
    }
    return { ok: false, error: "Gagal menambahkan pelanggan" };
  }
  revalidateAll();
  return { ok: true };
}

export async function updateCustomerAction(
  id: string,
  input: { name: string; phone?: string },
): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = customerInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Masukan tidak valid" };
  }
  try {
    const { count } = await prisma.customer.updateMany({
      where: { id, userId },
      data: { name: parsed.data.name, phone: parsed.data.phone ?? null },
    });
    if (count === 0) return { ok: false, error: "Pelanggan tidak ditemukan" };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "Pelanggan dengan nama itu sudah ada" };
    }
    return { ok: false, error: "Gagal memperbarui pelanggan" };
  }
  revalidateAll();
  return { ok: true };
}

export async function renameCustomerAction(
  id: string,
  name: string,
): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = customerNameSchema.safeParse(name);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Nama tidak valid" };
  }
  try {
    const { count } = await prisma.customer.updateMany({
      where: { id, userId },
      data: { name: parsed.data },
    });
    if (count === 0) return { ok: false, error: "Pelanggan tidak ditemukan" };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "Pelanggan dengan nama itu sudah ada" };
    }
    return { ok: false, error: "Gagal mengubah nama pelanggan" };
  }
  revalidateAll();
  return { ok: true };
}

export async function deleteCustomerAction(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  try {
    const { count } = await prisma.customer.deleteMany({ where: { id, userId } });
    if (count === 0) return { ok: false, error: "Pelanggan tidak ditemukan" };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
      return {
        ok: false,
        error: "Tidak bisa dihapus: pelanggan ini dipakai di satu atau lebih faktur",
      };
    }
    return { ok: false, error: "Gagal menghapus pelanggan" };
  }
  revalidateAll();
  return { ok: true };
}
