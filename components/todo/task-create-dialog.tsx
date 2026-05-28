"use client";

import { Loader2 } from "lucide-react";
import { type FormEvent, useCallback, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DueDateTimeFields } from "@/components/todo/due-date-time-fields";
import { PrioritySegmentedControl } from "@/components/todo/priority-segmented-control";
import { cn } from "@/lib/utils";
import { dateAndTimePartsToIso } from "@/lib/format/due-input-parts";
import { mobileSheetDialogContentClassName } from "@/lib/ui/mobile-sheet-dialog";
import { uiCopy } from "@/shared/messages/ui-copy";
import type { TodoPriority } from "@/types/todo-view";

export type CreateTaskPayload = {
  title: string;
  description: string | null;
  priority: TodoPriority;
  dueDateISO: string | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creating: boolean;
  onSubmit: (payload: CreateTaskPayload) => Promise<void>;
};

export function TaskCreateDialog({
  open,
  onOpenChange,
  creating,
  onSubmit,
}: Props) {
  const titleErrorId = useId();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TodoPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [titleError, setTitleError] = useState(false);

  const titleInvalid = titleError && !title.trim();

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const trimmed = title.trim();
      if (!trimmed) {
        setTitleError(true);
        return;
      }
      setTitleError(false);
      await onSubmit({
        title: trimmed,
        description: description.trim() || null,
        priority,
        dueDateISO: dateAndTimePartsToIso(dueDate, dueTime),
      });
    },
    [description, dueDate, dueTime, onSubmit, priority, title],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          "flex w-full max-w-[100vw] flex-col gap-0 overflow-hidden p-0 sm:max-h-[90vh] sm:max-w-lg",
          "max-h-[min(92dvh,100dvh)]",
          mobileSheetDialogContentClassName({ maxHeightOnMobile: true }),
          "sm:top-[50%] sm:left-[50%] sm:max-w-[min(32rem,calc(100vw-2rem))] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:border",
        )}
      >
        <DialogHeader className="shrink-0 space-y-1 px-3 pb-2 pt-4 sm:space-y-1.5 sm:px-6 sm:pt-6">
          <DialogTitle className="text-base sm:text-lg">
            {uiCopy.createTask.dialogTitle}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {uiCopy.createTask.dialogHint}
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(e) => void handleSubmit(e)}
          noValidate
        >
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3 sm:px-6 sm:pb-4">
            <div className="grid gap-3 sm:gap-4">
              <div className="space-y-2">
                <label
                  className={cn(
                    "text-sm font-medium",
                    titleInvalid && "text-destructive",
                  )}
                  htmlFor="ctd-title"
                >
                  {uiCopy.addTask.titleLabel}
                  <span className="text-destructive" aria-hidden>
                    {" "}
                    *
                  </span>
                </label>
                <Input
                  id="ctd-title"
                  placeholder={uiCopy.addTask.titlePlaceholder}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (e.target.value.trim()) setTitleError(false);
                  }}
                  autoComplete="off"
                  autoFocus={open}
                  aria-invalid={titleInvalid}
                  aria-describedby={titleInvalid ? titleErrorId : undefined}
                  className={cn(
                    "h-11 sm:h-9",
                    titleInvalid &&
                      "border-destructive ring-destructive/30 focus-visible:border-destructive focus-visible:ring-destructive/25",
                  )}
                />
                {titleInvalid ? (
                  <p
                    id={titleErrorId}
                    className="text-destructive text-xs"
                    role="alert"
                  >
                    {uiCopy.createTask.titleRequired}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="ctd-notes">
                  {uiCopy.createTask.detailsLabel}
                </label>
                <Textarea
                  id="ctd-notes"
                  placeholder={uiCopy.createTask.detailsPlaceholder}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="min-h-[100px] text-base sm:min-h-[120px] md:min-h-[140px] md:text-sm"
                />
              </div>
              <div className="flex flex-col gap-4 sm:gap-5">
                <div className="space-y-2">
                  <DueDateTimeFields
                    variant="create"
                    dateId="ctd-due-date"
                    timeId="ctd-due-time"
                    dateValue={dueDate}
                    timeValue={dueTime}
                    onDateChange={(v) => {
                      setDueDate(v);
                      if (!v) setDueTime("");
                    }}
                    onTimeChange={setDueTime}
                    dateLabel={uiCopy.createTask.dueLabel}
                    timeLabel={uiCopy.createTask.timeLabel}
                    labelClassName="text-sm font-medium"
                    timeDisabled={!dueDate}
                  />
                  <p className="text-muted-foreground text-xs">
                    {uiCopy.createTask.dueHint}
                  </p>
                </div>
                <PrioritySegmentedControl
                  value={priority}
                  onChange={setPriority}
                />
              </div>
            </div>
          </div>

          <DialogFooter
            className={cn(
              "bg-background shrink-0 flex-row gap-2 border-t border-border/50 px-3 py-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:justify-end sm:gap-3 sm:px-6 sm:py-3 sm:pb-6",
            )}
          >
            <Button
              type="button"
              variant="outline"
              className="h-10 min-h-10 flex-1 sm:h-9 sm:min-h-9 sm:w-auto sm:flex-none"
              onClick={() => onOpenChange(false)}
              disabled={creating}
            >
              {uiCopy.createTask.cancel}
            </Button>
            <Button
              type="submit"
              className="h-10 min-h-10 flex-1 sm:h-9 sm:min-h-9 sm:w-auto sm:flex-none"
              disabled={creating || !title.trim()}
            >
              {creating ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                uiCopy.createTask.save
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
