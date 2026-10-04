import type { ApiError } from "../../api/envelope";

export type PlaceFormField =
  "name" | "address" | "phone" | "lat" | "lon" | "city_id" | "category_ids" | "opening_hours";

// The backend's 422 details only carries a free-text `message`, not a field key (see
// openapi.yaml ValidationFailed) — matching keywords in it is the only way to route the
// error to a specific field instead of a generic alert. Same approach as cities.
const FIELD_KEYWORDS: [PlaceFormField, string[]][] = [
  ["opening_hours", ["opening_hours", "weekday", "opens_at", "closes_at"]],
  ["category_ids", ["category_ids", "category"]],
  ["city_id", ["city_id", "city"]],
  ["phone", ["phone"]],
  ["address", ["address"]],
  ["lat", ["lat", "latitude"]],
  ["lon", ["lon", "longitude"]],
  ["name", ["name"]],
];

export function extractDetailMessage(error: ApiError): string {
  const details = error.details;
  if (details && typeof details === "object" && "message" in details) {
    const message = (details as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return error.message;
}

export function matchFormField(message: string): PlaceFormField | undefined {
  const lower = message.toLowerCase();
  for (const [field, keywords] of FIELD_KEYWORDS) {
    if (keywords.some((keyword) => lower.includes(keyword))) return field;
  }
  return undefined;
}
