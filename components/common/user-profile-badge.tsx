"use client";

import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { uiCopy } from "@/shared/messages/ui-copy";

type Props = {
  /**
   * default: large sidebar; inline: list row; compact: header chip;
   * greeting: avatar only (next to welcome headline).
   */
  variant?: "sidebar" | "inline" | "compact" | "greeting";
  className?: string;
  /** When set, replaces the default “You” / profile label (all variants). */
  profileTitle?: string | null;
  /** Inline / sidebar: second line. Compact: optional muted line under the title. */
  profileSubtitle?: string | null;
  /** Optional avatar for `variant="greeting"` / `compact` (Google OAuth, etc). */
  avatarUrl?: string | null;
};

export function UserProfileBadge({
  variant = "sidebar",
  className,
  profileTitle,
  profileSubtitle,
  avatarUrl,
}: Props) {
  const isSidebar = variant === "sidebar";
  const compact = variant === "compact";
  const greetingOnly = variant === "greeting";

  if (greetingOnly) {
    return (
      <div
        className={cn("flex shrink-0 items-center", className)}
        aria-hidden
      >
        <div
          className={cn(
            "from-primary ring-border flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br to-violet-600 text-base text-white shadow-sm ring-2 ring-offset-2 ring-offset-background",
            // Keep content nicely clipped.
            "overflow-hidden",
          )}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              className="size-full object-cover"
            />
          ) : (
            <UserRound className="size-5 opacity-95" />
          )}
        </div>
      </div>
    );
  }

  const title = profileTitle?.trim() || uiCopy.mockUser.displayName;
  const subtitle =
    profileSubtitle?.trim() || uiCopy.mockUser.status;

  if (compact) {
    return (
      <div
        className={cn(
          "border-border/60 flex max-w-full items-center gap-2.5 rounded-full border bg-muted/30 py-1 pr-3 pl-1 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]",
          className,
        )}
      >
        <div
          className="from-primary flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br to-violet-600 text-white shadow-sm"
          aria-hidden
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              className="size-full object-cover"
            />
          ) : (
            <UserRound className="size-4 opacity-95" />
          )}
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <span className="text-foreground block truncate text-xs font-medium">
            {title}
          </span>
          {profileSubtitle?.trim() ? (
            <span className="text-muted-foreground block truncate text-[10px] font-normal">
              {profileSubtitle.trim()}
            </span>
          ) : null}
        </div>
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
        <p className="truncate text-sm font-semibold leading-tight">{title}</p>
        <p className="text-muted-foreground truncate text-xs leading-snug">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
