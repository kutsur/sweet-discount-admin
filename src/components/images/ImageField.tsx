import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { Box, Button, CircularProgress, FormHelperText, Stack, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
import { ApiError } from "../../api/envelope";
import { validationDetail } from "../../lib/formErrors";
import { prepareImageUpload } from "../../lib/prepareImageUpload";
import { uploadImage, type Image } from "./api";

interface ImageFieldProps {
  label?: string;
  value: Image | null;
  onChange: (image: Image | null) => void;
  disabled?: boolean;
  /** A server-side error for this field (e.g. a rejected image_id). */
  error?: string | null;
  helperText?: string;
}

const PREVIEW_WIDTH = 240;
const PREVIEW_HEIGHT = 160;

function uploadErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    return err.code === "validation_failed" ? validationDetail(err).text : err.message;
  }
  // prepareImageUpload's own errors are Russian already.
  return err instanceof Error ? err.message : "Не удалось загрузить изображение.";
}

/**
 * Picks, uploads and previews one picture. The upload happens as soon as a file is
 * chosen, so the form only carries the resulting image (sent as image_id on save) —
 * any form with a picture uses this one control.
 */
export function ImageField({
  label = "Фото",
  value,
  onChange,
  disabled,
  error,
  helperText,
}: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useMutation({
    mutationFn: async (file: File) => uploadImage(await prepareImageUpload(file)),
    onSuccess: onChange,
  });

  const message = error ?? (upload.error ? uploadErrorMessage(upload.error) : null);
  const busy = upload.isPending;

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">{label}</Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { sm: "center" } }}>
        <Box
          sx={{
            width: PREVIEW_WIDTH,
            height: PREVIEW_HEIGHT,
            borderRadius: 1,
            border: 1,
            borderColor: message ? "error.main" : "divider",
            bgcolor: "action.hover",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {busy ? (
            <CircularProgress size={28} />
          ) : value ? (
            <Box
              component="img"
              src={value.url}
              alt=""
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <AddPhotoAlternateIcon color="disabled" fontSize="large" />
          )}
        </Box>

        {!disabled && (
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" disabled={busy} onClick={() => inputRef.current?.click()}>
              {value ? "Заменить" : "Загрузить"}
            </Button>
            {value && (
              <Button color="error" disabled={busy} onClick={() => onChange(null)}>
                Убрать
              </Button>
            )}
          </Stack>
        )}
      </Stack>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          // Reset so picking the same file again still fires onChange.
          event.target.value = "";
          if (file) upload.mutate(file);
        }}
      />

      <FormHelperText error={Boolean(message)} sx={{ mx: 0 }}>
        {message ?? helperText ?? "JPEG или PNG. Большие фото уменьшаются перед загрузкой."}
      </FormHelperText>
    </Stack>
  );
}
