import { z } from "zod";

export interface LatLon {
  lat: number;
  lon: number;
}

// Shared by every form that edits a point (cities, places) — mirrors the backend's
// range checks. z.number() already rejects NaN (an empty number input), so the custom
// error covers "nothing picked yet".
export const latitudeSchema = z
  .number({ error: "Выберите точку на карте или введите широту" })
  .min(-90, "Широта — от −90 до 90")
  .max(90, "Широта — от −90 до 90");

export const longitudeSchema = z
  .number({ error: "Выберите точку на карте или введите долготу" })
  .min(-180, "Долгота — от −180 до 180")
  .max(180, "Долгота — от −180 до 180");

/** A point only when both halves are real numbers — an empty number input yields NaN. */
export function toLatLon(lat: number | undefined, lon: number | undefined): LatLon | null {
  return Number.isFinite(lat) && Number.isFinite(lon) ? { lat: lat as number, lon: lon as number } : null;
}
