import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="rounded-lg border border-border/60 p-6 space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-lg border border-border/60 p-6">
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
