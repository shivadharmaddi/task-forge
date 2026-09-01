"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { PageHeader } from "@/components/page-header";
import { WorkerCard } from "@/components/worker-card";
import { MetricCard } from "@/components/metric-card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import { api } from "@/lib/api";
import type { Worker } from "@/types";

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selected, setSelected] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadWorkers = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await api.getWorkers();
      setWorkers(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkers();
    const interval = setInterval(loadWorkers, 5000);
    return () => clearInterval(interval);
  }, [loadWorkers]);

  const busy = workers.filter((w) => w.state === "busy").length;
  const idle = workers.filter((w) => w.state === "idle").length;
  const offline = workers.filter((w) => w.state === "offline").length;
  const active = workers.filter((w) => w.status !== "offline").length;

  return (
    <>
      <DashboardHeader title="Workers" />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <PageHeader
          title="Workers"
          subtitle="Monitor the processes executing TaskForge jobs. Workers execute jobs in the background."
        />

        {error ? (
          <ErrorState onRetry={loadWorkers} />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <MetricCard title="Active Workers" value={String(active)} />
              <MetricCard title="Busy" value={String(busy)} />
              <MetricCard title="Idle" value={String(idle)} />
              <MetricCard title="Offline" value={String(offline)} />
              <MetricCard title="Jobs / Minute" value="~42" subtitle="Estimated throughput" />
            </div>

            {loading ? (
              <LoadingSkeleton rows={6} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {workers.map((worker) => (
                  <WorkerCard
                    key={worker.id}
                    worker={worker}
                    selected={selected?.id === worker.id}
                    onClick={() => setSelected(worker)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent>
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="font-mono">{selected.id}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4 text-sm">
                {[
                  ["State", selected.state],
                  ["Status", selected.status],
                  ["Current Job", selected.current_job || "—"],
                  ["Jobs Processed", selected.jobs_processed.toLocaleString()],
                  ["Failures", String(selected.failures)],
                  ["Success Rate", `${selected.success_rate}%`],
                  ["Average Runtime", `${selected.average_runtime}s`],
                  ["Uptime", selected.uptime],
                  ["Last Heartbeat", selected.last_heartbeat],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium capitalize">{value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
