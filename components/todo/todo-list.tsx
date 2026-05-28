"use client";

import { ClipboardList, Loader2 } from "lucide-react";
import { TodoTaskRow } from "@/components/todo/todo-task-row";
import { uiCopy } from "@/shared/messages/ui-copy";
import type { TodoGql, TodoPriority } from "@/types/todo-view";
import {
  groupTodosByDue,
  type DueGroupId,
} from "@/lib/todo-due-groups";

type Props = {
  todos: TodoGql[];
  loading: boolean;
  emptyLabel?: string;
  groupByDue?: boolean;
  selectedTodoId: string | null;
  onSelectTodo: (id: string) => void;
  onToggle: (id: string) => void;
  onUpdatePriority: (id: string, priority: TodoPriority) => void;
};

const dueLabels: Record<DueGroupId, string> = {
  overdue: uiCopy.dueGroups.overdue,
  today: uiCopy.dueGroups.today,
  upcoming: uiCopy.dueGroups.upcoming,
  nodate: uiCopy.dueGroups.nodate,
};

export function TodoList({
  todos,
  loading,
  emptyLabel = uiCopy.list.empty,
  groupByDue = true,
  selectedTodoId,
  onSelectTodo,
  onToggle,
  onUpdatePriority,
}: Props) {
  const groups =
    groupByDue && todos.length > 0
      ? groupTodosByDue(todos, dueLabels)
      : [];

  return (
    <div className="flex min-h-0 flex-col">
      {loading && todos.length === 0 ? (
        <div className="text-muted-foreground flex items-center gap-2 py-8 text-sm">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {uiCopy.list.loading}
        </div>
      ) : null}
      {!loading && todos.length === 0 ? (
        <div className="text-muted-foreground border-muted flex flex-col items-center gap-3 rounded-xl border border-dashed py-12 text-center text-sm">
          <ClipboardList className="text-muted-foreground/80 size-10" aria-hidden />
          <p className="max-w-xs px-4">{emptyLabel}</p>
        </div>
      ) : null}

      {!groupByDue && todos.length > 0 ? (
        <ul className="space-y-0.5">
          {todos.map((todo) => (
            <TodoTaskRow
              key={todo.id}
              todo={todo}
              selected={selectedTodoId === todo.id}
              onSelect={onSelectTodo}
              onToggle={onToggle}
              onUpdatePriority={onUpdatePriority}
            />
          ))}
        </ul>
      ) : null}
      {groupByDue && groups.length > 0 ? (
        <ul className="space-y-5">
          {groups.map((group) => (
            <li key={group.id}>
              <p className="text-muted-foreground mb-2 px-1 text-[11px] font-semibold tracking-wider uppercase">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.todos.map((todo) => (
                  <TodoTaskRow
                    key={todo.id}
                    todo={todo}
                    selected={selectedTodoId === todo.id}
                    onSelect={onSelectTodo}
                    onToggle={onToggle}
                    onUpdatePriority={onUpdatePriority}
                  />
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
