"use client";

import { ArrowDown, ArrowUp, Star, Trash2 } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { DueDateTimeFields } from "@/components/todo/due-date-time-fields";
import { PriorityDotPicker } from "@/components/todo/priority-dot-picker";
import {
  dateAndTimePartsToIso,
  isoToDateAndTimeParts,
} from "@/lib/format/due-input-parts";
import { formatDueLabel } from "@/lib/format/due-date";
import { uiCopy } from "@/shared/messages/ui-copy";
import type { TodoGql, TodoPriority } from "@/types/todo-view";

export type TodoDetailPanelProps = {
  todo: TodoGql | null;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  reorderEnabled?: boolean;
  className?: string;
  onToggle: (id: string) => void;
  onStar: (id: string, starred: boolean) => void;
  onDeleteRequest: (todo: TodoGql) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onUpdate: (
    id: string,
    patch: {
      title?: string;
      description?: string | null;
      priority?: TodoPriority;
      dueDateISO?: string | null;
    },
  ) => void;
};

function TodoDetailPanelInner({
  todo,
  index,
  isFirst,
  isLast,
  reorderEnabled = true,
  className,
  onToggle,
  onStar,
  onDeleteRequest,
  onMove,
  onUpdate,
}: TodoDetailPanelProps) {
  const [title, setTitle] = useState(() => todo?.title ?? "");
  const [description, setDescription] = useState(() => todo?.description ?? "");
  const [priority, setPriority] = useState<TodoPriority>(
    () => todo?.priority ?? "medium",
  );
  const [dueDate, setDueDate] = useState(
    () => isoToDateAndTimeParts(todo?.dueDate ?? null).date,
  );
  const [dueTime, setDueTime] = useState(
    () => isoToDateAndTimeParts(todo?.dueDate ?? null).time,
  );

  const handleToggle = useCallback(() => {
    if (todo) onToggle(todo.id);
  }, [onToggle, todo]);

  const handleStar = useCallback(() => {
    if (todo) onStar(todo.id, !todo.starred);
  }, [onStar, todo]);

  const handleDelete = useCallback(() => {
    if (todo) onDeleteRequest(todo);
  }, [onDeleteRequest, todo]);

  const commitTitle = useCallback(() => {
    if (!todo) return;
    const next = title.trim();
    if (!next) {
      setTitle(todo.title);
      return;
    }
    if (next !== todo.title) onUpdate(todo.id, { title: next });
  }, [onUpdate, title, todo]);

  const commitDescription = useCallback(() => {
    if (!todo) return;
    const next = description.trim() || null;
    const prev = todo.description?.trim() || null;
    if (next !== prev) onUpdate(todo.id, { description: next });
  }, [description, onUpdate, todo]);

  const setPriorityLevel = useCallback(
    (v: TodoPriority) => {
      if (!todo || v === todo.priority) return;
      setPriority(v);
      onUpdate(todo.id, { priority: v });
    },
    [onUpdate, todo],
  );

  const pushDueIfChanged = useCallback(
    (nextDate: string, nextTime: string) => {
      setDueDate(nextDate);
      setDueTime(nextDate ? nextTime : "");
      if (!todo) return;
      const iso = dateAndTimePartsToIso(nextDate, nextDate ? nextTime : "");
      const prevMs = todo.dueDate
        ? new Date(todo.dueDate).getTime()
        : null;
      const nextMs = iso ? new Date(iso).getTime() : null;
      if (prevMs === nextMs) return;
      onUpdate(todo.id, { dueDateISO: iso });
    },
    [onUpdate, todo],
  );

  const dueReadable = todo ? formatDueLabel(todo.dueDate) : null;

  if (!todo) {
    return (
      <Card
        className={cn(
          "border-dashed bg-transparent py-0 shadow-none",
          className,
        )}
      >
        <CardContent className="flex flex-col items-center justify-center gap-2 px-4 py-16 text-center">
          <p className="text-muted-foreground max-w-xs text-sm">
            {uiCopy.detail.placeholder}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "border-muted/50 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05] max-sm:gap-4 max-sm:py-4",
        className,
      )}
    >
      <CardHeader className="items-stretch space-y-0 px-4 pb-3 sm:px-6">
        <div className="space-y-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <label className="sr-only" htmlFor="tdp-title">
                {uiCopy.addTask.titleLabel}
              </label>
              <Input
                id="tdp-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={commitTitle}
                autoComplete="off"
                className={cn(
                  "text-foreground h-auto w-full min-w-0 border-transparent bg-transparent px-0 py-1.5 text-xl font-semibold tracking-tight shadow-none sm:text-2xl md:text-[1.65rem]",
                  "focus-visible:ring-offset-0",
                  todo.isCompleted && "text-muted-foreground line-through",
                )}
              />
            </div>
            <PriorityDotPicker
              value={priority}
              onChange={setPriorityLevel}
              className="pt-1.5"
              disabled={todo.isCompleted}
            />
          </div>

          <Separator className="bg-border/60" />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 shrink-0"
                onClick={handleToggle}
              >
                {todo.isCompleted
                  ? uiCopy.detail.markIncomplete
                  : uiCopy.detail.markComplete}
              </Button>
              {reorderEnabled ? (
                <div className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="size-8 shrink-0"
                    aria-label={uiCopy.a11y.moveUp}
                    disabled={isFirst}
                    onClick={() => onMove(index, -1)}
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="size-8 shrink-0"
                    aria-label={uiCopy.a11y.moveDown}
                    disabled={isLast}
                    onClick={() => onMove(index, 1)}
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-0.5 sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                aria-label={
                  todo.starred ? uiCopy.a11y.unstar : uiCopy.a11y.star
                }
                onClick={handleStar}
              >
                <Star
                  className={`size-4 ${todo.starred ? "fill-amber-400 text-amber-500" : ""}`}
                />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive size-8 shrink-0"
                aria-label={uiCopy.a11y.delete}
                onClick={handleDelete}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 px-4 text-sm sm:space-y-4 sm:px-6">
        <div className="space-y-2">
          <label
            className="text-muted-foreground text-xs font-medium uppercase"
            htmlFor="tdp-notes"
          >
            {uiCopy.createTask.detailsLabel}
          </label>
          <Textarea
            id="tdp-notes"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={commitDescription}
            placeholder={uiCopy.createTask.detailsPlaceholder}
            rows={5}
            className="min-h-[120px] resize-y text-base md:text-sm"
          />
        </div>

        <div className="space-y-2">
          <DueDateTimeFields
            variant="detail"
            dateId="tdp-due-date"
            timeId="tdp-due-time"
            dateValue={dueDate}
            timeValue={dueTime}
            onDateChange={(v) => {
              if (!v) pushDueIfChanged("", "");
              else pushDueIfChanged(v, dueTime);
            }}
            onTimeChange={(v) => pushDueIfChanged(dueDate, v)}
            dateLabel={uiCopy.createTask.dueLabel}
            timeLabel={uiCopy.createTask.timeLabel}
            labelClassName="text-muted-foreground text-xs font-medium uppercase"
            dateDisabled={todo.isCompleted}
            timeDisabled={todo.isCompleted || !dueDate}
          />
          <p className="text-muted-foreground text-xs">
            {dueReadable ? (
              <>
                {uiCopy.detail.duePrefix}: {dueReadable}
              </>
            ) : (
              uiCopy.createTask.dueHint
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export const TodoDetailPanel = memo(TodoDetailPanelInner);
