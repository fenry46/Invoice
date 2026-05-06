import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-9 w-24" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
      <article className="space-y-6 rounded-xl border bg-card p-5 shadow-sm sm:p-6">
        <header className="flex items-start justify-between gap-2 border-b pb-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-4 w-24" />
        </header>
        <section className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-32" />
        </section>
        <section className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </section>
        <section className="space-y-2 border-t pt-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex justify-between pt-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-28" />
          </div>
        </section>
      </article>
    </div>
  );
}
