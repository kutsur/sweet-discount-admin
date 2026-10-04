import { Alert, Box, Button, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ConfirmDialog } from "../../components/feedback/ConfirmDialog";
import { ErrorAlert } from "../../components/feedback/ErrorAlert";
import { PageHeader } from "../../components/layout/PageHeader";
import { formatDate } from "../../lib/formatDate";
import { usePublicCities } from "../cities/queries";
import { PlaceEditForm } from "./PlaceEditForm";
import { PlaceStatusChip } from "./PlaceStatusChip";
import { useApprovePlace, useDeletePlace, usePlace, useRejectPlace } from "./queries";
import { RejectPlaceDialog } from "./RejectPlaceDialog";

export function PlaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: place, isLoading, error: loadError } = usePlace(id);
  const { data: cities } = usePublicCities();

  const deletePlace = useDeletePlace();
  const approvePlace = useApprovePlace(id ?? "");
  const rejectPlace = useRejectPlace(id ?? "");

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
    return <ErrorAlert error={loadError ?? new Error("Place not found.")} />;
  }

  const isDeleted = Boolean(place.deleted_at);
  const cityName = (cities?.items ?? []).find((city) => city.id === place.city_id)?.name;
  const moderationPending = approvePlace.isPending || rejectPlace.isPending;

  return (
    <Box sx={{ maxWidth: 720 }}>
      <PageHeader
        title={place.name}
        subtitle={cityName ? `${cityName} · ${place.lat}, ${place.lon}` : `${place.lat}, ${place.lon}`}
        actions={<PlaceStatusChip status={place.status} deletedAt={place.deleted_at} />}
      />

      {isDeleted && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          This place has been deleted.
        </Alert>
      )}

      {place.status === "rejected" && place.rejection_reason && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Rejected: {place.rejection_reason}
        </Alert>
      )}

      <ErrorAlert error={deletePlace.error ?? approvePlace.error ?? rejectPlace.error} />

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Moderation
        </Typography>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexWrap: "wrap" }}>
          <Button
            variant="contained"
            color="success"
            disabled={isDeleted || moderationPending}
            onClick={() => approvePlace.mutate()}
          >
            Approve
          </Button>
          <Button
            variant="outlined"
            color="error"
            disabled={isDeleted || moderationPending}
            onClick={() => setConfirmReject(true)}
          >
            Reject
          </Button>
          <Typography variant="body2" color="text.secondary">
            {place.reviewed_at ? `Last reviewed ${formatDate(place.reviewed_at)}` : "Not reviewed yet"}
          </Typography>
        </Stack>
      </Paper>

      <PlaceEditForm key={place.id} place={place} cityName={cityName} />

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Danger zone
        </Typography>
        <Button
          variant="outlined"
          color="error"
          disabled={isDeleted || deletePlace.isPending}
          onClick={() => setConfirmDelete(true)}
        >
          Delete place
        </Button>
      </Paper>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this place?"
        description={`${place.name} will be hidden from the public listing.`}
        confirmLabel="Delete"
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
