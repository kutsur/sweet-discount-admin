import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useState } from "react";

interface RejectPlaceDialogProps {
  open: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}

/** Reject needs a reason the API requires to be non-empty, so ConfirmDialog won't do. */
export function RejectPlaceDialog({ open, loading, onCancel, onConfirm }: RejectPlaceDialogProps) {
  const [reason, setReason] = useState("");

  const close = () => {
    setReason("");
    onCancel();
  };

  return (
    <Dialog open={open} onClose={close} maxWidth="xs" fullWidth>
      <DialogTitle>Отклонить заведение?</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Причина сохранится в карточке заведения и будет видна тому, кто его добавил.
        </DialogContentText>
        <TextField
          autoFocus
          fullWidth
          multiline
          minRows={2}
          label="Причина"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={loading}>
          Отмена
        </Button>
        <Button
          color="error"
          disabled={loading || reason.trim().length === 0}
          onClick={() => onConfirm(reason.trim())}
        >
          Отклонить
        </Button>
      </DialogActions>
    </Dialog>
  );
}
