import { createTheme } from '@mui/material/styles'
import { getTheme } from '../theme.js'
import '@fontsource/big-shoulders/latin-700.css'
import '@fontsource/big-shoulders/latin-800.css'
import '@fontsource/big-shoulders/latin-900.css'
import '@fontsource/ibm-plex-mono/latin-500.css'
import '@fontsource/ibm-plex-mono/latin-600.css'

// Identidad visual compartida por las páginas "de venta" del producto —
// Landing, Login y Registro — a diferencia del panel interno, que usa el
// azul de theme.js. Toma prestado el vocabulario de un taller real: orden
// de trabajo, ticket perforado, naranja de seguridad, en vez de la estética
// SaaS genérica. Ver src/pages/Landing/Landing.jsx para el detalle original.
export const INK = '#18140f'
export const INK_SURFACE = '#241c14'
export const CONCRETE = '#e9e4d8'
export const BAND = '#f2eee2'
export const PAPER = '#fffaf0'
export const PAPER_DARK = '#2b2216'
export const SAFETY = '#e3521a'
export const SAFETY_DEEP = '#a13111'
export const HAZARD = '#eeae1f'
export const STEEL = '#6b7280'

export const FONT_DISPLAY = '"Big Shoulders", "Arial Narrow", sans-serif'
export const FONT_MONO = '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace'

// Textura de pegboard (el panel perforado donde se cuelgan las herramientas):
// una grilla de puntos sutil, sin imágenes externas.
export const pegboard = (dotColor) => ({
  backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1.4px)`,
  backgroundSize: '18px 18px',
})

export const btnSx = {
  borderRadius: 1.25,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  fontFamily: FONT_MONO,
  fontWeight: 600,
  fontSize: 13,
}

// Mismo theme base del panel (radios, sombras, tipografía de cuerpo) pero
// con el acento naranja de seguridad en vez del azul interno, para que
// Button/TextField/LinearProgress/links tomen el color de marca solos.
export function getWorkshopTheme(mode) {
  const base = getTheme(mode)
  const dark = mode === 'dark'
  return createTheme(base, {
    palette: {
      primary: { main: SAFETY, light: '#ef7a4a', dark: SAFETY_DEEP, contrastText: '#fff' },
      // El amarillo de peligro reemplaza al ámbar del panel para que no se
      // confunda con el naranja de seguridad (primary) en las mismas vistas
      // — por ejemplo las columnas "pendiente" vs. "en ejecución" del panel.
      warning: { main: HAZARD, light: '#f4c752', dark: '#b8830a', contrastText: '#1a1200' },
      // El panel interno hereda fondos/texto azulados de theme.js (pensados
      // para el primary #1656d1) — acá se reemplazan por los tonos cálidos
      // del taller (ink/concreto/papel) para que combine con el sidebar y
      // con Landing/Login/Registro, no sólo el acento naranja.
      text: {
        primary: dark ? '#f3ede0' : INK,
        secondary: dark ? 'rgba(243,237,224,0.66)' : '#57534a',
        disabled: dark ? 'rgba(243,237,224,0.35)' : 'rgba(24,20,15,0.35)',
      },
      divider: dark ? 'rgba(243,237,224,0.10)' : 'rgba(24,20,15,0.10)',
      background: { default: dark ? INK : CONCRETE, paper: dark ? INK_SURFACE : PAPER },
      action: {
        hover: dark ? 'rgba(227,82,26,0.10)' : 'rgba(227,82,26,0.06)',
        selected: dark ? 'rgba(227,82,26,0.18)' : 'rgba(227,82,26,0.12)',
        focus: dark ? 'rgba(227,82,26,0.18)' : 'rgba(227,82,26,0.12)',
      },
    },
    custom: {
      cardBorder: dark ? 'rgba(243,237,224,0.12)' : 'rgba(24,20,15,0.12)',
      tableHead: dark ? 'rgba(243,237,224,0.04)' : BAND,
      // Varios íconos (Clientes, Vehículos, NuevoVehiculoDialog) usan este
      // token directo en vez de primary — sin este override quedaban en
      // azul aunque el resto del panel ya estuviera en naranja.
      brandGradient: `linear-gradient(135deg, ${SAFETY}, ${SAFETY_DEEP})`,
    },
    shape: { borderRadius: 6 },
    components: {
      ...base.components,
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 6, fontFamily: FONT_MONO, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', paddingTop: 10, paddingBottom: 10 },
          contained: { boxShadow: `0 3px 0 ${SAFETY_DEEP}`, '&:hover': { boxShadow: `0 3px 0 ${SAFETY_DEEP}` } },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: 6 },
          notchedOutline: { borderColor: dark ? 'rgba(243,237,224,0.18)' : 'rgba(24,20,15,0.16)' },
        },
      },
    },
  })
}
