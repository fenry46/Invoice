import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
          <p className="text-sm text-muted-foreground">
            Most recent first.
          </p>
        </div>
        <Link href="/invoices/new" className={buttonVariants()}>
          <Plus className="size-4" />
          New
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          No invoices yet.
        </div>
      ) : (
        <ul className="divide-y rounded-md border">
          {invoices.map((inv) => (
            <li key={inv.id}>
              <Link
                href={`/invoices/${inv.id}`}
                className="flex items-center gap-3 p-4 hover:bg-accent"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{inv.invoiceNumber}</div>
                  {inv.customer && (
                    <div className="truncate text-sm">{inv.customer.name}</div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {formatDate(inv.createdAt)} · {inv._count.items} item
                    {inv._count.items === 1 ? "" : "s"}
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
