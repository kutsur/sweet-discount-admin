import { Alert } from "@mui/material";
import { ApiError } from "../../api/envelope";
import { apiErrorText, GENERIC_ERROR_TEXT } from "../../lib/apiErrorText";

/** The Russian text for whatever a query or mutation threw. */
function errorText(error: unknown): string {
  // ApiError messages are already Russian (see apiErrorText).
  if (error instanceof ApiError) return error.message;
  // fetch() itself failing — offline, DNS, CORS — surfaces as a TypeError.
  if (error instanceof TypeError) return apiErrorText("network_error");
  // Errors this app throws itself (e.g. "not found" guards) carry Russian messages.
  if (error instanceof Error && error.message) return error.message;
  return GENERIC_ERROR_TEXT;
}

export function ErrorAlert({ error }: { error: unknown }) {
  if (!error) return null;

  return (
    <Alert severity="error" sx={{ mb: 2 }}>
      {errorText(error)}
    </Alert>
  );
}
