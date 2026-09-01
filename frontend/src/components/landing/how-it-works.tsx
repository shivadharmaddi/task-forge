import { SectionHeading } from "@/components/section-heading";

const happyPath = ["Application", "TaskForge API", "Priority queue", "Worker", "Completed"];
const failurePath = ["Worker", "Job failed", "Retry", "Worker", "Dead-letter queue"];

function FlowColumn({ title, steps, highlightLast }: { title: string; steps: string[]; highlightLast?: "success" | "error" }) {
  return (
    <div className="ms-card p-6">
      <h3 className="mb-5 text-sm font-semibold text-foreground">{title}</h3>
      <ol className="space-y-0">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          return (
            <li key={step} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center text-xs font-semibold ${
                    isLast && highlightLast === "success"
                      ? "bg-[#107c10] text-white"
                      : isLast && highlightLast === "error"
                        ? "bg-[#d13438] text-white"
                        : "bg-[#0078d4] text-white"
                  }`}
                  style={{ borderRadius: "2px" }}
                >
                  {i + 1}
                </span>
                {i < steps.length - 1 && (
                  <div className="my-1 w-px flex-1 bg-border min-h-[16px]" />
                )}
              </div>
              <p className={`pb-4 text-sm ${isLast ? "font-semibold" : "text-foreground"}`}>
                {step}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="ms-section ms-section-alt border-y border-border">
      <div className="ms-container">
        <SectionHeading
          eyebrow="Workflow"
          title="How jobs move through the system"
          description="A clear path from submission to completion — with defined behavior when failures occur."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <FlowColumn title="Standard processing" steps={happyPath} highlightLast="success" />
          <FlowColumn title="Failure and recovery" steps={failurePath} highlightLast="error" />
        </div>

        <div className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {[
            { term: "Queues", desc: "Organize waiting work by priority." },
            { term: "Workers", desc: "Execute jobs in the background." },
            { term: "Retries", desc: "Automatically re-run failed jobs." },
            { term: "Dead letter", desc: "Isolate jobs that exceed retry limits." },
          ].map((item) => (
            <div key={item.term} className="bg-background p-5">
              <h4 className="text-sm font-semibold text-foreground">{item.term}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
