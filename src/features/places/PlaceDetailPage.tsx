import AddIcon from "@mui/icons-material/Add";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { Alert, Box, Button, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ROLES } from "../../auth/roles";
import { useHasRole } from "../../auth/useMe";
import { OWNER_TEXTS } from "../../components/assignees/assigneeTexts";
import { AssigneesCard } from "../../components/assignees/AssigneesCard";
import { ConfirmDialog } from "../../components/feedback/ConfirmDialog";
import { ErrorAlert } from "../../components/feedback/ErrorAlert";
import { PageHeader } from "../../components/layout/PageHeader";
import { formatDate } from "../../lib/formatDate";
import { usePublicCities } from "../cities/queries";
import { PlaceEditForm } from "./PlaceEditForm";
import { PlaceStatusChip } from "./PlaceStatusChip";
import {
  useAddPlaceOwner,
  useApprovePlace,
  useDeletePlace,
  useOwnerSearch,
  usePlace,
  useRejectPlace,
  useRemovePlaceOwner,
} from "./queries";
import { RejectPlaceDialog } from "./RejectPlaceDialog";

export function PlaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: place, isLoading, error: loadError } = usePlace(id);
  const { data: cities } = usePublicCities();

  const deletePlace = useDeletePlace();
  const approvePlace = useApprovePlace(id ?? "");
  const rejectPlace = useRejectPlace(id ?? "");
  const addOwner = useAddPlaceOwner(id ?? "");
  const removeOwner = useRemovePlaceOwner(id ?? "");
  // An owner may read the place and run its discounts, but never edit or moderate it.
  const canManage = useHasRole(ROLES.placeStaff);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loadError || !place) {
    return <ErrorAlert error={loadError ?? new Error("Заведение не найдено.")} />;
  }

  const isDeleted = Boolean(place.deleted_at);
  const cityName = (cities?.items ?? []).find((city) => city.id === place.city_id)?.name;
  const moderationPending = approvePlace.isPending || rejectPlace.isPending;

  return (
    <Box sx={{ maxWidth: 720 }}>
      <PageHeader
        title={place.name}
        subtitle={cityName ? `${cityName} · ${place.lat}, ${place.lon}` : `${place.lat}, ${place.lon}`}
        actions={
          <>
            <PlaceStatusChip status={place.status} deletedAt={place.deleted_at} />
            <Button
              startIcon={<LocalOfferIcon />}
              onClick={() => navigate(`/discounts?place_id=${place.id}`)}
            >
              Скидки
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              disabled={isDeleted}
              onClick={() => navigate(`/discounts/new?place_id=${place.id}`)}
            >
              Добавить скидку
            </Button>
          </>
        }
      />

      {isDeleted && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Это заведение удалено.
        </Alert>
      )}

      {place.status === "rejected" && place.rejection_reason && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Отклонено: {place.rejection_reason}
        </Alert>
      )}

      <ErrorAlert error={deletePlace.error ?? approvePlace.error ?? rejectPlace.error} />

      {canManage && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Модерация
          </Typography>
          <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexWrap: "wrap" }}>
            <Button
              variant="contained"
              color="success"
              disabled={isDeleted || moderationPending}
              onClick={() => approvePlace.mutate()}
            >
              Одобрить
            </Button>
            <Button
              variant="outlined"
              color="error"
              disabled={isDeleted || moderationPending}
              onClick={() => setConfirmReject(true)}
            >
              Отклонить
            </Button>
            <Typography variant="body2" color="text.secondary">
              {place.reviewed_at ? `Проверено ${formatDate(place.reviewed_at)}` : "Ещё не проверено"}
            </Typography>
          </Stack>
        </Paper>
      )}

      <PlaceEditForm key={place.id} place={place} cityName={cityName} readOnly={!canManage} />

      <AssigneesCard
        title="Владельцы"
        texts={OWNER_TEXTS}
        assignees={place.owners}
        useSearch={useOwnerSearch}
        onAdd={(userId) => addOwner.mutateAsync(userId)}
        onRemove={(userId) => removeOwner.mutateAsync(userId)}
        readOnly={!canManage || isDeleted}
        readOnlyReason={
          isDeleted ? "Это заведение удалено." : "Владельцев назначает администратор или менеджер города."
        }
      />

      {canManage && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Опасная зона
          </Typography>
          <Button
            variant="outlined"
            color="error"
            disabled={isDeleted || deletePlace.isPending}
            onClick={() => setConfirmDelete(true)}
          >
            Удалить заведение
          </Button>
        </Paper>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Удалить заведение?"
        description={`${place.name} исчезнет из публичного списка.`}
        confirmLabel="Удалить"
        destructive
        loading={deletePlace.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          if (!id) return;
          deletePlace.mutate(id, {
            onSuccess: () => {
              setConfirmDelete(false);
              navigate(`/places?city_id=${place.city_id}`);
            },
          });
        }}
      />

      <RejectPlaceDialog
        open={confirmReject}
        loading={rejectPlace.isPending}
        onCancel={() => setConfirmReject(false)}
        onConfirm={(reason) => rejectPlace.mutate(reason, { onSuccess: () => setConfirmReject(false) })}
      />
    </Box>
  );
}
