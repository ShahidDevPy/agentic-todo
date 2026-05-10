import type { TodoGql } from "@/types/todo-view";

export type DueGroupId = "overdue" | "today" | "upcoming" | "nodate";

export type DueGroup = {
  id: DueGroupId;
  label: string;
  todos: TodoGql[];
};

function startOfLocalDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function dueGroupForTodo(todo: TodoGql): DueGroupId {
  if (!todo.dueDate) return "nodate";
  const due = new Date(todo.dueDate);
  if (Number.isNaN(due.getTime())) return "nodate";
  const dueDay = startOfLocalDay(due);
  const today = startOfLocalDay(new Date());
  if (dueDay < today) return "overdue";
  if (dueDay === today) return "today";
  return "upcoming";
}

const ORDER: DueGroupId[] = ["overdue", "today", "upcoming", "nodate"];

/** Groups active-task lists for section headers (Google Tasks–style). */
export function groupTodosByDue(
  todos: TodoGql[],
  labels: Record<DueGroupId, string>,
): DueGroup[] {
  const map = new Map<DueGroupId, TodoGql[]>();
  for (const id of ORDER) map.set(id, []);

  for (const todo of todos) {
    const g = dueGroupForTodo(todo);
    map.get(g)?.push(todo);
  }

  return ORDER.filter((id) => (map.get(id)?.length ?? 0) > 0).map((id) => ({
    id,
    label: labels[id],
    todos: map.get(id) ?? [],
  }));
}
