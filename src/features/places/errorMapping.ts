import { matchField, type FieldKeywords } from "../../lib/formErrors";

export type PlaceFormField =
  "name" | "address" | "phone" | "lat" | "lon" | "city_id" | "category_ids" | "opening_hours" | "image_id";

const FIELD_KEYWORDS: FieldKeywords<PlaceFormField> = [
  ["image_id", ["image_id", "image"]],
  ["opening_hours", ["opening_hours", "weekday", "opens_at", "closes_at"]],
  ["category_ids", ["category_ids", "category"]],
  ["city_id", ["city_id", "city"]],
  ["phone", ["phone"]],
  ["address", ["address"]],
  ["lat", ["lat", "latitude"]],
  ["lon", ["lon", "longitude"]],
  ["name", ["name"]],
];

export function matchFormField(message: string): PlaceFormField | undefined {
  return matchField(message, FIELD_KEYWORDS);
}
