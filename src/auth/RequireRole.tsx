import { Box, CircularProgress } from "@mui/material";
import { Outlet } from "react-router";
import { ForbiddenPage } from "../components/feedback/ForbiddenPage";
import { hasRole, type Role } from "./roles";
import { useMe } from "./useMe";

/** Route guard: renders the nested routes only for the given roles. A UX boundary, not a security one. */
export function RequireRole({ roles }: { roles: readonly Role[] }) {
  const { role, isLoading } = useMe();

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!hasRole(role, roles)) {
    return <ForbiddenPage />;
  }

  return <Outlet />;
}
