import {
  Eye,
  Layers,
  Clock,
  RefreshCw,
  Server,
  Archive,
} from "lucide-react";
import { SectionHeading } from "@/components/section-heading";

const features = [
  { icon: Eye, title: "Job monitoring", description: "Track every job from creation through completion." },
  { icon: Layers, title: "Priority queues", description: "Separate critical, high, normal, and low workloads." },
  { icon: Clock, title: "Scheduled execution", description: "Run jobs at a defined future time." },
  { icon: RefreshCw, title: "Automatic retries", description: "Re-attempt failed jobs before permanent failure." },
  { icon: Server, title: "Worker visibility", description: "Monitor active, busy, idle, and offline workers." },
  { icon: Archive, title: "Dead-letter queue", description: "Investigate jobs that exceeded retry limits." },
];

export function FeaturesSection() {
  return (
    <section className="ms-section ms-section-alt border-y border-border">
      <div className="ms-container">
        <SectionHeading
          eyebrow="Capabilities"
          title="Operational control for background work"
          description="Everything needed to understand how distributed job processing works in practice."
        />

        <div className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="bg-background p-6">
              <feature.icon
                className="h-6 w-6 text-[#0078d4] dark:text-[#4da6ff]"
                strokeWidth={1.5}
              />
              <h3 className="mt-4 text-base font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
