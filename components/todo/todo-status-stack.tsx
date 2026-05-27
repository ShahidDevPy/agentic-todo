"use client";

import { ErrorBanner } from "@/components/common/error-banner";
import { SuccessBanner } from "@/components/common/success-banner";

type StatusTone = "success" | "danger" | "neutral";

type Props = {
  errorMessage: string | null;
  statusMessage: string | null;
  statusTone: StatusTone;
  onDismiss: () => void;
};

export function TodoStatusStack({
  errorMessage,
  statusMessage,
  statusTone,
  onDismiss,
}: Props) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[70] flex justify-center px-3 sm:top-4">
      <div className="flex w-[min(92vw,28rem)] flex-col gap-2">
        <SuccessBanner
          className="pointer-events-auto"
          message={statusMessage}
          tone={statusTone}
          onDismiss={onDismiss}
        />
        <ErrorBanner
          className="pointer-events-auto"
          message={errorMessage}
          onDismiss={onDismiss}
        />
      </div>
    </div>
  );
}
