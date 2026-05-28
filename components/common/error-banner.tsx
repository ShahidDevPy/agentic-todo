import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ErrorBannerProps = {
  message: string | null;
  className?: string;
  onDismiss?: () => void;
};

export function ErrorBanner({ message, className, onDismiss }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={cn(
        "border-destructive/50 bg-destructive/10 text-destructive flex items-start gap-3 rounded-lg border px-3 py-2 text-sm",
        className,
      )}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">{message}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-destructive hover:underline shrink-0 text-xs font-medium"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
