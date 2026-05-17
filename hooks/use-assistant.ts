"use client";

import { useCallback, useState } from "react";
import type { AssistantIntent } from "@/modules/todo/assistant/intent.schema";
import type {
  AssistantChatMessage,
  AssistantExecuteResponse,
  AssistantInterpretResponse,
} from "@/types/assistant";

function newMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type Status = "idle" | "thinking" | "preview" | "applying";

function shouldRefreshTasks(intent: AssistantIntent): boolean {
  if (
    intent.action === "create" ||
    intent.action === "update" ||
    intent.action === "toggle" ||
    intent.action === "delete"
  ) {
    return true;
  }
  if (intent.action === "summarize" && intent.style !== "list") {
    return true;
  }
  return false;
}

export function useAssistant(options: {
  timeZone: string;
  onTasksChanged?: () => void;
}) {
  const [messages, setMessages] = useState<AssistantChatMessage[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [pendingIntent, setPendingIntent] = useState<AssistantIntent | null>(
    null,
  );
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);

  const appendMessage = useCallback(
    (msg: Omit<AssistantChatMessage, "id">) => {
      setMessages((prev) => [...prev, { ...msg, id: newMessageId() }]);
    },
    [],
  );

  const executeIntent = useCallback(
    async (intent: AssistantIntent) => {
      setStatus("applying");
      setError(null);

      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            phase: "execute",
            intent,
            timeZone: options.timeZone,
          }),
        });

        const data = (await res.json()) as
          | AssistantExecuteResponse
          | { error?: string };

        if (!res.ok) {
          throw new Error(
            "error" in data && data.error
              ? data.error
              : "Could not complete that action",
          );
        }

        const result = data as AssistantExecuteResponse;
        const refreshBrief =
          intent.action === "summarize" && intent.style !== "list";

        if (shouldRefreshTasks(intent)) {
          await options.onTasksChanged?.();
        }

        appendMessage({
          role: "assistant",
          content: result.message,
          // Brief-style summarize updates the pinned brief via refetch — avoid duplicate markdown in chat.
          summaryMarkdown: refreshBrief
            ? undefined
            : result.summaryMarkdown,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setPendingIntent(null);
        setPendingPreview(null);
        setStatus("idle");
      }
    },
    [appendMessage, options.onTasksChanged, options.timeZone],
  );

  const interpret = useCallback(
    async (transcript: string) => {
      const trimmed = transcript.trim();
      if (!trimmed) return;

      setError(null);
      appendMessage({ role: "user", content: trimmed });
      setStatus("thinking");

      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            phase: "interpret",
            transcript: trimmed,
            timeZone: options.timeZone,
          }),
        });

        const data = (await res.json()) as
          | AssistantInterpretResponse
          | { error?: string };

        if (!res.ok) {
          throw new Error(
            "error" in data && data.error
              ? data.error
              : "Could not understand that request",
          );
        }

        const parsed = data as AssistantInterpretResponse;
        appendMessage({
          role: "assistant",
          content: parsed.assistantMessage,
        });

        if (parsed.intent.action === "clarify") {
          setPendingIntent(null);
          setPendingPreview(null);
          setStatus("idle");
          return;
        }

        if (parsed.requiresConfirmation) {
          setPendingIntent(parsed.intent);
          setPendingPreview(parsed.preview);
          setStatus("preview");
          return;
        }

        setPendingIntent(null);
        setPendingPreview(null);
        await executeIntent(parsed.intent);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
        setStatus("idle");
        setPendingIntent(null);
        setPendingPreview(null);
      }
    },
    [appendMessage, executeIntent, options.timeZone],
  );

  const confirmPending = useCallback(async () => {
    if (!pendingIntent) return;
    await executeIntent(pendingIntent);
  }, [executeIntent, pendingIntent]);

  const cancelPending = useCallback(() => {
    setPendingIntent(null);
    setPendingPreview(null);
    setStatus("idle");
    appendMessage({
      role: "assistant",
      content: "Cancelled.",
    });
  }, [appendMessage]);

  return {
    messages,
    status,
    error,
    pendingIntent,
    pendingPreview,
    interpret,
    confirmPending,
    cancelPending,
    setError,
  };
}
