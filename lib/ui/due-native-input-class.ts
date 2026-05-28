import { cn } from "@/lib/utils";

const BASE =
  "due-native-input block w-full max-w-full min-w-0 font-sans tabular-nums";

/** Native `date` / `time` styling for the create-task flow (taller touch targets on small screens). */
export function dueNativeFieldClassCreate() {
  return cn(BASE, "h-11 min-h-11 sm:h-10 sm:min-h-10");
}

/** Compact height for detail panel and similar dense layouts. */
export function dueNativeFieldClassCompact() {
  return cn(BASE, "h-10");
}
