import { weekScheduleFromWindows, weekScheduleToWindows, type WeekSchedule } from "../../lib/weeklySchedule";
import type { OpeningHours } from "./api";

/** Adapts the API's opens_at/closes_at rows to the shared weekly-schedule editor model. */
export function weekScheduleFromOpeningHours(hours: OpeningHours[]): WeekSchedule {
  return weekScheduleFromWindows(
    hours.map((hour) => ({ weekday: hour.weekday, start: hour.opens_at, end: hour.closes_at })),
  );
}

export function weekScheduleToOpeningHours(schedule: WeekSchedule): OpeningHours[] {
  return weekScheduleToWindows(schedule).map((window) => ({
    weekday: window.weekday,
    opens_at: window.start,
    closes_at: window.end,
  }));
}
