"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowDown,
  Server,
  Database,
  Clock,
  Activity,
  BarChart3,
} from "lucide-react";

const steps = [
  {
    title: "Submit",
    description: "A client submits a task and JSON payload through the API.",
  },
  {
    title: "Queue",
    description: "TaskForge stores the job and assigns its status and priority.",
  },
  {
    title: "Process",
    description: "A worker claims the job and processes the task.",
  },
  {
    title: "Track",
    description: "Execution status, worker information, attempts, logs, and timing are recorded.",
  },
  {
    title: "Recover",
    description: "Failed jobs can retry automatically. Failed jobs can automatically run again.",
  },
  {
    title: "Isolate",
    description: "Jobs exceeding the retry limit move to the dead-letter queue.",
  },
];

export default function ArchitecturePage() {
  return (
    <>
      <DashboardHeader title="Architecture" />
      <div className="flex-1 overflow-auto p-6 space-y-8">
        <PageHeader
          title="How TaskForge Works"
          subtitle="A technical overview of the job processing architecture."
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={step.title} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-muted text-sm font-medium">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-medium">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-medium">System Architecture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-2 py-4">
                {[
                  { label: "Next.js Dashboard", icon: BarChart3 },
                  { label: "FastAPI API", icon: Server },
                  { label: "Job Processing Layer", icon: Activity },
                  { label: "SQLite Database", icon: Database },
                ].map((layer, i) => (
                  <div key={layer.label} className="flex flex-col items-center w-full">
                    <div className="flex w-full max-w-xs items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
                      <layer.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{layer.label}</span>
                    </div>
                    {i < 3 && <ArrowDown className="my-1 h-4 w-4 text-muted-foreground" />}
                  </div>
                ))}

                <div className="mt-6 grid w-full max-w-xs grid-cols-3 gap-2">
                  {[
                    { label: "Scheduler", icon: Clock },
                    { label: "Workers", icon: Server },
                    { label: "Metrics", icon: BarChart3 },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex flex-col items-center gap-1 rounded-lg border border-dashed border-border/60 p-3 text-center"
                    >
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium">Why this implementation is lightweight</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>
              TaskForge is a portfolio implementation focused on demonstrating job-processing
              architecture and observability. Worker behavior is intentionally simulated through
              a lightweight FastAPI processing layer rather than a production-scale distributed
              worker cluster.
            </p>
            <p>
              This makes the project honest while still demonstrating the concepts: priority queues,
              scheduled execution, automatic retries, dead-letter handling, worker visibility, and
              job lifecycle tracking.
            </p>
            <p>
              The database layer is designed to support PostgreSQL via <code className="text-xs bg-muted px-1 py-0.5 rounded">DATABASE_URL</code>,
              and the frontend communicates with the backend through a REST API — no mock data in production.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium">Technology Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {["Next.js", "TypeScript", "FastAPI", "Python", "SQLAlchemy", "SQLite", "Docker", "Recharts"].map(
                (tech) => (
                  <div
                    key={tech}
                    className="rounded-lg border border-border/60 px-3 py-2 text-sm text-center font-medium"
                  >
                    {tech}
                  </div>
                ),
              )}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Source code maintained privately. Available upon request.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
