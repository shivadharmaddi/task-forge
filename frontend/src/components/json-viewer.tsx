"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface JsonViewerProps {
  data: Record<string, unknown> | null;
  title?: string;
}

export function JsonViewer({ data, title }: JsonViewerProps) {
  const [copied, setCopied] = useState(false);
  const json = data ? JSON.stringify(data, null, 2) : "{}";

  const handleCopy = () => {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-border/60 bg-muted/30">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-2">
        {title && <span className="text-sm font-medium">{title}</span>}
        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 gap-1.5">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-foreground/90">
        {json}
      </pre>
    </div>
  );
}
