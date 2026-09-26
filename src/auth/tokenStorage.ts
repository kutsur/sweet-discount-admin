import type { AuthUser } from "./authSlice";

const STORAGE_KEY = "sweet-discount-admin.session";

interface PersistedSession {
  refreshToken: string;
  user: AuthUser;
}

export const tokenStorage = {
  load(): PersistedSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as PersistedSession) : null;
    } catch {
      return null;
    }
  },
  save(session: PersistedSession) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // localStorage unavailable (private browsing, quota) — session just won't survive a reload.
    }
  },
  saveRefreshToken(refreshToken: string) {
    const current = tokenStorage.load();
    if (!current) return;
    tokenStorage.save({ ...current, refreshToken });
  },
  clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  },
};
