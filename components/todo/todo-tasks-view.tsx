"use client";

import { UserProfileBadge } from "@/components/common/user-profile-badge";
import { TaskListControlsStrip } from "@/components/todo/task-list-controls-strip";
import { TodoDetailPanel } from "@/components/todo/todo-detail-panel";
import { TodoList } from "@/components/todo/todo-list";
import { workspacePanelShellClassName } from "@/lib/ui/workspace-panel";
import { cn } from "@/lib/utils";
import { uiCopy } from "@/shared/messages/ui-copy";
import type { TaskListSegment } from "@/lib/todo-list-segment";
import type { ClientListOrder } from "@/hooks/use-todo-list-order";
import type { TodoGql, TodoPriority } from "@/types/todo-view";

type Props = {
  mainNav: "tasks" | "assistant";
  greetingName: string;
  greetingAvatarUrl?: string | null;
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
  displayTodos: TodoGql[];
  loading: boolean;
  listEmptyLabel: string;
  selectedTodoId: string | null;
  onSelectTodo: (id: string) => void;
  onToggle: (id: string) => void;
  onUpdatePriority: (id: string, priority: TodoPriority) => void;
  selectedTodo: TodoGql | null;
  selectedIndex: number;
  todosLength: number;
  reorderEnabled: boolean;
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

export function TodoTasksView({
  mainNav,
  greetingName,
  greetingAvatarUrl,
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
  displayTodos,
  loading,
  listEmptyLabel,
  selectedTodoId,
  onSelectTodo,
  onToggle,
  onUpdatePriority,
  selectedTodo,
  selectedIndex,
  todosLength,
  reorderEnabled,
  onStar,
  onDeleteRequest,
  onMove,
  onUpdate,
}: Props) {
  return (
    <section
      aria-hidden={mainNav !== "tasks"}
      className={cn(
        "transition-opacity duration-200 ease-out motion-reduce:transition-none",
        mainNav === "tasks"
          ? "relative z-10 flex min-h-0 flex-1 flex-col opacity-100"
          : "pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-0",
      )}
    >
      <div className={workspacePanelShellClassName()}>
        <div className="border-border/45 flex shrink-0 flex-col gap-1.5 border-b px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:px-5 sm:py-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight sm:text-lg md:text-xl">
              {uiCopy.list.heading}
            </h2>
            {uiCopy.list.headingHint ? (
              <p className="text-muted-foreground mt-0.5 max-w-prose text-xs">
                {uiCopy.list.headingHint}
              </p>
            ) : null}
          </div>
          <UserProfileBadge
            variant="compact"
            className="shrink-0 max-w-[min(100%,12rem)] sm:max-w-xs"
            profileTitle={greetingName}
            avatarUrl={greetingAvatarUrl}
          />
        </div>

        <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[minmax(220px,30%)_minmax(0,1fr)]">
          <div className="border-border/40 flex min-h-0 min-w-0 flex-col lg:border-r">
            <TaskListControlsStrip
              listSegment={listSegment}
              onListSegmentChange={onListSegmentChange}
              upcomingCount={upcomingCount}
              listOrder={listOrder}
              onListOrderChange={onListOrderChange}
              completedOnly={completedOnly}
              onCompletedOnlyChange={onCompletedOnlyChange}
              starredOnly={starredOnly}
              onStarredOnlyChange={onStarredOnlyChange}
              onClearRequest={onClearRequest}
              clearing={clearing}
              canClear={canClear}
            />
            <div className="min-h-0 flex-1 overflow-y-auto px-1.5 py-2 sm:px-3 sm:py-3">
              <TodoList
                todos={displayTodos}
                loading={loading}
                emptyLabel={listEmptyLabel}
                groupByDue={listSegment === "all"}
                selectedTodoId={selectedTodoId}
                onSelectTodo={onSelectTodo}
                onToggle={onToggle}
                onUpdatePriority={onUpdatePriority}
              />
            </div>
          </div>
          <div className="bg-muted/10 hidden min-h-0 flex-col lg:flex">
            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-6">
              <TodoDetailPanel
                key={selectedTodo?.id ?? "__none__"}
                className="border-0 shadow-none ring-0"
                todo={selectedTodo}
                index={selectedIndex >= 0 ? selectedIndex : 0}
                isFirst={selectedIndex === 0}
                isLast={selectedIndex >= 0 && selectedIndex === todosLength - 1}
                reorderEnabled={reorderEnabled}
                onToggle={onToggle}
                onStar={onStar}
                onDeleteRequest={onDeleteRequest}
                onMove={onMove}
                onUpdate={onUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
