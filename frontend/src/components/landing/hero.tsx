"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/metric-card";
import { JobTable } from "@/components/job-table";
import { api } from "@/lib/api";
import { formatNumber, formatPercent } from "@/lib/format";
import type { Metrics, Job } from "@/types";

export function HeroSection() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);

  useEffect(() => {
    Promise.all([api.getMetrics("24h"), api.getJobs({ per_page: 5 })])
      .then(([m, j]) => {
        setMetrics(m);
        setRecentJobs(j.jobs);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="ms-hero-bg border-b border-border">
      <div className="ms-container ms-section">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-semibold text-[#0078d4] dark:text-[#4da6ff]">
              Distributed job processing
            </p>
            <h1 className="mt-3 text-[clamp(2rem,5vw,3rem)] font-semibold leading-[1.15] text-foreground">
              Built for reliability at scale
            </h1>
            <p className="mt-4 max-w-[480px] text-base leading-relaxed text-muted-foreground">
              TaskForge gives your team one place to create, schedule, monitor,
              retry, and inspect background jobs across queues and workers.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dashboard">
                <Button className="h-10 rounded-sm bg-[#0078d4] px-6 text-sm font-semibold hover:bg-[#106ebe] dark:bg-[#4da6ff] dark:text-[#1b1a19]">
                  Open live demo
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button
                  variant="outline"
                  className="h-10 rounded-sm border-[#8a8886] px-6 text-sm font-semibold dark:border-[#605e5c]"
                >
                  How it works
                </Button>
              </a>
            </div>
          </div>

          <div className="ms-card overflow-hidden">
            <div className="border-b border-border bg-[#faf9f8] px-4 py-2.5 dark:bg-[#252423]">
              <span className="text-xs font-semibold text-muted-foreground">
                Live dashboard preview
              </span>
            </div>
            <div className="space-y-4 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <MetricCard
                  title="Jobs processed"
                  value={metrics ? formatNumber(metrics.total_jobs) : "—"}
                  subtitle="All queues"
                />
                <MetricCard
                  title="Success rate"
                  value={metrics ? formatPercent(metrics.success_rate) : "—"}
                  subtitle="30-day average"
                />
                <MetricCard
                  title="Active workers"
                  value={metrics ? String(metrics.active_workers) : "—"}
                />
                <MetricCard
                  title="Queue depth"
                  value={metrics ? String(metrics.queue_depth) : "—"}
                />
              </div>
              <div className="border border-border">
                <div className="border-b border-border bg-[#faf9f8] px-3 py-2 dark:bg-[#252423]">
                  <p className="text-xs font-semibold text-foreground">Recent jobs</p>
                </div>
                {recentJobs.length > 0 ? (
                  <JobTable jobs={recentJobs} compact />
                ) : (
                  <p className="p-6 text-center text-sm text-muted-foreground">
                    Loading…
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
