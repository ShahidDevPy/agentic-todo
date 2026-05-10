"use client";

import { ListTodo, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uiCopy } from "@/shared/messages/ui-copy";

type Props = {
  onCreateTask: () => void;
};

export function TaskSidebar({ onCreateTask }: Props) {
  const pathname = usePathname();
  const assistantActive = pathname === "/";
  const tasksActive = pathname === "/tasks";
  return (
    <aside className="border-border bg-card/50 flex w-full shrink-0 flex-col border-b md:sticky md:top-0 md:w-60 md:shrink-0 md:self-start md:border-r md:border-b-0 md:px-2 md:pb-6 md:pt-4">
      <div className="border-border flex items-center justify-between gap-2 border-b px-2.5 py-2.5 md:hidden">
        <p className="truncate text-base font-semibold tracking-tight sm:text-lg">
          {uiCopy.appTitle}
        </p>
        <Button
          type="button"
          size="sm"
          className="h-8 shrink-0 gap-1 px-2.5 text-xs sm:h-9 sm:gap-1.5 sm:px-3 sm:text-sm"
          onClick={onCreateTask}
        >
          <Plus className="size-4" aria-hidden />
          {uiCopy.sidebar.newTask}
        </Button>
      </div>

      <div className="hidden px-2 pb-3 md:block">
        <p className="text-lg font-semibold tracking-tight">{uiCopy.appTitle}</p>
      </div>

      <div className="hidden px-2 pb-3 md:block">
        <Button
          type="button"
          className="h-10 w-full gap-2 shadow-sm"
          onClick={onCreateTask}
        >
          <Plus className="size-4" aria-hidden />
          {uiCopy.sidebar.newTask}
        </Button>
      </div>

      <nav className="flex gap-1 px-2 pb-2 md:flex-col md:pb-3" aria-label="Main">
        <Link
          href="/"
          aria-current={assistantActive ? "page" : undefined}
          className={cn(
            "flex flex-1 items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors md:flex-none",
            assistantActive
              ? "bg-accent text-accent-foreground"
              : "hover:bg-muted text-muted-foreground hover:text-foreground",
          )}
        >
          <Sparkles className="size-4 shrink-0 opacity-80" aria-hidden />
          {uiCopy.sidebar.assistant}
        </Link>
        <Link
          href="/tasks"
          aria-current={tasksActive ? "page" : undefined}
          className={cn(
            "flex flex-1 items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors md:flex-none",
            tasksActive
              ? "bg-accent text-accent-foreground"
              : "hover:bg-muted text-muted-foreground hover:text-foreground",
          )}
        >
          <ListTodo className="size-4 shrink-0 opacity-80" aria-hidden />
          {uiCopy.sidebar.tasks}
        </Link>
      </nav>

      <div className="text-muted-foreground border-border/70 mt-auto border-t px-3 py-3 text-xs leading-snug md:mt-2 md:px-4 md:pt-3">
        <p className="text-foreground/85 font-medium">
          {uiCopy.sidebar.comingTitle}
        </p>
        <p className="mt-1">{uiCopy.sidebar.comingBody}</p>
      </div>
    </aside>
  );
}
