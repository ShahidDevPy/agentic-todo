import {
  assistantIntentSchema,
  type AssistantIntent,
  type AssistantTaskContextItem,
} from "@/modules/todo/assistant/intent.schema";
import { generateGeminiText } from "@/shared/lib/gemini";

function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence?.[1]?.trim() ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object in model response");
  }
  return JSON.parse(candidate.slice(start, end + 1)) as unknown;
}

function buildPrompt(
  transcript: string,
  tasks: AssistantTaskContextItem[],
  timeZone: string,
): string {
  const taskLines =
    tasks.length === 0
      ? "(no open tasks)"
      : tasks
          .map(
            (t) =>
              `- id=${t.id} title="${t.title.replace(/"/g, "'")}" priority=${t.priority} starred=${t.starred} due=${t.dueDateISO ?? "none"}`,
          )
          .join("\n");

  return `You are a task assistant for a todo app. The user spoke or typed a command. Return ONLY valid JSON matching one of these actions (no markdown outside JSON):

Actions:
- create: { "action":"create", "title": string, "description"?: string, "dueDateISO"?: ISO-8601 string, "priority"?: "low"|"medium"|"high", "starred"?: boolean }
- update: { "action":"update", "taskId": string (uuid from list), optional fields }
- toggle: { "action":"toggle", "taskId": string }
- delete: { "action":"delete", "taskId": string }
- summarize: { "action":"summarize", "style"?: "brief"|"list" }
- clarify: { "action":"clarify", "message": string } — use when ambiguous or not a task command

Rules:
- Viewer timezone: ${timeZone}. Interpret "today", "tomorrow" relative to that zone as ISO datetimes.
- For update/delete/toggle, taskId MUST be one of the ids below.
- Never invent task ids.
- Prefer create when user asks to add/remind/schedule something.
- Prefer summarize when user asks what's on their plate, summary, or daily brief.
- Keep titles concise.

Open tasks:
${taskLines}

User message:
${transcript.trim()}`;
}

export async function interpretAssistantCommand(
  transcript: string,
  tasks: AssistantTaskContextItem[],
  timeZone: string,
): Promise<AssistantIntent> {
  const trimmed = transcript.trim();
  if (!trimmed) {
    return {
      action: "clarify",
      message: "Say or type what you’d like to do with your tasks.",
    };
  }

  const raw = await generateGeminiText(
    buildPrompt(trimmed, tasks, timeZone),
  );

  if (!raw) {
    return fallbackInterpret(trimmed, tasks);
  }

  try {
    const parsed = assistantIntentSchema.safeParse(extractJsonObject(raw));
    if (parsed.success) {
      return validateIntentAgainstTasks(parsed.data, tasks);
    }
  } catch {
    /* fall through */
  }

  return fallbackInterpret(trimmed, tasks);
}

function validateIntentAgainstTasks(
  intent: AssistantIntent,
  tasks: AssistantTaskContextItem[],
): AssistantIntent {
  const ids = new Set(tasks.map((t) => t.id));
  if (
    (intent.action === "update" ||
      intent.action === "toggle" ||
      intent.action === "delete") &&
    !ids.has(intent.taskId)
  ) {
    return {
      action: "clarify",
      message:
        "I couldn’t find that task. Try naming it more specifically or check your task list.",
    };
  }
  return intent;
}

/** Simple fallback when Gemini is unavailable. */
function fallbackInterpret(
  transcript: string,
  tasks: AssistantTaskContextItem[],
): AssistantIntent {
  const lower = transcript.toLowerCase();
  if (
    lower.includes("summary") ||
    lower.includes("brief") ||
    lower.includes("what's on") ||
    lower.includes("what is on") ||
    lower.includes("my plate")
  ) {
    return { action: "summarize", style: "brief" };
  }
  if (lower.includes("list") && lower.includes("task")) {
    return { action: "summarize", style: "list" };
  }
  if (
    lower.startsWith("add ") ||
    lower.startsWith("create ") ||
    lower.includes("remind me")
  ) {
    const title = transcript
      .replace(/^(add|create)\s+/i, "")
      .replace(/^remind me to\s+/i, "")
      .trim();
    if (title) return { action: "create", title: title.slice(0, 500) };
  }
  if (tasks.length === 0) {
    return {
      action: "clarify",
      message:
        "AI assistant needs GEMINI_API_KEY for full understanding. Try: “add buy milk” or configure Gemini.",
    };
  }
  return {
    action: "clarify",
    message:
      "I need Gemini configured to understand that command. Try simpler phrasing like “add …” or “summarize my tasks”.",
  };
}
