import { cn } from "@/lib/utils";

export const authCardClassName = cn(
  "w-full gap-0 overflow-hidden rounded-2xl border-border/60 bg-card py-0 shadow-sm ring-1 ring-black/[0.04] dark:bg-card dark:ring-white/[0.06]",
);

export const authHeaderClassName =
  "border-border/50 space-y-1.5 border-b px-5 pb-4 pt-5 sm:px-6 sm:pt-6";

export const authFooterClassName =
  "border-border/50 flex flex-col gap-3 border-t px-5 py-4 sm:px-6 sm:py-5";
