"use client";

import { cn } from "@/lib/utils";
import { uiCopy } from "@/shared/messages/ui-copy";
import type { TodoPriority } from "@/types/todo-view";

const LEVELS: {
  value: TodoPriority;
  ariaLabel: string;
  active: string;
  idle: string;
  ring: string;
}[] = [
  {
    value: "low",
    ariaLabel: uiCopy.a11y.priorityLow,
    active: "bg-slate-500 shadow-inner dark:bg-slate-400",
    idle: "bg-slate-300 dark:bg-slate-600",
    ring: "ring-slate-500 dark:ring-slate-400",
  },
  {
    value: "medium",
    ariaLabel: uiCopy.a11y.priorityMedium,
    active: "bg-amber-500 shadow-inner",
    idle: "bg-amber-300 dark:bg-amber-600",
    ring: "ring-amber-500 dark:ring-amber-400",
  },
  {
    value: "high",
    ariaLabel: uiCopy.a11y.priorityHigh,
    active: "bg-red-500 shadow-inner dark:bg-red-600",
    idle: "bg-red-300 dark:bg-red-700",
    ring: "ring-red-500 dark:ring-red-400",
  },
];

type Props = {
  value: TodoPriority;
  onChange: (p: TodoPriority) => void;
  className?: string;
  disabled?: boolean;
  compact?: boolean;
};

export function PriorityDotPicker({
  value,
  onChange,
  className,
  disabled,
  compact = false,
}: Props) {
  return (
    <div
      role="radiogroup"
      aria-label={uiCopy.a11y.priorityGroup}
      className={cn(
        "flex shrink-0 items-center",
        compact ? "gap-1" : "gap-2",
        className,
      )}
    >
      {LEVELS.map(({ value: v, ariaLabel, active, idle, ring }) => {
        const selected = value === v;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            title={ariaLabel}
            aria-label={ariaLabel}
            onClick={() => onChange(v)}
            className={cn(
              "rounded-full outline-none transition-transform focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              compact ? "p-0.5" : "p-1",
              disabled && "pointer-events-none opacity-50",
            )}
          >
            <span
              className={cn(
                "block rounded-full ring-offset-background",
                compact
                  ? "size-2.5 ring-1 ring-offset-1"
                  : "size-3.5 ring-2 ring-offset-2",
                selected ? cn(active, ring) : cn(idle, "ring-transparent"),
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
