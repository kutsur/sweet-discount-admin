import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Divider, Paper, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ApiError } from "../../api/envelope";
import { ErrorAlert } from "../../components/feedback/ErrorAlert";
import { formatDate } from "../../lib/formatDate";
import type { ManagedPlace, PlaceCategory } from "./api";
import { CategorySelect } from "./CategorySelect";
import { extractDetailMessage, matchFormField } from "./errorMapping";
import { validateWeekSchedule, weekScheduleFromApi, weekScheduleToApi } from "./openingHours";
import type { WeekSchedule } from "./openingHours";
import { OpeningHoursEditor } from "./OpeningHoursEditor";
import { blankToNull, placeFormSchema, type PlaceFormValues } from "./placeSchema";
import { useUpdatePlace } from "./queries";

interface PlaceEditFormProps {
  place: ManagedPlace;
  cityName?: string;
}

/**
 * Mount this with `key={place.id}` — every piece of form state is seeded from the
 * loaded place once, on mount, rather than re-synced by an effect on each refetch,
 * so a background refetch can't overwrite what the user is typing.
 */
export function PlaceEditForm({ place, cityName }: PlaceEditFormProps) {
  const updatePlace = useUpdatePlace(place.id);
  const isDeleted = Boolean(place.deleted_at);

  const [categories, setCategories] = useState<PlaceCategory[]>(place.categories);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<WeekSchedule>(() => weekScheduleFromApi(place.opening_hours));
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<unknown>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<PlaceFormValues>({
    resolver: zodResolver(placeFormSchema),
    defaultValues: {
      name: place.name,
      address: place.address ?? "",
      phone: place.phone ?? "",
      lat: place.lat,
      lon: place.lon,
    },
  });

  const onSubmit = async (values: PlaceFormValues) => {
    setGeneralError(null);
    setCategoriesError(null);

    const scheduleMessage = validateWeekSchedule(schedule);
    setScheduleError(scheduleMessage);
    if (scheduleMessage) return;

    try {
      // category_ids and opening_hours fully replace the stored set when sent, so the
      // form always sends both — omitting one would leave stale rows behind.
      await updatePlace.mutateAsync({
        name: values.name,
        address: blankToNull(values.address),
        phone: blankToNull(values.phone),
        lat: values.lat,
        lon: values.lon,
        category_ids: categories.map((category) => category.id),
        opening_hours: weekScheduleToApi(schedule),
      });
    } catch (err) {
      if (err instanceof ApiError && err.code === "validation_failed") {
        const message = extractDetailMessage(err);
        const field = matchFormField(message);
        if (field === "category_ids") {
          setCategoriesError(message);
          return;
        }
        if (field === "opening_hours") {
          setScheduleError(message);
          return;
        }
        if (
          field === "name" ||
          field === "address" ||
          field === "phone" ||
          field === "lat" ||
          field === "lon"
        ) {
          setError(field, { message });
          return;
        }
      }
      setGeneralError(err);
    }
  };

  return (
    <Paper component="form" sx={{ p: 3, mb: 3 }} onSubmit={handleSubmit(onSubmit)} noValidate>
      <ErrorAlert error={generalError} />

      <Stack spacing={2.5}>
        <TextField
          label="City"
          fullWidth
          value={cityName ?? place.city_id}
          disabled
          helperText="A place can't be moved to another city."
        />
        <TextField
          label="Name"
          fullWidth
          disabled={isDeleted}
          error={!!errors.name}
          helperText={errors.name?.message}
          {...register("name")}
        />
        <TextField
          label="Address"
          fullWidth
          disabled={isDeleted}
          error={!!errors.address}
          helperText={errors.address?.message}
          {...register("address")}
        />
        <TextField
          label="Phone"
          fullWidth
          disabled={isDeleted}
          error={!!errors.phone}
          helperText={errors.phone?.message ?? "International format, e.g. +375291234567"}
          {...register("phone")}
        />
        <Stack direction="row" spacing={2}>
          <TextField
            label="Latitude"
            type="number"
            fullWidth
            disabled={isDeleted}
            error={!!errors.lat}
            helperText={errors.lat?.message}
            slotProps={{ htmlInput: { step: "any" } }}
            {...register("lat", { valueAsNumber: true })}
          />
          <TextField
            label="Longitude"
            type="number"
            fullWidth
            disabled={isDeleted}
            error={!!errors.lon}
            helperText={errors.lon?.message}
            slotProps={{ htmlInput: { step: "any" } }}
            {...register("lon", { valueAsNumber: true })}
          />
        </Stack>

        <CategorySelect
          value={categories}
          onChange={setCategories}
          disabled={isDeleted}
          error={categoriesError}
        />

        <Divider />

        <OpeningHoursEditor
          value={schedule}
          onChange={setSchedule}
          disabled={isDeleted}
          error={scheduleError}
        />

        <Stack direction="row" spacing={2} sx={{ color: "text.secondary" }}>
          <Typography variant="body2">Created {formatDate(place.created_at)}</Typography>
          <Typography variant="body2">Updated {formatDate(place.updated_at)}</Typography>
        </Stack>

        <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
          <Button type="submit" variant="contained" disabled={isDeleted || updatePlace.isPending}>
            Save
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
