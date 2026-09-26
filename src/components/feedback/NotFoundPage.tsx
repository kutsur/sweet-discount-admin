import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 8 }}>
      <Typography variant="h5">Page not found</Typography>
      <Button variant="contained" onClick={() => navigate("/users")}>
        Back to Users
      </Button>
    </Box>
  );
}
