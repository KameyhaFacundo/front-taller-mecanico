import { createTheme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'

const light = {
  palette: {
    mode: 'light',
    primary: { main: '#1656d1', light: '#5a86ea', dark: '#0d3a94', contrastText: '#ffffff' },
    secondary: { main: '#64748b', light: '#94a3b8', dark: '#475569', contrastText: '#ffffff' },
    success: { main: '#1e8e5a', light: '#4cbb7f', dark: '#156b45', contrastText: '#ffffff' },
    warning: { main: '#e69500', light: '#f5b731', dark: '#b57500', contrastText: '#1a1200' },
    error: { main: '#d32f2f', light: '#ff6659', dark: '#9a0007', contrastText: '#ffffff' },
    info: { main: '#0ea5b7', light: '#4dd0df', dark: '#0b7c8a', contrastText: '#ffffff' },
    text: { primary: '#111827', secondary: '#5b6472', disabled: '#9aa3b0' },
    divider: 'rgba(17,24,39,0.10)',
    background: { default: '#f4f6f8', paper: '#ffffff' },
    action: {
      hover: 'rgba(22,86,209,0.06)',
      selected: 'rgba(22,86,209,0.12)',
      focus: 'rgba(22,86,209,0.12)',
    },
  },
  custom: {
    appbar: 'rgba(255,255,255,0.82)',
    sidebar: '#ffffff',
    sidebarText: '#5b6472',
    sidebarActive: '#ffffff',
    sidebarBorder: 'rgba(17,24,39,0.10)',
    sidebarHover: 'rgba(17,24,39,0.045)',
    sidebarSurface: 'rgba(17,24,39,0.035)',
    cardBorder: 'rgba(17,24,39,0.10)',
    brandGradient: 'linear-gradient(135deg, #1656d1, #0a2a72)',
    shadow: '0 1px 3px rgba(16,24,40,0.06), 0 8px 24px rgba(16,24,40,0.06)',
    shadowHover: '0 4px 12px rgba(16,24,40,0.10), 0 16px 40px rgba(16,24,40,0.12)',
    tableHead: '#eef2f9',
    overlay: 'rgba(5,9,20,0.5)',
  },
}

const dark = {
  palette: {
    mode: 'dark',
    primary: { main: '#5f8fff', light: '#93b4ff', dark: '#3563d1', contrastText: '#04102a' },
    secondary: { main: '#9aa9bd', light: '#c2cbd6', dark: '#707d90', contrastText: '#0b0f16' },
    success: { main: '#3dbf85', light: '#6fe0ab', dark: '#1f8f5c', contrastText: '#04120c' },
    warning: { main: '#f2a900', light: '#ffc944', dark: '#c28500', contrastText: '#1a1200' },
    error: { main: '#ff6b60', light: '#ff9d92', dark: '#d1332a', contrastText: '#1f0806' },
    info: { main: '#22c3d6', light: '#6fe0ec', dark: '#128b99', contrastText: '#04141a' },
    text: { primary: '#e7ecf5', secondary: '#98a5ba', disabled: '#5d6b82' },
    divider: 'rgba(231,236,245,0.10)',
    background: { default: '#070c17', paper: '#0f1626' },
    action: {
      hover: 'rgba(95,143,255,0.08)',
      selected: 'rgba(95,143,255,0.16)',
      focus: 'rgba(95,143,255,0.16)',
    },
  },
  custom: {
    appbar: 'rgba(15,22,38,0.82)',
    sidebar: '#05070d',
    sidebarText: '#8394ad',
    sidebarActive: '#ffffff',
    sidebarBorder: 'rgba(255,255,255,0.08)',
    sidebarHover: 'rgba(255,255,255,0.08)',
    sidebarSurface: 'rgba(255,255,255,0.04)',
    cardBorder: 'rgba(231,236,245,0.09)',
    brandGradient: 'linear-gradient(135deg, #3563d1, #5f8fff)',
    shadow: '0 1px 2px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.25)',
    shadowHover: '0 6px 16px rgba(0,0,0,0.4), 0 16px 40px rgba(0,0,0,0.45)',
    tableHead: 'rgba(95,143,255,0.05)',
    overlay: 'rgba(0,0,0,0.6)',
  },
}

const base = {
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    h4: { fontWeight: 800, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        body: { transition: 'background-color 0.25s ease, color 0.25s ease' },
        '::-webkit-scrollbar': {
          width: 10,
          height: 10,
        },
        '::-webkit-scrollbar-track': { background: 'transparent' },
        '::-webkit-scrollbar-thumb': {
          background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(22,32,46,0.18)',
          borderRadius: 8,
          border: '2px solid transparent',
          backgroundClip: 'padding-box',
        },
        '::-webkit-scrollbar-thumb:hover': {
          background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(22,32,46,0.3)',
          border: '2px solid transparent',
          backgroundClip: 'padding-box',
        },
      }),
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderColor: theme.custom.cardBorder,
          backgroundImage: 'none',
        }),
        outlined: ({ theme }) => ({ borderColor: theme.custom.cardBorder }),
        elevation1: ({ theme }) => ({ boxShadow: theme.custom.shadow }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          boxShadow: theme.custom.shadow,
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': { boxShadow: theme.custom.shadowHover },
        }),
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: () => ({
          borderRadius: 10,
          fontWeight: 700,
          letterSpacing: '-0.01em',
          paddingTop: 8,
          paddingBottom: 8,
          transition: 'transform 0.12s ease, box-shadow 0.2s ease',
          '&:active': { transform: 'scale(0.98)' },
        }),
        contained: ({ theme }) => ({ boxShadow: theme.custom.shadow }),
        sizeLarge: { paddingLeft: 24, paddingRight: 24 },
        sizeSmall: { fontSize: 13 },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { transition: 'background-color 0.15s ease, transform 0.12s ease', '&:active': { transform: 'scale(0.94)' } },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            transition: 'box-shadow 0.2s ease',
            '&.Mui-focused': { boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.15)}` },
          },
        }),
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: () => ({ fontSize: 14 }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: ({ theme }) => ({ borderColor: theme.palette.divider }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: () => ({ borderRadius: 8, fontWeight: 600 }),
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: ({ theme }) => ({
          fontWeight: 700,
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: theme.palette.text.secondary,
          backgroundColor: theme.custom.tableHead,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }),
        root: ({ theme }) => ({ borderBottom: `1px solid ${theme.palette.divider}` }),
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&:hover td': { backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.06 : 0.03) },
        }),
      },
    },
    MuiToolbar: {
      styleOverrides: { root: { minHeight: 64 } },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({ borderRadius: 16, boxShadow: theme.custom.shadowHover }),
      },
    },
    MuiDialogTitle: { styleOverrides: { root: { fontWeight: 700 } } },
    MuiTooltip: {
      styleOverrides: { tooltip: { borderRadius: 8, fontSize: 12, fontWeight: 500 } },
    },
    MuiListItemButton: {
      styleOverrides: { root: { transition: 'background-color 0.15s ease' } },
    },
    MuiMenu: {
      styleOverrides: { paper: { borderRadius: 12, marginTop: 4 } },
    },
    MuiAppBar: {
      styleOverrides: { root: { backdropFilter: 'blur(10px)', backgroundImage: 'none' } },
    },
    MuiSkeleton: {
      styleOverrides: { root: ({ theme }) => ({ background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(22,32,46,0.07)' }) },
    },
    MuiDivider: {
      styleOverrides: { root: ({ theme }) => ({ borderColor: theme.palette.divider }) },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: 'none',
          fontWeight: 600,
          borderColor: theme.palette.divider,
          '&.Mui-selected': {
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
            color: theme.palette.primary.main,
          },
        }),
      },
    },
    MuiTab: {
      styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } },
    },
    MuiAlert: {
      styleOverrides: { root: { borderRadius: 12, fontWeight: 500 } },
    },
  },
}

export const getTheme = (mode) => createTheme({ ...base, palette: mode === 'dark' ? dark.palette : light.palette, custom: mode === 'dark' ? dark.custom : light.custom })

export default getTheme('light')
