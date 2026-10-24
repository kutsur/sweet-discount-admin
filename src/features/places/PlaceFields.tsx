import { Divider, TextField } from "@mui/material";
import { ImageField } from "../../components/images/ImageField";
import { CoordinatesField } from "../../components/map/CoordinatesField";
import { WeeklyScheduleEditor } from "../../components/schedule/WeeklyScheduleEditor";
import type { LatLon } from "../../lib/geo";
import { CategorySelect } from "./CategorySelect";
import type { PlaceFormState } from "./usePlaceForm";

interface PlaceFieldsProps {
  state: PlaceFormState;
  disabled?: boolean;
  /** Where the map opens when the place has no point yet — the city's centre. */
  fallbackCenter?: LatLon | null;
}

/** The editable fields of a place, shared by the create page and the edit form. */
export function PlaceFields({ state, disabled, fallbackCenter }: PlaceFieldsProps) {
  const {
    form: {
      register,
      control,
      formState: { errors },
    },
    fieldErrors,
  } = state;

  return (
    <>
      <TextField
        label="Название"
        fullWidth
        disabled={disabled}
        error={!!errors.name}
        helperText={errors.name?.message}
        {...register("name")}
      />
      <TextField
        label="Адрес"
        fullWidth
        disabled={disabled}
        error={!!errors.address}
        helperText={errors.address?.message ?? "Необязательно."}
        {...register("address")}
      />
      <TextField
        label="Телефон"
        fullWidth
        disabled={disabled}
        error={!!errors.phone}
        helperText={errors.phone?.message ?? "Необязательно. Международный формат, например +375291234567"}
        {...register("phone")}
      />

      <ImageField
        value={state.image}
        onChange={state.setImage}
        disabled={disabled}
        error={fieldErrors.image_id}
        helperText="Необязательно. Показывается на странице заведения."
      />

      <CoordinatesField control={control} disabled={disabled} fallbackCenter={fallbackCenter} />

      <CategorySelect
        value={state.categories}
        onChange={state.setCategories}
        disabled={disabled}
        error={fieldErrors.category_ids ?? null}
      />

      <Divider />

      <WeeklyScheduleEditor
        title="Часы работы"
        offLabel="Выходной"
        value={state.schedule}
        onChange={state.setSchedule}
        disabled={disabled}
        error={fieldErrors.opening_hours ?? null}
      />
    </>
  );
}
