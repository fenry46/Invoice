import { prisma } from "@/lib/db";
import { FishManager } from "./_components/FishManager";

export const dynamic = "force-dynamic";

export default async function FishPage() {
  const fish = await prisma.fish.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { items: true } } },
  });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Fish</h1>
        <p className="text-sm text-muted-foreground">
          Manage your master list of fish.
        </p>
      </div>
      <FishManager
        fish={fish.map((f) => ({
          id: f.id,
          name: f.name,
          itemCount: f._count.items,
        }))}
      />
    </div>
  );
}
