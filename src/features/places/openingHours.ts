import type { OpeningHours } from "./api";

export interface Weekday {
  value: number;
  label: string;
  short: string;
}

/** 1 = Monday, matching the backend's EXTRACT(ISODOW FROM ...) convention. */
export const WEEKDAYS: Weekday[] = [
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
  { value: 7, label: "Sunday", short: "Sun" },
];

export const FULL_DAY_OPENS = "00:00";
export const FULL_DAY_CLOSES = "24:00";

export interface Interval {
  opens_at: string;
  closes_at: string;
}

export interface DaySchedule {
  /** No row for a weekday means closed that day — the backend's own rule. */
  open: boolean;
  /** 00:00–24:00, the backend's "open the full 24 hours" encoding. */
  allDay: boolean;
  intervals: Interval[];
}

/** Keyed by weekday 1..7. */
export type WeekSchedule = Record<number, DaySchedule>;

const DEFAULT_INTERVAL: Interval = { opens_at: "09:00", closes_at: "18:00" };

export function emptyWeekSchedule(): WeekSchedule {
  const schedule: WeekSchedule = {};
  for (const day of WEEKDAYS) {
    schedule[day.value] = { open: false, allDay: false, intervals: [{ ...DEFAULT_INTERVAL }] };
  }
  return schedule;
}

/**
 * `<input type="time">` cannot hold "24:00", so a closing time the API returns as
 * "24:00" is shown as "00:00" — the same wall-clock midnight, since a closes_at below
 * opens_at already means "closes after midnight". The one case that is *not*
 * equivalent, 00:00–24:00 (open the full 24 hours), is lifted into the allDay flag.
 */
export function weekScheduleFromApi(hours: OpeningHours[]): WeekSchedule {
  const schedule = emptyWeekSchedule();

  for (const day of WEEKDAYS) {
    const rows = hours.filter((hour) => hour.weekday === day.value);
    if (rows.length === 0) continue;

    const isFullDay = rows.some(
      (row) => row.opens_at === FULL_DAY_OPENS && row.closes_at === FULL_DAY_CLOSES,
    );

    schedule[day.value] = {
      open: true,
      allDay: isFullDay,
      intervals: isFullDay
        ? [{ ...DEFAULT_INTERVAL }]
        : rows.map((row) => ({
            opens_at: row.opens_at,
            closes_at: row.closes_at === FULL_DAY_CLOSES ? FULL_DAY_OPENS : row.closes_at,
          })),
    };
  }

  return schedule;
}

export function weekScheduleToApi(schedule: WeekSchedule): OpeningHours[] {
  const hours: OpeningHours[] = [];

  for (const day of WEEKDAYS) {
    const entry = schedule[day.value];
    if (!entry?.open) continue;

    if (entry.allDay) {
      hours.push({ weekday: day.value, opens_at: FULL_DAY_OPENS, closes_at: FULL_DAY_CLOSES });
      continue;
    }

    for (const interval of entry.intervals) {
      hours.push({ weekday: day.value, opens_at: interval.opens_at, closes_at: interval.closes_at });
    }
  }

  return hours;
}

/**
 * Mirrors the backend's validateOpeningHours so a bad week is caught before the round
 * trip: both times set, opens_at != closes_at, and no two intervals of one day sharing
 * an opens_at (the composite primary key on place_opening_hours).
 */
export function validateWeekSchedule(schedule: WeekSchedule): string | null {
  for (const day of WEEKDAYS) {
    const entry = schedule[day.value];
    if (!entry?.open || entry.allDay) continue;

    const seen = new Set<string>();
    for (const interval of entry.intervals) {
      if (!interval.opens_at || !interval.closes_at) {
        return `${day.label}: set both an opening and a closing time, or mark the day closed.`;
      }
      if (interval.opens_at === interval.closes_at) {
        return `${day.label}: opening and closing time must differ. Use "Open 24 hours" for a full day.`;
      }
      if (seen.has(interval.opens_at)) {
        return `${day.label}: two intervals start at ${interval.opens_at}.`;
      }
      seen.add(interval.opens_at);
    }
  }

  return null;
}

/** "09:00"–"18:00" for one day, used in the list and summary rows. */
export function formatInterval(interval: Interval): string {
  return `${interval.opens_at}–${interval.closes_at === FULL_DAY_OPENS ? "24:00" : interval.closes_at}`;
}
