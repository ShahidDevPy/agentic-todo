"use client";

import Markdown from "react-markdown";
import type { ComponentProps } from "react";

type MdProps = ComponentProps<typeof Markdown>;

export const briefMarkdownComponents: MdProps["components"] = {
  h1: (p) => (
    <h2 className="text-foreground mt-4 mb-2 text-lg font-semibold tracking-tight first:mt-0">
      {p.children}
    </h2>
  ),
  h2: (p) => (
    <h3 className="mt-3 mb-1.5 text-sm font-semibold">{p.children}</h3>
  ),
  p: (p) => <p className="mb-2 text-sm leading-relaxed">{p.children}</p>,
  ul: (p) => (
    <ul className="mb-2 ml-4 list-disc space-y-1 text-sm">{p.children}</ul>
  ),
  ol: (p) => (
    <ol className="mb-2 ml-4 list-decimal space-y-1 text-sm">{p.children}</ol>
  ),
  li: (p) => <li className="leading-relaxed">{p.children}</li>,
  strong: (p) => (
    <strong className="text-foreground font-semibold">{p.children}</strong>
  ),
  em: (p) => <em className="italic">{p.children}</em>,
};

/** Kept in a separate chunk so `react-markdown` loads lazily from the brief panel. */
export function MarkdownBriefBody({ text }: { text: string }) {
  return <Markdown components={briefMarkdownComponents}>{text}</Markdown>;
}
