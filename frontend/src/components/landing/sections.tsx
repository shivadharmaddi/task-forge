import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/section-heading";

const technologies = [
  "Next.js", "TypeScript", "FastAPI", "Python",
  "SQLAlchemy", "SQLite", "Docker", "GitHub Actions", "pytest",
];

export function TechnicalSection() {
  return (
    <section className="ms-section">
      <div className="ms-container">
        <SectionHeading
          eyebrow="Technology"
          title="Built with proven engineering tools"
          description="A modern stack chosen for clarity, maintainability, and straightforward deployment."
        />

        <div className="mt-10 flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <span
              key={tech}
              className="border border-border bg-[#faf9f8] px-3 py-1.5 text-sm text-foreground dark:bg-[#252423]"
            >
              {tech}
            </span>
          ))}
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Source code maintained privately. Available upon request.
        </p>
      </div>
    </section>
  );
}

export function DemoCTASection() {
  return (
    <section id="demo" className="bg-[#0078d4] py-16 lg:py-20">
      <div className="ms-container text-center">
        <SectionHeading
          title="Explore the live demo"
          description="Submit jobs, inspect timelines, trigger failures, retry work, and review worker activity in the demo workspace."
          align="center"
          dark
        />
        <Link href="/dashboard" className="mt-8 inline-block">
          <Button className="h-10 rounded-sm bg-white px-8 text-sm font-semibold text-[#0078d4] hover:bg-[#f0f0f0]">
            Open dashboard
          </Button>
        </Link>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-[#faf9f8] py-10 dark:bg-[#1f1e1d]">
      <div className="ms-container space-y-1 text-center text-sm text-muted-foreground">
        <p>TaskForge — A distributed job-processing portfolio project.</p>
        <p className="text-xs">Designed and built by Shivadhar Reddy Maddi.</p>
      </div>
    </footer>
  );
}
