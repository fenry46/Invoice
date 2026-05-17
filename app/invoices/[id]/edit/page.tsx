import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import type { InvoiceInput } from "@/lib/schemas";
import { InvoiceForm } from "../../new/_components/InvoiceForm";

export const dynamic = "force-dynamic";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [invoice, fish, customers] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id },
      include: {
        items: { include: { fish: true } },
        deductions: true,
        customer: true,
      },
    }),
    prisma.fish.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.customer.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!invoice) notFound();

  const initialValues: InvoiceInput = {
    customerId: invoice.customerId ?? "",
    items: invoice.items.map((it) => ({
      fishId: it.fishId,
      weightKg: it.weightKg,
      pricePerKg: it.pricePerKg,
    })),
    deductions: invoice.deductions.map((d) => ({
      description: d.description,
      amount: d.amount,
    })),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit faktur</h1>
        <p className="font-mono text-sm font-medium text-muted-foreground">
          {invoice.invoiceNumber}
        </p>
      </div>
      <InvoiceForm
        fish={fish}
        customers={customers}
        invoiceId={invoice.id}
        initialValues={initialValues}
      />
    </div>
  );
}
