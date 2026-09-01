const statusConfig: Record<string, { color: string; label?: string }> = {
  completed: { color: "#107c10" },
  processing: { color: "#0078d4" },
  queued: { color: "#ffb900" },
  scheduled: { color: "#8764b8" },
  retrying: { color: "#ca5010" },
  failed: { color: "#d13438" },
  dead_letter: { color: "#d13438", label: "Dead letter" },
  cancelled: { color: "#8a8886" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { color: "#8a8886" };
  const label = config.label || status.replace(/_/g, " ");

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-foreground capitalize">
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      {label}
    </span>
  );
}
