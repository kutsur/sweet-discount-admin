import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Chip, Paper, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { ApiError } from "../../api/envelope";
import { ErrorAlert } from "../../components/feedback/ErrorAlert";
import type { AdminUser } from "../users/api";
import { cityFormSchema, type CityFormValues } from "./citySchema";
import { extractDetailMessage, matchFormField } from "./errorMapping";
import { ManagerTypeahead } from "./ManagerTypeahead";
import { useCreateCity } from "./queries";

export function CityCreatePage() {
  const navigate = useNavigate();
  const createCity = useCreateCity();

  const [selectedManagers, setSelectedManagers] = useState<AdminUser[]>([]);
  const [managersError, setManagersError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<unknown>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CityFormValues>({
    resolver: zodResolver(cityFormSchema),
    defaultValues: { name: "", slug: "", country_code: "", lat: undefined, lon: undefined },
  });

  const onSubmit = async (values: CityFormValues) => {
    setGeneralError(null);
    setManagersError(null);

    try {
      const city = await createCity.mutateAsync({
        ...values,
        manager_ids: selectedManagers.map((manager) => manager.id),
      });
      navigate(`/cities/${city.id}`, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "slug_taken") {
          setError("slug", { message: err.message });
          return;
        }
        if (err.code === "validation_failed") {
          const message = extractDetailMessage(err);
          const field = matchFormField(message);
          if (field === "manager_ids") {
            setManagersError(message);
            return;
          }
          if (field) {
            setError(field, { message });
            return;
          }
        }
      }
      setGeneralError(err);
    }
  };

  const excludeIds = selectedManagers.map((manager) => manager.id);

  return (
    <Box sx={{ maxWidth: 640 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Add city
      </Typography>

      <ErrorAlert error={generalError} />

      <Paper component="form" sx={{ p: 3 }} onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2}>
          <TextField
            label="Name"
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register("name")}
          />
          <TextField
            label="Slug"
            fullWidth
            error={!!errors.slug}
            helperText={errors.slug?.message ?? "Latin letters, digits and single hyphens, e.g. gomel"}
            {...register("slug")}
          />
          <TextField
            label="Country code"
            fullWidth
            error={!!errors.country_code}
            helperText={errors.country_code?.message ?? "ISO 3166-1 alpha-2, e.g. BY"}
            {...register("country_code")}
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="Latitude"
              type="number"
              fullWidth
              error={!!errors.lat}
              helperText={errors.lat?.message}
              {...register("lat", { valueAsNumber: true })}
            />
            <TextField
              label="Longitude"
              type="number"
              fullWidth
              error={!!errors.lon}
              helperText={errors.lon?.message}
              {...register("lon", { valueAsNumber: true })}
            />
          </Stack>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Managers
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              You'll be assigned as a manager automatically.
            </Typography>
            <ManagerTypeahead
              excludeIds={excludeIds}
              onSelect={(user) => setSelectedManagers((prev) => [...prev, user])}
            />
            {managersError && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {managersError}
              </Typography>
            )}
            {selectedManagers.length > 0 && (
              <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 1.5, flexWrap: "wrap" }}>
                {selectedManagers.map((manager) => (
                  <Chip
                    key={manager.id}
                    label={`${manager.display_name} <${manager.email}>`}
                    onDelete={() => setSelectedManagers((prev) => prev.filter((m) => m.id !== manager.id))}
                  />
                ))}
              </Stack>
            )}
          </Box>

          <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
            <Button onClick={() => navigate("/cities")} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              Create
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
