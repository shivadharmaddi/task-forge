import {
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Play,
  AlertTriangle,
  Archive,
  Ban,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import type { JobEvent } from "@/types";

const eventIcons: Record<string, React.ElementType> = {
  created: Clock,
  queued: Clock,
  scheduled: Clock,
  processing: Play,
  completed: CheckCircle2,
  failed: XCircle,
  retry_scheduled: RefreshCw,
  dead_letter: Archive,
  cancelled: Ban,
};

const eventColors: Record<string, string> = {
  created: "text-muted-foreground",
  queued: "text-amber-600 dark:text-amber-400",
  scheduled: "text-purple-600 dark:text-purple-400",
  processing: "text-blue-600 dark:text-blue-400",
  completed: "text-emerald-600 dark:text-emerald-400",
  failed: "text-red-600 dark:text-red-400",
  retry_scheduled: "text-orange-600 dark:text-orange-400",
  dead_letter: "text-red-600 dark:text-red-400",
  cancelled: "text-gray-600 dark:text-gray-400",
};

export function Timeline({ events }: { events: JobEvent[] }) {
  return (
    <div className="relative space-y-0">
      {events.map((event, index) => {
        const Icon = eventIcons[event.event_type] || AlertTriangle;
        const isLast = index === events.length - 1;

        return (
          <div key={event.id} className="relative flex gap-4 pb-8">
            {!isLast && (
              <div className="absolute left-[15px] top-8 h-full w-px bg-border" />
            )}
            <div
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background",
                eventColors[event.event_type],
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm font-medium capitalize">
                {event.event_type.replace(/_/g, " ")}
              </p>
              <p className="text-sm text-muted-foreground">{event.description}</p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                {formatDate(event.created_at)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
