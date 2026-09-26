import { Alert, Typography } from "@mui/material";
import { ApiError } from "../../api/envelope";

export function ErrorAlert({ error }: { error: unknown }) {
  if (!error) return null;

  const message = error instanceof ApiError ? error.message : "Something went wrong.";
  const code = error instanceof ApiError ? error.code : undefined;

  return (
    <Alert severity="error" sx={{ mb: 2 }}>
      {message}
      {code && (
        <Typography variant="caption" component="div" color="text.secondary">
          {code}
        </Typography>
      )}
    </Alert>
  );
}
