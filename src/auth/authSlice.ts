import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type AuthStatus = "bootstrapping" | "authenticated" | "unauthenticated";

export interface AuthUser {
  id: string;
  email: string;
  display_name: string;
  email_verified: boolean;
}

export interface AuthState {
  status: AuthStatus;
  accessToken: string | null;
  user: AuthUser | null;
}

const initialState: AuthState = {
  status: "bootstrapping",
  accessToken: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    sessionEstablished(state, action: PayloadAction<{ accessToken: string; user: AuthUser }>) {
      state.status = "authenticated";
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
    },
    accessTokenRefreshed(state, action: PayloadAction<string>) {
      state.status = "authenticated";
      state.accessToken = action.payload;
    },
    userHydrated(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
    },
    statusChanged(state, action: PayloadAction<AuthStatus>) {
      state.status = action.payload;
    },
    sessionCleared(state) {
      state.status = "unauthenticated";
      state.accessToken = null;
      state.user = null;
    },
  },
});

export const { sessionEstablished, accessTokenRefreshed, userHydrated, statusChanged, sessionCleared } =
  authSlice.actions;
export const authReducer = authSlice.reducer;
