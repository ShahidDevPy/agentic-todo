"use client";

import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uiCopy } from "@/shared/messages/ui-copy";

type Props = {
  listening: boolean;
  disabled?: boolean;
  supported: boolean;
  onStart: () => void;
  onStop: () => void;
  className?: string;
};

export function AssistantMicButton({
  listening,
  disabled,
  supported,
  onStart,
  onStop,
  className,
}: Props) {
  return (
    <Button
      type="button"
      variant={listening ? "default" : "outline"}
      size="icon"
      className={cn(
        "size-10 shrink-0 rounded-full",
        listening && "bg-destructive hover:bg-destructive/90 text-white",
        className,
      )}
      disabled={disabled || !supported}
      aria-label={
        listening ? uiCopy.assistant.stopMic : uiCopy.assistant.startMic
      }
      title={
        !supported
          ? uiCopy.assistant.micUnsupported
          : listening
            ? uiCopy.assistant.stopMic
            : uiCopy.assistant.startMic
      }
      onClick={() => (listening ? onStop() : onStart())}
    >
      {listening ? (
        <Square className="size-4" aria-hidden />
      ) : (
        <Mic className="size-4" aria-hidden />
      )}
    </Button>
  );
}
