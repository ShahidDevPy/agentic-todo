"use client";

import { MockUserBadge } from "@/components/common/mock-user-badge";
import { uiCopy } from "@/shared/messages/ui-copy";

function greetingForHour(d: Date): string {
  const h = d.getHours();
  if (h < 12) return uiCopy.welcome.morning;
  if (h < 17) return uiCopy.welcome.afternoon;
  return uiCopy.welcome.evening;
}

type Props = {
  className?: string;
};

export function WelcomeGreeting({ className }: Props) {
  const line = `${greetingForHour(new Date())}, ${uiCopy.welcome.name}`;
  return (
    <div
      className={`border-primary/15 from-card rounded-2xl border bg-gradient-to-br to-primary/5 p-4 shadow-sm ${className ?? ""}`}
    >
      <div className="flex min-w-0 flex-col items-stretch gap-3 sm:flex-row sm:items-start">
        <MockUserBadge variant="inline" className="p-0 sm:shrink-0" />
        <div className="min-w-0 pt-0.5 sm:pt-0">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
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
