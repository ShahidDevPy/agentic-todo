"use client";

import {
  ArrowDownWideNarrow,
  CheckCircle2,
  ListOrdered,
  Loader2,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ClientListOrder } from "@/hooks/use-todo-list-order";
import type { TaskListSegment } from "@/lib/todo-list-segment";
import { uiCopy } from "@/shared/messages/ui-copy";

type Props = {
  listSegment: TaskListSegment;
  onListSegmentChange: (segment: TaskListSegment) => void;
  upcomingCount: number;
  listOrder: ClientListOrder;
  onListOrderChange: (v: ClientListOrder) => void;
  completedOnly: boolean;
  onCompletedOnlyChange: (v: boolean) => void;
  starredOnly: boolean;
  onStarredOnlyChange: (v: boolean) => void;
  onClearRequest: () => void;
  clearing: boolean;
  canClear: boolean;
};

export function TaskListControlsStrip({
  listSegment,
  onListSegmentChange,
  upcomingCount,
  listOrder,
  onListOrderChange,
  completedOnly,
  onCompletedOnlyChange,
  starredOnly,
  onStarredOnlyChange,
  onClearRequest,
  clearing,
  canClear,
}: Props) {
  const scopeTabs = (
    <div
      className="inline-flex shrink-0 rounded-lg bg-muted/60 p-0.5 ring-1 ring-border/25"
      role="tablist"
      aria-label={uiCopy.tasksPanel.scopeLabel}
    >
      <button
        type="button"
        role="tab"
        aria-selected={listSegment === "all"}
            className={cn(
              "inline-flex h-7 shrink-0 items-center rounded-md px-2 text-xs font-medium transition-colors sm:px-2.5",
              listSegment === "all"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
        onClick={() => onListSegmentChange("all")}
      >
        {uiCopy.sidebarTask.segmentAll}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={listSegment === "upcoming"}
            className={cn(
              "inline-flex h-7 shrink-0 items-center gap-1 rounded-md px-2 text-xs font-medium transition-colors sm:px-2.5",
              listSegment === "upcoming"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
        onClick={() => onListSegmentChange("upcoming")}
      >
        {uiCopy.dueGroups.upcoming}
        <span className="text-muted-foreground/90 tabular-nums opacity-80">
          {upcomingCount}
        </span>
      </button>
    </div>
  );

  const orderToggle = (
    <div
      className="bg-muted/70 inline-flex shrink-0 rounded-lg p-0.5 ring-1 ring-border/30"
      role="group"
      aria-label={uiCopy.toolbar.sortLabel}
    >
      <button
        type="button"
        title={uiCopy.toolbar.smartOrderHint}
        className={cn(
          "inline-flex h-7 shrink-0 items-center gap-1 rounded-md px-2 text-xs font-medium",
          listOrder === "SMART"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
        onClick={() => onListOrderChange("SMART")}
      >
        <Sparkles className="size-3 shrink-0 opacity-80" aria-hidden />
        {uiCopy.toolbar.smartOrder}
      </button>
      <button
        type="button"
        title={uiCopy.toolbar.manualOrderHint}
        className={cn(
          "inline-flex h-7 shrink-0 items-center gap-1 rounded-md px-2 text-xs font-medium",
          listOrder === "MANUAL"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
        onClick={() => onListOrderChange("MANUAL")}
      >
        <ListOrdered className="size-3 shrink-0 opacity-80" aria-hidden />
        {uiCopy.toolbar.manualOrder}
      </button>
    </div>
  );

  return (
    <div className="border-border/40 bg-muted/10 border-b">
      <div className="flex items-center justify-between gap-1.5 px-1.5 py-1.5 sm:gap-2 sm:px-3 sm:py-1.5">
        <div className="min-w-0 flex-1 overflow-x-auto py-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {scopeTabs}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            type="button"
            variant={completedOnly ? "secondary" : "ghost"}
            size="icon"
            className="size-8 max-sm:size-9 touch-manipulation"
            aria-pressed={completedOnly}
            aria-label={uiCopy.list.completedOnly}
            title={uiCopy.list.completedOnly}
            onClick={() => onCompletedOnlyChange(!completedOnly)}
          >
            <CheckCircle2
              className={cn(
                "size-4",
                completedOnly ? "text-foreground" : "text-muted-foreground",
              )}
              aria-hidden
            />
          </Button>
          <Button
            type="button"
            variant={starredOnly ? "secondary" : "ghost"}
            size="icon"
            className="size-8 max-sm:size-9 touch-manipulation"
            aria-pressed={starredOnly}
            aria-label={uiCopy.list.starredOnly}
            title={uiCopy.list.starredOnly}
            onClick={() => onStarredOnlyChange(!starredOnly)}
          >
            <Star
              className={cn(
                "size-4",
                starredOnly
                  ? "fill-amber-400 text-amber-500"
                  : "text-muted-foreground",
              )}
              aria-hidden
            />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="text-muted-foreground hover:text-foreground size-8 max-sm:size-9 touch-manipulation border-dashed"
            disabled={clearing || !canClear}
            aria-label={uiCopy.list.clearCompleted}
            title={uiCopy.list.clearCompleted}
            onClick={onClearRequest}
          >
            {clearing ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Trash2 className="size-4 opacity-80" aria-hidden />
            )}
          </Button>
        </div>
      </div>

      <div className="border-border/40 flex flex-wrap items-center gap-1.5 border-t px-1.5 py-1.5 sm:gap-2 sm:px-3">
        <span
          className="text-muted-foreground inline-flex shrink-0 items-center justify-center"
          title={uiCopy.toolbar.sortLabel}
        >
          <span className="sr-only">{uiCopy.toolbar.sortLabel}</span>
          <ArrowDownWideNarrow
            className="size-3.5 opacity-80"
            aria-hidden
          />
        </span>
        {orderToggle}
      </div>
    </div>
  );
}
