import { z } from "zod";

export const fishNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(60, "Name is too long");

export const invoiceItemInputSchema = z.object({
  fishId: z.string().min(1, "Select a fish"),
  weightKg: z
    .number({ error: "Must be a number" })
    .positive("Weight must be greater than 0")
    .max(100000, "Weight too large"),
  pricePerKg: z
    .number({ error: "Must be a number" })
    .positive("Price must be greater than 0")
    .max(1_000_000_000, "Price too large"),
});

export const deductionInputSchema = z.object({
  description: z.string().trim().min(1, "Description is required").max(60),
  amount: z
    .number({ error: "Must be a number" })
    .nonnegative("Amount must be 0 or more")
    .max(1_000_000_000, "Amount too large"),
});

export const invoiceInputSchema = z.object({
  items: z
    .array(invoiceItemInputSchema)
    .min(1, "Add at least one item"),
  deductions: z.array(deductionInputSchema),
});

export type InvoiceItemInput = z.infer<typeof invoiceItemInputSchema>;
export type DeductionInput = z.infer<typeof deductionInputSchema>;
export type InvoiceInput = z.infer<typeof invoiceInputSchema>;
