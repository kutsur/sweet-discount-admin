import LogoutIcon from "@mui/icons-material/Logout";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../auth/useAuth";
import { useIsAdmin } from "../../auth/useIsAdmin";
import { logout } from "../../features/auth/logout";
import { navItems } from "./navConfig";

const DRAWER_WIDTH = 220;

export function AppShell() {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    void logout().finally(() => navigate("/login", { replace: true }));
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Sweet Discount Admin
          </Typography>
          {user && (
            <Typography variant="body2" color="inherit" noWrap>
              {user.email}
            </Typography>
          )}
          <Tooltip title="Log out">
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: "border-box" },
        }}
      >
        <Toolbar />
        <List>
          {navItems.filter((item) => !item.adminOnly || isAdmin).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <ListItemButton key={item.path} selected={isActive} onClick={() => navigate(item.path)}>
                <ListItemIcon>
                  <Icon color={isActive ? "primary" : undefined} />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
