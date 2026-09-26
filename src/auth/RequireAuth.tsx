import { Box, CircularProgress } from "@mui/material";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "./useAuth";

export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "bootstrapping") {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
