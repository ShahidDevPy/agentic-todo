"use client";

import { MarkdownBriefBody } from "@/components/todo/markdown-brief-body";
import { cn } from "@/lib/utils";
import type { AssistantChatMessage } from "@/types/assistant";

type Props = {
  message: AssistantChatMessage;
};

export function AssistantMessage({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[min(100%,28rem)] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "border-border/60 bg-card text-foreground border rounded-bl-md",
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.summaryMarkdown ? (
          <div className="border-border/50 mt-2 border-t pt-2">
            <MarkdownBriefBody text={message.summaryMarkdown} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
