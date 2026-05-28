"use client";

import { Loader2 } from "lucide-react";
import Markdown from "react-markdown";
import { useEffect, useMemo, useState } from "react";
import { briefMarkdownComponents } from "@/components/todo/markdown-brief-body";
import { cn } from "@/lib/utils";
import { uiCopy } from "@/shared/messages/ui-copy";

export function splitBriefMarkdownIntoChunks(markdown: string): string[] {
  const t = markdown.trim();
  if (!t) return [];
  const byHeading = t.split(/\n(?=## )/);
  const parts =
    byHeading.length > 1
      ? byHeading
      : t.split(/\n\n+/).map((s) => s.trim()).filter(Boolean);
  const trimmed = parts.map((s) => s.trim()).filter(Boolean);
  return trimmed.length ? trimmed : [t];
}

function chunkRevealDelayMs(chunkCount: number): number {
  if (chunkCount > 14) return 90;
  if (chunkCount > 8) return 160;
  return 260;
}

type Props = {
  text: string;
  stream: boolean;
  className?: string;
};

export function DailyBriefMarkdownChat({ text, stream, className }: Props) {
  const chunks = useMemo(() => splitBriefMarkdownIntoChunks(text), [text]);
  const [visible, setVisible] = useState(() => (!stream ? chunks.length : 0));

  useEffect(() => {
    setVisible(stream ? 0 : chunks.length);
  }, [text, stream, chunks.length]);

  const delayMs = chunkRevealDelayMs(chunks.length);

  useEffect(() => {
    if (!stream || visible >= chunks.length) return;
    const id = window.setTimeout(() => {
      setVisible((v) => Math.min(v + 1, chunks.length));
    }, delayMs);
    return () => window.clearTimeout(id);
  }, [stream, visible, chunks.length, delayMs]);

  const streaming = stream && visible < chunks.length;

  return (
    <div
      className={cn("flex min-h-0 flex-col gap-2.5 pb-1", className)}
      aria-busy={streaming}
    >
      {chunks.slice(0, visible).map((chunk, i) => (
        <div
          key={`${i}-${chunk.slice(0, 48)}`}
          className={cn(
            "max-w-[min(100%,40rem)] rounded-2xl rounded-bl-md border border-border/40 bg-card px-3.5 py-2.5 shadow-sm",
            "transition-opacity duration-200 dark:border-border/50 dark:bg-card/90",
          )}
        >
          <Markdown components={briefMarkdownComponents}>{chunk}</Markdown>
        </div>
      ))}
      {streaming ? (
        <div
          className="text-muted-foreground flex max-w-xs items-center gap-2 rounded-2xl rounded-bl-md border border-dashed border-border/45 bg-muted/20 px-3 py-2 text-xs dark:border-border/55"
          aria-live="polite"
        >
          <span className="bg-primary/80 size-1.5 animate-pulse rounded-full" />
          <span className="bg-primary/60 size-1.5 animate-pulse rounded-full [animation-delay:150ms]" />
          <span className="bg-primary/40 size-1.5 animate-pulse rounded-full [animation-delay:300ms]" />
          <Loader2
            className="text-muted-foreground size-3.5 shrink-0 animate-spin opacity-70"
            aria-hidden
          />
          <span>{uiCopy.brief.writingBrief}</span>
        </div>
      ) : null}
    </div>
  );
}
