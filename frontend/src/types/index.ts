export interface Job {
  id: string;
  task_name: string;
  payload: Record<string, unknown>;
  status: string;
  priority: string;
  queue: string;
  attempt_count: number;
  max_attempts: number;
  worker_id: string | null;
  error_message: string | null;
  result: Record<string, unknown> | null;
  created_at: string;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  duration: number | null;
}

export interface JobEvent {
  id: number;
  event_type: string;
  description: string;
  worker_id: string | null;
  created_at: string;
}

export interface JobLog {
  id: number;
  level: string;
  message: string;
  created_at: string;
}

export interface JobAttempt {
  id: number;
  attempt_number: number;
  worker_id: string | null;
  status: string;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
  duration: number | null;
}

export interface JobDetail extends Job {
  events: JobEvent[];
  logs: JobLog[];
  attempts: JobAttempt[];
}

export interface Worker {
  id: string;
  status: string;
  state: string;
  current_job: string | null;
  jobs_processed: number;
  failures: number;
  success_rate: number;
  average_runtime: number;
  uptime: string;
  last_heartbeat: string;
  last_heartbeat_at: string;
}

export interface Queue {
  name: string;
  priority: string;
  waiting: number;
  processing: number;
  failed: number;
  average_wait: number;
  throughput: number;
  pending: number;
  completed_today: number;
  failed_today: number;
}

export interface Activity {
  id: number;
  event_type: string;
  category: string;
  message: string;
  job_id: string | null;
  worker_id: string | null;
  created_at: string;
}

export interface Metrics {
  total_jobs: number;
  completed: number;
  failed: number;
  queued: number;
  scheduled: number;
  dead_letter: number;
  processing: number;
  retrying: number;
  success_rate: number;
  average_duration: number;
  queue_depth: number;
  active_workers: number;
  jobs_by_status: Record<string, number>;
  jobs_by_priority: Record<string, number>;
  activity_over_time: Array<{
    time: string;
    label: string;
    successful: number;
    failed: number;
  }>;
  queue_distribution: Record<string, number>;
}

export interface JobsListResponse {
  jobs: Job[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}
