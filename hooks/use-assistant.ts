"use client";

import { useCallback, useRef, useState } from "react";
import type { AssistantIntent } from "@/modules/todo/assistant/intent.schema";
import { uiCopy } from "@/shared/messages/ui-copy";
import type {
  AssistantChatMessage,
  AssistantExecuteResponse,
  AssistantInterpretResponse,
} from "@/types/assistant";

function newMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function isAbortError(e: unknown): boolean {
  return e instanceof DOMException && e.name === "AbortError";
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
  const { timeZone, onTasksChanged } = options;
  const [messages, setMessages] = useState<AssistantChatMessage[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [pendingIntent, setPendingIntent] = useState<AssistantIntent | null>(
    null,
  );
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inFlightRef = useRef(false);

  const appendMessage = useCallback((msg: Omit<AssistantChatMessage, "id">) => {
    setMessages((prev) => [...prev, { ...msg, id: newMessageId() }]);
  }, []);

  const newAbortSignal = useCallback(() => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    return controller.signal;
  }, []);

  const abortAssistant = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    inFlightRef.current = false;
    setPendingIntent(null);
    setPendingPreview(null);
    setStatus("idle");
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      if (last.role === "user") return prev.slice(0, -1);
      return prev;
    });
  }, []);

  const executeIntent = useCallback(
    async (intent: AssistantIntent, signal: AbortSignal) => {
      setStatus("applying");
      setError(null);

      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          signal,
          body: JSON.stringify({
            phase: "execute",
            intent,
            timeZone,
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
          await onTasksChanged?.();
        }

        appendMessage({
          role: "assistant",
          content: result.message,
          summaryMarkdown: refreshBrief ? undefined : result.summaryMarkdown,
        });
      } catch (e) {
        if (isAbortError(e)) return;
        setError(uiCopy.assistant.requestFailed);
      } finally {
        if (!signal.aborted) {
          setPendingIntent(null);
          setPendingPreview(null);
          setStatus("idle");
        }
      }
    },
    [appendMessage, onTasksChanged, timeZone],
  );

  const interpret = useCallback(
    async (transcript: string) => {
      const trimmed = transcript.trim();
      if (!trimmed || inFlightRef.current) return;

      const signal = newAbortSignal();
      inFlightRef.current = true;
      setError(null);
      appendMessage({ role: "user", content: trimmed });
      setStatus("thinking");

      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          signal,
          body: JSON.stringify({
            phase: "interpret",
            transcript: trimmed,
            timeZone,
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
        await executeIntent(parsed.intent, signal);
      } catch (e) {
        if (isAbortError(e)) return;
        setError(uiCopy.assistant.requestFailed);
        setStatus("idle");
        setPendingIntent(null);
        setPendingPreview(null);
      } finally {
        inFlightRef.current = false;
      }
    },
    [appendMessage, executeIntent, newAbortSignal, timeZone],
  );

  const confirmPending = useCallback(async () => {
    if (!pendingIntent) return;
    const signal = newAbortSignal();
    await executeIntent(pendingIntent, signal);
  }, [executeIntent, newAbortSignal, pendingIntent]);

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
    abortAssistant,
    setError,
  };
}
