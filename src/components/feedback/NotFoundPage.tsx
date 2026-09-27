import SearchOffIcon from "@mui/icons-material/SearchOff";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
      <Stack spacing={2} sx={{ alignItems: "center", textAlign: "center", maxWidth: 360 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "action.hover",
            color: "text.secondary",
          }}
        >
          <SearchOffIcon />
        </Box>
        <Typography variant="h5">Page not found</Typography>
        <Typography variant="body2" color="text.secondary">
          The page you're looking for doesn't exist or may have been moved.
        </Typography>
        <Button variant="contained" onClick={() => navigate("/users")} sx={{ mt: 1 }}>
          Back to Users
        </Button>
      </Stack>
    </Box>
  );
}
