import { api } from "../../api/client";
import { unwrap, unwrapPage, unwrapVoid } from "../../api/envelope";
import type { components } from "../../api/schema.gen";

export type AdminUser = components["schemas"]["AdminUser"];
export type Role = components["schemas"]["Role"];

export interface ListUsersParams {
  limit: number;
  offset: number;
}

export function fetchUsers({ limit, offset }: ListUsersParams) {
  return unwrapPage<AdminUser>(api.GET("/admin/users", { params: { query: { limit, offset } } }));
}

export function fetchUser(id: string) {
  return unwrap<AdminUser>(api.GET("/admin/users/{id}", { params: { path: { id } } }));
}

export function deleteUser(id: string) {
  return unwrapVoid(api.DELETE("/admin/users/{id}", { params: { path: { id } } }));
}

export function activateUser(id: string) {
  return unwrap<{ activated: true }>(api.POST("/admin/users/{id}/activate", { params: { path: { id } } }));
}

export function changeUserRole(id: string, role: Role) {
  return unwrap<AdminUser>(
    api.PATCH("/admin/users/{id}/role", { params: { path: { id } }, body: { role } }),
  );
}

export function triggerPasswordReset(id: string) {
  return unwrap<{ password_reset_requested: true }>(
    api.POST("/admin/users/{id}/password-reset", { params: { path: { id } } }),
  );
}

export function blockUser(id: string) {
  return unwrap<{ blocked: true }>(api.POST("/admin/users/{id}/block", { params: { path: { id } } }));
}

export function unblockUser(id: string) {
  return unwrap<{ unblocked: true }>(api.POST("/admin/users/{id}/unblock", { params: { path: { id } } }));
}
