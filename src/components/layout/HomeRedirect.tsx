import { Box, CircularProgress } from "@mui/material";
import { Navigate } from "react-router";
import { useMe } from "../../auth/useMe";
import { ForbiddenPage } from "../feedback/ForbiddenPage";
import { navItemsFor } from "./navConfig";

/** "/" lands on the first section the user's role can open — an owner has no Users page. */
export function HomeRedirect() {
  const { role, isLoading } = useMe();

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const first = navItemsFor(role)[0];
  return first ? <Navigate to={first.path} replace /> : <ForbiddenPage />;
}
