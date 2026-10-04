import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, MenuItem, Paper, Stack, TextField } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router";
import { ApiError } from "../../api/envelope";
import { ErrorAlert } from "../../components/feedback/ErrorAlert";
import { PageHeader } from "../../components/layout/PageHeader";
import { usePublicCities } from "../cities/queries";
import type { PlaceCategory } from "./api";
import { CategorySelect } from "./CategorySelect";
import { extractDetailMessage, matchFormField } from "./errorMapping";
import { emptyWeekSchedule, validateWeekSchedule, weekScheduleToApi } from "./openingHours";
import type { WeekSchedule } from "./openingHours";
import { OpeningHoursEditor } from "./OpeningHoursEditor";
import { blankToNull, placeFormSchema, type PlaceFormValues } from "./placeSchema";
import { useCreatePlace } from "./queries";

/**
 * Creates a place in one city. The city is fixed at creation — the API has no city_id
 * on update — so it is picked here, pre-filled from ?city_id= when the user arrived
 * from a city page.
 */
export function PlaceCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createPlace = useCreatePlace();

  const { data: cities, isLoading: citiesLoading } = usePublicCities();

  const [cityId, setCityId] = useState(searchParams.get("city_id") ?? "");
  const [cityError, setCityError] = useState<string | null>(null);
  const [categories, setCategories] = useState<PlaceCategory[]>([]);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<WeekSchedule>(() => emptyWeekSchedule());
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<unknown>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PlaceFormValues>({
    resolver: zodResolver(placeFormSchema),
    defaultValues: { name: "", address: "", phone: "", lat: undefined, lon: undefined },
  });

  const onSubmit = async (values: PlaceFormValues) => {
    setGeneralError(null);
    setCityError(null);
    setCategoriesError(null);

    if (!cityId) {
      setCityError("Pick the city this place belongs to.");
      return;
    }

    const scheduleMessage = validateWeekSchedule(schedule);
    setScheduleError(scheduleMessage);
    if (scheduleMessage) return;

    try {
      const place = await createPlace.mutateAsync({
        city_id: cityId,
        name: values.name,
        address: blankToNull(values.address),
        phone: blankToNull(values.phone),
        lat: values.lat,
        lon: values.lon,
        category_ids: categories.map((category) => category.id),
        opening_hours: weekScheduleToApi(schedule),
      });
      navigate(`/places/${place.id}`, { replace: true });
    } catch (err) {
      // Rendered as its own Alert above: for a manager, "not your city" and "no such
      // city" are deliberately the same 404.
      if (err instanceof ApiError && err.code === "place_not_found") return;
      if (err instanceof ApiError && err.code === "validation_failed") {
        const message = extractDetailMessage(err);
        const field = matchFormField(message);
        if (field === "city_id") {
          setCityError(message);
          return;
        }
        if (field === "category_ids") {
          setCategoriesError(message);
          return;
        }
        if (field === "opening_hours") {
          setScheduleError(message);
          return;
        }
        if (field) {
          setError(field, { message });
          return;
        }
      }
      setGeneralError(err);
    }
  };

  /** A manager reaching into a city they don't manage gets 404, not 403 — by design. */
  const notFound = createPlace.error instanceof ApiError && createPlace.error.code === "place_not_found";

  return (
    <Box sx={{ maxWidth: 720 }}>
      <PageHeader
        title="Add place"
        subtitle="The place is created as pending — approve it separately once the details check out."
      />

      {notFound && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You can only add places to a city you manage.
        </Alert>
      )}

      <ErrorAlert error={generalError} />

      <Paper component="form" sx={{ p: 3 }} onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2.5}>
          <TextField
            select
            label="City"
            fullWidth
            value={cityId}
            disabled={citiesLoading}
            onChange={(event) => setCityId(event.target.value)}
            error={Boolean(cityError)}
            helperText={cityError ?? "A place can't be moved to another city later."}
          >
            {(cities?.items ?? []).map((city) => (
              <MenuItem key={city.id} value={city.id}>
                {city.name} · {city.country_code}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Name"
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register("name")}
          />
          <TextField
            label="Address"
            fullWidth
            error={!!errors.address}
            helperText={errors.address?.message ?? "Optional."}
            {...register("address")}
          />
          <TextField
            label="Phone"
            fullWidth
            error={!!errors.phone}
            helperText={errors.phone?.message ?? "Optional. International format, e.g. +375291234567"}
            {...register("phone")}
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="Latitude"
              type="number"
              fullWidth
              error={!!errors.lat}
              helperText={errors.lat?.message}
              slotProps={{ htmlInput: { step: "any" } }}
              {...register("lat", { valueAsNumber: true })}
            />
            <TextField
              label="Longitude"
              type="number"
              fullWidth
              error={!!errors.lon}
              helperText={errors.lon?.message}
              slotProps={{ htmlInput: { step: "any" } }}
              {...register("lon", { valueAsNumber: true })}
            />
          </Stack>

          <CategorySelect value={categories} onChange={setCategories} error={categoriesError} />

          <OpeningHoursEditor value={schedule} onChange={setSchedule} error={scheduleError} />

          <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
            <Button
              onClick={() => navigate(cityId ? `/places?city_id=${cityId}` : "/places")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              Create
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
