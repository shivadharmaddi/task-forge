import { formatRelative } from "@/lib/format";
import type { Activity } from "@/types";
import { cn } from "@/lib/utils";
import { Server, Clock, Zap } from "lucide-react";

const categoryIcons: Record<string, React.ElementType> = {
  jobs: Zap,
  workers: Server,
  system: Clock,
};

const eventTypeColors: Record<string, string> = {
  job_completed: "text-emerald-600 dark:text-emerald-400",
  job_failed: "text-red-600 dark:text-red-400",
  retry_scheduled: "text-orange-600 dark:text-orange-400",
  dead_letter: "text-red-600 dark:text-red-400",
  worker_pickup: "text-blue-600 dark:text-blue-400",
  worker_registered: "text-blue-600 dark:text-blue-400",
  job_ready: "text-purple-600 dark:text-purple-400",
};

export function ActivityItem({ activity }: { activity: Activity }) {
  const Icon = categoryIcons[activity.category] || Zap;
  const colorClass = eventTypeColors[activity.event_type] || "text-muted-foreground";

  return (
    <div className="flex items-start gap-3 py-3">
      <div className={cn("mt-0.5 rounded-full bg-muted p-1.5", colorClass)}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">{activity.message}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatRelative(activity.created_at)}
        </p>
      </div>
      <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">
        {activity.category}
      </span>
    </div>
  );
}
