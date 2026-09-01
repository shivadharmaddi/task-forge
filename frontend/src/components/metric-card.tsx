import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  className,
}: MetricCardProps) {
  return (
    <div className={cn("border border-border bg-background p-4", className)}>
      <p className="text-xs font-normal text-muted-foreground">{title}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
      {subtitle && (
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
