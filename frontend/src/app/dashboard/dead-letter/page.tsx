"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { RefreshCw, Trash2, Eye } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { PageHeader } from "@/components/page-header";
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

export default function DeadLetterPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await api.getDeadLetter();
      setJobs(data.jobs);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleRetry = async (id: string) => {
    await api.retryJob(id);
    loadJobs();
  };

  const handleDelete = async (id: string) => {
    await api.deleteJob(id);
    loadJobs();
  };

  return (
    <>
      <DashboardHeader title="Dead Letter" />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <PageHeader
          title="Dead-Letter Queue"
          subtitle="Jobs that fail repeatedly are isolated here for investigation."
        />

        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-sm">
            <strong>What is the Dead-Letter Queue?</strong> Jobs are moved here after they exceed
            their maximum retry attempts. They can then be inspected, retried, or removed without
            blocking active processing.
          </p>
        </div>

        {error ? (
          <ErrorState onRetry={loadJobs} />
        ) : loading ? (
          <LoadingSkeleton rows={6} />
        ) : jobs.length === 0 ? (
          <EmptyState title="No dead-letter jobs" description="Failed jobs that exceed retry limits will appear here." />
        ) : (
          <div className="rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Last Error</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Worker</TableHead>
                  <TableHead>Failed At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-mono text-xs">{job.id}</TableCell>
                    <TableCell>{job.task_name}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                      {job.error_message || "—"}
                    </TableCell>
                    <TableCell>{job.attempt_count}/{job.max_attempts}</TableCell>
                    <TableCell className="font-mono text-xs">{job.worker_id || "—"}</TableCell>
                    <TableCell className="text-xs">{formatDate(job.completed_at)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Link href={`/dashboard/jobs/${job.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleRetry(job.id)}>
                          <RefreshCw className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleDelete(job.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}
