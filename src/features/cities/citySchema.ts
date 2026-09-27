import { z } from "zod";

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const cityFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().regex(SLUG_PATTERN, "Latin letters, digits and single hyphens only, e.g. gomel"),
  country_code: z
    .string()
    .min(2, "Use a 2-letter country code")
    .max(2, "Use a 2-letter country code")
    .transform((value) => value.toUpperCase()),
  lat: z
    .number()
    .refine(Number.isFinite, { message: "Latitude is required" })
    .refine((value) => value >= -90 && value <= 90, { message: "Latitude must be between -90 and 90" }),
  lon: z
    .number()
    .refine(Number.isFinite, { message: "Longitude is required" })
    .refine((value) => value >= -180 && value <= 180, { message: "Longitude must be between -180 and 180" }),
});

export type CityFormValues = z.infer<typeof cityFormSchema>;
