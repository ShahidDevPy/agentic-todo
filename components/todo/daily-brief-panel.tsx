"use client";

import dynamic from "next/dynamic";
import { ClipboardList, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WelcomeGreeting } from "@/components/todo/welcome-greeting";
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
  brief: DailyBriefQueryData["dailyBrief"] | null;
  loading: boolean;
  /** True while refetching; keeps previous brief visible. */
  briefRefetching?: boolean;
  /** True when the dailyBrief query failed (network or server). */
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
        <ClipboardList
          className="text-primary size-7 opacity-90"
          aria-hidden
        />
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
  const zeroOpen = !loading && brief && brief.pendingCount === 0;

  const sourceBadge = (() => {
    if (!brief || briefQueryFailed) return null;
    if (brief.usedGemini) {
      return { label: uiCopy.brief.sourceAi, variant: "ai" as const };
    }
    if (deterministicOnly) {
      return { label: uiCopy.brief.sourceTemplate, variant: "template" as const };
    }
    return { label: uiCopy.brief.sourceAiFallback, variant: "fallback" as const };
  })();

  const bodyContent = (() => {
    if (loading && !brief) {
      return <BriefLoadingSkeleton />;
    }
    if (briefQueryFailed && !loading) {
      return (
        <div className="flex flex-col items-center gap-3 px-2 py-8 text-center">
          <p className="text-foreground font-medium">{uiCopy.brief.loadFailedTitle}</p>
          <p className="text-muted-foreground max-w-sm text-sm">
            {uiCopy.brief.loadFailedBody}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
          >
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
            <div
              className="mb-3 flex shrink-0 justify-end"
              aria-live="polite"
            >
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
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden px-3 py-3 sm:gap-4 sm:px-5 sm:py-5">
      <WelcomeGreeting className="shrink-0" />
      <Card
        className={cn(
          "border-primary/20 flex min-h-0 flex-1 flex-col overflow-hidden shadow-md max-sm:gap-4 max-sm:py-4",
        )}
      >
        <CardHeader className="shrink-0 space-y-0 px-4 pb-2 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="flex flex-wrap items-center gap-2 text-base sm:text-lg">
                <Sparkles className="text-primary size-4 shrink-0 sm:size-5" aria-hidden />
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
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-4 pt-0 sm:gap-4 sm:px-6 sm:pb-6">
          {brief ? (
            <div className="text-muted-foreground flex shrink-0 flex-wrap gap-3 text-xs">
              <span>
                {uiCopy.brief.statsOpen}:{" "}
                <strong className="text-foreground">{brief.pendingCount}</strong>
              </span>
              <span>
                {uiCopy.brief.statsOverdue}:{" "}
                <strong className="text-foreground">{brief.overdueCount}</strong>
              </span>
            </div>
          ) : null}
          <div
            className={cn(
              "bg-muted/25 min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-xl p-3 sm:p-4",
              zeroOpen &&
                "ring-1 ring-dashed ring-border/50 dark:ring-border/60",
            )}
          >
            {bodyContent}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
