import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { unwrap } from "../api/envelope";
import type { components } from "../api/schema.gen";
import { hasRole, type Role } from "./roles";
import { useAuth } from "./useAuth";

export type Me = components["schemas"]["Me"];

export const meKeys = {
  /** Keyed by user id, so signing in as someone else never reuses the previous role. */
  detail: (userId: string) => ["me", userId] as const,
};

/**
 * The signed-in user's own profile, including role — which the login response does not
 * carry. Drives navigation and which actions a page offers; the API remains the access
 * boundary.
 */
export function useMe() {
  const { status, user } = useAuth();
  const query = useQuery({
    queryKey: meKeys.detail(user?.id ?? ""),
    queryFn: () => unwrap<Me>(api.GET("/me")),
    enabled: status === "authenticated" && Boolean(user?.id),
    staleTime: 5 * 60 * 1000,
  });

  return { me: query.data, role: query.data?.role, isLoading: query.isPending, error: query.error };
}

/** Shorthand for "may the current user see this?" — false while the role is loading. */
export function useHasRole(allowed: readonly Role[]): boolean {
  return hasRole(useMe().role, allowed);
}
