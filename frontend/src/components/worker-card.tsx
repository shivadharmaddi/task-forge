"use client";

import { cn } from "@/lib/utils";
import type { Worker } from "@/types";

interface WorkerCardProps {
  worker: Worker;
  onClick?: () => void;
  selected?: boolean;
}

export function WorkerCard({ worker, onClick, selected }: WorkerCardProps) {
  const stateColor =
    worker.state === "idle"
      ? "#107c10"
      : worker.state === "busy"
        ? "#0078d4"
        : "#8a8886";

  return (
    <div
      className={cn(
        "cursor-pointer border border-border bg-background p-4 transition-colors hover:border-[#8a8886]",
        selected && "border-[#0078d4] ring-1 ring-[#0078d4]",
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <p className="font-mono text-sm font-semibold">{worker.id}</p>
        <span className="inline-flex items-center gap-1.5 text-xs capitalize">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: stateColor }} />
          {worker.state}
        </span>
      </div>

      {worker.current_job && (
        <p className="mt-2 text-xs text-muted-foreground">
          Current: <span className="font-mono text-foreground">{worker.current_job}</span>
        </p>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <dt className="text-muted-foreground">Processed</dt>
          <dd className="mt-0.5 font-semibold tabular-nums">{worker.jobs_processed.toLocaleString()}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Success rate</dt>
          <dd className="mt-0.5 font-semibold">{worker.success_rate}%</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Uptime</dt>
          <dd className="mt-0.5 font-semibold">{worker.uptime}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Heartbeat</dt>
          <dd className="mt-0.5 font-semibold">{worker.last_heartbeat}</dd>
        </div>
      </dl>
    </div>
  );
}
