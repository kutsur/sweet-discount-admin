import { Autocomplete, Chip, TextField } from "@mui/material";
import type { PlaceCategory } from "./api";
import { MAX_CATEGORIES_PER_PLACE } from "./placeSchema";
import { usePlaceCategories } from "./queries";

interface CategorySelectProps {
  value: PlaceCategory[];
  onChange: (next: PlaceCategory[]) => void;
  disabled?: boolean;
  error?: string | null;
}

/** Multi-select over the seeded, read-only category catalog. The API caps a place at 5. */
export function CategorySelect({ value, onChange, disabled, error }: CategorySelectProps) {
  const { data, isFetching, error: loadError } = usePlaceCategories();
  const atLimit = value.length >= MAX_CATEGORIES_PER_PLACE;

  const helperText =
    error ??
    (loadError
      ? "Не удалось загрузить список категорий."
      : `Не более ${MAX_CATEGORIES_PER_PLACE} категорий у заведения.`);

  return (
    <Autocomplete<PlaceCategory, true>
      multiple
      disabled={disabled}
      options={data?.items ?? []}
      value={value}
      onChange={(_, next) => onChange(next)}
      getOptionLabel={(category) => category.name}
      getOptionDisabled={(category) => atLimit && !value.some((picked) => picked.id === category.id)}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      loading={isFetching}
      renderValue={(selected, getItemProps) =>
        selected.map((category, index) => (
          <Chip size="small" label={category.name} {...getItemProps({ index })} key={category.id} />
        ))
      }
      renderOption={(props, category) => (
        <li {...props} key={category.id}>
          {category.name}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Категории"
          placeholder={atLimit ? undefined : "Добавить категорию…"}
          error={Boolean(error) || Boolean(loadError)}
          helperText={helperText}
        />
      )}
    />
  );
}
