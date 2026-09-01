import { Server, Database, Activity, BarChart3, Clock } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";

const layers = [
  { label: "Next.js dashboard", icon: BarChart3 },
  { label: "FastAPI API", icon: Server },
  { label: "Job processing layer", icon: Activity },
  { label: "SQLite database", icon: Database },
];

export function ArchitectureSection() {
  return (
    <section id="architecture" className="ms-section">
      <div className="ms-container">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <SectionHeading
            eyebrow="Architecture"
            title="Lightweight, honest implementation"
            description="A focused stack that demonstrates job-processing concepts without unnecessary infrastructure. Simulated workers keep the demo deployable while preserving realistic behavior."
          />

          <div className="space-y-2">
            {layers.map((layer) => (
              <div
                key={layer.label}
                className="flex items-center gap-4 border border-border bg-background px-5 py-4"
              >
                <layer.icon className="h-5 w-5 text-[#0078d4] dark:text-[#4da6ff]" strokeWidth={1.5} />
                <span className="text-sm font-semibold text-foreground">{layer.label}</span>
              </div>
            ))}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {[
                { label: "Scheduler", icon: Clock },
                { label: "Workers", icon: Server },
                { label: "Metrics", icon: BarChart3 },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-2 border border-dashed border-border bg-[#faf9f8] py-4 dark:bg-[#252423]"
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
