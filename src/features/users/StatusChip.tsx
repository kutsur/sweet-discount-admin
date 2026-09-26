import { Chip, type ChipProps } from "@mui/material";
import type { AdminUser } from "./api";
import { deriveUserStatus, USER_STATUS_LABEL, type UserStatus } from "./userStatus";

const COLOR_BY_STATUS: Record<UserStatus, ChipProps["color"]> = {
  active: "success",
  unverified: "warning",
  blocked: "error",
  deleted: "default",
};

export function StatusChip({ user }: { user: AdminUser }) {
  const status = deriveUserStatus(user);
  return <Chip size="small" label={USER_STATUS_LABEL[status]} color={COLOR_BY_STATUS[status]} />;
}
