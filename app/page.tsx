import Link from "next/link";
import { ChevronRight, FileText, Fish as FishIcon, Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatIDR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [recent, fishCount, invoiceCount] = await Promise.all([
    prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.fish.count(),
    prisma.invoice.count(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {invoiceCount} invoice{invoiceCount === 1 ? "" : "s"} · {fishCount}{" "}
          fish
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          href="/invoices/new"
          className={buttonVariants({ size: "lg", className: "h-16 justify-start" })}
        >
          <Plus className="size-5" />
          <span className="flex-1 text-left">New invoice</span>
        </Link>
        <Link
          href="/fish"
          className={buttonVariants({
            variant: "outline",
            size: "lg",
            className: "h-16 justify-start",
          })}
        >
          <FishIcon className="size-5" />
          <span className="flex-1 text-left">Manage fish</span>
        </Link>
        <Link
          href="/invoices"
          className={buttonVariants({
            variant: "outline",
            size: "lg",
            className: "h-16 justify-start",
          })}
        >
          <FileText className="size-5" />
          <span className="flex-1 text-left">All invoices</span>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Recent invoices
          </h2>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No invoices yet. Create your first one.
            </p>
          ) : (
            <ul className="divide-y">
              {recent.map((inv) => (
                <li key={inv.id}>
                  <Link
                    href={`/invoices/${inv.id}`}
                    className="-mx-2 flex items-center gap-3 rounded-md px-2 py-3 hover:bg-accent"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{inv.invoiceNumber}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(inv.createdAt)}
                      </div>
                    </div>
                    <div className="tabular-nums font-medium">
                      {formatIDR(inv.grandTotal)}
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
