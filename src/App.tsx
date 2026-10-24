import { useEffect } from "react";
import { Route, Routes } from "react-router";
import { bootstrapAuth } from "./auth/bootstrap";
import { RequireAuth } from "./auth/RequireAuth";
import { RequireRole } from "./auth/RequireRole";
import { ROLES } from "./auth/roles";
import { NotFoundPage } from "./components/feedback/NotFoundPage";
import { AppShell } from "./components/layout/AppShell";
import { HomeRedirect } from "./components/layout/HomeRedirect";
import { LoginPage } from "./features/auth/LoginPage";
import { CitiesListPage } from "./features/cities/CitiesListPage";
import { CityCreatePage } from "./features/cities/CityCreatePage";
import { CityDetailPage } from "./features/cities/CityDetailPage";
import { DiscountCreatePage } from "./features/discounts/DiscountCreatePage";
import { DiscountDetailPage } from "./features/discounts/DiscountDetailPage";
import { DiscountsListPage } from "./features/discounts/DiscountsListPage";
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
          <Route index element={<HomeRedirect />} />
          <Route element={<RequireRole roles={ROLES.admin} />}>
            <Route path="/users" element={<UsersListPage />} />
            <Route path="/users/:id" element={<UserDetailPage />} />
            <Route path="/cities" element={<CitiesListPage />} />
            <Route path="/cities/new" element={<CityCreatePage />} />
            <Route path="/cities/:id" element={<CityDetailPage />} />
          </Route>
          <Route element={<RequireRole roles={ROLES.placeStaff} />}>
            <Route path="/places/new" element={<PlaceCreatePage />} />
          </Route>
          <Route element={<RequireRole roles={ROLES.venue} />}>
            <Route path="/places" element={<PlacesListPage />} />
            <Route path="/places/:id" element={<PlaceDetailPage />} />
            <Route path="/discounts" element={<DiscountsListPage />} />
            <Route path="/discounts/new" element={<DiscountCreatePage />} />
            <Route path="/discounts/:id" element={<DiscountDetailPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
