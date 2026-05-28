import { z } from "zod";

export const todoPrioritySchema = z.enum(["low", "medium", "high"]);

export const TodoSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  title: z.string().min(1).max(500),
  description: z.string().max(8000).nullable(),
  starred: z.boolean(),
  isCompleted: z.boolean(),
  completedAt: z.string().datetime().nullable(),
  dueDate: z.string().datetime().nullable(),
  priority: todoPrioritySchema,
  sortOrder: z.number().int(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Todo = z.infer<typeof TodoSchema>;

export const dailyBriefWireSchema = z.object({
  summaryMarkdown: z.string().min(1),
  pendingCount: z.number().int().nonnegative(),
  overdueCount: z.number().int().nonnegative(),
});

export type DailyBriefWire = z.infer<typeof dailyBriefWireSchema>;
