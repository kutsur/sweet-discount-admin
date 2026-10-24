import {
  formatWindows,
  weekScheduleFromWindows,
  weekScheduleToWindows,
  type WeekSchedule,
} from "../../lib/weeklySchedule";
import type { ScheduleWindow } from "./api";

const DEFAULT_DISCOUNT_INTERVAL = { start: "15:00", end: "18:00" };

/** Adapts the API's starts_at/ends_at windows to the shared weekly-schedule editor model. */
export function weekScheduleFromDiscount(windows: ScheduleWindow[]): WeekSchedule {
  return weekScheduleFromWindows(
    windows.map((window) => ({ weekday: window.weekday, start: window.starts_at, end: window.ends_at })),
    DEFAULT_DISCOUNT_INTERVAL,
  );
}

export function weekScheduleToDiscount(schedule: WeekSchedule): ScheduleWindow[] {
  return weekScheduleToWindows(schedule).map((window) => ({
    weekday: window.weekday,
    starts_at: window.start,
    ends_at: window.end,
  }));
}

/** An empty schedule means all day, every day — the backend's own rule. */
export function formatDiscountSchedule(windows: ScheduleWindow[]): string {
  if (windows.length === 0) return "Каждый день, весь день";
  return formatWindows(
    windows.map((window) => ({ weekday: window.weekday, start: window.starts_at, end: window.ends_at })),
  );
}
