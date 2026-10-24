/**
 * A week of venue-local time windows, as the editor holds it — shared by a place's
 * opening hours and a discount's schedule, which the backend stores in the same
 * weekday/start/end shape (domain.WeeklyWindow). Features adapt their own API field
 * names to and from WeeklyWindow; everything else lives here once.
 */

export interface Weekday {
  value: number;
  label: string;
  short: string;
}

/** 1 = Monday, matching the backend's EXTRACT(ISODOW FROM ...) convention. */
export const WEEKDAYS: Weekday[] = [
  { value: 1, label: "Понедельник", short: "Пн" },
  { value: 2, label: "Вторник", short: "Вт" },
  { value: 3, label: "Среда", short: "Ср" },
  { value: 4, label: "Четверг", short: "Чт" },
  { value: 5, label: "Пятница", short: "Пт" },
  { value: 6, label: "Суббота", short: "Сб" },
  { value: 7, label: "Воскресенье", short: "Вс" },
];

export const DAY_START = "00:00";
export const DAY_END = "24:00";

/** One window of one weekday, in the backend's neutral shape. */
export interface WeeklyWindow {
  weekday: number;
  start: string;
  end: string;
}

export interface Interval {
  start: string;
  end: string;
}

export interface DaySchedule {
  /** A day switched off produces no windows at all. */
  enabled: boolean;
  /** 00:00–24:00, the backend's "the whole day" encoding. */
  allDay: boolean;
  intervals: Interval[];
}

/** Keyed by weekday 1..7. */
export type WeekSchedule = Record<number, DaySchedule>;

export function emptyWeekSchedule(
  defaultInterval: Interval = { start: "09:00", end: "18:00" },
): WeekSchedule {
  const schedule: WeekSchedule = {};
  for (const day of WEEKDAYS) {
    schedule[day.value] = { enabled: false, allDay: false, intervals: [{ ...defaultInterval }] };
  }
  return schedule;
}

/**
 * `<input type="time">` cannot hold "24:00", so an end the API returns as "24:00" is
 * shown as "00:00" — the same wall-clock midnight, since an end below the start already
 * means "runs past midnight". The one case that is *not* equivalent, 00:00–24:00 (the
 * whole day), is lifted into the allDay flag.
 */
export function weekScheduleFromWindows(windows: WeeklyWindow[], defaultInterval?: Interval): WeekSchedule {
  const schedule = emptyWeekSchedule(defaultInterval);

  for (const day of WEEKDAYS) {
    const rows = windows.filter((window) => window.weekday === day.value);
    if (rows.length === 0) continue;

    const isAllDay = rows.some((row) => row.start === DAY_START && row.end === DAY_END);

    schedule[day.value] = {
      enabled: true,
      allDay: isAllDay,
      intervals: isAllDay
        ? schedule[day.value].intervals
        : rows.map((row) => ({ start: row.start, end: row.end === DAY_END ? DAY_START : row.end })),
    };
  }

  return schedule;
}

export function weekScheduleToWindows(schedule: WeekSchedule): WeeklyWindow[] {
  const windows: WeeklyWindow[] = [];

  for (const day of WEEKDAYS) {
    const entry = schedule[day.value];
    if (!entry?.enabled) continue;

    if (entry.allDay) {
      windows.push({ weekday: day.value, start: DAY_START, end: DAY_END });
      continue;
    }

    for (const interval of entry.intervals) {
      windows.push({ weekday: day.value, start: interval.start, end: interval.end });
    }
  }

  return windows;
}

/**
 * Mirrors the backend's validateWeeklyWindows so a bad week is caught before the round
 * trip: both times set, start != end, and no two windows of one day sharing a start (the
 * composite primary key on the backing tables).
 */
export function validateWeekSchedule(schedule: WeekSchedule): string | null {
  for (const day of WEEKDAYS) {
    const entry = schedule[day.value];
    if (!entry?.enabled || entry.allDay) continue;

    const seen = new Set<string>();
    for (const interval of entry.intervals) {
      if (!interval.start || !interval.end) {
        return `${day.label}: укажите время начала и окончания или выключите день.`;
      }
      if (interval.start === interval.end) {
        return `${day.label}: начало и конец должны отличаться. Для всего дня отметьте «Круглосуточно».`;
      }
      if (seen.has(interval.start)) {
        return `${day.label}: два интервала начинаются в ${interval.start}.`;
      }
      seen.add(interval.start);
    }
  }

  return null;
}

export function hasEnabledDay(schedule: WeekSchedule): boolean {
  return WEEKDAYS.some((day) => schedule[day.value]?.enabled);
}

/** "Пн 15:00–18:00, Пт 22:00–02:00" — compact, for list cells. */
export function formatWindows(windows: WeeklyWindow[]): string {
  return windows
    .map((window) => {
      const day = WEEKDAYS.find((weekday) => weekday.value === window.weekday)?.short ?? "?";
      const isAllDay = window.start === DAY_START && window.end === DAY_END;
      return isAllDay ? `${day} весь день` : `${day} ${window.start}–${window.end}`;
    })
    .join(", ");
}
