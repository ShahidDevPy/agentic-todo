import { z } from "zod";

export const todoPrioritySchema = z.enum(["low", "medium", "high"]);
export type TodoPriority = z.infer<typeof todoPrioritySchema>;

/** GraphQL `Todo` row as returned by our queries (ISO date strings). */
export const todoGqlSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  description: z.string().nullable(),
  starred: z.boolean(),
  isCompleted: z.boolean(),
  priority: todoPrioritySchema,
  sortOrder: z.number().int(),
  dueDate: z.string().nullable(),
  completedAt: z.string().nullable(),
  createdAt: z.string(),
});

export type TodoGql = z.infer<typeof todoGqlSchema>;

export const todosQueryShapeSchema = z.object({
  todos: z.array(todoGqlSchema),
});

export type TodosQueryData = z.infer<typeof todosQueryShapeSchema>;

export const dailyBriefShapeSchema = z.object({
  dailyBrief: z.object({
    summaryMarkdown: z.string(),
    pendingCount: z.number().int(),
    overdueCount: z.number().int(),
    usedGemini: z.boolean(),
  }),
});

export type DailyBriefQueryData = z.infer<typeof dailyBriefShapeSchema>;

/** Safe parse: invalid rows are dropped; logs in development. */
export function narrowTodos(data: unknown): TodoGql[] {
  if (data == null) return [];
  const r = todosQueryShapeSchema.safeParse(data);
  if (r.success) return r.data.todos;
  if (process.env.NODE_ENV === "development") {
    console.warn("[TodoGql] query shape mismatch", r.error.flatten());
  }
  return [];
}

export function narrowDailyBrief(
  data: unknown,
): DailyBriefQueryData["dailyBrief"] | null {
  if (data == null) return null;
  const r = dailyBriefShapeSchema.safeParse(data);
  if (r.success) return r.data.dailyBrief;
  if (process.env.NODE_ENV === "development") {
    console.warn("[DailyBrief] query shape mismatch", r.error.flatten());
  }
  return null;
}

export function isTodoPriority(v: string): v is TodoPriority {
  return todoPrioritySchema.safeParse(v).success;
}
