import { cn } from "@/lib/utils";

const MOBILE_SHEET =
  "max-sm:fixed max-sm:top-[max(0.5rem,env(safe-area-inset-top))] max-sm:right-0 max-sm:bottom-0 max-sm:left-0 max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-t-xl max-sm:rounded-b-none max-sm:border-x-0 max-sm:border-b-0";

/**
 * Shared bottom-sheet behavior for `DialogContent` on narrow viewports.
 * Optionally caps height (e.g. create dialog scroll area).
 */
export function mobileSheetDialogContentClassName(options?: {
  maxHeightOnMobile?: boolean;
}) {
  return cn(
    MOBILE_SHEET,
    options?.maxHeightOnMobile && "max-sm:max-h-[min(100dvh,100%)]",
  );
}
