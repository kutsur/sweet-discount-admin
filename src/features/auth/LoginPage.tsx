import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import { api } from "../../api/client";
import { ApiError, toApiError } from "../../api/envelope";
import { apiErrorText } from "../../lib/apiErrorText";
import { sessionEstablished } from "../../auth/authSlice";
import { tokenStorage } from "../../auth/tokenStorage";
import { ErrorAlert } from "../../components/feedback/ErrorAlert";
import { useAppDispatch } from "../../store/hooks";
import { NAVY } from "../../theme/theme";
import { loginSchema, type LoginFormValues } from "./loginSchema";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<unknown>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);

    try {
      const { data, error: apiError, response } = await api.POST("/auth/login", { body: values });

      if (apiError || !data) {
        setError(toApiError(response, apiError));
        return;
      }

      const { access_token, refresh_token, user } = data.data;
      dispatch(sessionEstablished({ accessToken: access_token, user }));
      tokenStorage.save({ refreshToken: refresh_token, user });

      // "/" lets HomeRedirect pick the first section this role can open.
      const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/";
      navigate(from, { replace: true });
    } catch {
      setError(new ApiError(0, "network_error", apiErrorText("network_error"), null));
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: `radial-gradient(circle at 20% 20%, ${NAVY} 0%, #0f1822 55%, #0a1119 100%)`,
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{ p: 5, width: 380, border: "none", boxShadow: "0 24px 64px rgba(0,0,0,0.35)" }}
      >
        <Stack spacing={0.5} sx={{ alignItems: "center", mb: 4 }}>
          <Box component="img" src="/favicon.svg" alt="" sx={{ width: 40, height: 38, mb: 1.5 }} />
          <Typography variant="h5">Sweet Discount</Typography>
          <Typography variant="body2" color="text.secondary">
            Вход в панель управления
          </Typography>
        </Stack>

        <ErrorAlert error={error} />

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={2}>
            <TextField
              label="Эл. почта"
              type="email"
              fullWidth
              autoComplete="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register("email")}
            />
            <TextField
              label="Пароль"
              type="password"
              fullWidth
              autoComplete="current-password"
              error={!!errors.password}
              helperText={errors.password?.message}
              {...register("password")}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{ mt: 1 }}
              disabled={isSubmitting}
            >
              Войти
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
