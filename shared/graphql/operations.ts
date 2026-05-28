export const GqlField = {
  todos: "todos",
  todo: "todo",
  completedTodosCount: "completedTodosCount",
  dailyBrief: "dailyBrief",

  createTodo: "createTodo",
  updateTodo: "updateTodo",
  toggleTodo: "toggleTodo",
  deleteTodo: "deleteTodo",
  clearCompletedTodos: "clearCompletedTodos",
  reorderTodos: "reorderTodos",
} as const;

export type GqlFieldName = (typeof GqlField)[keyof typeof GqlField];

export const GqlOperation = {
  Todos: "Todos",
  CompletedTodosCount: "CompletedTodosCount",
  DailyBrief: "DailyBrief",

  CreateTodo: "CreateTodo",
  UpdateTodo: "UpdateTodo",
  ToggleTodo: "ToggleTodo",
  DeleteTodo: "DeleteTodo",
  ClearCompleted: "ClearCompleted",
  ReorderTodos: "ReorderTodos",
} as const;

export type GqlOperationName = (typeof GqlOperation)[keyof typeof GqlOperation];
