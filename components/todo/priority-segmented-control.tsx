"use client";

import { cn } from "@/lib/utils";
import { uiCopy } from "@/shared/messages/ui-copy";
import type { TodoPriority } from "@/types/todo-view";

export const PRIORITY_SEGMENTS: {
  value: TodoPriority;
  label: string;
  labelClass: string;
}[] = [
  {
    value: "low",
    label: "Low",
    labelClass: "text-slate-600 dark:text-slate-400",
  },
  {
    value: "medium",
    label: "Medium",
    labelClass: "text-amber-600 dark:text-amber-400",
  },
  {
    value: "high",
    label: "High",
    labelClass: "text-red-600 dark:text-red-400",
  },
];

type Props = {
  value: TodoPriority;
  onChange: (p: TodoPriority) => void;
  ariaLabel?: string;
  disabled?: boolean;
};

export function PrioritySegmentedControl({
  value,
  onChange,
  ariaLabel = uiCopy.addTask.priorityLabel,
  disabled,
}: Props) {
  return (
    <div className="min-w-0 space-y-2">
      <span className="text-sm font-medium">{ariaLabel}</span>
      <div
        className="bg-muted/50 inline-flex w-full max-w-full rounded-lg p-0.5 ring-1 ring-border/30"
        role="group"
        aria-label={ariaLabel}
      >
        {PRIORITY_SEGMENTS.map(({ value: v, label, labelClass }) => (
          <button
            key={v}
            type="button"
            disabled={disabled}
            className={cn(
              "min-w-0 flex-1 rounded-md px-1.5 py-2 text-xs font-medium transition-colors sm:px-2 sm:py-1.5 sm:text-sm",
              disabled && "pointer-events-none opacity-50",
              value === v
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/40"
                : "opacity-75 hover:bg-muted/60 hover:opacity-100",
            )}
            aria-pressed={value === v}
            onClick={() => onChange(v)}
          >
            <span className={labelClass}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
