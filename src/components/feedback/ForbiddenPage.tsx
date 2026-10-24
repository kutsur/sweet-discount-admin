import BlockIcon from "@mui/icons-material/Block";
import { Box, Button, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router";

export function ForbiddenPage() {
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
            bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
            color: "error.main",
          }}
        >
          <BlockIcon />
        </Box>
        <Typography variant="h5">Нет доступа</Typography>
        <Typography variant="body2" color="text.secondary">
          У вашей учётной записи нет прав на это действие.
        </Typography>
        <Button variant="contained" onClick={() => navigate("/", { replace: true })} sx={{ mt: 1 }}>
          На главную
        </Button>
      </Stack>
    </Box>
  );
}
