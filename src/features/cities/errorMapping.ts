import type { ApiError } from "../../api/envelope";

export type CityFormField = "name" | "slug" | "country_code" | "lat" | "lon" | "manager_ids";

// The backend's 422 details only carries a free-text `message`, not a field key (see
// openapi.yaml ValidationFailed response) — matching keywords in it is the only way to
// route the error to a specific field instead of a generic toast.
const FIELD_KEYWORDS: [CityFormField, string[]][] = [
  ["slug", ["slug"]],
  ["manager_ids", ["manager_ids", "manager"]],
  ["lat", ["lat", "latitude"]],
  ["lon", ["lon", "longitude"]],
  ["country_code", ["country_code", "country"]],
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

export function matchFormField(message: string): CityFormField | undefined {
  const lower = message.toLowerCase();
  for (const [field, keywords] of FIELD_KEYWORDS) {
    if (keywords.some((keyword) => lower.includes(keyword))) return field;
  }
  return undefined;
}
