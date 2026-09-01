"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { PageHeader } from "@/components/page-header";
import { CreateJobDialog } from "@/components/create-job-dialog";
import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Job } from "@/types";

export default function ScheduledPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await api.getScheduled();
      setJobs(data.jobs);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 5000);
    return () => clearInterval(interval);
  }, [loadJobs]);

  return (
    <>
      <DashboardHeader title="Scheduled" />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <PageHeader
          title="Scheduled Jobs"
          subtitle="Jobs waiting until a future execution time."
        >
          <Button onClick={() => setCreateOpen(true)} size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Schedule Job
          </Button>
        </PageHeader>

        {error ? (
          <ErrorState onRetry={loadJobs} />
        ) : loading ? (
          <LoadingSkeleton rows={6} />
        ) : jobs.length === 0 ? (
          <EmptyState
            title="No scheduled jobs"
            description="Schedule a job to run at a future time."
            action={{ label: "Schedule Job", onClick: () => setCreateOpen(true) }}
          />
        ) : (
          <div className="rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Queue</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Scheduled Time</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <Link href={`/dashboard/jobs/${job.id}`} className="font-mono text-xs hover:underline">
                        {job.id}
                      </Link>
                    </TableCell>
                    <TableCell>{job.task_name}</TableCell>
                    <TableCell className="capitalize">{job.queue}</TableCell>
                    <TableCell><PriorityBadge priority={job.priority} /></TableCell>
                    <TableCell>{formatDate(job.scheduled_at)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(job.created_at)}</TableCell>
                    <TableCell><StatusBadge status={job.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <CreateJobDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={loadJobs} />
    </>
  );
}
