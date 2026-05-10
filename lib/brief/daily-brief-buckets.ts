/**
 * Calendar bucketing for daily brief (due today / this week / overdue) in a viewer IANA timezone.
 */

export type DueBucket = "overdue" | "today" | "thisWeek" | "later" | "noDue";

/** Safe check for IANA zone strings from the client; invalid values fall back to UTC in callers. */
export function isValidIanaTimeZone(tz: string): boolean {
  try {
    Intl.DateTimeFormat("en-US", { timeZone: tz }).format();
    return true;
  } catch {
    return false;
  }
}

/** YYYY-MM-DD in the given IANA timezone (e.g. en-CA). */
export function zonedYmd(d: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Pure calendar addition on Y-M-D (handles month boundaries). */
export function addCalendarDaysYmd(ymd: string, delta: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + delta));
  return next.toISOString().slice(0, 10);
}

export function classifyDue(
  dueDate: Date | null,
  now: Date,
  timeZone: string,
): DueBucket {
  const zone = isValidIanaTimeZone(timeZone) ? timeZone : "UTC";
  const today = zonedYmd(now, zone);
  if (!dueDate) return "noDue";
  const due = zonedYmd(dueDate, zone);
  if (due < today) return "overdue";
  if (due === today) return "today";
  const weekEnd = addCalendarDaysYmd(today, 7);
  if (due > today && due <= weekEnd) return "thisWeek";
  return "later";
}
