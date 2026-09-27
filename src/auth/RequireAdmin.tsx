import { Box, CircularProgress } from "@mui/material";
import { Outlet } from "react-router";
import { ForbiddenPage } from "../components/feedback/ForbiddenPage";
import { useIsAdmin } from "./useIsAdmin";

export function RequireAdmin() {
  const { isAdmin, isLoading } = useIsAdmin();

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAdmin) {
    return <ForbiddenPage />;
  }

  return <Outlet />;
}
