import Link from "next/link";
import { ChevronRight, FileText, Fish as FishIcon, Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatIDR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Home() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [recent, fishCount, invoiceCount, monthAgg] = await Promise.all([
    prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.fish.count(),
    prisma.invoice.count(),
    prisma.invoice.aggregate({
      where: { createdAt: { gte: monthStart } },
      _sum: { grandTotal: true },
      _count: { _all: true },
    }),
  ]);

  const monthTotal = monthAgg._sum.grandTotal ?? 0;
  const monthCount = monthAgg._count._all;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-primary/8 via-primary/3 to-transparent">
        <CardContent className="space-y-1 pt-6">
          <h1 className="text-2xl font-semibold tracking-tight">Beranda</h1>
          <p className="text-sm text-muted-foreground">
            {invoiceCount} faktur · {fishCount} ikan di daftar utama
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold tabular-nums tracking-tight">
              {formatIDR(monthTotal)}
            </span>
            <span className="text-xs text-muted-foreground">
              bulan ini · {monthCount} faktur
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-2.5 sm:grid-cols-3">
        <Link
          href="/invoices/new"
          className={buttonVariants({ size: "lg", className: "h-14 justify-start shadow-sm" })}
        >
          <Plus className="size-5" />
          <span className="flex-1 text-left">Faktur baru</span>
        </Link>
        <Link
          href="/fish"
          className={buttonVariants({
            variant: "outline",
            size: "lg",
            className: "h-14 justify-start",
          })}
        >
          <FishIcon className="size-5" />
          <span className="flex-1 text-left">Kelola ikan</span>
        </Link>
        <Link
          href="/invoices"
          className={buttonVariants({
            variant: "outline",
            size: "lg",
            className: "h-14 justify-start",
          })}
        >
          <FileText className="size-5" />
          <span className="flex-1 text-left">Semua faktur</span>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Faktur terbaru
          </h2>
          {recent.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
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
            <ul className="divide-y">
              {recent.map((inv) => (
                <li key={inv.id}>
                  <Link
                    href={`/invoices/${inv.id}`}
                    className="-mx-2 flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-accent"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-sm font-medium">
                        {inv.invoiceNumber}
                      </div>
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
