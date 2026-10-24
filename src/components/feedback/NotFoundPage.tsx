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
        <Typography variant="h5">Страница не найдена</Typography>
        <Typography variant="body2" color="text.secondary">
          Такой страницы нет или она была перемещена.
        </Typography>
        <Button variant="contained" onClick={() => navigate("/")} sx={{ mt: 1 }}>
          На главную
        </Button>
      </Stack>
    </Box>
  );
}
