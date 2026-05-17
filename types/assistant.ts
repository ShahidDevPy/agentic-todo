import type { AssistantIntent } from "@/modules/todo/assistant/intent.schema";

export type AssistantMessageRole = "user" | "assistant";

export type AssistantChatMessage = {
  id: string;
  role: AssistantMessageRole;
  content: string;
  /** Markdown summary from summarize action */
  summaryMarkdown?: string;
};

export type AssistantInterpretResponse = {
  intent: AssistantIntent;
  preview: string;
  requiresConfirmation: boolean;
  assistantMessage: string;
};

export type AssistantExecuteResponse = {
  success: boolean;
  message: string;
  summaryMarkdown?: string;
};
