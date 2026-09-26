import { api } from "../../api/client";
import { sessionCleared } from "../../auth/authSlice";
import { tokenStorage } from "../../auth/tokenStorage";
import { store } from "../../store";

export async function logout(): Promise<void> {
  const refreshToken = tokenStorage.load()?.refreshToken;
  if (refreshToken) {
    try {
      await api.POST("/auth/logout", { body: { refresh_token: refreshToken } });
    } catch {
      // Logout is idempotent server-side; a failed request here shouldn't block clearing local state.
    }
  }
  store.dispatch(sessionCleared());
  tokenStorage.clear();
}
