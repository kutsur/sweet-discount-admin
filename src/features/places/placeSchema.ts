import { z } from "zod";
import { latitudeSchema, longitudeSchema } from "../../lib/geo";

/** E.164, matching the backend's phonePattern: '+', then 8 to 15 digits, the first non-zero. */
const E164_PATTERN = /^\+[1-9]\d{7,14}$/;
/** Characters the backend strips before validating, so the form accepts them too. */
const PHONE_FORMATTING = /[\s\-()]/g;

export const MAX_CATEGORIES_PER_PLACE = 5;

export const placeFormSchema = z.object({
  name: z.string().min(1, "Укажите название"),
  address: z.string(),
  phone: z
    .string()
    .refine((value) => value.trim() === "" || E164_PATTERN.test(value.replace(PHONE_FORMATTING, "")), {
      message: "Международный формат, например +375291234567",
    }),
  lat: latitudeSchema,
  lon: longitudeSchema,
});

export type PlaceFormValues = z.infer<typeof placeFormSchema>;

/** The API treats a blank optional string as "unset"; send null rather than "". */
export function blankToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
