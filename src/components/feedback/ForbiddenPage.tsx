import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router";

export function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 8 }}>
      <Typography variant="h5">You don't have access to this</Typography>
      <Typography color="text.secondary">
        Your account doesn't have permission to perform this action.
      </Typography>
      <Button variant="contained" onClick={() => navigate("/users")}>
        Back to Users
      </Button>
    </Box>
  );
}
