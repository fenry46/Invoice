import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-11 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-9 w-28" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-32 w-full rounded-md" />
        </CardContent>
      </Card>
    </div>
  );
}
