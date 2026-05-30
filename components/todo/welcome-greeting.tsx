"use client";

import { useEffect, useState } from "react";
import { UserProfileBadge } from "@/components/common/user-profile-badge";
import { greetingForDate } from "@/lib/format/time-greeting";
import { uiCopy } from "@/shared/messages/ui-copy";

type Props = {
  className?: string;
  greetingName: string;
  avatarUrl?: string | null;
};

export function WelcomeGreeting({ className, greetingName, avatarUrl }: Props) {
  const [greeting, setGreeting] = useState<string | null>(null);

  useEffect(() => {
    setGreeting(greetingForDate(new Date()));
  }, []);

  const line = greeting
    ? `${greeting}, ${greetingName}`
    : `${uiCopy.welcome.hello}, ${greetingName}`;

  return (
    <div
      className={`border-primary/20 from-card rounded-2xl border bg-gradient-to-br to-primary/5 p-4 shadow-md ring-1 ring-black/[0.04] dark:ring-white/[0.06] ${className ?? ""}`}
    >
      <div className="flex min-w-0 flex-col items-stretch gap-3 sm:flex-row sm:items-start">
        <UserProfileBadge
          variant="greeting"
          className="p-0 sm:shrink-0"
          avatarUrl={avatarUrl}
          profileTitle={greetingName}
        />
        <div className="min-w-0 pt-0.5 sm:pt-0">
          <h1
            className="text-xl font-semibold tracking-tight sm:text-2xl"
            suppressHydrationWarning
          >
            {line}
          </h1>
          <p className="text-muted-foreground mt-1 max-w-prose text-sm leading-relaxed">
            {uiCopy.welcome.subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
