import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { Alert, Box, Button, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ConfirmDialog } from "../../components/feedback/ConfirmDialog";
import { ErrorAlert } from "../../components/feedback/ErrorAlert";
import { PageHeader } from "../../components/layout/PageHeader";
import { formatDate } from "../../lib/formatDate";
import { DISCOUNT_KINDS } from "./discountKinds";
import { DiscountForm, type DiscountPayload } from "./DiscountForm";
import { DiscountStatusChip } from "./DiscountStatusChip";
import { useDeleteDiscount, useDiscount, useUpdateDiscount } from "./queries";

export function DiscountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: discount, isLoading, error: loadError } = useDiscount(id);
  const updateDiscount = useUpdateDiscount(id ?? "");
  // A separate mutation for the header toggle, so its error doesn't double up with the form's.
  const toggleStatus = useUpdateDiscount(id ?? "");
  const deleteDiscount = useDeleteDiscount();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loadError || !discount) {
    return <ErrorAlert error={loadError ?? new Error("Скидка не найдена.")} />;
  }

  const isDeleted = Boolean(discount.deleted_at);
  const isActive = discount.status === "active";

  // kind and place_id are immutable server-side; status has its own header toggle.
  const save = ({ kind: _kind, status: _status, ...terms }: DiscountPayload) =>
    updateDiscount.mutateAsync(terms);

  return (
    <Box sx={{ maxWidth: 760 }}>
      <PageHeader
        title={discount.title}
        subtitle={`${DISCOUNT_KINDS[discount.kind].formatValue(discount)} · ${discount.place_name}`}
        actions={
          <>
            <DiscountStatusChip status={discount.status} deletedAt={discount.deleted_at} />
            <Button startIcon={<StorefrontIcon />} onClick={() => navigate(`/places/${discount.place_id}`)}>
              Заведение
            </Button>
            <Button
              variant="outlined"
              startIcon={isActive ? <PauseIcon /> : <PlayArrowIcon />}
              disabled={isDeleted || toggleStatus.isPending}
              onClick={() => toggleStatus.mutate({ status: isActive ? "paused" : "active" })}
            >
              {isActive ? "Приостановить" : "Возобновить"}
            </Button>
          </>
        }
      />

      {isDeleted && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Эта скидка удалена.
        </Alert>
      )}

      <ErrorAlert error={deleteDiscount.error ?? toggleStatus.error} />

      <DiscountForm
        key={discount.id}
        discount={discount}
        submitLabel="Сохранить"
        onSubmit={save}
        disabled={isDeleted}
      />

      <Stack direction="row" spacing={2} sx={{ color: "text.secondary", mb: 3 }}>
        <Typography variant="body2">Создана {formatDate(discount.created_at)}</Typography>
        <Typography variant="body2">Изменена {formatDate(discount.updated_at)}</Typography>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Опасная зона
        </Typography>
        <Button
          variant="outlined"
          color="error"
          disabled={isDeleted || deleteDiscount.isPending}
          onClick={() => setConfirmDelete(true)}
        >
          Удалить скидку
        </Button>
      </Paper>

      <ConfirmDialog
        open={confirmDelete}
        title="Удалить скидку?"
        description={`“${discount.title}” перестанет действовать.`}
        confirmLabel="Удалить"
        destructive
        loading={deleteDiscount.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() =>
          deleteDiscount.mutate(discount.id, {
            onSuccess: () => {
              setConfirmDelete(false);
              navigate(`/discounts?place_id=${discount.place_id}`);
            },
          })
        }
      />
    </Box>
  );
}
