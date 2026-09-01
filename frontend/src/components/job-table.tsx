"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { formatDate, formatDuration } from "@/lib/format";
import type { Job } from "@/types";

interface JobTableProps {
  jobs: Job[];
  onRowClick?: (job: Job) => void;
  compact?: boolean;
}

export function JobTable({ jobs, onRowClick, compact }: JobTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead className="h-9 text-xs font-semibold text-muted-foreground">Job ID</TableHead>
          <TableHead className="h-9 text-xs font-semibold text-muted-foreground">Task</TableHead>
          {!compact && (
            <TableHead className="h-9 text-xs font-semibold text-muted-foreground">Queue</TableHead>
          )}
          <TableHead className="h-9 text-xs font-semibold text-muted-foreground">Priority</TableHead>
          <TableHead className="h-9 text-xs font-semibold text-muted-foreground">Status</TableHead>
          <TableHead className="h-9 text-xs font-semibold text-muted-foreground">Worker</TableHead>
          <TableHead className="h-9 text-xs font-semibold text-muted-foreground">Duration</TableHead>
          <TableHead className="h-9 text-xs font-semibold text-muted-foreground">Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => (
          <TableRow
            key={job.id}
            className="cursor-pointer border-border hover:bg-[#f3f2f1] dark:hover:bg-[#252423]"
            onClick={() => onRowClick?.(job)}
          >
            <TableCell className="py-2 font-mono text-xs">
              <Link
                href={`/dashboard/jobs/${job.id}`}
                className="text-[#0078d4] hover:underline dark:text-[#4da6ff]"
                onClick={(e) => e.stopPropagation()}
              >
                {job.id}
              </Link>
            </TableCell>
            <TableCell className="py-2 text-sm text-foreground">{job.task_name}</TableCell>
            {!compact && (
              <TableCell className="py-2 text-sm capitalize text-muted-foreground">{job.queue}</TableCell>
            )}
            <TableCell className="py-2">
              <PriorityBadge priority={job.priority} />
            </TableCell>
            <TableCell className="py-2">
              <StatusBadge status={job.status} />
            </TableCell>
            <TableCell className="py-2 font-mono text-xs text-muted-foreground">
              {job.worker_id || "—"}
            </TableCell>
            <TableCell className="py-2 text-sm tabular-nums text-muted-foreground">
              {formatDuration(job.duration)}
            </TableCell>
            <TableCell className="py-2 text-xs tabular-nums text-muted-foreground">
              {formatDate(job.created_at)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
