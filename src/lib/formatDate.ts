/** The admin panel is Russian-only, whatever the browser's language. */
const LOCALE = "ru-RU";

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString(LOCALE, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/**
 * A calendar date ("YYYY-MM-DD", no time, no zone) in Russian. Parsed as a
 * local date on purpose — `new Date("2026-12-01")` is UTC midnight and would show the
 * previous day west of Greenwich.
 */
export function formatCalendarDate(value: string | null | undefined): string {
  if (!value) return "—";
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(LOCALE, { dateStyle: "medium" });
}

/** Today as "YYYY-MM-DD" in the user's own time zone. */
export function todayIsoDate(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
