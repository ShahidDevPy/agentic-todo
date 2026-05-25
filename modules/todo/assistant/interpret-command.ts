import {
  assistantIntentSchema,
  type AssistantIntent,
  type AssistantTaskContextItem,
} from "@/modules/todo/assistant/intent.schema";
import { generateGeminiText } from "@/shared/lib/gemini";
import { uiCopy } from "@/shared/messages/ui-copy";

function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY?.trim();
}

const TASK_VERB_PATTERN =
  /\b(add|create|delete|remove|update|mark|complete|toggle|remind|summarize|summary|brief|schedule|list tasks?)\b/i;

const THANKS_PHRASES = [
  "thanks",
  "thank you",
  "thank u",
  "thx",
  "ty",
  "much appreciated",
  "appreciate it",
  "cheers",
  "many thanks",
  "thanks a lot",
  "thanks so much",
  "thank you so much",
];

const GREETING_PHRASES = [
  "hi",
  "hello",
  "hey",
  "good morning",
  "good afternoon",
  "good evening",
  "howdy",
  "greetings",
];

const GOODBYE_PHRASES = [
  "bye",
  "goodbye",
  "good bye",
  "see you",
  "see ya",
  "take care",
  "later",
  "catch you later",
];

function normalizeSocialPhrase(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[!.?,]+$/g, "")
    .trim();
}

function containsTaskVerbs(text: string): boolean {
  return TASK_VERB_PATTERN.test(text);
}

function matchesPhrase(normalized: string, phrases: string[]): boolean {
  return phrases.some(
    (p) => normalized === p || normalized.startsWith(`${p} `),
  );
}

/** Gratitude, greetings, or sign-offs with no task request. */
function detectSocialIntent(transcript: string): AssistantIntent | null {
  const trimmed = transcript.trim();
  if (!trimmed || containsTaskVerbs(trimmed)) return null;

  const normalized = normalizeSocialPhrase(trimmed);

  if (matchesPhrase(normalized, THANKS_PHRASES)) {
    return {
      action: "clarify",
      message: uiCopy.assistant.clarify.thanks,
    };
  }

  if (matchesPhrase(normalized, GREETING_PHRASES)) {
    return {
      action: "clarify",
      message: uiCopy.assistant.clarify.greeting,
    };
  }

  if (matchesPhrase(normalized, GOODBYE_PHRASES)) {
    return {
      action: "clarify",
      message: uiCopy.assistant.clarify.goodbye,
    };
  }

  return null;
}

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
- clarify: { "action":"clarify", "message": string } — use when ambiguous, off-topic, or not a task command

Rules:
- Viewer timezone: ${timeZone}. Interpret "today", "tomorrow" relative to that zone as ISO datetimes.
- For update/delete/toggle, taskId MUST be one of the ids below.
- Never invent task ids.
- Prefer create when user asks to add/remind/schedule something.
- Prefer summarize when user asks what's on their plate, summary, or daily brief.
- Keep titles concise.
- For gratitude (thanks, thank you), greetings (hi, hello), or goodbye with no task request, return clarify with a brief, warm message. Do not tell the user they mis-spoke or need different phrasing.
- If the message is unclear, nonsense, or unrelated to tasks, return clarify with a short, friendly message and example phrasing.
- Never mention API keys, configuration, environment variables, or internal systems in clarify messages.

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
      message: uiCopy.assistant.clarify.empty,
    };
  }

  const social = detectSocialIntent(trimmed);
  if (social) return social;

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
      message: uiCopy.assistant.clarify.taskNotFound,
    };
  }
  return intent;
}

function unrecognizedClarify(): AssistantIntent {
  return {
    action: "clarify",
    message: isGeminiConfigured()
      ? uiCopy.assistant.clarify.unrecognized
      : uiCopy.assistant.clarify.geminiUnavailable,
  };
}

/** Simple fallback when Gemini is unavailable or response could not be parsed. */
function fallbackInterpret(
  transcript: string,
  _tasks: AssistantTaskContextItem[],
): AssistantIntent {
  const social = detectSocialIntent(transcript);
  if (social) return social;

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

  return unrecognizedClarify();
}
