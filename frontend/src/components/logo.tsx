import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { box: "h-7 w-7", text: "text-[15px]" },
  md: { box: "h-8 w-8", text: "text-base" },
  lg: { box: "h-9 w-9", text: "text-lg" },
};

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const s = sizes[size];
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex items-center justify-center bg-[#0078d4] text-white",
          s.box,
        )}
        style={{ borderRadius: "2px" }}
      >
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden>
          <path d="M8 2L3 5.5v5L8 14l5-3.5v-5L8 2zm0 2.2l2.8 2v3.6L8 12.8 5.2 10V6.2L8 4.2z" />
        </svg>
      </div>
      {showText && (
        <span className={cn("font-semibold text-foreground", s.text)}>
          TaskForge
        </span>
      )}
    </div>
  );
}
