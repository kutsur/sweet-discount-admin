import { zodResolver } from "@hookform/resolvers/zod";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { ApiError } from "../../api/envelope";
import { ConfirmDialog } from "../../components/feedback/ConfirmDialog";
import { ErrorAlert } from "../../components/feedback/ErrorAlert";
import { formatDate } from "../../lib/formatDate";
import type { AdminUser } from "../users/api";
import type { CityManager } from "./api";
import { cityFormSchema } from "./citySchema";
import { extractDetailMessage, matchFormField } from "./errorMapping";
import { ManagerTypeahead } from "./ManagerTypeahead";
import { useAddCityManager, useCity, useDeleteCity, useRemoveCityManager, useUpdateCity } from "./queries";

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
  const [managerToRemove, setManagerToRemove] = useState<CityManager | null>(null);
  const [managersError, setManagersError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<unknown>(null);

  const {
    register,
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
    return <ErrorAlert error={loadError ?? new Error("City not found.")} />;
  }

  const isDeleted = Boolean(city.deleted_at);
  const managerIds = city.managers.map((manager) => manager.user_id);

  const onSubmit = async (values: CityEditValues) => {
    setGeneralError(null);
    try {
      await updateCity.mutateAsync(values);
    } catch (err) {
      if (err instanceof ApiError && err.code === "validation_failed") {
        const message = extractDetailMessage(err);
        const field = matchFormField(message);
        if (field === "name" || field === "country_code" || field === "lat" || field === "lon") {
          setError(field, { message });
          return;
        }
      }
      setGeneralError(err);
    }
  };

  const handleAddManager = async (user: AdminUser) => {
    setManagersError(null);
    try {
      await addManager.mutateAsync(user.id);
    } catch (err) {
      if (err instanceof ApiError && err.code === "validation_failed") {
        setManagersError(extractDetailMessage(err));
        return;
      }
      setGeneralError(err);
    }
  };

  return (
    <Box sx={{ maxWidth: 640 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {city.name}
      </Typography>

      {isDeleted && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          This city has been deleted.
        </Alert>
      )}

      <ErrorAlert error={generalError ?? deleteCity.error} />

      <Paper component="form" sx={{ p: 3, mb: 3 }} onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2}>
          <TextField label="Slug" fullWidth value={city.slug} disabled helperText="Slug can't be changed after creation." />
          <TextField
            label="Name"
            fullWidth
            disabled={isDeleted}
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register("name")}
          />
          <TextField
            label="Country code"
            fullWidth
            disabled={isDeleted}
            error={!!errors.country_code}
            helperText={errors.country_code?.message}
            {...register("country_code")}
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="Latitude"
              type="number"
              fullWidth
              disabled={isDeleted}
              error={!!errors.lat}
              helperText={errors.lat?.message}
              {...register("lat", { valueAsNumber: true })}
            />
            <TextField
              label="Longitude"
              type="number"
              fullWidth
              disabled={isDeleted}
              error={!!errors.lon}
              helperText={errors.lon?.message}
              {...register("lon", { valueAsNumber: true })}
            />
          </Stack>
          <Stack direction="row" spacing={2} sx={{ color: "text.secondary" }}>
            <Typography variant="body2">Created {formatDate(city.created_at)}</Typography>
            <Typography variant="body2">Updated {formatDate(city.updated_at)}</Typography>
          </Stack>
          <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
            <Button type="submit" variant="contained" disabled={isDeleted || !isDirty || updateCity.isPending}>
              Save
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Managers
        </Typography>
        <Stack spacing={1} sx={{ mb: 2 }}>
          {city.managers.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No managers assigned.
            </Typography>
          )}
          {city.managers.map((manager) => (
            <Stack
              key={manager.user_id}
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", justifyContent: "space-between" }}
            >
              <Box>
                <Typography variant="body2">{manager.display_name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {manager.email} · assigned {formatDate(manager.assigned_at)}
                </Typography>
              </Box>
              <Tooltip title={isDeleted ? "City is deleted" : "Remove manager"}>
                <span>
                  <IconButton size="small" disabled={isDeleted} onClick={() => setManagerToRemove(manager)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          ))}
        </Stack>

        {!isDeleted && (
          <>
            <ManagerTypeahead excludeIds={managerIds} onSelect={handleAddManager} />
            {managersError && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {managersError}
              </Typography>
            )}
          </>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Danger zone
        </Typography>
        <Button
          variant="outlined"
          color="error"
          disabled={isDeleted || deleteCity.isPending}
          onClick={() => setConfirmDelete(true)}
        >
          Delete city
        </Button>
      </Paper>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this city?"
        description={`${city.name} will be removed from the public listing.`}
        confirmLabel="Delete"
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

      <ConfirmDialog
        open={Boolean(managerToRemove)}
        title="Remove this manager?"
        description={`${managerToRemove?.display_name ?? ""} will no longer be responsible for this city.`}
        confirmLabel="Remove"
        destructive
        loading={removeManager.isPending}
        onCancel={() => setManagerToRemove(null)}
        onConfirm={() => {
          if (!managerToRemove) return;
          removeManager.mutate(managerToRemove.user_id, { onSuccess: () => setManagerToRemove(null) });
        }}
      />
    </Box>
  );
}
