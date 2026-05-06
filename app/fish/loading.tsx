import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Skeleton className="h-11 flex-1" />
            <Skeleton className="h-11 w-20" />
          </div>
        </CardContent>
      </Card>
      <ul className="divide-y rounded-lg border bg-card">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="flex items-center gap-2 px-3 py-3">
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="size-9 rounded-md" />
            <Skeleton className="size-9 rounded-md" />
          </li>
        ))}
      </ul>
    </div>
  );
}
