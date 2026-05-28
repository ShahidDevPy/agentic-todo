/**
 * Split ISO instant into `YYYY-MM-DD` and `HH:mm` for native date/time inputs (local).
 */
export function isoToDateAndTimeParts(iso: string | null | undefined): {
  date: string;
  time: string;
} {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: "", time: "" };
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

/**
 * Build an ISO string from native date + time fields.
 * - No date → `null` (clear due).
 * - Date, empty time → 12:00 local (midday default).
 */
export function dateAndTimePartsToIso(
  date: string,
  time: string,
): string | null {
  const d = date.trim();
  if (!d) return null;
  const t = time.trim() || "12:00";
  const composed = `${d}T${t}`;
  const parsed = new Date(composed);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}
