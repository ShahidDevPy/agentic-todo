"use client";

import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TodoDetailPanel } from "@/components/todo/todo-detail-panel";
import { mobileSheetDialogContentClassName } from "@/lib/ui/mobile-sheet-dialog";
import { cn } from "@/lib/utils";
import { uiCopy } from "@/shared/messages/ui-copy";
import type { TodoGql, TodoPriority } from "@/types/todo-view";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTodo: TodoGql | null;
  selectedIndex: number;
  todosLength: number;
  reorderEnabled: boolean;
  onToggle: (id: string) => void;
  onStar: (id: string, starred: boolean) => void;
  onDeleteRequest: (todo: TodoGql) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onUpdate: (
    id: string,
    patch: {
      title?: string;
      description?: string | null;
      priority?: TodoPriority;
      dueDateISO?: string | null;
    },
  ) => void;
};

export function MobileTodoDetailDialog({
  open,
  onOpenChange,
  selectedTodo,
  selectedIndex,
  todosLength,
  reorderEnabled,
  onToggle,
  onStar,
  onDeleteRequest,
  onMove,
  onUpdate,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          "flex max-h-[min(92dvh,100dvh)] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg",
          mobileSheetDialogContentClassName(),
          "sm:left-[50%] sm:top-[50%] sm:max-h-[90vh] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:p-0",
        )}
      >
        <DialogHeader className="border-border flex shrink-0 flex-row items-center gap-2 border-b px-3 py-2.5 sm:px-4 sm:py-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 shrink-0"
            aria-label={uiCopy.detailMobile.back}
            onClick={() => onOpenChange(false)}
          >
            <ChevronLeft className="size-5" />
          </Button>
          <DialogTitle className="text-sm font-semibold sm:text-base">
            {uiCopy.detailMobile.sheetTitle}
          </DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto p-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-4 sm:pb-6">
          <TodoDetailPanel
            key={selectedTodo?.id ?? "__none__"}
            todo={selectedTodo}
            index={selectedIndex >= 0 ? selectedIndex : 0}
            isFirst={selectedIndex === 0}
            isLast={selectedIndex >= 0 && selectedIndex === todosLength - 1}
            reorderEnabled={reorderEnabled}
            onToggle={onToggle}
            onStar={onStar}
            onDeleteRequest={onDeleteRequest}
            onMove={onMove}
            onUpdate={onUpdate}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
