import { useState } from 'react'
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import LogoutIcon from '@mui/icons-material/Logout'
import { INK, CONCRETE, PAPER, PAPER_DARK, SAFETY, FONT_DISPLAY, btnSx } from '../theme/workshopBrand'
import { fmtMoney } from '../utils/format'
import { crearSuscripcionCheckout } from '../services/suscripcionApi'
import { useNotify } from '../context/useNotify'

export default function SuscripcionVencidaView({ mode = 'light', montoMensual, onLogout }) {
  const notify = useNotify()
  const dark = mode === 'dark'
  const [loading, setLoading] = useState(false)
  const textPrimary = dark ? '#f3ede0' : INK
  const textSecondary = dark ? 'rgba(243,237,224,0.66)' : '#57534a'
  const borderColor = dark ? 'rgba(243,237,224,0.14)' : 'rgba(24,20,15,0.14)'

  const handleSuscribirse = async () => {
    setLoading(true)
    try {
      const { init_point: initPoint } = await crearSuscripcionCheckout()
      window.location.href = initPoint
    } catch {
      notify.error('No pudimos iniciar el pago. Probá de nuevo en unos minutos.')
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: dark ? INK : CONCRETE, p: 3 }}>
      <Paper variant="outlined" sx={{ maxWidth: 480, width: '100%', p: { xs: 3, sm: 4 }, textAlign: 'center', borderRadius: 2, bgcolor: dark ? PAPER_DARK : PAPER, borderColor }}>
        <Box sx={{ width: 56, height: 56, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: SAFETY, color: '#fff', mx: 'auto', mb: 2.5 }}>
          <CreditCardIcon />
        </Box>
        <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', fontSize: '1.8rem', mb: 1.5, color: textPrimary }}>
          Tu prueba gratis terminó
        </Typography>
        <Typography variant="body1" sx={{ color: textSecondary, mb: 1 }}>
          Para seguir usando el sistema, activá tu suscripción mensual.
        </Typography>
        {montoMensual != null && (
          <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: '1.4rem', color: SAFETY, mb: 3 }}>
            {fmtMoney(montoMensual)} / mes
          </Typography>
        )}
        <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
          Te vamos a redirigir a Mercado Pago para autorizar el débito automático mensual. Podés cancelarlo cuando quieras desde tu cuenta de Mercado Pago.
        </Alert>
        <Stack spacing={1.5}>
          <Button variant="contained" size="large" onClick={handleSuscribirse} disabled={loading} sx={{ ...btnSx, bgcolor: SAFETY, color: '#fff' }}>
            {loading ? 'Redirigiendo…' : 'Suscribirme con Mercado Pago'}
          </Button>
          <Button variant="outlined" startIcon={<LogoutIcon />} onClick={onLogout} sx={{ ...btnSx, color: textPrimary, borderColor }}>
            Cerrar sesión
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}
