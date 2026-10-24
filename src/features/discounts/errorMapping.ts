import { matchField, type FieldKeywords } from "../../lib/formErrors";

export type DiscountFormField =
  "place_id" | "title" | "description" | "percent_off" | "starts_on" | "ends_on" | "schedule" | "image_id";

const FIELD_KEYWORDS: FieldKeywords<DiscountFormField> = [
  ["image_id", ["image_id", "image"]],
  ["schedule", ["schedule", "weekday"]],
  ["place_id", ["place_id", "place"]],
  ["percent_off", ["percent_off"]],
  ["starts_on", ["starts_on"]],
  ["ends_on", ["ends_on"]],
  ["description", ["description"]],
  ["title", ["title"]],
];

export function matchFormField(message: string): DiscountFormField | undefined {
  return matchField(message, FIELD_KEYWORDS);
}
