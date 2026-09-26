import createClient from "openapi-fetch";
import type { paths } from "./schema.gen";
import { accessTokenRefreshed, sessionCleared } from "../auth/authSlice";
import { tokenStorage } from "../auth/tokenStorage";
import { store } from "../store";

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/v1";

export const api = createClient<paths>({ baseUrl });

// Holds an unconsumed clone of each in-flight request (taken before the body stream is read),
// so a 401 can be retried with a fresh Authorization header once refreshed.
const requestClones = new Map<string, Request>();

let refreshPromise: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  const refreshToken = tokenStorage.load()?.refreshToken;
  if (!refreshToken) return null;

  const { data, error } = await api.POST("/auth/refresh", {
    body: { refresh_token: refreshToken },
  });

  if (error || !data) {
    store.dispatch(sessionCleared());
    tokenStorage.clear();
    return null;
  }

  const { access_token, refresh_token } = data.data;
  store.dispatch(accessTokenRefreshed(access_token));
  tokenStorage.saveRefreshToken(refresh_token);
  return access_token;
}

/** Shares one in-flight refresh across concurrent 401s instead of racing multiple calls. */
export function refreshSession(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

api.use({
  onRequest({ id, request }) {
    const { accessToken } = store.getState().auth;
    if (accessToken) {
      request.headers.set("Authorization", `Bearer ${accessToken}`);
    }
    requestClones.set(id, request.clone());
    return request;
  },
  async onResponse({ id, request, response }) {
    const clone = requestClones.get(id);
    requestClones.delete(id);

    const isAuthEndpoint = request.url.includes("/auth/");
    if (response.status !== 401 || isAuthEndpoint || !clone) {
      return response;
    }

    const newToken = await refreshSession();
    if (!newToken) {
      return response;
    }

    clone.headers.set("Authorization", `Bearer ${newToken}`);
    return fetch(clone);
  },
  onError({ id }) {
    requestClones.delete(id);
  },
});
