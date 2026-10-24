import type { ApiError } from "../api/envelope";
import { validationText } from "./apiErrorText";

/** A 422's detail: `raw` (English, from the API) to route by, `text` (Russian) to show. */
export interface ValidationDetail {
  raw: string;
  text: string;
}

export function validationDetail(error: ApiError): ValidationDetail {
  const details = error.details;
  let raw = "";
  if (details && typeof details === "object" && "message" in details) {
    const message = (details as { message?: unknown }).message;
    if (typeof message === "string") raw = message;
  }
  return { raw, text: raw ? validationText(raw) : error.message };
}

/** Keyword table per form: the first field whose keywords appear in the message wins. */
export type FieldKeywords<F extends string> = [F, string[]][];

/**
 * The backend's 422 details only carries a free-text `message`, not a field key (see
 * openapi.yaml ValidationFailed) — matching keywords in it is the only way to route the
 * error to a specific form field instead of a generic alert. Pass the raw message.
 */
export function matchField<F extends string>(message: string, table: FieldKeywords<F>): F | undefined {
  const lower = message.toLowerCase();
  for (const [field, keywords] of table) {
    if (keywords.some((keyword) => lower.includes(keyword))) return field;
  }
  return undefined;
}
