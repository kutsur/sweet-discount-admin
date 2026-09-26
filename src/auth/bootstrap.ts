import { refreshSession } from "../api/client";
import { store } from "../store";
import { statusChanged, userHydrated } from "./authSlice";
import { tokenStorage } from "./tokenStorage";

let started = false;

/** Runs once per app load: resumes a persisted session via silent refresh, or marks unauthenticated. */
export function bootstrapAuth() {
  if (started) return;
  started = true;

  const persisted = tokenStorage.load();
  if (!persisted) {
    store.dispatch(statusChanged("unauthenticated"));
    return;
  }

  store.dispatch(userHydrated(persisted.user));
  store.dispatch(statusChanged("bootstrapping"));
  void refreshSession();
}
