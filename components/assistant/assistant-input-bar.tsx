"use client";

import { Loader2, Mic, RotateCcw, Send, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { uiCopy } from "@/shared/messages/ui-copy";

type AssistantStatus = "idle" | "thinking" | "preview" | "applying";

type SpeechControls = {
  supported: boolean;
  listening: boolean;
  start: () => void;
  cancel: () => void;
};

type Props = {
  draft: string;
  onDraftChange: (value: string) => void;
  onSubmit: () => void;
  assistantStatus: AssistantStatus;
  disabled?: boolean;
  showRetry?: boolean;
  onAbort: () => void;
  onRetryVoice: () => void;
  speech: SpeechControls;
  className?: string;
};

export function AssistantInputBar({
  draft,
  onDraftChange,
  onSubmit,
  assistantStatus,
  disabled,
  showRetry,
  onAbort,
  onRetryVoice,
  speech,
  className,
}: Props) {
  const assistantBusy =
    assistantStatus === "thinking" || assistantStatus === "applying";
  const inputDisabled = disabled || assistantBusy || speech.listening;
  const hasDraft = draft.trim().length > 0;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputDisabled || speech.listening || !hasDraft) return;
    onSubmit();
  };

  return (
    <form
      className={cn("flex shrink-0 flex-col gap-1.5", className)}
      onSubmit={handleSubmit}
    >
      <div
        className="relative min-w-0 flex-1"
        aria-live={speech.listening ? "polite" : undefined}
        aria-busy={assistantBusy || speech.listening}
      >
        <Textarea
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          placeholder={uiCopy.assistant.inputPlaceholder}
          rows={2}
          disabled={inputDisabled}
          readOnly={speech.listening}
          className={cn(
            "min-h-[2.75rem] resize-none pr-[4.5rem] text-sm sm:pr-24",
            speech.listening && "border-primary/40",
          )}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />

        <div className="absolute inset-y-0 right-0 flex items-center gap-0.5 pr-1.5">
          {speech.listening ? (
            <>
              <span
                className="pointer-events-none flex size-9 items-center justify-center"
                title={uiCopy.assistant.recording}
              >
                <Mic
                  className="text-primary size-4 animate-pulse"
                  aria-hidden
                />
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="pointer-events-auto size-9 shrink-0 rounded-full"
                aria-label={uiCopy.assistant.cancelRecording}
                title={uiCopy.assistant.cancelRecording}
                onClick={() => speech.cancel()}
              >
                <X className="size-4" aria-hidden />
              </Button>
            </>
          ) : assistantBusy ? (
            <>
              <span className="pointer-events-none flex size-9 items-center justify-center">
                <Loader2
                  className="text-muted-foreground size-4 animate-spin"
                  aria-hidden
                />
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="pointer-events-auto size-9 shrink-0 rounded-full"
                aria-label={uiCopy.assistant.stopRequest}
                title={uiCopy.assistant.stopRequest}
                onClick={onAbort}
              >
                <Square className="size-4" aria-hidden />
              </Button>
            </>
          ) : showRetry ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="pointer-events-auto size-9 shrink-0 rounded-full"
              aria-label={uiCopy.assistant.retryVoice}
              title={uiCopy.assistant.retryVoice}
              disabled={disabled || !speech.supported}
              onClick={onRetryVoice}
            >
              <RotateCcw className="size-4" aria-hidden />
            </Button>
          ) : hasDraft ? (
            <Button
              type="submit"
              size="icon"
              className="pointer-events-auto size-9 shrink-0 rounded-full"
              disabled={disabled || !hasDraft}
              aria-label={uiCopy.assistant.send}
              title={uiCopy.assistant.send}
            >
              <Send className="size-4" aria-hidden />
            </Button>
          ) : speech.supported ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="pointer-events-auto size-9 shrink-0 rounded-full"
              disabled={disabled}
              aria-label={uiCopy.assistant.startMic}
              title={uiCopy.assistant.startMic}
              onClick={() => speech.start()}
            >
              <Mic className="size-4" aria-hidden />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              className="pointer-events-auto size-9 shrink-0 rounded-full"
              disabled={disabled || !hasDraft}
              aria-label={uiCopy.assistant.send}
            >
              <Send className="size-4" aria-hidden />
            </Button>
          )}
        </div>
      </div>

      {speech.listening ? (
        <p className="text-muted-foreground sr-only">
          {uiCopy.assistant.recordingLive}
        </p>
      ) : null}
    </form>
  );
}
