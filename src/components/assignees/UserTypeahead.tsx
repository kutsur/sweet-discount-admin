import type { AssigneeTexts } from "./assigneeTexts";
import { Autocomplete, TextField } from "@mui/material";
import { useState } from "react";
import { useDebouncedValue } from "../../lib/useDebouncedValue";

/** The few fields a picker needs — AdminUser and AssignableUser both satisfy it. */
export interface UserCandidate {
  id: string;
  email: string;
  display_name: string;
}

/** A search hook returning a page of candidates — e.g. managers, or owners. Must be a stable, module-level hook. */
export type UserSearchHook = (query: string) => {
  data?: { items: UserCandidate[] };
  isFetching: boolean;
};

interface UserTypeaheadProps {
  useSearch: UserSearchHook;
  excludeIds: string[];
  onSelect: (user: UserCandidate) => void;
  texts: Pick<AssigneeTexts, "searchPlaceholder" | "searchPrompt" | "searchEmpty">;
  disabled?: boolean;
}

/** Debounced typeahead over any assign-a-user search endpoint. */
export function UserTypeahead({ useSearch, excludeIds, onSelect, texts, disabled }: UserTypeaheadProps) {
  const [inputValue, setInputValue] = useState("");
  const debouncedQuery = useDebouncedValue(inputValue, 350);
  const { data, isFetching } = useSearch(debouncedQuery);

  const options = (data?.items ?? []).filter((candidate) => !excludeIds.includes(candidate.id));

  return (
    <Autocomplete<UserCandidate>
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
      noOptionsText={inputValue.length ? texts.searchEmpty : texts.searchPrompt}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          placeholder={texts.searchPlaceholder}
          helperText={isFetching ? "Поиск…" : " "}
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
