import { uiCopy } from "@/shared/messages/ui-copy";

/**
 * Local-time greeting bands (24h clock, user's device timezone):
 * - morning:   05:00–11:59
 * - afternoon: 12:00–16:59
 * - evening:   17:00–20:59
 * - late:      21:00–04:59 → neutral "Hello" (not "Good night", which reads as goodbye)
 */
export function greetingForLocalHour(hour: number): string {
  if (hour >= 5 && hour < 12) return uiCopy.welcome.morning;
  if (hour >= 12 && hour < 17) return uiCopy.welcome.afternoon;
  if (hour >= 17 && hour < 21) return uiCopy.welcome.evening;
  return uiCopy.welcome.hello;
}

export function greetingForDate(date: Date): string {
  return greetingForLocalHour(date.getHours());
}
