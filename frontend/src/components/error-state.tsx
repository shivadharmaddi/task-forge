import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "Unable to load data. Please check your connection and try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 py-16 text-center">
      <div className="rounded-full bg-destructive/10 p-3">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="mt-4 text-sm font-medium">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-4" size="sm">
          Try again
        </Button>
      )}
    </div>
  );
}
