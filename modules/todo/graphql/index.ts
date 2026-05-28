import { DailyBrief, dailyBriefQuery } from "./todo.brief";
import { Todo, TodoListFilter, TodoListOrder, TodoPriority } from "./todo.node";
import {
  clearCompletedTodosMutation,
  createTodoMutation,
  deleteTodoMutation,
  reorderTodosMutation,
  toggleTodoMutation,
  updateTodoMutation,
} from "./todo.mutations";
import {
  completedTodosCountQuery,
  todoQuery,
  todosQuery,
} from "./todo.queries";

export const todoGraphqlTypes = [
  TodoPriority,
  TodoListFilter,
  TodoListOrder,
  Todo,
  DailyBrief,
  todosQuery,
  completedTodosCountQuery,
  todoQuery,
  dailyBriefQuery,
  createTodoMutation,
  updateTodoMutation,
  toggleTodoMutation,
  deleteTodoMutation,
  reorderTodosMutation,
  clearCompletedTodosMutation,
];
