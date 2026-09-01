import { format, formatDistanceToNow } from "date-fns";

export function formatDate(date: string | null): string {
  if (!date) return "—";
  return format(new Date(date), "MMM d, yyyy HH:mm:ss");
}

export function formatRelative(date: string | null): string {
  if (!date) return "—";
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds === undefined) return "—";
  if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
  return `${seconds.toFixed(1)}s`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString();
}

export function formatPercent(n: number): string {
  return `${n.toFixed(1)}%`;
}
