import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Chip, Paper, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { ApiError } from "../../api/envelope";
import { MANAGER_TEXTS } from "../../components/assignees/assigneeTexts";
import { UserTypeahead, type UserCandidate } from "../../components/assignees/UserTypeahead";
import { ErrorAlert } from "../../components/feedback/ErrorAlert";
import { PageHeader } from "../../components/layout/PageHeader";
import { CoordinatesField } from "../../components/map/CoordinatesField";
import { cityFormSchema, type CityFormValues } from "./citySchema";
import { validationDetail } from "../../lib/formErrors";
import { matchFormField } from "./errorMapping";
import { useCreateCity, useManagerSearch } from "./queries";

export function CityCreatePage() {
  const navigate = useNavigate();
  const createCity = useCreateCity();

  const [selectedManagers, setSelectedManagers] = useState<UserCandidate[]>([]);
  const [managersError, setManagersError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<unknown>(null);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CityFormValues>({
    resolver: zodResolver(cityFormSchema),
    defaultValues: { name: "", slug: "", country_code: "", lat: Number.NaN, lon: Number.NaN },
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
          const { raw, text: message } = validationDetail(err);
          const field = matchFormField(raw);
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
      <PageHeader title="Новый город" subtitle="Создайте город и назначьте его менеджеров." />

      <ErrorAlert error={generalError} />

      <Paper component="form" sx={{ p: 3 }} onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2}>
          <TextField
            label="Название"
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register("name")}
          />
          <TextField
            label="Короткое имя (slug)"
            fullWidth
            error={!!errors.slug}
            helperText={
              errors.slug?.message ??
              "Латинские буквы, цифры и дефисы, например gomel. Используется в адресах."
            }
            {...register("slug")}
          />
          <TextField
            label="Код страны"
            fullWidth
            error={!!errors.country_code}
            helperText={errors.country_code?.message ?? "Две буквы по ISO 3166-1, например BY"}
            {...register("country_code")}
          />
          <CoordinatesField control={control} label="Центр города" />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Менеджеры
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Вы будете назначены менеджером автоматически.
            </Typography>
            <UserTypeahead
              useSearch={useManagerSearch}
              texts={MANAGER_TEXTS}
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
              Отмена
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              Создать
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
