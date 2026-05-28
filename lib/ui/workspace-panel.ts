import { cn } from "@/lib/utils";

/** Max height for single-panel views (e.g. My tasks). */
export const WORKSPACE_PANEL_MAX_H =
  "max-h-[min(56rem,calc(100dvh-9rem))] sm:max-h-[min(56rem,calc(100dvh-10.5rem))]";

/** Unified daily brief + assistant conversation feed. */
export const DAILY_BRIEF_ASSISTANT_FEED_SCROLL_CLASS =
  "min-h-[12rem] max-lg:overflow-visible lg:flex-1 lg:overflow-y-auto lg:overscroll-contain";

type ShellLayout = "fixed" | "scroll" | "assistant";

export function workspacePanelShellClassName(
  extra?: string,
  options?: { layout?: ShellLayout },
) {
  const layout = options?.layout ?? "fixed";
  return cn(
    "border-border/60 bg-card flex flex-col rounded-2xl border shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]",
    layout === "fixed" && [
      "min-h-0 flex-1",
      WORKSPACE_PANEL_MAX_H,
      "overflow-hidden",
    ],
    layout === "scroll" && "min-h-0 flex-1 overflow-y-auto overscroll-contain",
    layout === "assistant" && [
      "max-lg:max-h-none max-lg:overflow-visible",
      "lg:min-h-0 lg:flex-1",
      "lg:max-h-[min(56rem,calc(100dvh-10.5rem))] lg:overflow-hidden",
    ],
    extra,
  );
}
