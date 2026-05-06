import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-primary/8 via-primary/3 to-transparent">
        <CardContent className="space-y-2 pt-6">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="mt-3 h-7 w-40" />
        </CardContent>
      </Card>

      <div className="grid gap-2.5 sm:grid-cols-3">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Skeleton className="mb-3 h-3 w-28" />
          <ul className="divide-y">
            {Array.from({ length: 4 }).map((_, i) => (
              <li
                key={i}
                className="flex items-center gap-3 px-2 py-2.5"
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-20" />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
