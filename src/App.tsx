import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router";
import { bootstrapAuth } from "./auth/bootstrap";
import { RequireAuth } from "./auth/RequireAuth";
import { NotFoundPage } from "./components/feedback/NotFoundPage";
import { AppShell } from "./components/layout/AppShell";
import { LoginPage } from "./features/auth/LoginPage";
import { UserDetailPage } from "./features/users/UserDetailPage";
import { UsersListPage } from "./features/users/UsersListPage";

export function App() {
  useEffect(() => {
    bootstrapAuth();
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/users" replace />} />
          <Route path="/users" element={<UsersListPage />} />
          <Route path="/users/:id" element={<UserDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
