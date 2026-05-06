import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { formatDate, formatIDR, formatNumber } from "@/lib/format";
import { PrintButton } from "./_components/PrintButton";
import { DeleteInvoiceButton } from "./_components/DeleteInvoiceButton";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      items: { include: { fish: true } },
      deductions: true,
      customer: true,
    },
  });

  if (!invoice) notFound();

  return (
    <div className="space-y-4">
      <div className="no-print flex items-center justify-between gap-2">
        <Link
          href="/invoices"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft className="size-4" />
          Kembali
        </Link>
        <div className="flex items-center gap-2">
          <DeleteInvoiceButton
            id={invoice.id}
            invoiceNumber={invoice.invoiceNumber}
          />
          <PrintButton />
        </div>
      </div>

      <article className="print-area space-y-6 rounded-xl border bg-card p-5 shadow-sm sm:p-6">
        <header className="flex flex-wrap items-start justify-between gap-2 border-b pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Faktur</h1>
            <p className="font-mono text-sm font-medium text-muted-foreground">
              {invoice.invoiceNumber}
            </p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            {formatDate(invoice.createdAt)}
          </div>
        </header>

        {invoice.customer && (
          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Tagih ke
            </h2>
            <div className="text-sm">
              <div className="font-medium">{invoice.customer.name}</div>
              {invoice.customer.phone && (
                <div className="text-muted-foreground">
                  {invoice.customer.phone}
                </div>
              )}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Barang
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2">Ikan</th>
                  <th className="py-2 text-right">Berat (kg)</th>
                  <th className="py-2 text-right">Harga / kg</th>
                  <th className="py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((it) => (
                  <tr key={it.id} className="border-b last:border-0">
                    <td className="py-2">{it.fish.name}</td>
                    <td className="py-2 text-right tabular-nums">
                      {formatNumber(it.weightKg)}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {formatIDR(it.pricePerKg)}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {formatIDR(it.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {invoice.deductions.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Potongan
            </h2>
            <ul className="divide-y border-y">
              {invoice.deductions.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span>{d.description}</span>
                  <span className="tabular-nums">
                    - {formatIDR(d.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total kotor</span>
            <span className="tabular-nums">{formatIDR(invoice.grossTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Potongan</span>
            <span className="tabular-nums">
              - {formatIDR(invoice.totalDeductions)}
            </span>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-semibold">
            <span>Total akhir</span>
            <span className="tabular-nums">{formatIDR(invoice.grandTotal)}</span>
          </div>
        </section>
      </article>
    </div>
  );
}
