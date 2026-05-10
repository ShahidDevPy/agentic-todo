"use client";

import { Star } from "lucide-react";
import { memo, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { PriorityDotPicker } from "@/components/todo/priority-dot-picker";
import { cn } from "@/lib/utils";
import { formatDueLabel } from "@/lib/format/due-date";
import { uiCopy } from "@/shared/messages/ui-copy";
import type { TodoGql, TodoPriority } from "@/types/todo-view";

export type TodoTaskRowProps = {
  todo: TodoGql;
  selected: boolean;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onUpdatePriority: (id: string, priority: TodoPriority) => void;
};

function TodoTaskRowInner({
  todo,
  selected,
  onSelect,
  onToggle,
  onUpdatePriority,
}: TodoTaskRowProps) {
  const due = formatDueLabel(todo.dueDate);

  const handleRowActivate = useCallback(() => {
    onSelect(todo.id);
  }, [onSelect, todo.id]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect(todo.id);
      }
    },
    [onSelect, todo.id],
  );

  const handlePriorityChange = useCallback(
    (p: TodoPriority) => {
      onUpdatePriority(todo.id, p);
    },
    [onUpdatePriority, todo.id],
  );

  return (
    <li>
      <div
        role="button"
        tabIndex={0}
        onClick={handleRowActivate}
        onKeyDown={handleKeyDown}
        className={cn(
          "hover:bg-muted/70 flex w-full min-w-0 cursor-pointer touch-manipulation items-center gap-1.5 rounded-lg border border-transparent px-2 py-1.5 text-left text-sm transition-colors sm:gap-2 sm:px-2.5 sm:py-2 sm:text-base",
          selected &&
            "border-primary/20 bg-accent/60 shadow-sm ring-1 ring-primary/15",
        )}
      >
        <div
          className="inline-flex shrink-0"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={todo.isCompleted}
            onCheckedChange={() => onToggle(todo.id)}
            className="mt-0.5"
            aria-label={
              todo.isCompleted
                ? uiCopy.a11y.markNotDone
                : uiCopy.a11y.markDone
            }
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={cn(
                    "min-w-0 truncate font-medium",
                    todo.isCompleted && "text-muted-foreground line-through",
                  )}
                >
                  {todo.title}
                </span>
                {todo.starred ? (
                  <Star
                    className="fill-amber-400 text-amber-500 size-3.5 shrink-0"
                    aria-hidden
                  />
                ) : null}
              </div>
            </div>
            <div
              className="shrink-0 pt-0.5"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <PriorityDotPicker
                value={todo.priority}
                onChange={handlePriorityChange}
                compact
                disabled={todo.isCompleted}
              />
            </div>
          </div>
          {due ? (
            <p className="text-muted-foreground truncate text-xs">Due {due}</p>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export const TodoTaskRow = memo(TodoTaskRowInner);
