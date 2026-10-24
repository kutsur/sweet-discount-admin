import { matchField, type FieldKeywords } from "../../lib/formErrors";

export type CityFormField = "name" | "slug" | "country_code" | "lat" | "lon" | "manager_ids";

const FIELD_KEYWORDS: FieldKeywords<CityFormField> = [
  ["slug", ["slug"]],
  ["manager_ids", ["manager_ids", "manager"]],
  ["lat", ["lat", "latitude"]],
  ["lon", ["lon", "longitude"]],
  ["country_code", ["country_code", "country"]],
  ["name", ["name"]],
];

export function matchFormField(message: string): CityFormField | undefined {
  return matchField(message, FIELD_KEYWORDS);
}
