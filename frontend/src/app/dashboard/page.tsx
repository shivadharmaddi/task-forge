"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { MetricCard } from "@/components/metric-card";
import { JobTable } from "@/components/job-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobActivityChart, DistributionChart, getPriorityColor, getStatusColor } from "@/components/charts";
import { MetricCardSkeleton, ChartSkeleton, LoadingSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import { api } from "@/lib/api";
import { formatNumber, formatPercent, formatDuration } from "@/lib/format";
import type { Metrics, Job } from "@/types";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [period, setPeriod] = useState("24h");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [metricsData, jobsData] = await Promise.all([
        api.getMetrics(period),
        api.getJobs({ per_page: 8 }),
      ]);
      setMetrics(metricsData);
      setRecentJobs(jobsData.jobs);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  if (error) {
    return (
      <>
        <DashboardHeader title="Overview" />
        <div className="flex-1 overflow-auto p-6">
          <ErrorState onRetry={loadData} />
        </div>
      </>
    );
  }

  const priorityData = metrics
    ? Object.entries(metrics.jobs_by_priority).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: getPriorityColor(name),
      }))
    : [];

  const statusData = metrics
    ? Object.entries(metrics.jobs_by_status)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({
          name: name === "dead_letter" ? "Dead Letter" : name.charAt(0).toUpperCase() + name.slice(1),
          value,
          color: getStatusColor(name),
        }))
    : [];

  return (
    <>
      <DashboardHeader title="Overview" />
      <div className="flex-1 space-y-6 overflow-auto bg-[#faf9f8] p-6 dark:bg-[#1b1a19]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {loading && !metrics ? (
            Array.from({ length: 5 }).map((_, i) => <MetricCardSkeleton key={i} />)
          ) : metrics ? (
            <>
              <MetricCard
                title="Jobs processed"
                value={formatNumber(metrics.total_jobs)}
                subtitle={`${metrics.completed} completed`}
              />
              <MetricCard
                title="Success rate"
                value={formatPercent(metrics.success_rate)}
                subtitle="Last 30 days"
              />
              <MetricCard
                title="Active workers"
                value={String(metrics.active_workers)}
                subtitle="6 configured"
              />
              <MetricCard
                title="Queue depth"
                value={String(metrics.queue_depth)}
                subtitle={`${metrics.queued} waiting`}
              />
              <MetricCard
                title="Avg. runtime"
                value={formatDuration(metrics.average_duration)}
                subtitle="Completed jobs"
              />
            </>
          ) : null}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="ms-card lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">Job activity</h3>
              <Tabs value={period} onValueChange={setPeriod}>
                <TabsList className="h-8">
                  {["1h", "24h", "7d", "30d"].map((p) => (
                    <TabsTrigger key={p} value={p} className="text-xs px-2.5 h-6">
                      {p.toUpperCase()}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            <div className="p-4 pt-2">
              {loading && !metrics ? (
                <ChartSkeleton />
              ) : metrics ? (
                <JobActivityChart data={metrics.activity_over_time} />
              ) : null}
            </div>
          </div>

          <div className="ms-card">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">Queue distribution</h3>
            </div>
            <div className="p-4">
              {metrics ? (
                <DistributionChart data={priorityData} />
              ) : (
                <ChartSkeleton />
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="ms-card">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">Job status</h3>
            </div>
            <div className="p-4">
              {metrics ? (
                <DistributionChart data={statusData} />
              ) : (
                <ChartSkeleton />
              )}
            </div>
          </div>

          <div className="ms-card overflow-hidden lg:col-span-2">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">Recent jobs</h3>
            </div>
            <div>
              {loading && recentJobs.length === 0 ? (
                <div className="p-6"><LoadingSkeleton rows={4} /></div>
              ) : (
                <JobTable jobs={recentJobs} compact />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
