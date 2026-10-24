import DeleteIcon from "@mui/icons-material/Delete";
import { Box, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import { ApiError } from "../../api/envelope";
import { validationDetail } from "../../lib/formErrors";
import { formatDate } from "../../lib/formatDate";
import { ConfirmDialog } from "../feedback/ConfirmDialog";
import { ErrorAlert } from "../feedback/ErrorAlert";
import type { AssigneeTexts } from "./assigneeTexts";
import { UserTypeahead, type UserCandidate, type UserSearchHook } from "./UserTypeahead";

/** The backend's Assignee row — a city's manager or a place's owner. */
export interface Assignee {
  user_id: string;
  email: string;
  display_name: string;
  assigned_at: string;
}

interface AssigneesCardProps {
  title: string;
  texts: AssigneeTexts;
  assignees: Assignee[];
  useSearch: UserSearchHook;
  onAdd: (userId: string) => Promise<unknown>;
  onRemove: (userId: string) => Promise<unknown>;
  /** Read-only: lists the people but offers no add/remove (deleted resource, or no permission). */
  readOnly?: boolean;
  readOnlyReason?: string;
}

/**
 * Attach/detach list for one kind of user-to-resource assignment. Both endpoints are
 * idempotent server-side; a 422 (wrong role, blocked user) shows inline under the picker.
 */
export function AssigneesCard({
  title,
  texts,
  assignees,
  useSearch,
  onAdd,
  onRemove,
  readOnly,
  readOnlyReason,
}: AssigneesCardProps) {
  const [toRemove, setToRemove] = useState<Assignee | null>(null);
  const [removing, setRemoving] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);

  const handleAdd = async (user: UserCandidate) => {
    setInlineError(null);
    setError(null);
    try {
      await onAdd(user.id);
    } catch (err) {
      if (err instanceof ApiError && err.code === "validation_failed") {
        setInlineError(validationDetail(err).text);
        return;
      }
      setError(err);
    }
  };

  const handleRemove = async () => {
    if (!toRemove) return;
    setRemoving(true);
    try {
      await onRemove(toRemove.user_id);
      setToRemove(null);
    } catch (err) {
      setError(err);
      setToRemove(null);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <ErrorAlert error={error} />
      <Stack spacing={1} sx={{ mb: 2 }}>
        {assignees.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            {texts.empty}
          </Typography>
        )}
        {assignees.map((assignee) => (
          <Stack
            key={assignee.user_id}
            direction="row"
            spacing={1}
            sx={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <Box>
              <Typography variant="body2">{assignee.display_name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {assignee.email} · назначен {formatDate(assignee.assigned_at)}
              </Typography>
            </Box>
            {!readOnly && (
              <Tooltip title={texts.removeTooltip}>
                <IconButton size="small" onClick={() => setToRemove(assignee)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        ))}
      </Stack>

      {readOnly ? (
        readOnlyReason && (
          <Typography variant="caption" color="text.secondary">
            {readOnlyReason}
          </Typography>
        )
      ) : (
        <>
          <UserTypeahead
            useSearch={useSearch}
            texts={texts}
            excludeIds={assignees.map((assignee) => assignee.user_id)}
            onSelect={handleAdd}
          />
          {inlineError && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {inlineError}
            </Typography>
          )}
        </>
      )}

      <ConfirmDialog
        open={Boolean(toRemove)}
        title={texts.removeTitle}
        description={`${toRemove?.display_name ?? ""} ${texts.removeConsequence}`}
        confirmLabel="Снять"
        destructive
        loading={removing}
        onCancel={() => setToRemove(null)}
        onConfirm={() => void handleRemove()}
      />
    </Paper>
  );
}
