import { alpha, createTheme } from "@mui/material/styles";
import type {} from "@mui/x-data-grid/themeAugmentation";

export const NAVY = "#1c2b3a";
export const ACCENT = "#863bff";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: NAVY, light: "#334458", dark: "#101c27" },
    secondary: { main: ACCENT, light: "#a56bff", dark: "#6a1fe0", contrastText: "#ffffff" },
    background: { default: "#f4f5f9", paper: "#ffffff" },
    divider: alpha(NAVY, 0.09),
    text: { primary: "#1a2330", secondary: "#667085" },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h4: { fontWeight: 700, letterSpacing: -0.3 },
    h5: { fontWeight: 700, letterSpacing: -0.2 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: "none" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: "#f4f5f9" },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
        elevation0: { boxShadow: "none" },
        elevation1: { boxShadow: "none", border: `1px solid ${alpha(NAVY, 0.08)}` },
        elevation2: { boxShadow: "none", border: `1px solid ${alpha(NAVY, 0.08)}` },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8, paddingInline: 18, paddingBlock: 8 },
        sizeSmall: { paddingInline: 12, paddingBlock: 5 },
        outlined: { borderColor: alpha(NAVY, 0.22) },
      },
    },
    MuiIconButton: {
      styleOverrides: { root: { borderRadius: 8 } },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 7 },
      },
    },
    MuiTextField: {
      defaultProps: { size: "small" },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { backgroundColor: "#fbfbfd" },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          color: "#1a2330",
          boxShadow: "none",
          borderBottom: `1px solid ${alpha(NAVY, 0.08)}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: NAVY,
          color: "#ffffff",
          borderRight: "none",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          marginBottom: 2,
          color: alpha("#ffffff", 0.72),
          "&:hover": { backgroundColor: alpha("#ffffff", 0.06) },
          "&.Mui-selected": {
            backgroundColor: alpha(ACCENT, 0.22),
            color: "#ffffff",
          },
          "&.Mui-selected:hover": { backgroundColor: alpha(ACCENT, 0.28) },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: { color: "inherit", minWidth: 40, opacity: 0.85 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 16 },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: "none",
          borderRadius: 0,
          "--DataGrid-rowBorderColor": alpha(NAVY, 0.08),
        },
        columnHeaders: {
          backgroundColor: alpha(NAVY, 0.035),
          borderBottom: `1px solid ${alpha(NAVY, 0.08)}`,
        },
        columnHeaderTitle: {
          fontWeight: 700,
          fontSize: 12,
          textTransform: "uppercase",
          letterSpacing: 0.4,
          color: "#667085",
        },
        row: {
          "&:hover": { backgroundColor: alpha(ACCENT, 0.045) },
        },
        cell: {
          borderColor: alpha(NAVY, 0.06),
          "&:focus, &:focus-within": { outline: "none" },
        },
        footerContainer: {
          borderTop: `1px solid ${alpha(NAVY, 0.08)}`,
        },
      },
    },
  },
});
