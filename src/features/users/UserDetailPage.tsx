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
import { ROLE_LABEL } from "../../auth/roles";
import { useAuth } from "../../auth/useAuth";
import { ConfirmDialog } from "../../components/feedback/ConfirmDialog";
import { ErrorAlert } from "../../components/feedback/ErrorAlert";
import { PageHeader } from "../../components/layout/PageHeader";
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

// Every role, manager included — the list used to leave it out, so a manager could
// only be created through the database.
const ROLE_OPTIONS = Object.keys(ROLE_LABEL) as Role[];

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
    return <ErrorAlert error={loadError ?? new Error("Пользователь не найден.")} />;
  }

  const isSelf = viewer?.id === user.id;

  return (
    <Box sx={{ maxWidth: 640 }}>
      <PageHeader title={user.display_name} subtitle={user.email} />

      <ErrorAlert error={actionError} />

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack spacing={1.5}>
          <Row label="Эл. почта" value={user.email} />
          <Row label="Статус" value={<StatusChip user={user} />} />
          <Row label="Почта подтверждена" value={formatDate(user.email_verified_at)} />
          <Row label="Заблокирован" value={formatDate(user.blocked_at)} />
          <Row label="Удалён" value={formatDate(user.deleted_at)} />
          <Row label="Создан" value={formatDate(user.created_at)} />
          <Row label="Изменён" value={formatDate(user.updated_at)} />
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Действия
        </Typography>
        <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: "wrap", alignItems: "center" }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="role-label">Роль</InputLabel>
            <Select
              labelId="role-label"
              label="Роль"
              value={user.role}
              disabled={changeRole.isPending}
              onChange={(event) => changeRole.mutate(event.target.value as Role)}
            >
              {ROLE_OPTIONS.map((role) => (
                <MenuItem key={role} value={role}>
                  {ROLE_LABEL[role]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            disabled={Boolean(user.email_verified_at) || activate.isPending}
            onClick={() => activate.mutate()}
          >
            Активировать
          </Button>

          <Button variant="outlined" disabled={triggerReset.isPending} onClick={() => triggerReset.mutate()}>
            Отправить сброс пароля
          </Button>

          {user.blocked_at ? (
            <Button variant="outlined" disabled={unblock.isPending} onClick={() => unblock.mutate()}>
              Разблокировать
            </Button>
          ) : (
            <Tooltip title={isSelf ? "Нельзя заблокировать свою учётную запись" : ""}>
              <span>
                <Button
                  variant="outlined"
                  color="warning"
                  disabled={isSelf || block.isPending}
                  onClick={() => setConfirmBlock(true)}
                >
                  Заблокировать
                </Button>
              </span>
            </Tooltip>
          )}

          <Tooltip title={isSelf ? "Нельзя удалить свою учётную запись" : ""}>
            <span>
              <Button
                variant="outlined"
                color="error"
                disabled={Boolean(user.deleted_at) || isSelf || del.isPending}
                onClick={() => setConfirmDelete(true)}
              >
                Удалить
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Paper>

      <ConfirmDialog
        open={confirmBlock}
        title="Заблокировать пользователя?"
        description={`${user.email} будет разлогинен на всех устройствах и не сможет войти, пока его не разблокируют.`}
        confirmLabel="Заблокировать"
        destructive
        loading={block.isPending}
        onCancel={() => setConfirmBlock(false)}
        onConfirm={() => block.mutate(undefined, { onSuccess: () => setConfirmBlock(false) })}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="Удалить пользователя?"
        description={`${user.email} будет удалён и обезличен. Отменить это с этого экрана нельзя.`}
        confirmLabel="Удалить"
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
