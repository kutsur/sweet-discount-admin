import { matchField, type FieldKeywords } from "../../lib/formErrors";

export type DiscountFormField =
  | "place_id"
  | "title"
  | "description"
  | "percent_off"
  | "price"
  | "original_price"
  | "quantity_left"
  | "starts_on"
  | "ends_on"
  | "schedule"
  | "image_id";

const FIELD_KEYWORDS: FieldKeywords<DiscountFormField> = [
  ["image_id", ["image_id", "image"]],
  ["schedule", ["schedule", "weekday"]],
  ["place_id", ["place_id", "place"]],
  ["percent_off", ["percent_off"]],
  // original_price_minor first: its message also mentions price_minor.
  ["original_price", ["original_price_minor"]],
  ["price", ["price_minor", "currency_code"]],
  ["quantity_left", ["quantity_left"]],
  ["starts_on", ["starts_on"]],
  ["ends_on", ["ends_on"]],
  ["description", ["description"]],
  ["title", ["title"]],
];

export function matchFormField(message: string): DiscountFormField | undefined {
  return matchField(message, FIELD_KEYWORDS);
}
