"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { fishNameSchema } from "@/lib/schemas";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createFishAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = fishNameSchema.safeParse(formData.get("name"));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid name" };
  }
  try {
    await prisma.fish.create({ data: { name: parsed.data } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "A fish with that name already exists" };
    }
    return { ok: false, error: "Failed to create fish" };
  }
  revalidatePath("/fish");
  revalidatePath("/invoices/new");
  return { ok: true };
}

export async function renameFishAction(
  id: string,
  name: string,
): Promise<ActionResult> {
  const parsed = fishNameSchema.safeParse(name);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid name" };
  }
  try {
    await prisma.fish.update({ where: { id }, data: { name: parsed.data } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "A fish with that name already exists" };
    }
    return { ok: false, error: "Failed to rename fish" };
  }
  revalidatePath("/fish");
  revalidatePath("/invoices/new");
  return { ok: true };
}

export async function deleteFishAction(id: string): Promise<ActionResult> {
  try {
    await prisma.fish.delete({ where: { id } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
      return {
        ok: false,
        error: "Cannot delete: this fish is used by one or more invoices",
      };
    }
    return { ok: false, error: "Failed to delete fish" };
  }
  revalidatePath("/fish");
  revalidatePath("/invoices/new");
  return { ok: true };
}
