import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  dark?: boolean;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  dark = false,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-[640px]",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "mb-2 text-sm font-semibold",
            dark ? "text-[#4da6ff]" : "text-[#0078d4]",
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "text-[clamp(1.75rem,4vw,2.25rem)] font-semibold leading-tight",
          dark ? "text-white" : "text-foreground",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-3 text-base leading-relaxed",
            dark ? "text-[#d2d0ce]" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
