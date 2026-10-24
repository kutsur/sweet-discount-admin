import { Stack, TextField, Typography } from "@mui/material";
import { useCallback } from "react";
import { useController, type Control, type FieldValues, type Path, type PathValue } from "react-hook-form";
import { toLatLon, type LatLon } from "../../lib/geo";
import { LocationPicker } from "./LocationPicker";

interface CoordinatesFieldProps<T extends FieldValues> {
  control: Control<T>;
  /** Field names default to "lat" / "lon" — every point-carrying form in this app uses those. */
  latName?: Path<T>;
  lonName?: Path<T>;
  fallbackCenter?: LatLon | null;
  disabled?: boolean;
  label?: string;
}

/**
 * The map picker plus the two numeric inputs, bound to a react-hook-form pair of
 * fields. The map and the inputs edit the same values, so a user can click, drag,
 * or type exact coordinates — whichever is faster.
 */
export function CoordinatesField<T extends FieldValues>({
  control,
  latName = "lat" as Path<T>,
  lonName = "lon" as Path<T>,
  fallbackCenter,
  disabled,
  label = "Расположение",
}: CoordinatesFieldProps<T>) {
  const lat = useController({ control, name: latName });
  const lon = useController({ control, name: lonName });

  const latOnChange = lat.field.onChange;
  const lonOnChange = lon.field.onChange;

  const onPick = useCallback(
    (point: LatLon) => {
      latOnChange(point.lat as PathValue<T, Path<T>>);
      lonOnChange(point.lon as PathValue<T, Path<T>>);
    },
    [latOnChange, lonOnChange],
  );

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">{label}</Typography>
      <Typography variant="body2" color="text.secondary">
        Кликните по карте, чтобы поставить метку, перетащите её для уточнения или введите координаты ниже.
      </Typography>
      <LocationPicker
        value={toLatLon(lat.field.value, lon.field.value)}
        onChange={onPick}
        fallbackCenter={fallbackCenter}
        disabled={disabled}
      />
      <Stack direction="row" spacing={2}>
        <NumberInput label="Широта" disabled={disabled} controller={lat} />
        <NumberInput label="Долгота" disabled={disabled} controller={lon} />
      </Stack>
    </Stack>
  );
}

function NumberInput<T extends FieldValues>({
  label,
  disabled,
  controller,
}: {
  label: string;
  disabled?: boolean;
  controller: ReturnType<typeof useController<T>>;
}) {
  const { field, fieldState } = controller;
  const value: number | undefined = field.value;

  return (
    <TextField
      label={label}
      type="number"
      fullWidth
      disabled={disabled}
      inputRef={field.ref}
      name={field.name}
      onBlur={field.onBlur}
      value={Number.isFinite(value) ? value : ""}
      onChange={(event) =>
        field.onChange(event.target.value === "" ? Number.NaN : Number(event.target.value))
      }
      error={Boolean(fieldState.error)}
      helperText={fieldState.error?.message}
      slotProps={{ htmlInput: { step: "any" } }}
    />
  );
}
