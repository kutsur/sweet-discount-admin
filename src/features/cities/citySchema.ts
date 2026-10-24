import { z } from "zod";
import { latitudeSchema, longitudeSchema } from "../../lib/geo";

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const cityFormSchema = z.object({
  name: z.string().min(1, "Укажите название"),
  slug: z.string().regex(SLUG_PATTERN, "Только латинские буквы, цифры и одиночные дефисы, например gomel"),
  country_code: z
    .string()
    .min(2, "Код страны — две буквы")
    .max(2, "Код страны — две буквы")
    .transform((value) => value.toUpperCase()),
  lat: latitudeSchema,
  lon: longitudeSchema,
});

export type CityFormValues = z.infer<typeof cityFormSchema>;
