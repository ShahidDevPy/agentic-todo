"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { uiCopy } from "@/shared/messages/ui-copy";

type Status = "idle" | "thinking" | "preview" | "applying";

type Props = {
  status: Status;
  listening?: boolean;
  className?: string;
};

export function AssistantStatusChip({
  status,
  listening,
  className,
}: Props) {
  if (status === "idle" && !listening) return null;

  const label = listening
    ? uiCopy.assistant.listening
    : status === "thinking"
      ? uiCopy.assistant.thinking
      : status === "applying"
        ? uiCopy.assistant.applying
        : status === "preview"
          ? uiCopy.assistant.confirmHint
          : null;

  if (!label) return null;

  return (
    <span
      className={cn(
        "text-muted-foreground inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/40 px-2.5 py-1 text-xs",
        className,
      )}
      aria-live="polite"
    >
      {status === "thinking" || status === "applying" || listening ? (
        <Loader2 className="size-3 animate-spin" aria-hidden />
      ) : null}
      {label}
    </span>
  );
}
