import { dueGroupForTodo } from "@/lib/todo-due-groups";
import type { TodoGql } from "@/types/todo-view";

/** Main panel segment filter (client-side). */
export type TaskListSegment = "all" | "upcoming";

export function filterTodosByTaskSegment(
  todos: TodoGql[],
  segment: TaskListSegment,
): TodoGql[] {
  if (segment === "all") return todos;
  return todos.filter((t) => dueGroupForTodo(t) === "upcoming");
}
