import { Autocomplete, TextField } from "@mui/material";
import { useEffect } from "react";
import type { ManagedPlaceListItem } from "./api";
import { usePlacesList } from "./queries";

/** The API's page cap — enough for a venue's staff; a larger catalog would need a q param. */
const PICKER_LIMIT = 100;

interface PlacePickerProps {
  /** Place id, or "" for none. */
  value: string;
  onChange: (placeId: string) => void;
  label?: string;
  /** Text for the empty choice when used as a filter, e.g. "All places". */
  placeholder?: string;
  size?: "small" | "medium";
  disabled?: boolean;
  error?: string | null;
  helperText?: string;
  /** Picks the only option automatically — an owner of one place shouldn't have to choose. */
  autoSelectSingle?: boolean;
}

/** Picks one of the places the actor can see — already scoped server-side by role. */
export function PlacePicker({
  value,
  onChange,
  label = "Заведение",
  placeholder,
  size,
  disabled,
  error,
  helperText,
  autoSelectSingle,
}: PlacePickerProps) {
  const { data, isFetching } = usePlacesList({ limit: PICKER_LIMIT, offset: 0 });
  const options = data?.items ?? [];
  const selected = options.find((place) => place.id === value) ?? null;
  const onlyOptionId = autoSelectSingle && options.length === 1 ? options[0].id : null;

  useEffect(() => {
    if (onlyOptionId && !value) onChange(onlyOptionId);
  }, [onlyOptionId, value, onChange]);

  return (
    <Autocomplete<ManagedPlaceListItem>
      options={options}
      value={selected}
      disabled={disabled}
      loading={isFetching}
      onChange={(_, place) => onChange(place?.id ?? "")}
      getOptionLabel={(place) => place.name}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      renderOption={(props, place) => (
        <li {...props} key={place.id}>
          {place.name}
          {place.address && <span style={{ opacity: 0.6, marginLeft: 6 }}>{place.address}</span>}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          size={size}
          label={label}
          placeholder={placeholder}
          error={Boolean(error)}
          helperText={error ?? helperText}
        />
      )}
      sx={{ minWidth: 240 }}
    />
  );
}
