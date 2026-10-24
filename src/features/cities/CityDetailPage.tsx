import { zodResolver } from "@hookform/resolvers/zod";
import AddIcon from "@mui/icons-material/Add";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { Alert, Box, Button, CircularProgress, Paper, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { ApiError } from "../../api/envelope";
import { AssigneesCard } from "../../components/assignees/AssigneesCard";
import { ConfirmDialog } from "../../components/feedback/ConfirmDialog";
import { ErrorAlert } from "../../components/feedback/ErrorAlert";
import { PageHeader } from "../../components/layout/PageHeader";
import { CoordinatesField } from "../../components/map/CoordinatesField";
import { formatDate } from "../../lib/formatDate";
import { cityFormSchema } from "./citySchema";
import { validationDetail } from "../../lib/formErrors";
import { MANAGER_TEXTS } from "../../components/assignees/assigneeTexts";
import { matchFormField } from "./errorMapping";
import {
  useAddCityManager,
  useCity,
  useDeleteCity,
  useManagerSearch,
  useRemoveCityManager,
  useUpdateCity,
} from "./queries";

const cityEditSchema = cityFormSchema.omit({ slug: true });
type CityEditValues = { name: string; country_code: string; lat: number; lon: number };

export function CityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: city, isLoading, error: loadError } = useCity(id);

  const updateCity = useUpdateCity(id ?? "");
  const deleteCity = useDeleteCity();
  const addManager = useAddCityManager(id ?? "");
  const removeManager = useRemoveCityManager(id ?? "");

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [generalError, setGeneralError] = useState<unknown>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<CityEditValues>({ resolver: zodResolver(cityEditSchema) });

  useEffect(() => {
    if (city) {
      reset({ name: city.name, country_code: city.country_code, lat: city.lat, lon: city.lon });
    }
  }, [city, reset]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loadError || !city) {
    return <ErrorAlert error={loadError ?? new Error("Город не найден.")} />;
  }

  const isDeleted = Boolean(city.deleted_at);

  const onSubmit = async (values: CityEditValues) => {
    setGeneralError(null);
    try {
      await updateCity.mutateAsync(values);
    } catch (err) {
      if (err instanceof ApiError && err.code === "validation_failed") {
        const { raw, text: message } = validationDetail(err);
        const field = matchFormField(raw);
        if (field === "name" || field === "country_code" || field === "lat" || field === "lon") {
          setError(field, { message });
          return;
        }
      }
      setGeneralError(err);
    }
  };

  return (
    <Box sx={{ maxWidth: 640 }}>
      <PageHeader
        title={city.name}
        subtitle={`${city.country_code} · ${city.slug}`}
        actions={
          <>
            <Button startIcon={<StorefrontIcon />} onClick={() => navigate(`/places?city_id=${city.id}`)}>
              Заведения
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              disabled={isDeleted}
              onClick={() => navigate(`/places/new?city_id=${city.id}`)}
            >
              Добавить заведение
            </Button>
          </>
        }
      />

      {isDeleted && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Этот город удалён.
        </Alert>
      )}

      <ErrorAlert error={generalError ?? deleteCity.error} />

      <Paper component="form" sx={{ p: 3, mb: 3 }} onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2}>
          <TextField
            label="Короткое имя (slug)"
            fullWidth
            value={city.slug}
            disabled
            helperText="Короткое имя нельзя изменить после создания."
          />
          <TextField
            label="Название"
            fullWidth
            disabled={isDeleted}
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register("name")}
          />
          <TextField
            label="Код страны"
            fullWidth
            disabled={isDeleted}
            error={!!errors.country_code}
            helperText={errors.country_code?.message}
            {...register("country_code")}
          />
          <CoordinatesField control={control} label="Центр города" disabled={isDeleted} />
          <Stack direction="row" spacing={2} sx={{ color: "text.secondary" }}>
            <Typography variant="body2">Создан {formatDate(city.created_at)}</Typography>
            <Typography variant="body2">Изменён {formatDate(city.updated_at)}</Typography>
          </Stack>
          <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isDeleted || !isDirty || updateCity.isPending}
            >
              Сохранить
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <AssigneesCard
        title="Менеджеры"
        texts={MANAGER_TEXTS}
        assignees={city.managers}
        useSearch={useManagerSearch}
        onAdd={(userId) => addManager.mutateAsync(userId)}
        onRemove={(userId) => removeManager.mutateAsync(userId)}
        readOnly={isDeleted}
        readOnlyReason="Этот город удалён."
      />

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Опасная зона
        </Typography>
        <Button
          variant="outlined"
          color="error"
          disabled={isDeleted || deleteCity.isPending}
          onClick={() => setConfirmDelete(true)}
        >
          Удалить город
        </Button>
      </Paper>

      <ConfirmDialog
        open={confirmDelete}
        title="Удалить город?"
        description={`${city.name} исчезнет из публичного списка.`}
        confirmLabel="Удалить"
        destructive
        loading={deleteCity.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          if (!id) return;
          deleteCity.mutate(id, {
            onSuccess: () => {
              setConfirmDelete(false);
              navigate("/cities");
            },
          });
        }}
      />
    </Box>
  );
}
