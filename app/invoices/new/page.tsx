import Link from "next/link";
import { prisma } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { InvoiceForm } from "./_components/InvoiceForm";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage() {
  const fish = await prisma.fish.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  if (fish.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">New invoice</h1>
        <div className="rounded-md border border-dashed p-6 text-center">
          <p className="mb-4 text-sm text-muted-foreground">
            Add at least one fish before creating an invoice.
          </p>
          <Link href="/fish" className={buttonVariants()}>
            Manage fish
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New invoice</h1>
        <p className="text-sm text-muted-foreground">
          Add items, weights, prices, and any deductions.
        </p>
      </div>
      <InvoiceForm fish={fish} />
    </div>
  );
}
