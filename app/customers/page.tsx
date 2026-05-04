import { prisma } from "@/lib/db";
import { CustomerManager } from "./_components/CustomerManager";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { invoices: true } } },
  });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground">
          Manage your customer list.
        </p>
      </div>
      <CustomerManager
        customers={customers.map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          invoiceCount: c._count.invoices,
        }))}
      />
    </div>
  );
}
