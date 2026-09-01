const priorityColors: Record<string, string> = {
  critical: "#d13438",
  high: "#ca5010",
  normal: "#0078d4",
  low: "#8a8886",
};

export function PriorityBadge({ priority }: { priority: string }) {
  const color = priorityColors[priority] || "#8a8886";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs capitalize text-foreground">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {priority}
    </span>
  );
}
