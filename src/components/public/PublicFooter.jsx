import { Link as RouterLink } from 'react-router-dom'
import { Box, Container, Divider, Stack, Typography } from '@mui/material'
import BuildIcon from '@mui/icons-material/Build'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import ScheduleIcon from '@mui/icons-material/Schedule'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import MapIcon from '@mui/icons-material/Map'
import { useColorMode } from '../../context/useColorMode'
import { waLink } from '../../utils/wa'
import { INK, CONCRETE, SAFETY, FONT_DISPLAY, FONT_MONO } from '../../theme/workshopBrand'

export default function PublicFooter({ nombre = 'el taller', tagline, direccion, horario, whatsapp, agendarTo = '/agendar', ctaLabel = 'Reservá tu turno →', workshop = false, servicios = [] }) {
  const { mode } = useColorMode()
  const dark = mode === 'dark'
  const wa = waLink(whatsapp, 'Hola, quiero consultar por ' + nombre + '.')
  const mapsQuery = direccion ? encodeURIComponent(direccion) : null
  const mapsLink = mapsQuery ? 'https://www.google.com/maps/search/?api=1&query=' + mapsQuery : null

  const textPrimary = dark ? '#f3ede0' : INK
  const textSecondary = dark ? 'rgba(243,237,224,0.66)' : '#57534a'
  const borderColor = dark ? 'rgba(243,237,224,0.14)' : 'rgba(24,20,15,0.14)'
  const pageBg = dark ? INK : CONCRETE

  if (!workshop) {
    return (
      <Box
        component="footer"
        sx={{
          bgcolor: dark ? '#070c17' : '#ffffff',
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
                <Box sx={{ width: 36, height: 36, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: (t) => t.custom.brandGradient, color: '#fff', flexShrink: 0 }}>
                  <BuildIcon fontSize="small" />
                </Box>
                <Typography sx={{ fontWeight: 800 }}>{nombre}</Typography>
              </Stack>
              {tagline && <Typography variant="body2" sx={{ color: dark ? 'rgba(255,255,255,0.65)' : 'text.secondary' }}>{tagline}</Typography>}
            </Box>

            <Stack spacing={1} sx={{ color: dark ? 'rgba(255,255,255,0.75)' : 'text.secondary' }}>
              <Typography sx={{ fontWeight: 700, color: dark ? '#fff' : 'text.primary', mb: 0.5 }}>Contacto</Typography>
              {direccion && (
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <LocationOnIcon sx={{ fontSize: 18 }} />
                  <Typography variant="body2">{direccion}</Typography>
                </Stack>
              )}
              {horario && (
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <ScheduleIcon sx={{ fontSize: 18 }} />
                  <Typography variant="body2">{horario}</Typography>
                </Stack>
              )}
              {wa && (
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <WhatsAppIcon sx={{ fontSize: 18, color: '#25D366' }} />
                  <Typography component="a" href={wa} target="_blank" rel="noopener noreferrer" variant="body2" sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { color: '#25D366' } }}>
                    Escribinos por WhatsApp
                  </Typography>
                </Stack>
              )}
              <Typography component={RouterLink} to={agendarTo} variant="body2" sx={{ color: (t) => t.palette.primary.light, textDecoration: 'none', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
                {ctaLabel}
              </Typography>
            </Stack>
          </Stack>

          <Divider sx={{ borderColor: dark ? 'rgba(255,255,255,0.1)' : 'divider' }} />
          <Typography variant="caption" sx={{ color: dark ? 'rgba(255,255,255,0.45)' : 'text.disabled', display: 'block', textAlign: 'center', pt: 2.5 }}>
            &copy; {new Date().getFullYear()} {nombre} · Todos los derechos reservados
          </Typography>
          <Typography variant="caption" sx={{ color: dark ? 'rgba(255,255,255,0.45)' : 'text.disabled', display: 'block', textAlign: 'center', pt: 0.75 }}>
          ¿Tenés un taller?{' '}
            <Typography component={RouterLink} to="/registro" variant="caption" sx={{ color: (t) => t.palette.primary.light, textDecoration: 'none', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
              Sumalo al sistema
            </Typography>
          </Typography>
        </Container>
      </Box>
    )
  }

  const linkSx = {
    fontFamily: FONT_MONO,
    fontSize: 11,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: textSecondary,
    fontWeight: 600,
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    '&:hover': { color: SAFETY },
  }

  const sectionTitleSx = {
    fontFamily: FONT_MONO,
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: textPrimary,
    mb: 1,
  }

  return (
    <Box component="footer" sx={{ bgcolor: pageBg, color: textPrimary, pt: 5, pb: 3, mt: 'auto', borderTop: '1px solid', borderColor }}>
      <Container maxWidth="lg">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 4, md: 6 }} sx={{ justifyContent: 'space-between', alignItems: 'flex-start', pb: 4 }}>
          {/* MARCA */}
          <Box sx={{ maxWidth: 280 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
              <Box sx={{ width: 34, height: 34, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: SAFETY, color: '#fff', flexShrink: 0, transform: 'rotate(-4deg)', boxShadow: '0 3px 0 rgba(0,0,0,0.15)' }}>
                <BuildIcon fontSize="small" />
              </Box>
              <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 16, letterSpacing: '0.01em', textTransform: 'uppercase' }}>
                {nombre}
              </Typography>
            </Stack>
            {tagline && <Typography variant="body2" sx={{ color: textSecondary }}>{tagline}</Typography>}
          </Box>

          {/* SERVICIOS */}
          {(servicios ?? []).length > 0 && (
            <Box>
              <Typography sx={sectionTitleSx}>Servicios</Typography>
              <Stack spacing={0.5}>
                {(servicios ?? []).map((s) => (
                  <Typography key={s.id} sx={{ ...linkSx, cursor: 'default' }}>
                    {s.nombre}
                  </Typography>
                ))}
              </Stack>
            </Box>
          )}

          {/* CONTACTO */}
          <Box>
            <Typography sx={sectionTitleSx}>Contacto</Typography>
            <Stack spacing={1.25}>
              {direccion && (
                <Typography component="span" sx={linkSx}>
                  <LocationOnIcon sx={{ fontSize: 16, color: SAFETY }} /> {direccion}
                </Typography>
              )}
              {mapsLink && (
                <Typography component="a" href={mapsLink} target="_blank" rel="noopener noreferrer" sx={linkSx}>
                  <MapIcon sx={{ fontSize: 16, color: SAFETY }} /> Cómo llegar en Google Maps
                </Typography>
              )}
              {horario && (
                <Typography component="span" sx={linkSx}>
                  <ScheduleIcon sx={{ fontSize: 16, color: SAFETY }} /> {horario}
                </Typography>
              )}
              {wa && (
                <Typography component="a" href={wa} target="_blank" rel="noopener noreferrer" sx={linkSx}>
                  <WhatsAppIcon sx={{ fontSize: 16, color: '#25D366' }} /> Escribinos por WhatsApp
                </Typography>
              )}
              <Typography component={RouterLink} to={agendarTo} sx={{ ...linkSx, color: SAFETY, fontWeight: 700 }}>
                <CalendarMonthIcon sx={{ fontSize: 16 }} /> {ctaLabel}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ borderColor }} />
        <Typography sx={{ fontFamily: FONT_MONO, fontSize: 11, color: textSecondary, opacity: 0.8, display: 'block', textAlign: 'center', pt: 2.5 }}>
          &copy; {new Date().getFullYear()} {nombre} · Todos los derechos reservados
        </Typography>
        <Typography sx={{ fontFamily: FONT_MONO, fontSize: 11, color: textSecondary, opacity: 0.8, display: 'block', textAlign: 'center', pt: 0.75 }}>
          Tenes un taller?{' '}
          <Typography component={RouterLink} to="/registro" sx={{ fontFamily: FONT_MONO, fontSize: 11, color: SAFETY, textDecoration: 'none', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
            Sumalo al sistema
          </Typography>
        </Typography>
      </Container>
    </Box>
  )
}
