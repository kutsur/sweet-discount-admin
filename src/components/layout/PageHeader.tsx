import { Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <Stack
      direction="row"
      sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 3, gap: 2, flexWrap: "wrap" }}
    >
      <Stack spacing={0.5}>
        <Typography variant="h4">{title}</Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Stack>
      {actions && (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          {actions}
        </Stack>
      )}
    </Stack>
  );
}
