"use client";

import dynamic from "next/dynamic";
import { ClipboardList, Loader2, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AssistantActionPreview } from "@/components/assistant/assistant-action-preview";
import { AssistantMessage } from "@/components/assistant/assistant-message";
import { AssistantInputBar } from "@/components/assistant/assistant-input-bar";
import { AssistantStatusChip } from "@/components/assistant/assistant-status-chip";
import { ErrorBanner } from "@/components/common/error-banner";
import { WelcomeGreeting } from "@/components/todo/welcome-greeting";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAssistant } from "@/hooks/use-assistant";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { DAILY_BRIEF_ASSISTANT_FEED_SCROLL_CLASS } from "@/lib/ui/workspace-panel";
import { cn } from "@/lib/utils";
import { uiCopy } from "@/shared/messages/ui-copy";
import type { DailyBriefQueryData } from "@/types/todo-view";

const DailyBriefMarkdownChat = dynamic(
  () =>
    import("./daily-brief-markdown-chat").then((m) => ({
      default: m.DailyBriefMarkdownChat,
    })),
  {
    ssr: false,
    loading: () => <BriefLoadingSkeleton />,
  },
);

function BriefLoadingSkeleton() {
  return (
    <div
      className="flex flex-col gap-5"
      aria-busy
      aria-label={uiCopy.brief.generating}
    >
      <div className="flex flex-col gap-3">
        <div
          className="bg-muted/80 h-11 w-[min(100%,18rem)] animate-pulse rounded-2xl rounded-bl-md"
          style={{ animationDuration: "1.2s" }}
        />
        <div
          className="bg-muted/60 h-24 w-[min(100%,22rem)] animate-pulse rounded-2xl rounded-bl-md"
          style={{ animationDuration: "1.35s" }}
        />
        <div
          className="bg-muted/50 h-9 w-[min(100%,12rem)] animate-pulse rounded-2xl rounded-bl-md"
          style={{ animationDuration: "1.5s" }}
        />
      </div>
      <div className="text-muted-foreground flex items-start gap-2.5 text-sm">
        <span className="bg-primary/20 text-primary inline-flex size-8 shrink-0 items-center justify-center rounded-full">
          <Loader2 className="size-4 animate-spin" aria-hidden />
        </span>
        <span className="leading-snug">
          <span className="text-foreground font-medium">
            {uiCopy.brief.generating}
          </span>
          <span className="mt-0.5 block text-xs">
            {uiCopy.brief.generatingDetail}
          </span>
        </span>
      </div>
    </div>
  );
}

type Props = {
  greetingName: string;
  avatarUrl?: string | null;
  timeZone: string;
  onAssistantTasksChanged?: () => void;
  assistantDisabled?: boolean;
  brief: DailyBriefQueryData["dailyBrief"] | null;
  loading: boolean;
  briefRefetching?: boolean;
  briefQueryFailed: boolean;
  deterministicOnly: boolean;
  onDeterministicChange: (value: boolean) => void;
  onRefresh: () => void;
  disabled: boolean;
  onAddTask?: () => void;
};

function ZeroOpenFooter({ onAddTask }: { onAddTask?: () => void }) {
  return (
    <div className="border-border/60 flex flex-col items-center gap-3 border-t border-dashed pt-5 text-center">
      <div className="bg-primary/10 flex size-12 items-center justify-center rounded-xl">
        <ClipboardList className="text-primary size-7 opacity-90" aria-hidden />
      </div>
      <p className="text-foreground text-sm font-medium">
        {uiCopy.brief.allClearTitle}
      </p>
      {onAddTask ? (
        <Button type="button" size="sm" onClick={onAddTask}>
          {uiCopy.brief.emptyTasksCta}
        </Button>
      ) : null}
    </div>
  );
}

export function DailyBriefPanel({
  greetingName,
  avatarUrl,
  timeZone,
  onAssistantTasksChanged,
  assistantDisabled,
  brief,
  loading,
  briefRefetching,
  briefQueryFailed,
  deterministicOnly,
  onDeterministicChange,
  onRefresh,
  disabled,
  onAddTask,
}: Props) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    status,
    error,
    pendingPreview,
    interpret,
    confirmPending,
    cancelPending,
    abortAssistant,
    setError,
  } = useAssistant({ timeZone, onTasksChanged: onAssistantTasksChanged });

  const handleVoiceTranscript = useCallback((text: string) => {
    setDraft(text);
  }, []);

  const handleUtteranceComplete = useCallback(
    (text: string) => {
      setDraft("");
      void interpret(text);
    },
    [interpret],
  );

  const speech = useSpeechRecognition({
    continuous: false,
    onTranscript: handleVoiceTranscript,
    onUtteranceComplete: handleUtteranceComplete,
  });

  const handleRetryVoice = useCallback(() => {
    abortAssistant();
    setDraft("");
    setError(null);
    speech.cancel();
    speech.start();
  }, [abortAssistant, setError, speech]);

  const assistantBusy =
    assistantDisabled || status === "thinking" || status === "applying";

  const showRetry =
    !!error ||
    (status === "idle" &&
      !pendingPreview &&
      messages.length > 0 &&
      messages[messages.length - 1]?.role === "assistant");

  const zeroOpen = !loading && brief && brief.pendingCount === 0;

  const sourceBadge = (() => {
    if (!brief || briefQueryFailed) return null;
    if (brief.usedGemini) {
      return { label: uiCopy.brief.sourceAi, variant: "ai" as const };
    }
    if (deterministicOnly) {
      return {
        label: uiCopy.brief.sourceTemplate,
        variant: "template" as const,
      };
    }
    return {
      label: uiCopy.brief.sourceAiFallback,
      variant: "fallback" as const,
    };
  })();

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status, brief?.summaryMarkdown, loading, briefRefetching]);

  const handleSubmit = useCallback(() => {
    const text = draft.trim();
    if (!text || assistantBusy || speech.listening) return;
    setDraft("");
    void interpret(text);
  }, [assistantBusy, draft, interpret, speech.listening]);

  const briefSection = (() => {
    if (loading && !brief) {
      return <BriefLoadingSkeleton />;
    }
    if (briefQueryFailed && !loading) {
      return (
        <div className="flex flex-col items-center gap-3 px-2 py-6 text-center">
          <p className="text-foreground font-medium">
            {uiCopy.brief.loadFailedTitle}
          </p>
          <p className="text-muted-foreground max-w-sm text-sm">
            {uiCopy.brief.loadFailedBody}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={onRefresh}>
            {uiCopy.brief.retry}
          </Button>
        </div>
      );
    }
    if (!brief && !loading) {
      return (
        <p className="text-muted-foreground text-sm">{uiCopy.brief.idleHint}</p>
      );
    }
    if (brief) {
      return (
        <div className="min-h-0">
          {briefRefetching ? (
            <div className="mb-3 flex shrink-0 justify-end" aria-live="polite">
              <span className="text-muted-foreground inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/50 px-2.5 py-1 text-xs shadow-sm">
                <Loader2 className="size-3 animate-spin" aria-hidden />
                {uiCopy.brief.updatingBrief}
              </span>
            </div>
          ) : null}
          <div
            className={cn(
              "space-y-4",
              briefRefetching && "motion-safe:opacity-90",
            )}
          >
            <DailyBriefMarkdownChat
              text={brief.summaryMarkdown}
              stream={brief.usedGemini}
            />
            {zeroOpen ? <ZeroOpenFooter onAddTask={onAddTask} /> : null}
          </div>
        </div>
      );
    }
    return null;
  })();

  return (
    <div className="flex flex-col max-lg:min-h-0 lg:min-h-0 lg:flex-1 lg:overflow-hidden">
      <div className="border-border/40 bg-card/95 supports-[backdrop-filter]:bg-card/80 max-lg:relative lg:sticky lg:top-0 z-10 shrink-0 border-b px-3 py-3 backdrop-blur-sm sm:px-5 sm:py-4">
        <WelcomeGreeting greetingName={greetingName} avatarUrl={avatarUrl} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-4 lg:overflow-hidden">
        <Card
          className={cn(
            "border-primary/20 flex flex-col shadow-md max-sm:gap-4 max-sm:py-4",
            "max-lg:overflow-visible",
            "lg:min-h-0 lg:flex-1 lg:overflow-hidden",
          )}
        >
          <CardHeader className="shrink-0 space-y-2 px-4 pb-2 sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <CardTitle className="flex flex-wrap items-center gap-2 text-base sm:text-lg">
                  <Sparkles
                    className="text-primary size-4 shrink-0 sm:size-5"
                    aria-hidden
                  />
                  <span>{uiCopy.brief.cardTitle}</span>
                  {sourceBadge ? (
                    <span
                      className={cn(
                        "max-w-[min(100%,14rem)] truncate rounded-full px-2 py-0.5 text-xs font-medium sm:max-w-none",
                        sourceBadge.variant === "ai" &&
                          "bg-primary/15 text-primary",
                        sourceBadge.variant === "template" &&
                          "bg-muted text-muted-foreground",
                        sourceBadge.variant === "fallback" &&
                          "bg-amber-500/15 text-amber-800 dark:text-amber-200",
                      )}
                      title={sourceBadge.label}
                    >
                      {sourceBadge.label}
                    </span>
                  ) : null}
                </CardTitle>
                <CardDescription className="mt-1">
                  {uiCopy.brief.cardDescription}
                </CardDescription>
                <AssistantStatusChip
                  status={status}
                  listening={speech.listening}
                  className="mt-2"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-muted-foreground flex max-w-[min(100%,12rem)] cursor-pointer items-start gap-2 text-xs sm:max-w-none">
                  <input
                    type="checkbox"
                    checked={deterministicOnly}
                    onChange={(e) => onDeterministicChange(e.target.checked)}
                    className="accent-primary mt-0.5 shrink-0"
                  />
                  <span>{uiCopy.brief.templateOnly}</span>
                </label>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={disabled}
                  onClick={onRefresh}
                >
                  {loading && !brief ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    uiCopy.brief.refresh
                  )}
                </Button>
              </div>
            </div>

            {brief ? (
              <div className="text-muted-foreground flex flex-wrap gap-3 text-xs">
                <span>
                  {uiCopy.brief.statsOpen}:{" "}
                  <strong className="text-foreground">
                    {brief.pendingCount}
                  </strong>
                </span>
                <span>
                  {uiCopy.brief.statsOverdue}:{" "}
                  <strong className="text-foreground">
                    {brief.overdueCount}
                  </strong>
                </span>
              </div>
            ) : null}
          </CardHeader>

          <CardContent className="flex flex-col gap-3 px-4 pb-4 pt-0 sm:gap-4 sm:px-6 sm:pb-6 lg:min-h-0 lg:flex-1">
            {error ? (
              <ErrorBanner
                message={error}
                onDismiss={() => setError(null)}
                className="shrink-0 text-xs"
              />
            ) : null}
            {speech.error ? (
              <p className="text-destructive shrink-0 text-xs" role="alert">
                {speech.error}
              </p>
            ) : null}

            <div
              ref={scrollRef}
              className={cn(
                "bg-muted/25 rounded-xl p-3 sm:p-4",
                DAILY_BRIEF_ASSISTANT_FEED_SCROLL_CLASS,
                zeroOpen &&
                  "ring-1 ring-dashed ring-border/50 dark:ring-border/60",
              )}
              aria-label={uiCopy.assistant.messagesLabel}
            >
              <section aria-label={uiCopy.brief.cardTitle}>
                {briefSection}
              </section>

              {messages.length > 0 ? (
                <>
                  <div
                    className="border-border/50 my-4 border-t border-dashed"
                    role="separator"
                  />
                  <section
                    className="flex flex-col gap-3"
                    aria-label={uiCopy.assistant.messagesLabel}
                  >
                    {messages.map((m) => (
                      <AssistantMessage key={m.id} message={m} />
                    ))}
                  </section>
                </>
              ) : brief && !loading ? (
                <p className="text-muted-foreground mt-4 border-t border-dashed border-border/50 pt-4 text-sm leading-relaxed">
                  {uiCopy.assistant.commandsHint}
                </p>
              ) : null}
            </div>

            {pendingPreview &&
            (status === "preview" || status === "applying") ? (
              <AssistantActionPreview
                preview={pendingPreview}
                loading={status === "applying"}
                onConfirm={() => void confirmPending()}
                onCancel={cancelPending}
              />
            ) : null}

            <AssistantInputBar
              draft={draft}
              onDraftChange={setDraft}
              onSubmit={handleSubmit}
              assistantStatus={status}
              disabled={assistantDisabled || status === "preview"}
              showRetry={showRetry}
              onAbort={abortAssistant}
              onRetryVoice={handleRetryVoice}
              speech={{
                supported: speech.supported,
                listening: speech.listening,
                start: () => {
                  setDraft("");
                  speech.start();
                },
                cancel: speech.cancel,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
