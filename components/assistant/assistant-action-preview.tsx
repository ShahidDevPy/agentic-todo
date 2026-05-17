"use client";

import { Button } from "@/components/ui/button";
import { uiCopy } from "@/shared/messages/ui-copy";

type Props = {
  preview: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export function AssistantActionPreview({
  preview,
  onConfirm,
  onCancel,
  loading,
}: Props) {
  return (
    <div className="border-destructive/30 bg-destructive/5 flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-foreground text-sm font-medium">{preview}</p>
      <div className="flex shrink-0 gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={onCancel}
        >
          {uiCopy.assistant.cancel}
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={loading}
          onClick={onConfirm}
        >
          {uiCopy.assistant.confirmDelete}
        </Button>
      </div>
    </div>
  );
}
