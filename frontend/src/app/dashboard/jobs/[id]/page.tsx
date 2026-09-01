"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Copy, RefreshCw, Ban, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard-header";
import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { Timeline } from "@/components/timeline";
import { JsonViewer } from "@/components/json-viewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { api } from "@/lib/api";
import { formatDate, formatDuration } from "@/lib/format";
import type { JobDetail } from "@/types";

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadJob = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await api.getJob(jobId);
      setJob(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    loadJob();
    const interval = setInterval(loadJob, 3000);
    return () => clearInterval(interval);
  }, [loadJob]);

  const handleRetry = async () => {
    await api.retryJob(jobId);
    loadJob();
  };

  const handleCancel = async () => {
    await api.cancelJob(jobId);
    loadJob();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jobId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) {
    return (
      <>
        <DashboardHeader title="Job Details" />
        <div className="flex-1 overflow-auto p-6">
          <ErrorState onRetry={loadJob} />
        </div>
      </>
    );
  }

  if (loading && !job) {
    return (
      <>
        <DashboardHeader title="Job Details" />
        <div className="flex-1 overflow-auto p-6">
          <LoadingSkeleton rows={10} />
        </div>
      </>
    );
  }

  if (!job) return null;

  return (
    <>
      <DashboardHeader title="Job Details" />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/jobs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-xl font-semibold">{job.id}</h1>
            <StatusBadge status={job.status} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              {copied ? "Copied" : "Copy ID"}
            </Button>
            {["failed", "dead_letter", "cancelled"].includes(job.status) && (
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Retry
              </Button>
            )}
            {!["completed", "cancelled", "dead_letter"].includes(job.status) && (
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <Ban className="mr-1.5 h-3.5 w-3.5" />
                Cancel
              </Button>
            )}
          </div>
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium">Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Task", value: job.task_name },
                { label: "Queue", value: job.queue },
                { label: "Priority", value: <PriorityBadge priority={job.priority} /> },
                { label: "Status", value: <StatusBadge status={job.status} /> },
                { label: "Worker", value: job.worker_id || "—" },
                { label: "Attempts", value: `${job.attempt_count} / ${job.max_attempts}` },
                { label: "Runtime", value: formatDuration(job.duration) },
                { label: "Created", value: formatDate(job.created_at) },
                { label: "Started", value: formatDate(job.started_at) },
                { label: "Completed", value: formatDate(job.completed_at) },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-xs text-muted-foreground">{item.label}</dt>
                  <dd className="mt-1 text-sm font-medium">{item.value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-medium">Execution Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline events={job.events} />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-medium">Payload</CardTitle>
              </CardHeader>
              <CardContent>
                <JsonViewer data={job.payload} />
              </CardContent>
            </Card>

            {job.result && (
              <Card className="border-border/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-medium">Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <JsonViewer data={job.result} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {job.attempts.length > 0 && (
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-medium">Attempts</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Attempt</TableHead>
                    <TableHead>Worker</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {job.attempts.map((attempt) => (
                    <TableRow key={attempt.id}>
                      <TableCell>#{attempt.attempt_number}</TableCell>
                      <TableCell className="font-mono text-xs">{attempt.worker_id || "—"}</TableCell>
                      <TableCell className="text-xs">{formatDate(attempt.started_at)}</TableCell>
                      <TableCell>{formatDuration(attempt.duration)}</TableCell>
                      <TableCell><StatusBadge status={attempt.status} /></TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {attempt.error_message || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium">Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted/50 p-4 font-mono text-xs leading-relaxed space-y-1">
              {job.logs.map((log) => (
                <div key={log.id} className="flex gap-3">
                  <span className="text-muted-foreground shrink-0">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </span>
                  <span className={log.level === "ERROR" ? "text-red-500" : "text-blue-500"}>
                    {log.level}
                  </span>
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
