import {
  Mail,
  FileText,
  Image,
  Database,
  FileSpreadsheet,
  BarChart3,
} from "lucide-react";
import { SectionHeading } from "@/components/section-heading";

const examples = [
  { icon: Mail, label: "Sending emails" },
  { icon: FileText, label: "Generating reports" },
  { icon: Image, label: "Processing files" },
  { icon: Database, label: "Syncing customer data" },
  { icon: FileSpreadsheet, label: "Exporting invoices" },
  { icon: BarChart3, label: "Processing datasets" },
];

export function ProblemSection() {
  return (
    <section id="product" className="ms-section">
      <div className="ms-container">
        <SectionHeading
          eyebrow="The challenge"
          title="Background jobs get complicated quickly"
          description="Modern applications run work outside the main request path. As systems grow, teams need reliable queuing, processing, retries, and observability."
        />

        <div className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {examples.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-4 bg-background p-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#deecf9] dark:bg-[#004578]">
                <item.icon className="h-5 w-5 text-[#0078d4] dark:text-[#4da6ff]" strokeWidth={1.5} />
              </div>
              <span className="text-sm font-normal text-foreground">{item.label}</span>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          TaskForge demonstrates how jobs can be queued, processed, retried, scheduled, and monitored from a single operational view.
        </p>
      </div>
    </section>
  );
}
