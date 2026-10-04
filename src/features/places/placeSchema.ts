import { z } from "zod";

/** E.164, matching the backend's phonePattern: '+', then 8 to 15 digits, the first non-zero. */
const E164_PATTERN = /^\+[1-9]\d{7,14}$/;
/** Characters the backend strips before validating, so the form accepts them too. */
const PHONE_FORMATTING = /[\s\-()]/g;

export const MAX_CATEGORIES_PER_PLACE = 5;

export const placeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string(),
  phone: z
    .string()
    .refine((value) => value.trim() === "" || E164_PATTERN.test(value.replace(PHONE_FORMATTING, "")), {
      message: "Use international format, e.g. +375291234567",
    }),
  lat: z
    .number()
    .refine(Number.isFinite, { message: "Latitude is required" })
    .refine((value) => value >= -90 && value <= 90, { message: "Latitude must be between -90 and 90" }),
  lon: z
    .number()
    .refine(Number.isFinite, { message: "Longitude is required" })
    .refine((value) => value >= -180 && value <= 180, { message: "Longitude must be between -180 and 180" }),
});

export type PlaceFormValues = z.infer<typeof placeFormSchema>;

/** The API treats a blank optional string as "unset"; send null rather than "". */
export function blankToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
