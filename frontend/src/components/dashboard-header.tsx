"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  title: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export function DashboardHeader({
  title,
  searchValue,
  onSearchChange,
}: DashboardHeaderProps) {
  const [apiStatus, setApiStatus] = useState<"ok" | "error" | "loading">("loading");

  useEffect(() => {
    api.health()
      .then(() => setApiStatus("ok"))
      .catch(() => setApiStatus("error"));
  }, []);

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-background px-6">
      <h1 className="text-base font-semibold text-foreground">{title}</h1>

      <div className="flex items-center gap-3">
        <span className="hidden text-xs text-muted-foreground sm:inline">
          Demo environment
        </span>

        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-xs",
            apiStatus === "ok" && "text-[#107c10]",
            apiStatus === "error" && "text-[#d13438]",
            apiStatus === "loading" && "text-muted-foreground",
          )}
        >
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              apiStatus === "ok" && "bg-[#107c10]",
              apiStatus === "error" && "bg-[#d13438]",
              apiStatus === "loading" && "animate-pulse bg-[#ffb900]",
            )}
          />
          {apiStatus === "ok" ? "API online" : apiStatus === "error" ? "API offline" : "Checking…"}
        </span>

        {onSearchChange && (
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
            <Input
              placeholder="Search jobs"
              className="h-8 w-48 rounded-sm border-border pl-8 text-[13px]"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}

        <ThemeToggle />
      </div>
    </header>
  );
}
