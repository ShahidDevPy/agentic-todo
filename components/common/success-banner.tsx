import { CheckCircle2, Info, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type SuccessBannerTone = "success" | "danger" | "neutral";

type SuccessBannerProps = {
  message: string | null;
  tone?: SuccessBannerTone;
  className?: string;
  onDismiss?: () => void;
};

export function SuccessBanner({
  message,
  tone = "success",
  className,
  onDismiss,
}: SuccessBannerProps) {
  if (!message) return null;

  const toneClass =
    tone === "danger"
      ? "border-destructive/50 bg-destructive/10 text-destructive"
      : tone === "neutral"
        ? "border-border/50 bg-muted/50 text-foreground"
        : "border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100";

  const icon =
    tone === "danger" ? (
      <Trash2 className="mt-0.5 size-4 shrink-0" aria-hidden />
    ) : tone === "neutral" ? (
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
    ) : (
      <CheckCircle2
        className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
        aria-hidden
      />
    );

  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 rounded-lg border px-3 py-2 text-sm shadow-md",
        toneClass,
        className,
      )}
    >
      {icon}
      <div className="min-w-0 flex-1">{message}</div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-xs font-medium hover:underline"
        >
          Dismiss
        </button>
      ) : null}
    </div>
  );
}
