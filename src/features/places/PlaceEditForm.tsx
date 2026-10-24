import { Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { ErrorAlert } from "../../components/feedback/ErrorAlert";
import { formatDate } from "../../lib/formatDate";
import type { ManagedPlace } from "./api";
import { weekScheduleFromOpeningHours } from "./openingHours";
import { PlaceFields } from "./PlaceFields";
import { useUpdatePlace } from "./queries";
import { usePlaceForm } from "./usePlaceForm";

interface PlaceEditFormProps {
  place: ManagedPlace;
  cityName?: string;
  /** View-only, for a role that may read the place but not change it (an owner). */
  readOnly?: boolean;
}

/**
 * Mount this with `key={place.id}` — every piece of form state is seeded from the
 * loaded place once, on mount, rather than re-synced by an effect on each refetch,
 * so a background refetch can't overwrite what the user is typing.
 */
export function PlaceEditForm({ place, cityName, readOnly }: PlaceEditFormProps) {
  const updatePlace = useUpdatePlace(place.id);
  const locked = readOnly || Boolean(place.deleted_at);

  const state = usePlaceForm({
    values: {
      name: place.name,
      address: place.address ?? "",
      phone: place.phone ?? "",
      lat: place.lat,
      lon: place.lon,
    },
    categories: place.categories,
    schedule: weekScheduleFromOpeningHours(place.opening_hours),
    image: place.image,
  });

  const onSubmit = state.submitWith((body) => updatePlace.mutateAsync(body));

  return (
    <Paper component="form" sx={{ p: 3, mb: 3 }} onSubmit={onSubmit} noValidate>
      <ErrorAlert error={state.generalError} />

      <Stack spacing={2.5}>
        <TextField
          label="Город"
          fullWidth
          value={cityName ?? place.city_id}
          disabled
          helperText="Заведение нельзя перенести в другой город."
        />

        <PlaceFields state={state} disabled={locked} />

        <Stack direction="row" spacing={2} sx={{ color: "text.secondary" }}>
          <Typography variant="body2">Создано {formatDate(place.created_at)}</Typography>
          <Typography variant="body2">Изменено {formatDate(place.updated_at)}</Typography>
        </Stack>

        {!readOnly && (
          <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
            <Button type="submit" variant="contained" disabled={locked || updatePlace.isPending}>
              Сохранить
            </Button>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
