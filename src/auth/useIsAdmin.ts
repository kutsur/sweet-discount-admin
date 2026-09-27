import { useUser } from "../features/users/queries";
import { useAuth } from "./useAuth";

/**
 * The session (/auth/login) response carries no role — the backend enforces access per
 * endpoint instead. This fetches the caller's own admin record to know whether to show
 * admin-only UI (e.g. the Cities section); it is a UX nicety, not the access boundary.
 */
export function useIsAdmin() {
  const { user } = useAuth();
  const { data, isLoading } = useUser(user?.id);
  return { isAdmin: data?.role === "admin", isLoading };
}
