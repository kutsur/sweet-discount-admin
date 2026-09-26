import type { AdminUser } from "./api";

export type UserStatus = "active" | "unverified" | "blocked" | "deleted";

/** The API has no status enum, only nullable timestamps — precedence is a client-side judgment call. */
export function deriveUserStatus(user: AdminUser): UserStatus {
  if (user.deleted_at) return "deleted";
  if (user.blocked_at) return "blocked";
  if (!user.email_verified_at) return "unverified";
  return "active";
}

export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  active: "Active",
  unverified: "Unverified",
  blocked: "Blocked",
  deleted: "Deleted",
};
