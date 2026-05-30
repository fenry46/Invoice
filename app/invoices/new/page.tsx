import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { buttonVariants } from "@/components/ui/button";
import { InvoiceForm } from "./_components/InvoiceForm";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage() {
  const userId = await requireUserId();
  const [fish, customers] = await Promise.all([
    prisma.fish.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.customer.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (fish.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Faktur baru</h1>
        <div className="rounded-md border border-dashed p-6 text-center">
          <p className="mb-4 text-sm text-muted-foreground">
            Tambahkan minimal satu ikan sebelum membuat faktur.
          </p>
          <Link href="/fish" className={buttonVariants()}>
            Kelola ikan
          </Link>
        </div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Faktur baru</h1>
        <div className="rounded-md border border-dashed p-6 text-center">
          <p className="mb-4 text-sm text-muted-foreground">
            Tambahkan minimal satu pelanggan sebelum membuat faktur.
          </p>
          <Link href="/customers" className={buttonVariants()}>
            Kelola pelanggan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Faktur baru</h1>
        <p className="text-sm text-muted-foreground">
          Tambahkan barang, berat, harga, dan potongan jika ada.
        </p>
      </div>
      <InvoiceForm fish={fish} customers={customers} />
    </div>
  );
}
