"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { PageHeader } from "@/components/page-header";
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
import type { Queue } from "@/types";

export default function QueuesPage() {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadQueues = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await api.getQueues();
      setQueues(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueues();
    const interval = setInterval(loadQueues, 5000);
    return () => clearInterval(interval);
  }, [loadQueues]);

  return (
    <>
      <DashboardHeader title="Queues" />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <PageHeader
          title="Queues"
          subtitle="Queues organize waiting jobs by priority. Higher priority queues are processed first."
        />

        {error ? (
          <ErrorState onRetry={loadQueues} />
        ) : loading ? (
          <LoadingSkeleton rows={6} />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {queues.map((queue) => (
                <Card key={queue.priority} className="border-border/60 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">{queue.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Waiting</span>
                      <span className="font-medium">{queue.waiting}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Processing</span>
                      <span className="font-medium">{queue.processing}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Failed</span>
                      <span className="font-medium">{queue.failed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Wait</span>
                      <span className="font-medium">{queue.average_wait}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Throughput</span>
                      <span className="font-medium">{queue.throughput}/hr</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-medium">Queue Activity</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Queue</TableHead>
                      <TableHead>Pending</TableHead>
                      <TableHead>Processing</TableHead>
                      <TableHead>Completed Today</TableHead>
                      <TableHead>Failed Today</TableHead>
                      <TableHead>Average Wait</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queues.map((queue) => (
                      <TableRow key={queue.priority}>
                        <TableCell className="font-medium">{queue.name}</TableCell>
                        <TableCell>{queue.pending}</TableCell>
                        <TableCell>{queue.processing}</TableCell>
                        <TableCell>{queue.completed_today}</TableCell>
                        <TableCell>{queue.failed_today}</TableCell>
                        <TableCell>{queue.average_wait}s</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
