import { cn } from "@/lib/utils";
import {
  authCardClassName,
  authHeaderClassName,
} from "@/components/auth/auth-card-styles";

export function AuthCardSkeleton() {
  return (
    <div className={cn(authCardClassName, "animate-pulse")} aria-hidden>
      <div className={authHeaderClassName}>
        <div className="bg-muted h-9 w-full rounded-lg" />
        <div className="bg-muted/70 mt-3 h-4 w-4/5 rounded" />
      </div>
      <div className="space-y-4 px-5 py-5 sm:px-6">
        <div className="bg-muted h-10 w-full rounded-lg" />
        <div className="bg-muted/60 h-px w-full" />
        <div className="space-y-2">
          <div className="bg-muted/70 h-4 w-16 rounded" />
          <div className="bg-muted h-10 w-full rounded-lg" />
        </div>
        <div className="space-y-2">
          <div className="bg-muted/70 h-4 w-20 rounded" />
          <div className="bg-muted h-10 w-full rounded-lg" />
        </div>
      </div>
      <div className="border-border/50 border-t px-5 py-4 sm:px-6">
        <div className="bg-muted h-10 w-28 rounded-lg" />
      </div>
    </div>
  );
}
