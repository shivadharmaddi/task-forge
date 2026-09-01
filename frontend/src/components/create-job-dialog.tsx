"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";

interface CreateJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

const TASKS = [
  "generate_report",
  "send_email",
  "process_dataset",
  "resize_image",
  "sync_customer",
  "unstable_task",
  "always_fail",
];

export function CreateJobDialog({ open, onOpenChange, onCreated }: CreateJobDialogProps) {
  const [task, setTask] = useState("generate_report");
  const [payload, setPayload] = useState(
    JSON.stringify({ user_id: 1024, source: "dashboard" }, null, 2),
  );
  const [priority, setPriority] = useState("normal");
  const [queue, setQueue] = useState("default");
  const [execution, setExecution] = useState("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [maxAttempts, setMaxAttempts] = useState("3");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      let parsedPayload: Record<string, unknown>;
      try {
        parsedPayload = JSON.parse(payload);
      } catch {
        setError("Invalid JSON payload");
        setLoading(false);
        return;
      }

      await api.createJob({
        task_name: task,
        payload: parsedPayload,
        priority,
        queue,
        max_attempts: parseInt(maxAttempts, 10),
        scheduled_at:
          execution === "schedule" && scheduledAt
            ? new Date(scheduledAt).toISOString()
            : undefined,
      });

      onOpenChange(false);
      onCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Job</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Task</Label>
            <Select value={task} onValueChange={(v) => setTask(v ?? "generate_report")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASKS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Payload</Label>
            <Textarea
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              className="font-mono text-xs min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v ?? "normal")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["critical", "high", "normal", "low"].map((p) => (
                    <SelectItem key={p} value={p} className="capitalize">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Queue</Label>
              <Select value={queue} onValueChange={(v) => setQueue(v ?? "default")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["default", "reports", "emails", "processing"].map((q) => (
                    <SelectItem key={q} value={q} className="capitalize">
                      {q}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Execution</Label>
            <Tabs value={execution} onValueChange={setExecution}>
              <TabsList className="w-full">
                <TabsTrigger value="now" className="flex-1">
                  Run Now
                </TabsTrigger>
                <TabsTrigger value="schedule" className="flex-1">
                  Schedule
                </TabsTrigger>
              </TabsList>
            </Tabs>
            {execution === "schedule" && (
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Maximum Attempts</Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create Job"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
