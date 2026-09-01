"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SettingsPage() {
  return (
    <>
      <DashboardHeader title="Settings" />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <PageHeader title="Settings" subtitle="Configure your TaskForge demo workspace." />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-medium">General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Workspace</Label>
                <Input value="TaskForge Demo" readOnly />
              </div>
              <div className="space-y-2">
                <Label>Environment</Label>
                <Input value="Demo" readOnly />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-medium">Processing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Default Attempts</Label>
                <Input value="3" readOnly />
              </div>
              <div className="space-y-2">
                <Label>Retry Delay</Label>
                <Input value="2 seconds" readOnly />
              </div>
              <div className="space-y-2">
                <Label>Heartbeat Timeout</Label>
                <Input value="30 seconds" readOnly />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-medium">API</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Backend</Label>
                <Input value="FastAPI" readOnly />
              </div>
              <div className="space-y-2">
                <Label>Database</Label>
                <Input value="SQLite" readOnly />
              </div>
              <div className="space-y-2">
                <Label>API Version</Label>
                <Input value="v1" readOnly />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-medium">Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Theme</Label>
                  <p className="text-xs text-muted-foreground mt-1">Toggle light and dark mode</p>
                </div>
                <ThemeToggle />
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground">
                Settings are display-only in the demo workspace.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
