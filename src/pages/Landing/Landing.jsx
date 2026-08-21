import { Link as RouterLink, Navigate } from 'react-router-dom'
import { Box, Button, Container, Drawer, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import BuildIcon from '@mui/icons-material/Build'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import PeopleIcon from '@mui/icons-material/People'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import PaymentsIcon from '@mui/icons-material/Payments'
import StorefrontIcon from '@mui/icons-material/Storefront'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeIcon from '@mui/icons-material/LightModeOutlined'
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import PedalBikeIcon from '@mui/icons-material/PedalBike'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CheckIcon from '@mui/icons-material/Check'
import AddIcon from '@mui/icons-material/Add'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useColorMode } from '../../context/useColorMode'
import Reveal from '../../components/Reveal'
import TicketTag from '../../components/TicketTag'
import { INK, INK_SURFACE, CONCRETE, BAND, PAPER, PAPER_DARK, SAFETY, SAFETY_DEEP, HAZARD, STEEL, FONT_DISPLAY, FONT_MONO, pegboard, btnSx } from '../../theme/workshopBrand'

// Landing general del producto — a diferencia de /taller/:tallerSlug (la página
// pública de CADA taller, con sus datos reales), esta no llama al backend:
// no hay ningún taller "actual" acá, así que no hay nada que traer.
//
// Identidad propia, distinta del azul del panel interno: esta página vende
// el producto en sí (no representa a ningún taller puntual), así que toma
// prestado el vocabulario visual de un taller real — orden de trabajo,
// ticket perforado, sello de "en taller", naranja de seguridad — en vez
// de la estética SaaS genérica (gradiente índigo/violeta + mockup de panel).
// Tokens compartidos con Login/Registro en src/theme/workshopBrand.js.

const beneficios = [
  { icon: CalendarMonthIcon, titulo: 'Turnos online', descripcion: 'Tus clientes reservan solos, eligiendo el servicio y el horario que les quede libre.' },
  { icon: PeopleIcon, titulo: 'Clientes y vehículos', descripcion: 'Historial completo de cada cliente y cada vehículo, sin planillas sueltas.' },
  { icon: Inventory2Icon, titulo: 'Stock y compras', descripcion: 'Control de repuestos con descuento automático al usarlos en una orden.' },
  { icon: PaymentsIcon, titulo: 'Caja y reportes', descripcion: 'Cobros, gastos y balance del taller, siempre al día.' },
  { icon: WhatsAppIcon, titulo: 'WhatsApp integrado', descripcion: 'Tus clientes también pueden pedir turno directamente por WhatsApp.' },
  { icon: StorefrontIcon, titulo: 'Multi-taller', descripcion: 'Si manejás más de un local, todos desde la misma cuenta.' },
]

const pasos = [
  { titulo: 'Creá tu taller', descripcion: 'Te registrás gratis con el nombre de tu negocio y ya tenés tu cuenta lista.' },
  { titulo: 'Cargá tus servicios', descripcion: 'Sumá lo que ofrecés, tus horarios y los datos de contacto.' },
  { titulo: 'Compartí tu link', descripcion: 'Tus clientes reservan turnos solos desde tu página, sin llamadas.' },
]

const vehiculos = [
  { icon: TwoWheelerIcon, label: 'Motos' },
  { icon: DirectionsCarIcon, label: 'Autos' },
  { icon: PedalBikeIcon, label: 'Bicicletas' },
  { icon: LocalShippingIcon, label: 'Utilitarios' },
]

const NAV_LINKS = [
  { label: 'Beneficios', id: 'beneficios' },
  { label: 'Cómo funciona', id: 'como-funciona' },
  { label: 'Preguntas frecuentes', id: 'preguntas-frecuentes' },
]

const faqs = [
  { pregunta: '¿Tengo que instalar algo?', respuesta: 'No, es todo web. Entrás desde el navegador, tanto desde la computadora como desde el celular, sin instalar nada.' },
  { pregunta: '¿Mis clientes necesitan crear una cuenta para pedir turno?', respuesta: 'No. Comparten tu link y reservan el turno directamente, sin registrarse.' },
  { pregunta: '¿Sirve para cualquier tipo de vehículo?', respuesta: 'Sí, lo configurás según lo que repares: motos, autos, bicicletas, utilitarios o lo que necesites.' },
  { pregunta: '¿Puedo cancelar cuando quiera?', respuesta: 'Sí, no hay permanencia. Cancelás cuando quieras desde tu cuenta.' },
  { pregunta: '¿Puedo manejar más de un taller con la misma cuenta?', respuesta: 'Sí, la cuenta soporta múltiples talleres, cada uno con sus propios turnos, clientes y stock.' },
]

const scrollToId = (id) => (e) => {
  e.preventDefault()
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function Landing() {
  const { token } = useAuth()
  const { mode, toggleColorMode } = useColorMode()
  const dark = mode === 'dark'
  const [menuOpen, setMenuOpen] = useState(false)

  if (token) return <Navigate to="/panel" replace />

  const scrollToIdAndClose = (id) => (e) => {
    scrollToId(id)(e)
    setMenuOpen(false)
  }

  const textPrimary = dark ? '#f3ede0' : INK
  const textSecondary = dark ? 'rgba(243,237,224,0.66)' : '#57534a'
  const borderColor = dark ? 'rgba(243,237,224,0.14)' : 'rgba(24,20,15,0.14)'
  const cardBg = dark ? PAPER_DARK : PAPER
  const pageBg = dark ? INK : CONCRETE
  const ticketInk = dark ? '#f3ede0' : INK
  const ticketMuted = dark ? 'rgba(243,237,224,0.55)' : '#8a8478'
  const ticketSub = dark ? 'rgba(243,237,224,0.72)' : '#5c5648'
  const ticketDivider = dark ? 'rgba(243,237,224,0.18)' : 'rgba(24,20,15,0.18)'

  return (
    <Box sx={{ bgcolor: pageBg, color: textPrimary, minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
      {/* HEADER */}
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          bgcolor: dark ? 'rgba(24,20,15,0.88)' : 'rgba(233,228,216,0.88)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid',
          borderColor,
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', py: 1.6 }}>
            <Box sx={{ width: 34, height: 34, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: SAFETY, color: '#fff', flexShrink: 0, transform: 'rotate(-4deg)', boxShadow: '0 3px 0 rgba(0,0,0,0.15)' }}>
              <BuildIcon fontSize="small" />
            </Box>
            <Typography noWrap sx={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 20, letterSpacing: '0.01em', textTransform: 'uppercase', color: textPrimary }}>
              Gestión de Talleres
            </Typography>

            <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', md: 'flex' }, ml: 3, flexGrow: 1 }}>
              {NAV_LINKS.map((link) => (
                <Button
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={scrollToId(link.id)}
                  size="small"
                  sx={{ px: 1.5, borderRadius: 1, fontFamily: FONT_MONO, fontSize: 12, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600, color: textSecondary, '&:hover': { color: textPrimary, bgcolor: 'transparent' } }}
                >
                  {link.label}
                </Button>
              ))}
            </Stack>
            <Box sx={{ flexGrow: { xs: 1, md: 0 } }} />

            <Tooltip title={dark ? 'Modo claro' : 'Modo oscuro'}>
              <IconButton size="small" onClick={toggleColorMode} sx={{ borderRadius: 1, color: textSecondary, border: '1px solid', borderColor }}>
                {dark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Button component={RouterLink} to="/login" sx={{ ...btnSx, display: { xs: 'none', sm: 'inline-flex' }, color: textPrimary }}>
              Iniciar sesión
            </Button>
            <Button component={RouterLink} to="/registro" variant="contained" sx={{ ...btnSx, display: { xs: 'none', sm: 'inline-flex' }, bgcolor: SAFETY, color: '#fff', whiteSpace: 'nowrap', boxShadow: '0 3px 0 ' + SAFETY_DEEP, '&:hover': { bgcolor: SAFETY_DEEP, boxShadow: '0 3px 0 ' + SAFETY_DEEP } }}>
              Creá tu taller
            </Button>
            <IconButton
              size="small"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
              sx={{ display: { xs: 'inline-flex', md: 'none' }, borderRadius: 1, color: textSecondary, border: '1px solid', borderColor }}
            >
              <MenuIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Container>
      </Box>

      <Drawer anchor="right" open={menuOpen} onClose={() => setMenuOpen(false)}>
        <Box sx={{ width: 260, p: 2.5, height: '100%', bgcolor: pageBg, color: textPrimary }}>
          <Stack direction="row" sx={{ justifyContent: 'flex-end', mb: 2 }}>
            <IconButton size="small" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú" sx={{ color: textPrimary }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Stack spacing={0.5}>
            {NAV_LINKS.map((link) => (
              <Button
                key={link.id}
                href={`#${link.id}`}
                onClick={scrollToIdAndClose(link.id)}
                sx={{ ...btnSx, justifyContent: 'flex-start', color: textPrimary, px: 1.5 }}
              >
                {link.label}
              </Button>
            ))}
            <Button component={RouterLink} to="/login" sx={{ ...btnSx, justifyContent: 'flex-start', color: textPrimary, px: 1.5, mt: 1 }}>
              Iniciar sesión
            </Button>
            <Button
              component={RouterLink}
              to="/registro"
              variant="contained"
              sx={{ ...btnSx, bgcolor: SAFETY, color: '#fff', mt: 1, boxShadow: '0 3px 0 ' + SAFETY_DEEP }}
            >
              Creá tu taller
            </Button>
          </Stack>
        </Box>
      </Drawer>

      {/* HERO */}
      <Box sx={{ position: 'relative', overflow: 'hidden', ...pegboard(dark ? 'rgba(243,237,224,0.05)' : 'rgba(24,20,15,0.05)') }}>
        <Container maxWidth="lg" sx={{ py: { xs: 7, md: 11 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 6, md: 5 }} sx={{ alignItems: 'center' }}>
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' }, maxWidth: { xs: '100%', md: 560 } }}>
              <TicketTag ink={!dark} sx={{ mb: 3, transform: 'rotate(-1deg)', color: SAFETY, borderColor: SAFETY }}>
                N.º 000 · software para talleres
              </TicketTag>
              <Typography
                sx={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.005em',
                  lineHeight: 0.98,
                  mb: 2.5,
                  fontSize: { xs: '2.9rem', sm: '3.6rem', md: '4.4rem' },
                }}
              >
                Gestión completa
                <br />
                para tu{' '}
                <Box component="span" sx={{ color: SAFETY }}>
                  taller
                </Box>
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 500, color: textSecondary, mb: 4, lineHeight: 1.55, maxWidth: 480, mx: { xs: 'auto', md: 0 } }}>
                Turnos, clientes, stock, caja y reportes en un solo lugar. Moto, auto, bici o lo que repares — tus clientes reservan solos, online.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}>
                <Button
                  component={RouterLink}
                  to="/registro"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ ...btnSx, fontSize: 14, bgcolor: SAFETY, color: '#fff', px: 4, boxShadow: '0 4px 0 ' + SAFETY_DEEP, '&:hover': { bgcolor: SAFETY_DEEP, boxShadow: '0 4px 0 ' + SAFETY_DEEP } }}
                >
                  Creá tu taller gratis
                </Button>
                <Button component={RouterLink} to="/login" variant="outlined" size="large" sx={{ ...btnSx, fontSize: 14, px: 4, color: textPrimary, borderWidth: 1.5, borderColor: dark ? 'rgba(243,237,224,0.3)' : 'rgba(24,20,15,0.3)', '&:hover': { borderWidth: 1.5, borderColor: textPrimary, bgcolor: 'transparent' } }}>
                  Ya tengo cuenta
                </Button>
              </Stack>
              <Stack direction="row" spacing={1.25} sx={{ mt: 3.5, justifyContent: { xs: 'center', md: 'flex-start' }, flexWrap: 'wrap', rowGap: 1.25 }}>
                {['Sin instalar nada', 'Desde el celular', 'Cancelás cuando quieras'].map((f) => (
                  <TicketTag key={f} ink={!dark}>
                    <CheckIcon sx={{ fontSize: 13, color: SAFETY }} />
                    {f}
                  </TicketTag>
                ))}
              </Stack>
            </Box>

            {/* Orden de trabajo — el objeto real de un taller, no un mockup de dashboard */}
            <Box sx={{ flex: 1, width: '100%', maxWidth: 400, display: { xs: 'none', sm: 'block' } }}>
              <Reveal direction="left" delay={100}>
              <Box sx={{ position: 'relative', mx: 'auto', maxWidth: 360 }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: -30,
                    left: '50%',
                    width: 30,
                    height: 20,
                    ml: '-15px',
                    border: '2px solid',
                    borderColor: STEEL,
                    borderBottom: 'none',
                    borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
                    opacity: 0.5,
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: -13,
                    left: '50%',
                    width: 14,
                    height: 14,
                    ml: '-7px',
                    borderRadius: '50%',
                    bgcolor: pageBg,
                    border: '2px solid',
                    borderColor: STEEL,
                  }}
                />
                <Paper
                  elevation={0}
                  sx={{
                    position: 'relative',
                    p: 3,
                    borderRadius: 2,
                    border: '1.5px solid',
                    borderColor: dark ? 'rgba(243,237,224,0.16)' : 'rgba(24,20,15,0.14)',
                    boxShadow: dark ? '0 24px 60px -20px rgba(0,0,0,0.55)' : '0 24px 60px -24px rgba(24,20,15,0.35)',
                    bgcolor: cardBg,
                    color: ticketInk,
                    transform: 'rotate(-3deg)',
                  }}
                >
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: 1.5 }}>
                    <Typography sx={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: ticketMuted }}>
                      Orden de trabajo
                    </Typography>
                    <Typography sx={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 600, color: ticketMuted }}>
                      N.º 0842
                    </Typography>
                  </Stack>
                  <Box sx={{ borderTop: '1.5px dashed', borderColor: ticketDivider, mb: 1.5 }} />

                  <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 26, textTransform: 'uppercase', lineHeight: 1, mb: 0.5 }}>
                    Fiat Cronos
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: ticketSub, mb: 2 }}>
                    Juan P. · Cambio de aceite · 09:30
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
                    <Box
                      sx={{
                        transform: 'rotate(-8deg)',
                        border: '2px solid',
                        borderColor: SAFETY,
                        borderRadius: 1,
                        px: 1.4,
                        py: 0.4,
                        color: SAFETY,
                      }}
                    >
                      <Typography sx={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                        En taller
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ borderTop: '1.5px dashed', borderColor: ticketDivider, mb: 1.5 }} />
                  <Stack direction="row" sx={{ '& > div': { flex: 1, textAlign: 'center' } }}>
                    {[
                      { label: 'Turnos hoy', valor: '8' },
                      { label: 'En taller', valor: '3' },
                      { label: 'Por cobrar', valor: '$42k' },
                    ].map((s, i) => (
                      <Box key={s.label} sx={{ borderLeft: i > 0 ? `1.5px dashed ${ticketDivider}` : 'none' }}>
                        <Typography sx={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 18, color: ticketInk }}>{s.valor}</Typography>
                        <Typography sx={{ fontSize: 10, letterSpacing: '0.04em', textTransform: 'uppercase', color: ticketMuted }}>{s.label}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </Box>
              </Reveal>
            </Box>
          </Stack>

          {/* Tipos de vehículo */}
          <Reveal delay={150}>
            <Stack
              direction="row"
              spacing={{ xs: 1.5, sm: 2.5 }}
              sx={{ mt: { xs: 6, md: 8 }, justifyContent: 'center', flexWrap: 'wrap', rowGap: 1.5 }}
            >
              {vehiculos.map((v) => (
                <TicketTag key={v.label} ink={!dark}>
                  <v.icon sx={{ fontSize: 15 }} />
                  {v.label}
                </TicketTag>
              ))}
            </Stack>
          </Reveal>
        </Container>
      </Box>

      {/* BENEFICIOS */}
      <Box id="beneficios" sx={{ scrollMarginTop: 84 }}>
        <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
          <Reveal>
            <Typography sx={{ display: 'block', textAlign: 'center', fontFamily: FONT_MONO, fontWeight: 600, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: SAFETY, mb: 1.5 }}>
              — Beneficios —
            </Typography>
            <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', textAlign: 'center', fontSize: { xs: '2rem', md: '2.6rem' }, mb: 5 }}>
              Todo lo que necesita tu taller
            </Typography>
          </Reveal>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2.5 }}>
            {beneficios.map((b, i) => (
              <Reveal key={b.titulo} delay={i * 70}>
                <Paper
                  variant="outlined"
                  sx={{
                    position: 'relative',
                    p: 3,
                    pt: 3.5,
                    borderRadius: 1.5,
                    height: '100%',
                    borderColor,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: dark ? '0 16px 34px -18px rgba(0,0,0,0.6)' : '0 16px 34px -18px rgba(24,20,15,0.28)' },
                  }}
                >
                  <Typography sx={{ position: 'absolute', top: 10, right: 14, fontFamily: FONT_MONO, fontSize: 11, fontWeight: 600, color: textSecondary, opacity: 0.6 }}>
                    {String(i + 1).padStart(2, '0')}
                  </Typography>
                  <Box sx={{ width: 44, height: 44, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: SAFETY, color: '#fff', mb: 2, transform: `rotate(${i % 2 ? 2 : -2}deg)` }}>
                    <b.icon fontSize="small" />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.75 }}>{b.titulo}</Typography>
                  <Typography variant="body2" sx={{ color: textSecondary }}>{b.descripcion}</Typography>
                </Paper>
              </Reveal>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CÓMO FUNCIONA */}
      <Box id="como-funciona" sx={{ scrollMarginTop: 84, bgcolor: dark ? INK_SURFACE : BAND, borderTop: '1px solid', borderBottom: '1px solid', borderColor }}>
        <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
          <Reveal>
            <Typography sx={{ display: 'block', textAlign: 'center', fontFamily: FONT_MONO, fontWeight: 600, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: SAFETY, mb: 1.5 }}>
              — Cómo funciona —
            </Typography>
            <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', textAlign: 'center', fontSize: { xs: '2rem', md: '2.6rem' }, mb: 5 }}>
              Empezá en tres pasos
            </Typography>
          </Reveal>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            {pasos.map((p, i) => (
              <Reveal key={p.titulo} delay={i * 90}>
                <Stack spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed',
                      borderColor: SAFETY,
                      color: SAFETY,
                      fontFamily: FONT_MONO,
                      fontWeight: 700,
                      fontSize: 18,
                      transform: `rotate(${i % 2 ? 3 : -3}deg)`,
                    }}
                  >
                    {i + 1}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{p.titulo}</Typography>
                  <Typography variant="body2" sx={{ color: textSecondary }}>{p.descripcion}</Typography>
                </Stack>
              </Reveal>
            ))}
          </Box>
        </Container>
      </Box>

      {/* PREGUNTAS FRECUENTES */}
      <Box id="preguntas-frecuentes" sx={{ scrollMarginTop: 84 }}>
        <Container maxWidth="md" sx={{ py: { xs: 7, md: 10 } }}>
          <Reveal>
            <Typography sx={{ display: 'block', textAlign: 'center', fontFamily: FONT_MONO, fontWeight: 600, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: SAFETY, mb: 1.5 }}>
              — Preguntas frecuentes —
            </Typography>
            <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', textAlign: 'center', fontSize: { xs: '2rem', md: '2.6rem' }, mb: 5 }}>
              Lo que más nos preguntan
            </Typography>
          </Reveal>
          <Stack spacing={1.5}>
            {faqs.map((f, i) => (
              <Reveal key={f.pregunta} delay={i * 60}>
                <Accordion
                  disableGutters
                  variant="outlined"
                  sx={{
                    borderRadius: '10px !important',
                    overflow: 'hidden',
                    borderColor,
                    '&:before': { display: 'none' },
                    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': { transform: 'rotate(45deg)' },
                  }}
                >
                  <AccordionSummary expandIcon={<AddIcon sx={{ color: SAFETY }} />}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'baseline' }}>
                      <Typography sx={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: textSecondary, opacity: 0.6 }}>
                        Q{i + 1}
                      </Typography>
                      <Typography sx={{ fontWeight: 700 }}>{f.pregunta}</Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ color: textSecondary, pl: { sm: 4.5 } }}>{f.respuesta}</Typography>
                  </AccordionDetails>
                </Accordion>
              </Reveal>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* CTA BANNER */}
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <Box
          sx={{
            height: 10,
            backgroundImage: `repeating-linear-gradient(-45deg, ${HAZARD}, ${HAZARD} 14px, ${INK} 14px, ${INK} 28px)`,
          }}
        />
        <Box sx={{ color: '#fff8ec', bgcolor: SAFETY, ...pegboard('rgba(255,255,255,0.08)') }}>
          <Container maxWidth="md" sx={{ py: { xs: 7, md: 9 }, textAlign: 'center' }}>
            <Reveal>
              <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', mb: 1.5, fontSize: { xs: '2.1rem', md: '2.8rem' } }}>
                ¿Listo para digitalizar tu taller?
              </Typography>
              <Typography sx={{ color: 'rgba(255,248,236,0.85)', mb: 3.5 }}>
                Registrate gratis y empezá a recibir reservas online hoy mismo.
              </Typography>
              <Button
                component={RouterLink}
                to="/registro"
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{ ...btnSx, fontSize: 14, bgcolor: INK, color: '#fff8ec', px: 4, boxShadow: '0 4px 0 rgba(0,0,0,0.35)', '&:hover': { bgcolor: '#000' } }}
              >
                Creá tu taller gratis
              </Button>
            </Reveal>
          </Container>
        </Box>
      </Box>

      {/* FOOTER */}
      <Box component="footer" sx={{ borderTop: '1px solid', borderColor, py: 4, mt: 'auto' }}>
        <Container maxWidth="lg">
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', alignItems: 'center', mb: 2 }}>
            <BuildIcon sx={{ fontSize: 15, color: textSecondary }} />
            <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 15, letterSpacing: '0.02em', textTransform: 'uppercase', color: textSecondary }}>
              Gestión de Talleres
            </Typography>
          </Stack>
          <Stack direction="row" spacing={{ xs: 2, sm: 3.5 }} sx={{ justifyContent: 'center', flexWrap: 'wrap', rowGap: 1, mb: 2 }}>
            {NAV_LINKS.map((link) => (
              <Typography
                key={link.id}
                component="a"
                href={`#${link.id}`}
                onClick={scrollToId(link.id)}
                sx={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase', color: textSecondary, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', '&:hover': { color: textPrimary } }}
              >
                {link.label}
              </Typography>
            ))}
            <Typography component={RouterLink} to="/login" sx={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase', color: textSecondary, fontWeight: 600, textDecoration: 'none', '&:hover': { color: textPrimary } }}>
              Iniciar sesión
            </Typography>
            <Typography component={RouterLink} to="/registro" sx={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase', color: textSecondary, fontWeight: 600, textDecoration: 'none', '&:hover': { color: textPrimary } }}>
              Creá tu taller
            </Typography>
          </Stack>
          <Typography sx={{ fontFamily: FONT_MONO, fontSize: 11, color: textSecondary, opacity: 0.7, display: 'block', textAlign: 'center' }}>
            © {new Date().getFullYear()} · Software para talleres de motos, autos, bicicletas y más
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}
