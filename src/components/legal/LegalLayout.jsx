import { Link as RouterLink } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { Box, Container, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeIcon from '@mui/icons-material/LightModeOutlined'
import { useColorMode } from '../../context/useColorMode'
import BrandMark from '../BrandMark'
import { INK, CONCRETE, FONT_DISPLAY, getWorkshopTheme } from '../../theme/workshopBrand'

// Layout compartido por /terminos y /privacidad — texto largo, así que
// prioriza legibilidad (ancho de línea acotado, tipografía de cuerpo normal)
// por sobre la identidad más "gráfica" del resto del sitio. Solo el header
// de marca y los títulos de sección usan la tipografía condensada.
export default function LegalLayout({ titulo, actualizado, children }) {
  const { mode, toggleColorMode } = useColorMode()
  const dark = mode === 'dark'
  const textPrimary = dark ? '#f3ede0' : INK
  const textSecondary = dark ? 'rgba(243,237,224,0.66)' : '#57534a'
  const borderColor = dark ? 'rgba(243,237,224,0.14)' : 'rgba(24,20,15,0.14)'
  const pageBg = dark ? INK : CONCRETE

  return (
    <ThemeProvider theme={getWorkshopTheme(mode)}>
      <Box sx={{ minHeight: '100svh', bgcolor: pageBg, color: textPrimary }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', p: { xs: 2, sm: 3 } }}>
          <BrandMark color={textPrimary} size={17} iconSize={30} />
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Tooltip title="Volver al inicio">
              <IconButton component={RouterLink} to="/" size="small" sx={{ borderRadius: 1, color: textSecondary, border: '1px solid', borderColor }}>
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={dark ? 'Modo claro' : 'Modo oscuro'}>
              <IconButton size="small" onClick={toggleColorMode} sx={{ borderRadius: 1, color: textSecondary, border: '1px solid', borderColor }}>
                {dark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Container maxWidth="md" sx={{ pb: 10 }}>
          <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', fontSize: { xs: '2rem', sm: '2.4rem' }, lineHeight: 1.05, mb: 1 }}>
            {titulo}
          </Typography>
          <Typography variant="body2" sx={{ color: textSecondary, mb: 5 }}>
            Última actualización: {actualizado}
          </Typography>

          <Stack spacing={4}>{children}</Stack>
        </Container>
      </Box>
    </ThemeProvider>
  )
}
