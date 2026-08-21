import { useEffect } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { Box, Button, CircularProgress, Container, Paper, Stack, Typography } from '@mui/material'
import BuildIcon from '@mui/icons-material/Build'
import SpeedIcon from '@mui/icons-material/Speed'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import ScheduleIcon from '@mui/icons-material/Schedule'
import MapIcon from '@mui/icons-material/Map'
import CheckIcon from '@mui/icons-material/Check'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { useColorMode } from '../../context/useColorMode'
import { waLink } from '../../utils/wa'
import { getPerfilPublico, listServiciosPublicos } from '../../services/publicoApi'
import { useAsyncData } from '../../hooks/useAsyncData'
import PublicHeader from '../../components/public/PublicHeader'
import PublicFooter from '../../components/public/PublicFooter'
import WhatsAppFloat from '../../components/public/WhatsAppFloat'
import Reveal from '../../components/Reveal'
import TicketTag from '../../components/TicketTag'
import TallerSuspendidoView from '../../components/TallerSuspendidoView'
import { INK, CONCRETE, BAND, PAPER, PAPER_DARK, SAFETY, SAFETY_DEEP, HAZARD, FONT_DISPLAY, FONT_MONO, pegboard, btnSx, getWorkshopTheme } from '../../theme/workshopBrand'

const NAV_LINKS = [
  { label: 'Servicios', id: 'servicios' },
  { label: 'Ubicación', id: 'ubicacion' },
  { label: 'Contacto', id: 'contacto' },
]

// Si tipo_vehiculo es una sola palabra ("motos") se singulariza y se pasa a
// minúscula ("moto"). Si es una frase con varios tipos ("Autos y motos"),
// sacarle la "s" final a la frase entera rompe la gramática ("tu Autos y
// moto") — en ese caso se usa "vehículo" como término genérico.
const singular = (frase) => {
  const limpio = String(frase ?? '').trim()
  const palabras = limpio.split(/\s+/)
  if (palabras.length !== 1) return 'vehículo'
  return limpio.toLowerCase().replace(/s$/, '')
}

const porQue = [
  'Diagnóstico honesto y presupuesto claro',
  'Trabajos con garantía',
  'Repuestos de primeras marcas',
  'Atención rápida y personalizada',
]

export default function TallerLanding() {
  const { tallerSlug } = useParams()
  const { mode } = useColorMode()
  const dark = mode === 'dark'

  const perfil = useAsyncData(() => getPerfilPublico(tallerSlug), { errorMessage: 'No se pudo cargar el taller.' })
  const serviciosData = useAsyncData(() => listServiciosPublicos(tallerSlug), { errorMessage: 'No se pudieron cargar los servicios.' })

  const nombre = perfil.data?.nombre_negocio ?? 'Taller'

  useEffect(() => {
    const previous = document.title
    document.title = nombre + ' · Taller'
    return () => { document.title = previous }
  }, [nombre])

  if (perfil.loading) {
    return (
      <Box sx={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: dark ? INK : CONCRETE }}>
        <CircularProgress />
      </Box>
    )
  }

  if (perfil.error) {
    const suspendido = perfil.error.response?.status === 403
    return (
      <TallerSuspendidoView
        mode={mode}
        title={suspendido ? 'Taller fuera de servicio' : 'No se pudo cargar el taller'}
        message={
          suspendido
            ? 'Este taller está temporalmente suspendido. Si sos el dueño, contactá al administrador.'
            : 'Ocurrió un error al cargar la información del taller. Intentá de nuevo más tarde.'
        }
      />
    )
  }

  const tipoVehiculo = perfil.data?.tipo_vehiculo?.trim() || 'vehículos'
  const tipoVehiculoSingular = singular(tipoVehiculo)
  const direccion = perfil.data?.direccion
  const horario = perfil.data?.horario
  const agendarTo = '/agendar/' + tallerSlug
  const wa = waLink(perfil.data?.whatsapp, 'Hola, quiero consultar por un servicio de ' + nombre + '.')

  const textPrimary = dark ? '#f3ede0' : INK
  const textSecondary = dark ? 'rgba(243,237,224,0.66)' : '#57534a'
  const borderColor = dark ? 'rgba(243,237,224,0.14)' : 'rgba(24,20,15,0.14)'
  const pageBg = dark ? INK : CONCRETE
  const cardBg = dark ? PAPER_DARK : PAPER
  const bandBg = dark ? INK : BAND

  const mapsQuery = direccion ? encodeURIComponent(direccion) : null
  const mapsEmbed = mapsQuery ? 'https://maps.google.com/maps?q=' + mapsQuery + '&t=&z=15&ie=UTF8&iwloc=&output=embed' : null
  const mapsLink = mapsQuery ? 'https://www.google.com/maps/search/?api=1&query=' + mapsQuery : null

  const servicios = serviciosData.data ?? []

  return (
    <ThemeProvider theme={getWorkshopTheme(mode)}>
      <Box sx={{ bgcolor: pageBg, color: textPrimary, minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
        <PublicHeader workshop links={NAV_LINKS} nombre={nombre} tagline={'Especialistas en ' + tipoVehiculo} agendarTo={agendarTo} />

        {/* HERO */}
        <Box sx={{ position: 'relative', overflow: 'hidden', ...pegboard(dark ? 'rgba(243,237,224,0.05)' : 'rgba(24,20,15,0.05)') }}>
          <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 }, textAlign: 'center' }}>
            <Box sx={{ maxWidth: 720, mx: 'auto' }}>
              <TicketTag ink={!dark} sx={{ mb: 2.5, color: SAFETY, borderColor: SAFETY }}>
                <SpeedIcon sx={{ fontSize: 13 }} />
                Taller de {tipoVehiculo}
              </TicketTag>
              <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.005em', lineHeight: 0.98, mb: 2.5, fontSize: { xs: '2.9rem', sm: '3.8rem', md: '4.8rem' } }}>
                {nombre}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 500, color: textSecondary, mb: 4, lineHeight: 1.55 }}>
                Especialistas en {tipoVehiculo}. Diagnóstico honesto, presupuesto claro y trabajo con garantía para tu {tipoVehiculoSingular}.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'center', mb: 4 }}>
                <Button component={RouterLink} to={agendarTo} variant="contained" size="large" startIcon={<CalendarMonthIcon />} sx={{ ...btnSx, fontSize: 14, bgcolor: SAFETY, color: '#fff', px: 4, boxShadow: '0 4px 0 ' + SAFETY_DEEP, '&:hover': { bgcolor: SAFETY_DEEP, boxShadow: '0 4px 0 ' + SAFETY_DEEP } }}>
                  Reservá tu turno
                </Button>
                {wa && (
                  <Button component="a" href={wa} target="_blank" rel="noopener noreferrer" variant="outlined" size="large" startIcon={<WhatsAppIcon />} sx={{ ...btnSx, fontSize: 14, px: 4, color: textPrimary, borderWidth: 1.5, borderColor: dark ? 'rgba(243,237,224,0.3)' : 'rgba(24,20,15,0.3)', '&:hover': { borderWidth: 1.5, borderColor: textPrimary, bgcolor: 'transparent' } }}>
                    Consultar por WhatsApp
                  </Button>
                )}
              </Stack>

              <Stack direction="row" spacing={0.75} sx={{ justifyContent: 'center', flexWrap: 'wrap', rowGap: 1 }}>
                {direccion && (
                  <TicketTag ink={!dark}>
                    <LocationOnIcon sx={{ fontSize: 13, color: SAFETY }} />
                    {direccion}
                  </TicketTag>
                )}
                {horario && (
                  <TicketTag ink={!dark}>
                    <ScheduleIcon sx={{ fontSize: 13, color: SAFETY }} />
                    {horario}
                  </TicketTag>
                )}
                {wa && (
                  <TicketTag ink={!dark}>
                    <WhatsAppIcon sx={{ fontSize: 13, color: '#25D366' }} />
                    WhatsApp
                  </TicketTag>
                )}
              </Stack>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 5, md: 7 } }}>
              <Box onClick={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, color: textSecondary, cursor: 'pointer', '&:hover': { color: SAFETY } }}>
                <Typography variant="caption" sx={{ fontFamily: FONT_MONO, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Ver servicios</Typography>
                <KeyboardArrowDownIcon sx={{ animation: 'bounceDown 1.6s infinite' }} />
                <style>{'@keyframes bounceDown { 0%,100% { transform: translateY(0); } 50% { transform: translateY(6px); } }'}</style>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* SERVICIOS */}
        {servicios.length > 0 && (
          <Box id="servicios" sx={{ scrollMarginTop: 84 }}>
            <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
              <Reveal>
                <Box sx={{ textAlign: 'center', maxWidth: 640, mx: 'auto', mb: { xs: 4, md: 5 } }}>
                  <Typography sx={{ display: 'block', fontFamily: FONT_MONO, fontWeight: 600, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: SAFETY, mb: 1.5 }}>
                    Servicios
                  </Typography>
                  <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.005em', lineHeight: 0.98, mb: 1.5, fontSize: { xs: '2rem', md: '2.6rem' }, color: textPrimary }}>
                    Lo que hacemos en {nombre}
                  </Typography>
                  <Typography variant="body1" sx={{ color: textSecondary }}>
                    Todo lo que tu {tipoVehiculoSingular} necesita, en un solo lugar.
                  </Typography>
                </Box>
              </Reveal>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2.5 }}>
                {servicios.map((s, i) => (
                  <Reveal key={s.id} delay={i * 70}>
                    <Paper variant="outlined" sx={{ position: 'relative', p: 3, borderRadius: 1.5, height: '100%', bgcolor: cardBg, borderColor, transition: 'transform 0.2s ease, box-shadow 0.2s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: dark ? '0 16px 34px -18px rgba(0,0,0,0.6)' : '0 16px 34px -18px rgba(24,20,15,0.28)' } }}>
                      <Typography sx={{ position: 'absolute', top: 10, right: 14, fontFamily: FONT_MONO, fontSize: 11, fontWeight: 600, color: textSecondary, opacity: 0.6 }}>
                        {String(i + 1).padStart(2, '0')}
                      </Typography>
                      <Box sx={{ width: 44, height: 44, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: SAFETY, color: '#fff', mb: 2, transform: 'rotate(' + (i % 2 ? 2 : -2) + 'deg)' }}>
                        <BuildIcon fontSize="small" />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.75 }}>{s.nombre}</Typography>
                      {s.duracion_min && <Typography variant="body2" sx={{ color: textSecondary }}>Aprox. {s.duracion_min} min</Typography>}
                    </Paper>
                  </Reveal>
                ))}
              </Box>
            </Container>
          </Box>
        )}

        {/* SOBRE EL TALLER */}
        <Box id="contacto" sx={{ scrollMarginTop: 84, bgcolor: bandBg, borderTop: '1px solid', borderBottom: '1px solid', borderColor }}>
          <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 4, md: 6 }} sx={{ alignItems: 'center' }}>
              <Box sx={{ flex: 1 }}>
                <Reveal>
                  <Typography sx={{ display: 'block', fontFamily: FONT_MONO, fontWeight: 600, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: SAFETY, mb: 1.5 }}>
                    Por qué elegirnos
                  </Typography>
                  <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.005em', lineHeight: 0.98, mb: 2.5, fontSize: { xs: '2rem', md: '2.6rem' }, color: textPrimary }}>
                    Tu {tipoVehiculoSingular} en las mejores manos
                  </Typography>
                </Reveal>
                <Reveal delay={100}>
                  <Typography variant="body1" sx={{ color: textSecondary, mb: 3 }}>
                    En {nombre} trabajamos con seriedad y transparencia. Te contamos exactamente qué necesita tu {tipoVehiculoSingular}, cuánto cuesta y cuánto tarda antes de tocar nada.
                  </Typography>
                </Reveal>
                <Reveal delay={150}>
                  <Stack spacing={1.5}>
                    {porQue.map((item) => (
                      <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: SAFETY, color: '#fff', flexShrink: 0 }}>
                          <CheckIcon sx={{ fontSize: 14 }} />
                        </Box>
                        <Typography variant="body2" sx={{ color: textSecondary, fontWeight: 600 }}>{item}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Reveal>
              </Box>

              <Box sx={{ flex: 1, width: '100%' }}>
                <Reveal delay={200} direction="left">
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 1.5, bgcolor: cardBg, borderColor }}>
                    <Typography sx={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: textSecondary, mb: 2 }}>
                      Datos de contacto
                    </Typography>
                    <Stack spacing={2}>
                      {direccion && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <LocationOnIcon sx={{ fontSize: 20, color: SAFETY }} />
                          <Typography variant="body2" sx={{ color: textSecondary }}>{direccion}</Typography>
                        </Box>
                      )}
                      {horario && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <ScheduleIcon sx={{ fontSize: 20, color: SAFETY }} />
                          <Typography variant="body2" sx={{ color: textSecondary }}>{horario}</Typography>
                        </Box>
                      )}
                      {wa && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <WhatsAppIcon sx={{ fontSize: 20, color: '#25D366' }} />
                          <Typography component="a" href={wa} target="_blank" rel="noopener noreferrer" variant="body2" sx={{ color: textSecondary, textDecoration: 'none', '&:hover': { color: '#25D366' } }}>
                            Escribinos por WhatsApp
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                    <Button component={RouterLink} to={agendarTo} variant="contained" fullWidth size="large" startIcon={<CalendarMonthIcon />} sx={{ ...btnSx, mt: 3, bgcolor: SAFETY, color: '#fff', boxShadow: '0 3px 0 ' + SAFETY_DEEP, '&:hover': { bgcolor: SAFETY_DEEP, boxShadow: '0 3px 0 ' + SAFETY_DEEP } }}>
                      Reservá tu turno
                    </Button>
                  </Paper>
                </Reveal>
              </Box>
            </Stack>
          </Container>
        </Box>

        {/* UBICACIÓN */}
        {(direccion || horario) && (
          <Box id="ubicacion" sx={{ scrollMarginTop: 84 }}>
            <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
              <Reveal>
                <Box sx={{ textAlign: 'center', maxWidth: 640, mx: 'auto', mb: { xs: 4, md: 5 } }}>
                  <Typography sx={{ display: 'block', fontFamily: FONT_MONO, fontWeight: 600, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: SAFETY, mb: 1.5 }}>
                    Ubicación
                  </Typography>
                  <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.005em', lineHeight: 0.98, mb: 1.5, fontSize: { xs: '2rem', md: '2.6rem' }, color: textPrimary }}>
                    Encontrarnos es fácil
                  </Typography>
                  {mapsLink && <Typography variant="body1" sx={{ color: textSecondary }}>Tocá el mapa o el botón para abrir la dirección en Google Maps.</Typography>}
                </Box>
              </Reveal>
              <Reveal delay={120}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: mapsEmbed ? '1.1fr 1fr' : '1fr' }, gap: { xs: 3, md: 5 }, alignItems: 'center' }}>
                  <Stack spacing={2} sx={{ alignItems: mapsEmbed ? 'flex-start' : 'center', textAlign: mapsEmbed ? 'left' : 'center' }}>
                    {direccion && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <LocationOnIcon sx={{ fontSize: 22, color: SAFETY }} />
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{direccion}</Typography>
                      </Box>
                    )}
                    {horario && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <ScheduleIcon sx={{ fontSize: 22, color: SAFETY }} />
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{horario}</Typography>
                      </Box>
                    )}
                    {mapsLink && (
                      <Button component="a" href={mapsLink} target="_blank" rel="noopener noreferrer" variant="contained" size="large" startIcon={<MapIcon />} sx={{ ...btnSx, bgcolor: SAFETY, color: '#fff', px: 3.5, boxShadow: '0 3px 0 ' + SAFETY_DEEP, '&:hover': { bgcolor: SAFETY_DEEP, boxShadow: '0 3px 0 ' + SAFETY_DEEP } }}>
                        Cómo llegar (Google Maps)
                      </Button>
                    )}
                  </Stack>
                  {mapsEmbed && (
                    <Box component="iframe" src={mapsEmbed} title="Ubicación del taller en Google Maps" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" sx={{ width: '100%', height: { xs: 280, md: 380 }, border: 0, borderRadius: 2, display: 'block', boxShadow: dark ? '0 24px 60px -20px rgba(0,0,0,0.55)' : '0 24px 60px -24px rgba(24,20,15,0.35)' }} />
                  )}
                </Box>
              </Reveal>
            </Container>
          </Box>
        )}

        {/* CTA BANNER */}
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ height: 10, backgroundImage: 'repeating-linear-gradient(-45deg, ' + HAZARD + ', ' + HAZARD + ' 14px, ' + INK + ' 14px, ' + INK + ' 28px)' }} />
          <Box sx={{ color: '#fff8ec', bgcolor: SAFETY, ...pegboard('rgba(255,255,255,0.08)') }}>
            <Container maxWidth="md" sx={{ py: { xs: 7, md: 9 }, textAlign: 'center' }}>
              <Reveal>
                <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', mb: 1.5, fontSize: { xs: '2.1rem', md: '2.8rem' } }}>
                  ¿Tenés un problema con tu {tipoVehiculoSingular}?
                </Typography>
                <Typography sx={{ color: 'rgba(255,248,236,0.85)', mb: 3.5 }}>
                  Reservá tu turno online o escribinos por WhatsApp. Te respondemos rápido.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'center' }}>
                  <Button component={RouterLink} to={agendarTo} variant="contained" size="large" startIcon={<CalendarMonthIcon />} sx={{ ...btnSx, bgcolor: INK, color: '#fff8ec', px: 4, boxShadow: '0 4px 0 rgba(0,0,0,0.35)', '&:hover': { bgcolor: '#000' } }}>
                    Reservá tu turno
                  </Button>
                  {wa && (
                    <Button component="a" href={wa} target="_blank" rel="noopener noreferrer" variant="outlined" size="large" startIcon={<WhatsAppIcon />} sx={{ ...btnSx, color: '#fff8ec', borderColor: 'rgba(255,248,236,0.6)', px: 4, '&:hover': { borderColor: '#fff8ec', bgcolor: 'rgba(255,248,236,0.1)' } }}>
                      Escribinos por WhatsApp
                    </Button>
                  )}
                </Stack>
              </Reveal>
            </Container>
          </Box>
        </Box>

        <PublicFooter workshop nombre={nombre} tagline={'Especialistas en ' + tipoVehiculo} direccion={direccion} horario={horario} whatsapp={perfil.data?.whatsapp} agendarTo={agendarTo} servicios={serviciosData.data} />
        <WhatsAppFloat telefono={perfil.data?.whatsapp} mensaje={'Hola, quiero consultar por un servicio de ' + nombre + '.'} />
      </Box>
    </ThemeProvider>
  )
}
