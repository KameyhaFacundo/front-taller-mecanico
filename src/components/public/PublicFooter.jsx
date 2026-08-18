import { Link as RouterLink } from 'react-router-dom'
import { Box, Container, Divider, Stack, Typography } from '@mui/material'
import SpeedIcon from '@mui/icons-material/Speed'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import MapIcon from '@mui/icons-material/Map'
import ScheduleIcon from '@mui/icons-material/Schedule'
import { useColorMode } from '../../context/useColorMode'
import { waLinkTaller } from '../../utils/wa'

const DIRECCION = 'Av. San Martín 1234, San Miguel de Tucumán, Tucumán'
const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(DIRECCION)}`

export default function PublicFooter() {
  const { mode } = useColorMode()
  const dark = mode === 'dark'
  const wa = waLinkTaller('Hola 👋, quiero consultar por el taller.')

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: dark ? '#0b1513' : '#ffffff',
        color: dark ? '#fff' : 'text.primary',
        pt: 5,
        pb: 3,
        mt: 'auto',
        borderTop: dark ? 'none' : '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ justifyContent: 'space-between', pb: 4 }}>
          <Box sx={{ maxWidth: 320 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: (t) => t.custom.brandGradient, color: '#fff' }}>
                <SpeedIcon fontSize="small" />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800 }}>Exe-Mecanica</Typography>
                <Typography sx={{ fontSize: 12, color: dark ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}>Motos con garantía</Typography>
              </Box>
            </Stack>
            <Typography variant="body2" sx={{ color: dark ? 'rgba(255,255,255,0.65)' : 'text.secondary' }}>
              Taller de motos. Diagnóstico, reparación y mantenimiento para tu moto.
            </Typography>
          </Box>

          <Stack spacing={1} sx={{ color: dark ? 'rgba(255,255,255,0.75)' : 'text.secondary' }}>
            <Typography sx={{ fontWeight: 700, color: dark ? '#fff' : 'text.primary', mb: 0.5 }}>Contacto</Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <LocationOnIcon sx={{ fontSize: 18 }} />
              <Typography variant="body2">Av. San Martín 1234, Tucumán</Typography>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <MapIcon sx={{ fontSize: 18 }} />
              <Typography component="a" href={MAPS_LINK} target="_blank" rel="noopener noreferrer" variant="body2" sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { color: (t) => t.palette.primary.light } }}>
                Cómo llegar en Google Maps
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <ScheduleIcon sx={{ fontSize: 18 }} />
              <Typography variant="body2">Lun a Vie 8:00–18:00 · Sáb 8:00–13:00</Typography>
            </Stack>
            {wa && (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <WhatsAppIcon sx={{ fontSize: 18, color: '#25D366' }} />
                <Typography component="a" href={wa} target="_blank" rel="noopener noreferrer" variant="body2" sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { color: '#25D366' } }}>
                  Escribinos por WhatsApp
                </Typography>
              </Stack>
            )}
          </Stack>

          <Stack spacing={1}>
            <Typography sx={{ fontWeight: 700, color: dark ? '#fff' : 'text.primary', mb: 0.5 }}>Servicios</Typography>
            <Typography variant="body2" sx={{ color: dark ? 'rgba(255,255,255,0.75)' : 'text.secondary' }}>Service completo</Typography>
            <Typography variant="body2" sx={{ color: dark ? 'rgba(255,255,255,0.75)' : 'text.secondary' }}>Frenos y transmisión</Typography>
            <Typography variant="body2" sx={{ color: dark ? 'rgba(255,255,255,0.75)' : 'text.secondary' }}>Cubiertas y cámaras</Typography>
            <Typography component={RouterLink} to="/agendar" variant="body2" sx={{ color: (t) => t.palette.primary.light, textDecoration: 'none', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
              Reservá tu turno →
            </Typography>
          </Stack>
        </Stack>

        <Divider sx={{ borderColor: dark ? 'rgba(255,255,255,0.1)' : 'divider' }} />
        <Typography variant="caption" sx={{ color: dark ? 'rgba(255,255,255,0.45)' : 'text.disabled', display: 'block', textAlign: 'center', pt: 2.5 }}>
          © {new Date().getFullYear()} Exe-Mecanica · Todos los derechos reservados
        </Typography>
      </Container>
    </Box>
  )
}
