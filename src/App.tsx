import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router";
import { bootstrapAuth } from "./auth/bootstrap";
import { RequireAdmin } from "./auth/RequireAdmin";
import { RequireAuth } from "./auth/RequireAuth";
import { NotFoundPage } from "./components/feedback/NotFoundPage";
import { AppShell } from "./components/layout/AppShell";
import { LoginPage } from "./features/auth/LoginPage";
import { CitiesListPage } from "./features/cities/CitiesListPage";
import { CityCreatePage } from "./features/cities/CityCreatePage";
import { CityDetailPage } from "./features/cities/CityDetailPage";
import { PlaceCreatePage } from "./features/places/PlaceCreatePage";
import { PlaceDetailPage } from "./features/places/PlaceDetailPage";
import { PlacesListPage } from "./features/places/PlacesListPage";
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
          <Route path="/places" element={<PlacesListPage />} />
          <Route path="/places/new" element={<PlaceCreatePage />} />
          <Route path="/places/:id" element={<PlaceDetailPage />} />
          <Route element={<RequireAdmin />}>
            <Route path="/cities" element={<CitiesListPage />} />
            <Route path="/cities/new" element={<CityCreatePage />} />
            <Route path="/cities/:id" element={<CityDetailPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
