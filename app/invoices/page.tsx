import Link from "next/link";
import { ChevronRight, FileText, Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { formatDate, formatIDR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      _count: { select: { items: true } },
      customer: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Faktur</h1>
          <p className="text-sm text-muted-foreground">Terbaru di atas.</p>
        </div>
        <Link href="/invoices/new" className={buttonVariants({ className: "shadow-sm" })}>
          <Plus className="size-4" />
          <span className="hidden sm:inline">Faktur baru</span>
          <span className="sm:hidden">Baru</span>
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-12 text-center">
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            <FileText className="size-5" aria-hidden />
          </div>
          <p className="text-sm font-medium">Belum ada faktur</p>
          <p className="text-xs text-muted-foreground">
            Buat yang pertama untuk memulai.
          </p>
          <Link
            href="/invoices/new"
            className={buttonVariants({ size: "sm", className: "mt-2" })}
          >
            <Plus className="size-4" />
            Faktur baru
          </Link>
        </div>
      ) : (
        <ul className="divide-y rounded-lg border bg-card">
          {invoices.map((inv) => (
            <li key={inv.id}>
              <Link
                href={`/invoices/${inv.id}`}
                className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-accent sm:px-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-sm font-medium">
                    {inv.invoiceNumber}
                  </div>
                  {inv.customer && (
                    <div className="truncate text-sm">{inv.customer.name}</div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {formatDate(inv.createdAt)} · {inv._count.items} barang
                  </div>
                </div>
                <div className="text-right tabular-nums font-medium">
                  {formatIDR(inv.grandTotal)}
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
