"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { PageHeader } from "@/components/page-header";
import { JobTable } from "@/components/job-table";
import { CreateJobDialog } from "@/components/create-job-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import { api } from "@/lib/api";
import type { Job } from "@/types";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [queue, setQueue] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params: Record<string, string | number> = { page, per_page: 15 };
      if (search) params.search = search;
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (queue) params.queue = queue;
      const data = await api.getJobs(params);
      setJobs(data.jobs);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, priority, queue]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  return (
    <>
      <DashboardHeader title="Jobs" searchValue={search} onSearchChange={setSearch} />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <PageHeader
          title="Jobs"
          subtitle="Create, monitor, and manage background jobs."
        >
          <Button onClick={() => setCreateOpen(true)} size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Create Job
          </Button>
        </PageHeader>

        <div className="flex flex-wrap gap-3">
            <Select value={status || "all"} onValueChange={(v) => { setStatus(v === "all" ? "" : (v ?? "")); setPage(1); }}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {["queued", "processing", "completed", "failed", "scheduled", "retrying", "dead_letter", "cancelled"].map((s) => (
                <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
            <Select value={priority || "all"} onValueChange={(v) => { setPriority(v === "all" ? "" : (v ?? "")); setPage(1); }}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {["critical", "high", "normal", "low"].map((p) => (
                <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
            <Select value={queue || "all"} onValueChange={(v) => { setQueue(v === "all" ? "" : (v ?? "")); setPage(1); }}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue placeholder="Queue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Queues</SelectItem>
              {["default", "reports", "emails", "processing"].map((q) => (
                <SelectItem key={q} value={q} className="capitalize">{q}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error ? (
          <ErrorState onRetry={loadJobs} />
        ) : loading ? (
          <LoadingSkeleton rows={8} />
        ) : jobs.length === 0 ? (
          <EmptyState
            title="No jobs found"
            description="Create a new job or adjust your filters."
            action={{ label: "Create Job", onClick: () => setCreateOpen(true) }}
          />
        ) : (
          <>
            <JobTable jobs={jobs} />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{total} jobs total</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Previous
                </Button>
                <span className="flex items-center px-2">
                  Page {page} of {pages}
                </span>
                <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <CreateJobDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={loadJobs}
      />
    </>
  );
}
