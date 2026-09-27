import { Autocomplete, TextField } from "@mui/material";
import { useState } from "react";
import { useDebouncedValue } from "../../lib/useDebouncedValue";
import type { AdminUser } from "../users/api";
import { useManagerSearch } from "./queries";

interface ManagerTypeaheadProps {
  excludeIds: string[];
  onSelect: (user: AdminUser) => void;
  disabled?: boolean;
  placeholder?: string;
}

/** Typeahead over GET /admin/users/search?role=manager — shared by the create form and the city card. */
export function ManagerTypeahead({ excludeIds, onSelect, disabled, placeholder }: ManagerTypeaheadProps) {
  const [inputValue, setInputValue] = useState("");
  const debouncedQuery = useDebouncedValue(inputValue, 350);
  const { data, isFetching } = useManagerSearch(debouncedQuery);

  const options = (data?.items ?? []).filter((candidate) => !excludeIds.includes(candidate.id));

  return (
    <Autocomplete<AdminUser>
      disabled={disabled}
      options={options}
      filterOptions={(opts) => opts}
      inputValue={inputValue}
      onInputChange={(_, value) => setInputValue(value)}
      value={null}
      onChange={(_, value) => {
        if (value) {
          onSelect(value);
          setInputValue("");
        }
      }}
      getOptionLabel={(user) => `${user.display_name} <${user.email}>`}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      loading={isFetching}
      noOptionsText={inputValue.length ? "No managers found" : "Type to search managers"}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          placeholder={placeholder ?? "Search managers by email or name…"}
          helperText={isFetching ? "Searching…" : " "}
        />
      )}
      renderOption={(props, user) => (
        <li {...props} key={user.id}>
          {user.display_name} <span style={{ opacity: 0.6, marginLeft: 6 }}>{user.email}</span>
        </li>
      )}
    />
  );
}
