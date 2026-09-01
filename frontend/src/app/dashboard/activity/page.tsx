"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { PageHeader } from "@/components/page-header";
import { ActivityItem } from "@/components/activity-item";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import { api } from "@/lib/api";
import type { Activity } from "@/types";

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadActivity = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await api.getActivity(category);
      setActivities(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    loadActivity();
    const interval = setInterval(loadActivity, 5000);
    return () => clearInterval(interval);
  }, [loadActivity]);

  return (
    <>
      <DashboardHeader title="Activity" />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <PageHeader
          title="Activity"
          subtitle="Chronological feed of job processing, worker, and system events."
        />

        <Tabs value={category} onValueChange={setCategory}>
          <TabsList>
            {["all", "jobs", "workers", "system"].map((c) => (
              <TabsTrigger key={c} value={c} className="capitalize">
                {c}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {error ? (
          <ErrorState onRetry={loadActivity} />
        ) : loading ? (
          <LoadingSkeleton rows={10} />
        ) : (
          <Card className="border-border/60 shadow-sm">
            <CardContent className="divide-y divide-border/60 p-4">
              {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
