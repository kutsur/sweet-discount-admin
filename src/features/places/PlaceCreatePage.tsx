import { Alert, Box, Button, MenuItem, Paper, Stack, TextField } from "@mui/material";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ApiError } from "../../api/envelope";
import { ErrorAlert } from "../../components/feedback/ErrorAlert";
import { PageHeader } from "../../components/layout/PageHeader";
import { emptyWeekSchedule } from "../../lib/weeklySchedule";
import { usePublicCities } from "../cities/queries";
import { PlaceFields } from "./PlaceFields";
import { useCreatePlace } from "./queries";
import { usePlaceForm, type PlaceBody } from "./usePlaceForm";

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

  const state = usePlaceForm({
    values: { name: "", address: "", phone: "", lat: Number.NaN, lon: Number.NaN },
    categories: [],
    schedule: emptyWeekSchedule(),
    image: null,
  });

  const selectedCity = cities?.items.find((city) => city.id === cityId);

  const save = async (body: PlaceBody) => {
    setCityError(null);
    if (!cityId) {
      setCityError("Выберите город заведения.");
      return;
    }

    try {
      const place = await createPlace.mutateAsync({ ...body, city_id: cityId });
      navigate(`/places/${place.id}`, { replace: true });
    } catch (err) {
      // Rendered as its own Alert below: for a manager, "not your city" and "no such
      // city" are deliberately the same 404.
      if (err instanceof ApiError && err.code === "place_not_found") return;
      throw err;
    }
  };

  const onSubmit = state.submitWith(save, (field, message) => {
    if (field !== "city_id") return false;
    setCityError(message);
    return true;
  });

  /** A manager reaching into a city they don't manage gets 404, not 403 — by design. */
  const notFound = createPlace.error instanceof ApiError && createPlace.error.code === "place_not_found";
  const submitting = state.form.formState.isSubmitting;

  return (
    <Box sx={{ maxWidth: 720 }}>
      <PageHeader
        title="Новое заведение"
        subtitle="Заведение создаётся со статусом «На модерации» — одобрите его, когда проверите данные."
      />

      {notFound && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Добавлять заведения можно только в города, которыми вы управляете.
        </Alert>
      )}

      <ErrorAlert error={state.generalError} />

      <Paper component="form" sx={{ p: 3 }} onSubmit={onSubmit} noValidate>
        <Stack spacing={2.5}>
          <TextField
            select
            label="Город"
            fullWidth
            value={cityId}
            disabled={citiesLoading}
            onChange={(event) => setCityId(event.target.value)}
            error={Boolean(cityError)}
            helperText={cityError ?? "Потом заведение нельзя будет перенести в другой город."}
          >
            {(cities?.items ?? []).map((city) => (
              <MenuItem key={city.id} value={city.id}>
                {city.name} · {city.country_code}
              </MenuItem>
            ))}
          </TextField>

          <PlaceFields
            state={state}
            fallbackCenter={selectedCity ? { lat: selectedCity.lat, lon: selectedCity.lon } : null}
          />

          <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
            <Button
              onClick={() => navigate(cityId ? `/places?city_id=${cityId}` : "/places")}
              disabled={submitting}
            >
              Отмена
            </Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              Создать
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
