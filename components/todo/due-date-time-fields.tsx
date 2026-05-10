"use client";

import { Input } from "@/components/ui/input";
import {
  dueNativeFieldClassCompact,
  dueNativeFieldClassCreate,
} from "@/lib/ui/due-native-input-class";

type Variant = "create" | "detail";

type Props = {
  variant: Variant;
  dateId: string;
  timeId: string;
  dateValue: string;
  timeValue: string;
  onDateChange: (next: string) => void;
  onTimeChange: (next: string) => void;
  dateLabel: string;
  timeLabel: string;
  dateDisabled?: boolean;
  timeDisabled?: boolean;
  labelClassName: string;
};

/**
 * Paired native `date` + `time` inputs. Layout matches existing create vs detail panels.
 */
export function DueDateTimeFields({
  variant,
  dateId,
  timeId,
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  dateLabel,
  timeLabel,
  dateDisabled,
  timeDisabled,
  labelClassName,
}: Props) {
  if (variant === "create") {
    const inputClass = dueNativeFieldClassCreate();
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
        <div className="w-full min-w-0 sm:min-w-[min(100%,15.5rem)] sm:flex-1">
          <div className="space-y-1.5">
            <label className={labelClassName} htmlFor={dateId}>
              {dateLabel}
            </label>
            <Input
              id={dateId}
              type="date"
              value={dateValue}
              disabled={dateDisabled}
              onChange={(e) => onDateChange(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div className="w-full shrink-0 sm:w-[9.75rem]">
          <div className="space-y-1.5">
            <label className={labelClassName} htmlFor={timeId}>
              {timeLabel}
            </label>
            <Input
              id={timeId}
              type="time"
              step={60}
              value={timeValue}
              disabled={timeDisabled}
              onChange={(e) => onTimeChange(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>
    );
  }

  const inputClass = dueNativeFieldClassCompact();
  return (
    <div className="grid max-w-lg gap-2 sm:grid-cols-[1fr_minmax(7rem,auto)] sm:items-end sm:gap-3">
      <div className="min-w-0 space-y-1.5">
        <label className={labelClassName} htmlFor={dateId}>
          {dateLabel}
        </label>
        <Input
          id={dateId}
          type="date"
          value={dateValue}
          disabled={dateDisabled}
          onChange={(e) => onDateChange(e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="min-w-0 space-y-1.5">
        <label className={labelClassName} htmlFor={timeId}>
          {timeLabel}
        </label>
        <Input
          id={timeId}
          type="time"
          step={60}
          value={timeValue}
          disabled={timeDisabled}
          onChange={(e) => onTimeChange(e.target.value)}
          className={inputClass}
        />
      </div>
    </div>
  );
}
