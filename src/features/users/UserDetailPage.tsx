import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "../../auth/useAuth";
import { ConfirmDialog } from "../../components/feedback/ConfirmDialog";
import { ErrorAlert } from "../../components/feedback/ErrorAlert";
import { formatDate } from "../../lib/formatDate";
import type { Role } from "./api";
import {
  useActivateUser,
  useBlockUser,
  useChangeUserRole,
  useDeleteUser,
  useTriggerPasswordReset,
  useUnblockUser,
  useUser,
} from "./queries";
import { StatusChip } from "./StatusChip";

const ROLE_OPTIONS: Role[] = ["user", "moderator", "admin", "owner"];

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: viewer } = useAuth();
  const { data: user, isLoading, error: loadError } = useUser(id);

  const activate = useActivateUser(id ?? "");
  const changeRole = useChangeUserRole(id ?? "");
  const triggerReset = useTriggerPasswordReset(id ?? "");
  const block = useBlockUser(id ?? "");
  const unblock = useUnblockUser(id ?? "");
  const del = useDeleteUser(id ?? "");

  const [confirmBlock, setConfirmBlock] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const actionError =
    activate.error ?? changeRole.error ?? triggerReset.error ?? block.error ?? unblock.error ?? del.error;

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loadError || !user) {
    return <ErrorAlert error={loadError ?? new Error("User not found.")} />;
  }

  const isSelf = viewer?.id === user.id;

  return (
    <Box sx={{ maxWidth: 640 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {user.display_name}
      </Typography>

      <ErrorAlert error={actionError} />

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack spacing={1.5}>
          <Row label="Email" value={user.email} />
          <Row label="Status" value={<StatusChip user={user} />} />
          <Row label="Verified" value={formatDate(user.email_verified_at)} />
          <Row label="Blocked" value={formatDate(user.blocked_at)} />
          <Row label="Deleted" value={formatDate(user.deleted_at)} />
          <Row label="Created" value={formatDate(user.created_at)} />
          <Row label="Updated" value={formatDate(user.updated_at)} />
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Actions
        </Typography>
        <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: "wrap", alignItems: "center" }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              label="Role"
              value={user.role}
              disabled={changeRole.isPending}
              onChange={(event) => changeRole.mutate(event.target.value as Role)}
            >
              {ROLE_OPTIONS.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            disabled={Boolean(user.email_verified_at) || activate.isPending}
            onClick={() => activate.mutate()}
          >
            Activate
          </Button>

          <Button variant="outlined" disabled={triggerReset.isPending} onClick={() => triggerReset.mutate()}>
            Send password reset
          </Button>

          {user.blocked_at ? (
            <Button variant="outlined" disabled={unblock.isPending} onClick={() => unblock.mutate()}>
              Unblock
            </Button>
          ) : (
            <Tooltip title={isSelf ? "You can't block your own account" : ""}>
              <span>
                <Button
                  variant="outlined"
                  color="warning"
                  disabled={isSelf || block.isPending}
                  onClick={() => setConfirmBlock(true)}
                >
                  Block
                </Button>
              </span>
            </Tooltip>
          )}

          <Tooltip title={isSelf ? "You can't delete your own account" : ""}>
            <span>
              <Button
                variant="outlined"
                color="error"
                disabled={Boolean(user.deleted_at) || isSelf || del.isPending}
                onClick={() => setConfirmDelete(true)}
              >
                Delete
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Paper>

      <ConfirmDialog
        open={confirmBlock}
        title="Block this user?"
        description={`${user.email} will be signed out everywhere and unable to log back in until unblocked.`}
        confirmLabel="Block"
        destructive
        loading={block.isPending}
        onCancel={() => setConfirmBlock(false)}
        onConfirm={() => block.mutate(undefined, { onSuccess: () => setConfirmBlock(false) })}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this user?"
        description={`${user.email} will be soft-deleted and anonymized. This cannot be undone from this screen.`}
        confirmLabel="Delete"
        destructive
        loading={del.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => del.mutate(undefined, { onSuccess: () => navigate("/users") })}
      />
    </Box>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Stack direction="row" sx={{ justifyContent: "space-between" }}>
      <Typography color="text.secondary">{label}</Typography>
      <Typography component="div">{value}</Typography>
    </Stack>
  );
}
