import { createTheme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'

const light = {
  palette: {
    mode: 'light',
    primary: { main: '#0e7c66', light: '#3ba98f', dark: '#0a5c4c', contrastText: '#ffffff' },
    secondary: { main: '#f27405', light: '#f9a03f', dark: '#c25a00', contrastText: '#ffffff' },
    success: { main: '#1e8e5a', light: '#4cbb7f', dark: '#156b45', contrastText: '#ffffff' },
    warning: { main: '#e69500', light: '#f5b731', dark: '#b57500', contrastText: '#1a1200' },
    error: { main: '#d32f2f', light: '#ff6659', dark: '#9a0007', contrastText: '#ffffff' },
    info: { main: '#0288d1', light: '#5eb8f5', dark: '#005b9f', contrastText: '#ffffff' },
    text: { primary: '#16202e', secondary: '#5b6778', disabled: '#9aa5b4' },
    divider: 'rgba(22,32,46,0.10)',
    background: { default: '#f4f6f5', paper: '#ffffff' },
    action: {
      hover: 'rgba(14,124,102,0.06)',
      selected: 'rgba(14,124,102,0.12)',
      focus: 'rgba(14,124,102,0.12)',
    },
  },
  custom: {
    appbar: 'rgba(255,255,255,0.82)',
    sidebar: '#0b1513',
    sidebarText: '#cbd5e1',
    sidebarActive: '#ffffff',
    cardBorder: 'rgba(22,32,46,0.10)',
    brandGradient: 'linear-gradient(135deg, #0e7c66, #f27405)',
    shadow: '0 1px 3px rgba(16,24,40,0.06), 0 8px 24px rgba(16,24,40,0.06)',
    shadowHover: '0 4px 12px rgba(16,24,40,0.10), 0 16px 40px rgba(16,24,40,0.12)',
    tableHead: '#f2f7f5',
    overlay: 'rgba(11,21,19,0.5)',
  },
}

const dark = {
  palette: {
    mode: 'dark',
    primary: { main: '#3dd6b0', light: '#86e8d0', dark: '#1f9d7f', contrastText: '#052018' },
    secondary: { main: '#ff8a3d', light: '#ffb26e', dark: '#cc5f14', contrastText: '#1a0f00' },
    success: { main: '#3dbf85', light: '#6fe0ab', dark: '#1f8f5c', contrastText: '#04120c' },
    warning: { main: '#f2a900', light: '#ffc944', dark: '#c28500', contrastText: '#1a1200' },
    error: { main: '#ff6b60', light: '#ff9d92', dark: '#d1332a', contrastText: '#1f0806' },
    info: { main: '#4db4e8', light: '#8fd5ff', dark: '#2a87bd', contrastText: '#04121c' },
    text: { primary: '#e8edf5', secondary: '#98a5b8', disabled: '#5f6c80' },
    divider: 'rgba(232,237,245,0.10)',
    background: { default: '#0e1412', paper: '#161d1b' },
    action: {
      hover: 'rgba(61,214,176,0.08)',
      selected: 'rgba(61,214,176,0.16)',
      focus: 'rgba(61,214,176,0.16)',
    },
  },
  custom: {
    appbar: 'rgba(22,29,27,0.82)',
    sidebar: '#0a120f',
    sidebarText: '#8fa0b5',
    sidebarActive: '#ffffff',
    cardBorder: 'rgba(232,237,245,0.09)',
    brandGradient: 'linear-gradient(135deg, #1f9d7f, #ff8a3d)',
    shadow: '0 1px 2px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.25)',
    shadowHover: '0 6px 16px rgba(0,0,0,0.4), 0 16px 40px rgba(0,0,0,0.45)',
    tableHead: 'rgba(61,214,176,0.05)',
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
