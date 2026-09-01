"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = {
  successful: "#107c10",
  failed: "#d13438",
  critical: "#d13438",
  high: "#ca5010",
  normal: "#0078d4",
  low: "#8a8886",
  completed: "#107c10",
  processing: "#0078d4",
  queued: "#ffb900",
  retrying: "#ca5010",
  scheduled: "#8764b8",
  failed_status: "#d13438",
};

interface JobActivityChartProps {
  data: Array<{ label: string; successful: number; failed: number }>;
}

export function JobActivityChart({ data }: JobActivityChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barGap={2} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid stroke="#e1dfdd" strokeDasharray="0" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#616161" }}
          axisLine={{ stroke: "#e1dfdd" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#616161" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #e1dfdd",
            borderRadius: "2px",
            fontSize: "12px",
            color: "#242424",
          }}
        />
        <Bar dataKey="successful" fill={COLORS.successful} name="Successful" maxBarSize={28} />
        <Bar dataKey="failed" fill={COLORS.failed} name="Failed" maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface DistributionChartProps {
  data: Array<{ name: string; value: number; color: string }>;
}

export function DistributionChart({ data }: DistributionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={210}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={72}
          paddingAngle={1}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #e1dfdd",
            borderRadius: "2px",
            fontSize: "12px",
          }}
        />
        <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function getPriorityColor(priority: string): string {
  return COLORS[priority as keyof typeof COLORS] || COLORS.normal;
}

export function getStatusColor(status: string): string {
  if (status === "failed" || status === "dead_letter") return COLORS.failed_status;
  return COLORS[status as keyof typeof COLORS] || COLORS.normal;
}
