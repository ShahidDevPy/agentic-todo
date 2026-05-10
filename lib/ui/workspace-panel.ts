import { cn } from "@/lib/utils";

/** Max height matches main work area; keeps panels within the viewport (see TodoApp / DailyBrief). */
export const WORKSPACE_PANEL_MAX_H =
  "max-h-[min(56rem,calc(100dvh-9rem))] sm:max-h-[min(56rem,calc(100dvh-10.5rem))]";

export function workspacePanelShellClassName(extra?: string) {
  return cn(
    "border-border/60 bg-card flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]",
    WORKSPACE_PANEL_MAX_H,
    extra,
  );
}
