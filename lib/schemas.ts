import { z } from "zod";

export const fishNameSchema = z
  .string()
  .trim()
  .min(1, "Nama wajib diisi")
  .max(60, "Nama terlalu panjang");

export const customerNameSchema = z
  .string()
  .trim()
  .min(1, "Nama wajib diisi")
  .max(100, "Nama terlalu panjang");

export const customerPhoneSchema = z
  .string()
  .trim()
  .max(30, "Telepon terlalu panjang")
  .optional()
  .transform((v) => (v ? v : undefined));

export const customerInputSchema = z.object({
  name: customerNameSchema,
  phone: customerPhoneSchema,
});

export type CustomerInput = z.infer<typeof customerInputSchema>;

export const invoiceItemInputSchema = z.object({
  fishId: z.string().min(1, "Pilih ikan"),
  weightKg: z
    .number({ error: "Harus berupa angka" })
    .positive("Berat harus lebih dari 0")
    .max(100000, "Berat terlalu besar"),
  pricePerKg: z
    .number({ error: "Harus berupa angka" })
    .positive("Harga harus lebih dari 0")
    .max(1_000_000_000, "Harga terlalu besar"),
});

export const deductionInputSchema = z.object({
  description: z.string().trim().min(1, "Keterangan wajib diisi").max(60),
  amount: z
    .number({ error: "Harus berupa angka" })
    .nonnegative("Jumlah harus 0 atau lebih")
    .max(1_000_000_000, "Jumlah terlalu besar"),
});

export const invoiceInputSchema = z.object({
  customerId: z.string().min(1, "Pilih pelanggan"),
  items: z
    .array(invoiceItemInputSchema)
    .min(1, "Tambahkan minimal satu barang"),
  deductions: z.array(deductionInputSchema),
});

export type InvoiceItemInput = z.infer<typeof invoiceItemInputSchema>;
export type DeductionInput = z.infer<typeof deductionInputSchema>;
export type InvoiceInput = z.infer<typeof invoiceInputSchema>;
