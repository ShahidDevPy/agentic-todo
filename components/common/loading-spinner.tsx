import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  label?: string;
};

export function LoadingSpinner({ className, label = "Loading" }: Props) {
  return (
    <div
      className={cn("flex items-center justify-center gap-2", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2
        className="text-muted-foreground size-8 animate-spin"
        aria-hidden
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
