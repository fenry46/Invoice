import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { FishManager } from "./_components/FishManager";

export const dynamic = "force-dynamic";

export default async function FishPage() {
  const userId = await requireUserId();
  const fish = await prisma.fish.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    include: { _count: { select: { items: true } } },
  });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Ikan</h1>
        <p className="text-sm text-muted-foreground">
          Kelola daftar utama ikan Anda.
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
