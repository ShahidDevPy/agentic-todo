"use client";

import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { uiCopy } from "@/shared/messages/ui-copy";

type Props = {
  /** default: large sidebar; inline: list row; compact: header chip (avatar + name only). */
  variant?: "sidebar" | "inline" | "compact";
  className?: string;
};

export function MockUserBadge({ variant = "sidebar", className }: Props) {
  const isSidebar = variant === "sidebar";
  const compact = variant === "compact";

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-full border border-border/50 bg-muted/30 py-1 pr-3 pl-1 shadow-sm",
          className,
        )}
      >
        <div
          className="from-primary flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br to-violet-600 text-white shadow-sm"
          aria-hidden
        >
          <UserRound className="size-4 opacity-95" />
        </div>
        <span className="text-muted-foreground text-xs font-medium">
          {uiCopy.mockUser.displayName}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        isSidebar ? "px-2 py-2" : "",
        className,
      )}
    >
      <div
        className={cn(
          "from-primary ring-border flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br to-violet-600 text-white shadow-sm ring-2 ring-offset-2 ring-offset-background",
          isSidebar ? "size-11 text-lg" : "size-10 text-base",
        )}
        aria-hidden
      >
        <UserRound
          className={isSidebar ? "size-6 opacity-95" : "size-5 opacity-95"}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold leading-tight">
          {uiCopy.mockUser.displayName}
        </p>
        <p className="text-muted-foreground truncate text-xs leading-snug">
          {uiCopy.mockUser.status}
        </p>
      </div>
    </div>
  );
}
