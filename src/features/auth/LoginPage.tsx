import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import { api } from "../../api/client";
import { ApiError } from "../../api/envelope";
import { sessionEstablished } from "../../auth/authSlice";
import { tokenStorage } from "../../auth/tokenStorage";
import { ErrorAlert } from "../../components/feedback/ErrorAlert";
import { useAppDispatch } from "../../store/hooks";
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
        setError(
          new ApiError(
            response.status,
            apiError?.error.code ?? "unknown_error",
            apiError?.error.message ?? "Invalid email or password.",
            apiError?.error.details ?? null,
          ),
        );
        return;
      }

      const { access_token, refresh_token, user } = data.data;
      dispatch(sessionEstablished({ accessToken: access_token, user }));
      tokenStorage.save({ refreshToken: refresh_token, user });

      const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/users";
      navigate(from, { replace: true });
    } catch {
      setError(new ApiError(0, "network_error", "Couldn't reach the server. Check your connection.", null));
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        bgcolor: "grey.100",
      }}
    >
      <Paper sx={{ p: 4, width: 360 }} elevation={3}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Sweet Discount Admin
        </Typography>
        <ErrorAlert error={error} />
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            autoComplete="email"
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register("email")}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            autoComplete="current-password"
            error={!!errors.password}
            helperText={errors.password?.message}
            {...register("password")}
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={isSubmitting}>
            Log in
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
