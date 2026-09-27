import LogoutIcon from "@mui/icons-material/Logout";
import {
  alpha,
  Avatar,
  Box,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../auth/useAuth";
import { useIsAdmin } from "../../auth/useIsAdmin";
import { logout } from "../../features/auth/logout";
import { ACCENT } from "../../theme/theme";
import { navItems } from "./navConfig";

const DRAWER_WIDTH = 248;

export function AppShell() {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    void logout().finally(() => navigate("/login", { replace: true }));
  };

  const initials = user?.display_name
    ? user.display_name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Box
        component="nav"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          bgcolor: "primary.main",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
        }}
      >
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", px: 3, py: 3 }}>
          <Box
            component="img"
            src="/favicon.svg"
            alt=""
            sx={{ width: 28, height: 27, display: "block" }}
          />
          <Box>
            <Typography variant="subtitle1" sx={{ lineHeight: 1.1, color: "#fff" }}>
              Sweet Discount
            </Typography>
            <Typography variant="caption" sx={{ color: alpha("#fff", 0.55) }}>
              Admin console
            </Typography>
          </Box>
        </Stack>

        <List sx={{ flexGrow: 1, px: 1.5 }}>
          {navItems
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <ListItemButton key={item.path} selected={isActive} onClick={() => navigate(item.path)}>
                  <ListItemIcon>
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    slotProps={{ primary: { sx: { fontWeight: isActive ? 600 : 500 } } }}
                  />
                </ListItemButton>
              );
            })}
        </List>

        <Divider sx={{ borderColor: alpha("#fff", 0.1) }} />
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", px: 2.5, py: 2 }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: ACCENT, fontSize: 13, fontWeight: 700 }}>
            {initials}
          </Avatar>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="body2" noWrap sx={{ color: "#fff", fontWeight: 600 }}>
              {user?.display_name}
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: alpha("#fff", 0.55), display: "block" }}>
              {user?.email}
            </Typography>
          </Box>
          <Tooltip title="Log out">
            <IconButton
              onClick={handleLogout}
              size="small"
              sx={{
                color: alpha("#fff", 0.7),
                "&:hover": { bgcolor: alpha("#fff", 0.08), color: "#fff" },
              }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, ml: `${DRAWER_WIDTH}px`, p: 4, maxWidth: "100%" }}>
        <Outlet />
      </Box>
    </Box>
  );
}
