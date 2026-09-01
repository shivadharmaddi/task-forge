import type {
  Activity,
  Job,
  JobDetail,
  JobsListResponse,
  Metrics,
  Queue,
  Worker,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: res.statusText }));
      throw new ApiError(error.detail || "Request failed", res.status);
    }

    return res.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Unable to connect to API", 0);
  }
}

export const api = {
  health: () => fetchApi<{ status: string; version: string }>("/api/health"),

  getJobs: (params?: Record<string, string | number>) => {
    const query = params
      ? "?" + new URLSearchParams(params as Record<string, string>).toString()
      : "";
    return fetchApi<JobsListResponse>(`/api/jobs${query}`);
  },

  getJob: (id: string) => fetchApi<JobDetail>(`/api/jobs/${id}`),

  createJob: (data: {
    task_name: string;
    payload: Record<string, unknown>;
    priority: string;
    queue: string;
    max_attempts: number;
    scheduled_at?: string;
  }) =>
    fetchApi<Job>("/api/jobs", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  retryJob: (id: string) =>
    fetchApi<Job>(`/api/jobs/${id}/retry`, { method: "POST" }),

  cancelJob: (id: string) =>
    fetchApi<Job>(`/api/jobs/${id}/cancel`, { method: "POST" }),

  deleteJob: (id: string) =>
    fetchApi<{ message: string }>(`/api/jobs/${id}`, { method: "DELETE" }),

  getWorkers: () => fetchApi<Worker[]>("/api/workers"),

  getQueues: () => fetchApi<Queue[]>("/api/queues"),

  getActivity: (category?: string) => {
    const query = category && category !== "all" ? `?category=${category}` : "";
    return fetchApi<Activity[]>(`/api/activity${query}`);
  },

  getMetrics: (period = "24h") =>
    fetchApi<Metrics>(`/api/metrics?period=${period}`),

  getScheduled: () =>
    fetchApi<{ jobs: Job[] }>("/api/scheduled"),

  getDeadLetter: () =>
    fetchApi<{ jobs: Job[] }>("/api/dead-letter"),
};

export { ApiError };
