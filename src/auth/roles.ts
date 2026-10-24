import type { components } from "../api/schema.gen";

export type Role = components["schemas"]["Role"];

/**
 * Who may reach which part of the console. These mirror the backend's requireRole
 * groups — they only decide what the UI shows; the API enforces every one of them.
 */
export const ROLES = {
  /** /v1/admin/* — users and cities. */
  admin: ["admin"],
  /** Create, edit, moderate places and attach their owners. */
  placeStaff: ["admin", "manager"],
  /** Read places and run their discounts. */
  venue: ["admin", "manager", "owner"],
} as const satisfies Record<string, readonly Role[]>;

export function hasRole(role: Role | undefined, allowed: readonly Role[]): boolean {
  return role !== undefined && allowed.includes(role);
}

/** How each role is named in the UI. */
export const ROLE_LABEL: Record<Role, string> = {
  user: "Пользователь",
  moderator: "Модератор",
  manager: "Менеджер",
  owner: "Владелец",
  admin: "Администратор",
};
