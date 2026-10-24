import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ApiError } from "../../api/envelope";
import type { Image } from "../../components/images/api";
import { validationDetail } from "../../lib/formErrors";
import { validateWeekSchedule, type WeekSchedule } from "../../lib/weeklySchedule";
import type { OpeningHours, PlaceCategory } from "./api";
import { matchFormField, type PlaceFormField } from "./errorMapping";
import { weekScheduleToOpeningHours } from "./openingHours";
import { blankToNull, placeFormSchema, type PlaceFormValues } from "./placeSchema";

/** The body fields create and update share; each page adds its own (city_id on create). */
export interface PlaceBody {
  name: string;
  address: string | null;
  phone: string | null;
  lat: number;
  lon: number;
  category_ids: string[];
  opening_hours: OpeningHours[];
  image_id: string | null;
}

export interface PlaceFormInitial {
  values: PlaceFormValues;
  categories: PlaceCategory[];
  schedule: WeekSchedule;
  image: Image | null;
}

/** Fields that live outside react-hook-form (their own controls) but get server errors too. */
type ExtraField = "category_ids" | "opening_hours" | "image_id";
const EXTRA_FIELDS: ReadonlySet<PlaceFormField> = new Set<ExtraField>([
  "category_ids",
  "opening_hours",
  "image_id",
]);
const FORM_FIELDS = new Set<PlaceFormField>(["name", "address", "phone", "lat", "lon"]);

/**
 * Everything the place create and edit forms share: the react-hook-form fields, the
 * categories/schedule/image state, client-side schedule validation, building the
 * common body, and routing a 422 to the field it is about. A page supplies only its
 * own extras — see PlaceCreatePage's city.
 */
export function usePlaceForm(initial: PlaceFormInitial) {
  const form = useForm<PlaceFormValues>({
    resolver: zodResolver(placeFormSchema),
    defaultValues: initial.values,
  });
  const [categories, setCategories] = useState(initial.categories);
  const [schedule, setSchedule] = useState(initial.schedule);
  const [image, setImage] = useState(initial.image);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<ExtraField, string>>>({});
  const [generalError, setGeneralError] = useState<unknown>(null);

  /**
   * Wraps a save. `onFieldError` gets first look at a 422 (return true if it showed the
   * message); anything unrouted ends up in generalError.
   */
  const submitWith = (
    save: (body: PlaceBody) => Promise<unknown>,
    onFieldError?: (field: PlaceFormField, message: string) => boolean,
  ) =>
    form.handleSubmit(async (values) => {
      setGeneralError(null);

      const scheduleMessage = validateWeekSchedule(schedule);
      setFieldErrors(scheduleMessage ? { opening_hours: scheduleMessage } : {});
      if (scheduleMessage) return;

      try {
        // category_ids and opening_hours fully replace the stored set when sent, so the
        // form always sends both — omitting one would leave stale rows behind.
        await save({
          name: values.name,
          address: blankToNull(values.address),
          phone: blankToNull(values.phone),
          lat: values.lat,
          lon: values.lon,
          category_ids: categories.map((category) => category.id),
          opening_hours: weekScheduleToOpeningHours(schedule),
          image_id: image?.id ?? null,
        });
      } catch (err) {
        if (err instanceof ApiError && err.code === "validation_failed") {
          const { raw, text: message } = validationDetail(err);
          const field = matchFormField(raw);
          if (field && onFieldError?.(field, message)) return;
          if (field && EXTRA_FIELDS.has(field)) {
            setFieldErrors({ [field]: message });
            return;
          }
          if (field && FORM_FIELDS.has(field)) {
            form.setError(field as keyof PlaceFormValues, { message });
            return;
          }
        }
        setGeneralError(err);
      }
    });

  return {
    form,
    categories,
    setCategories,
    schedule,
    setSchedule,
    image,
    setImage,
    fieldErrors,
    generalError,
    submitWith,
  };
}

export type PlaceFormState = ReturnType<typeof usePlaceForm>;
