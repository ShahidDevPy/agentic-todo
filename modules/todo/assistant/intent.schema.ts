import { z } from "zod";
import { todoPrioritySchema } from "@/modules/todo/types";

const isoDateTimeLoose = z
  .string()
  .min(1)
  .refine((s) => !Number.isNaN(Date.parse(s)), "Invalid date");

export const assistantIntentSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("create"),
    title: z.string().min(1).max(500),
    description: z.string().max(8000).optional(),
    dueDateISO: isoDateTimeLoose.optional(),
    priority: todoPrioritySchema.optional(),
    starred: z.boolean().optional(),
  }),
  z.object({
    action: z.literal("update"),
    taskId: z.string().uuid(),
    title: z.string().min(1).max(500).optional(),
    description: z.string().max(8000).nullable().optional(),
    priority: todoPrioritySchema.optional(),
    starred: z.boolean().optional(),
    isCompleted: z.boolean().optional(),
    dueDateISO: isoDateTimeLoose.nullable().optional(),
  }),
  z.object({
    action: z.literal("toggle"),
    taskId: z.string().uuid(),
  }),
  z.object({
    action: z.literal("delete"),
    taskId: z.string().uuid(),
  }),
  z.object({
    action: z.literal("summarize"),
    style: z.enum(["brief", "list"]).optional(),
  }),
  z.object({
    action: z.literal("clarify"),
    message: z.string().min(1).max(500),
  }),
]);

export type AssistantIntent = z.infer<typeof assistantIntentSchema>;

export const assistantTaskContextItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  priority: todoPrioritySchema,
  starred: z.boolean(),
  isCompleted: z.boolean(),
  dueDateISO: z.string().nullable(),
});

export type AssistantTaskContextItem = z.infer<
  typeof assistantTaskContextItemSchema
>;

export function intentRequiresConfirmation(intent: AssistantIntent): boolean {
  return intent.action === "delete";
}

export function formatIntentPreview(intent: AssistantIntent): string {
  switch (intent.action) {
    case "create":
      return `Create task: “${intent.title}”${intent.priority ? ` (${intent.priority})` : ""}`;
    case "update": {
      const parts: string[] = [];
      if (intent.title) parts.push(`title → “${intent.title}”`);
      if (intent.priority) parts.push(`priority → ${intent.priority}`);
      if (intent.isCompleted === true) parts.push("mark complete");
      if (intent.isCompleted === false) parts.push("mark incomplete");
      return `Update task${parts.length ? `: ${parts.join(", ")}` : ""}`;
    }
    case "toggle":
      return "Toggle task complete / incomplete";
    case "delete":
      return "Delete this task permanently";
    case "summarize":
      return intent.style === "list"
        ? "List your open tasks"
        : "Generate your daily brief summary";
    case "clarify":
      return intent.message;
    default:
      return "Assistant action";
  }
}
