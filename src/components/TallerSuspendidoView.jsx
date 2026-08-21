import { Link as RouterLink } from 'react-router-dom'
import { Box, Button, Paper, Stack, Typography } from '@mui/material'
import { INK, CONCRETE, PAPER, PAPER_DARK, FONT_DISPLAY, btnSx } from '../theme/workshopBrand'

export default function TallerSuspendidoView({
  mode = 'light',
  title = 'Taller fuera de servicio',
  message = 'Este taller está temporalmente suspendido. Si sos el dueño, contactá al administrador.',
  onVolverInicio = '/',
  actions = null,
}) {
  const dark = mode === 'dark'
  const textPrimary = dark ? '#f3ede0' : INK
  const textSecondary = dark ? 'rgba(243,237,224,0.66)' : '#57534a'
  const borderColor = dark ? 'rgba(243,237,224,0.14)' : 'rgba(24,20,15,0.14)'

  return (
    <Box sx={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: dark ? INK : CONCRETE, p: 3 }}>
      <Paper variant="outlined" sx={{ maxWidth: 480, width: '100%', p: { xs: 3, sm: 4 }, textAlign: 'center', borderRadius: 2, bgcolor: dark ? PAPER_DARK : PAPER, borderColor }}>
        <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', fontSize: '1.8rem', mb: 1.5, color: textPrimary }}>
          {title}
        </Typography>
        <Typography variant="body1" sx={{ color: textSecondary, mb: 3 }}>
          {message}
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
          {actions}
          <Button component={RouterLink} to={onVolverInicio} variant="outlined" sx={{ ...btnSx, color: textPrimary, borderColor }}>
            Volver al inicio
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}
