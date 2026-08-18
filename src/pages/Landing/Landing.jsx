import { Link as RouterLink, Navigate } from 'react-router-dom'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import BuildIcon from '@mui/icons-material/Build'
import TroubleshootIcon from '@mui/icons-material/Troubleshoot'
import SpeedIcon from '@mui/icons-material/Speed'
import EngineeringIcon from '@mui/icons-material/Engineering'
import TuneIcon from '@mui/icons-material/Tune'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import StarIcon from '@mui/icons-material/Star'
import ScheduleIcon from '@mui/icons-material/Schedule'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import MapIcon from '@mui/icons-material/Map'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { useAuth } from '../../hooks/useAuth'
import { useColorMode } from '../../context/useColorMode'
import { waLinkTaller } from '../../utils/wa'
import PublicHeader from '../../components/public/PublicHeader'
import PublicFooter from '../../components/public/PublicFooter'
import WhatsAppFloat from '../../components/public/WhatsAppFloat'
import Reveal from '../../components/Reveal'

const DIRECCION = 'Av. San Martín 1234, San Miguel de Tucumán, Tucumán'
const MAPS_QUERY = encodeURIComponent(DIRECCION)
const MAPS_EMBED = `https://maps.google.com/maps?q=${MAPS_QUERY}&t=&z=15&ie=UTF8&iwloc=&output=embed`
const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`

const NAV_LINKS = [
  { label: 'Servicios', id: 'servicios' },
  { label: 'Cómo funciona', id: 'como-funciona' },
  { label: 'Trabajos', id: 'trabajos' },
  { label: 'Precios', id: 'precios' },
  { label: 'Preguntas', id: 'faq' },
  { label: 'Contacto', id: 'contacto' },
]

const servicios = [
  { icon: BuildIcon, titulo: 'Service completo', descripcion: 'Cambio de aceite, filtros y puesta a punto general para que tu moto ande como nueva.' },
  { icon: TroubleshootIcon, titulo: 'Diagnóstico y electrónica', descripcion: 'Detección de fallas en el sistema eléctrico, arranque, tablero y batería.' },
  { icon: SpeedIcon, titulo: 'Frenos', descripcion: 'Pastillas, zapatas, discos y purgado del circuito para frenar seguro.' },
  { icon: EngineeringIcon, titulo: 'Cadena y transmisión', descripcion: 'Ajuste, lubricación y cambio de kit de arrastre para no quedarte a mitad de camino.' },
  { icon: AutoFixHighIcon, titulo: 'Cubiertas y cámaras', descripcion: 'Cambio de neumáticos, reparación de pinchaduras y balanceo.' },
  { icon: TuneIcon, titulo: 'Motor y carburación', descripcion: 'Rectificaciones, carburadores e inyección para que arranque y ande pareja.' },
]

const pasos = [
  { icon: EventAvailableIcon, titulo: 'Reservá tu turno', descripcion: 'Elegí el servicio, el día y la hora desde nuestra agenda online o por WhatsApp.' },
  { icon: TwoWheelerIcon, titulo: 'Traé tu moto', descripcion: 'La revisamos, te contamos exactamente qué necesita y cuánto cuesta, sin sorpresas.' },
  { icon: CheckCircleIcon, titulo: 'Retirala lista', descripcion: 'Queda terminada, probada y con garantía en el trabajo realizado.' },
]

const reseñas = [
  { nombre: 'Juan Pérez', texto: 'Excelente atención. Me lo dejaron impecable y en el día. Lo recomiendo de verdad.' },
  { nombre: 'María Torres', texto: 'Presupuesto claro, sin vueltas y trabajo de calidad. Volví y volveré.' },
  { nombre: 'Carlos Rodríguez', texto: 'Le hicieron el service completo y la diferencia se nota. Muy serios.' },
]

const marcas = ['Motul', 'Yamalube', 'DID', 'NGK', 'Bosch', 'Pirelli', 'Michelin', 'Bridgestone']

const trabajos = [
  { icon: TuneIcon, titulo: 'Service completo', detalle: 'Honda CG 125 · 25.000 km' },
  { icon: SpeedIcon, titulo: 'Frenos', detalle: 'Yamaha FZ 250' },
  { icon: EngineeringIcon, titulo: 'Cadena y transmisión', detalle: 'Motomel 110' },
  { icon: AutoFixHighIcon, titulo: 'Cubierta nueva', detalle: 'Zanella ZB 110' },
  { icon: TroubleshootIcon, titulo: 'Electrónica y arranque', detalle: 'Gilera Smash' },
  { icon: BuildIcon, titulo: 'Rectificación de motor', detalle: 'Corven 150' },
]

const precios = [
  {
    titulo: 'Service de moto',
    precio: 'desde $25.000',
    descripcion: 'Mantenimiento periódico ideal para cuidar tu motor.',
    items: ['Aceite y filtro incluidos', 'Ajuste de cadena', 'Control general de luces y frenos'],
    destacado: false,
  },
  {
    titulo: 'Kit de arrastre',
    precio: 'desde $35.000',
    descripcion: 'Cadena, piñón y corona nuevos, listos para andar.',
    items: ['Cadena, piñón y corona', 'Montaje y ajuste', 'Lubricación incluida'],
    destacado: true,
  },
  {
    titulo: 'Cubierta + cámara',
    precio: 'desde $45.000',
    descripcion: 'Neumático nuevo montado y en condiciones para la calle.',
    items: ['Montaje de cubierta', 'Cámara nueva', 'Balanceo incluido'],
    destacado: false,
  },
]

const preguntas = [
  {
    q: '¿Cómo reservo un turno para mi moto?',
    a: 'Podés reservar online en esta web: elegís el servicio, el día y la hora, y te mostramos solo los horarios que quedan libres. También podés hacerlo por WhatsApp.',
  },
  {
    q: '¿Trabajan con cualquier marca de moto?',
    a: 'Sí. Atendemos motos nacionales e importadas, desde 50cc hasta 400cc y más, sin importar la marca.',
  },
  {
    q: '¿Cuánto tarda la reparación?',
    a: 'Depende del trabajo. Al recibir la moto te damos una estimación clara y te vamos avisando por WhatsApp cada avance.',
  },
  {
    q: '¿Dan garantía por los trabajos?',
    a: 'Sí. Todos los trabajos tienen garantía y usamos repuestos y lubricantes de primeras marcas.',
  },
  {
    q: '¿El diagnóstico tiene costo?',
    a: 'La revisión inicial se bonifica si hacés la reparación con nosotros. El presupuesto siempre se confirma antes de tocar la moto.',
  },
  {
    q: '¿Cómo puedo pagar?',
    a: 'Aceptamos efectivo, transferencia y tarjetas de crédito y débito. Consultá por promociones y planes de pago.',
  },
]

export default function Landing() {
  const { token } = useAuth()
  const { mode } = useColorMode()
  const dark = mode === 'dark'
  if (token) return <Navigate to="/panel" replace />

  const wa = waLinkTaller('Hola 👋, quiero consultar por un servicio del taller.')

  const SeccionTitulo = ({ overline, titulo, texto }) => (
    <Box sx={{ textAlign: 'center', maxWidth: 640, mx: 'auto', mb: { xs: 4, md: 5 } }}>
      {overline && (
        <Typography
          variant="overline"
          sx={{ color: (t) => t.palette.secondary.main, fontWeight: 800, letterSpacing: '0.14em' }}
        >
          {overline}
        </Typography>
      )}
      <Typography
        variant="h2"
        sx={{ fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.12, mb: 1.5, fontSize: { xs: '1.8rem', md: '2.5rem' }, color: dark ? '#fff' : 'text.primary' }}
      >
        {titulo}
      </Typography>
      {texto && (
        <Typography variant="body1" sx={{ color: dark ? 'rgba(255,255,255,0.65)' : 'text.secondary' }}>
          {texto}
        </Typography>
      )}
    </Box>
  )

  const seccionSx = { scrollMarginTop: 84, scrollSnapAlign: 'start' }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader links={NAV_LINKS} />

      {/* HERO */}
      <Box
        sx={{
          color: dark ? '#fff' : 'text.primary',
          position: 'relative',
          overflow: 'hidden',
          background: dark
            ? 'radial-gradient(1000px 500px at 85% -10%, rgba(242,116,5,0.22), transparent 60%), radial-gradient(800px 420px at 0% 110%, rgba(14,124,102,0.26), transparent 60%), #0b1513'
            : 'radial-gradient(1000px 500px at 85% -10%, rgba(242,116,5,0.12), transparent 60%), radial-gradient(800px 420px at 0% 110%, rgba(14,124,102,0.12), transparent 60%), #ffffff',
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 }, textAlign: { xs: 'center', md: 'left' } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 5, md: 4 }} sx={{ alignItems: 'center' }}>
            <Box sx={{ flex: 1, maxWidth: 640 }}>
              <Chip
                label="Taller de motos en Tucumán"
                size="small"
                sx={{ mb: 2.5, color: dark ? '#fff' : 'text.secondary', borderColor: dark ? 'rgba(255,255,255,0.25)' : 'divider', bgcolor: dark ? 'rgba(255,255,255,0.06)' : 'action.hover', fontWeight: 600, '& .MuiChip-icon': { color: (t) => t.palette.secondary.light } }}
                icon={<SpeedIcon />}
              />
              <Typography variant="h1" sx={{ fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.04, fontSize: { xs: '2.4rem', sm: '3rem', md: '3.6rem' }, mb: 2.5 }}>
                Mecánica que cuida{' '}
                <Box component="span" sx={{ background: (t) => t.custom.brandGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  tu moto
                </Box>
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 500, color: dark ? 'rgba(255,255,255,0.78)' : 'text.secondary', mb: 3.5, lineHeight: 1.55 }}>
                Diagnóstico honesto, presupuesto claro y trabajo con garantía para tu moto. Reservá tu turno online en minutos o escribinos por WhatsApp.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}>
                <Button
                  component={RouterLink}
                  to="/agendar"
                  variant="contained"
                  size="large"
                  startIcon={<CalendarMonthIcon />}
                  sx={{ background: (t) => t.custom.brandGradient, fontSize: '0.95rem', px: 3.5, py: 1.3, '&:hover': { opacity: 0.92 } }}
                >
                  Reservá tu turno
                </Button>
                {wa && (
                  <Button
                    component="a"
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    size="large"
                    startIcon={<WhatsAppIcon />}
                    sx={{ color: '#25D366', borderColor: 'rgba(37,211,102,0.55)', fontSize: '0.95rem', px: 3.5, py: 1.3, '&:hover': { borderColor: '#25D366', bgcolor: 'rgba(37,211,102,0.08)' } }}
                  >
                    Consultar por WhatsApp
                  </Button>
                )}
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 4, alignItems: { xs: 'center', sm: 'flex-start' } }}>
                {['Presupuesto sin cargo', 'Garantía en trabajos', 'Atención rápida'].map((f) => (
                  <Box key={f} sx={{ display: 'flex', alignItems: 'center', gap: 1, color: dark ? 'rgba(255,255,255,0.78)' : 'text.secondary' }}>
                    <CheckCircleIcon sx={{ fontSize: 18, color: (t) => t.palette.primary.light }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{f}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Box sx={{ flexShrink: 0, width: { xs: '100%', md: 340 }, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
              {[
                { valor: '+10', label: 'años de experiencia' },
                { valor: '+3.000', label: 'motos reparadas' },
                { valor: '24h', label: 'de respuesta' },
                { valor: '4.9★', label: 'opinión de clientes' },
              ].map((s) => (
                <Paper
                  key={s.label}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    textAlign: 'center',
                    bgcolor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(14,124,102,0.05)',
                    border: dark ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(22,32,46,0.10)',
                    borderRadius: 3,
                    backdropFilter: dark ? 'blur(6px)' : 'none',
                  }}
                >
                  <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, background: (t) => t.custom.brandGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1 }}>
                    {s.valor}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: dark ? 'rgba(255,255,255,0.6)' : 'text.secondary', mt: 0.5 }}>{s.label}</Typography>
                </Paper>
              ))}
            </Box>
          </Stack>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 5, md: 7 } }}>
            <Box
              onClick={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
                color: dark ? 'rgba(255,255,255,0.5)' : 'text.disabled',
                cursor: 'pointer',
                '&:hover': { color: (t) => t.palette.secondary.main },
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600 }}>Descubrí más</Typography>
              <KeyboardArrowDownIcon sx={{ animation: 'bounceDown 1.6s infinite' }} />
              <style>{`@keyframes bounceDown { 0%,100% { transform: translateY(0); } 50% { transform: translateY(6px); } }`}</style>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* MARCAS */}
      <Container maxWidth="lg" sx={{ py: 3.5 }}>
        <Reveal direction="none">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Lubricantes y repuestos de primeras marcas:
            </Typography>
            {marcas.map((m) => (
              <Chip key={m} label={m} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
            ))}
          </Stack>
        </Reveal>
      </Container>

      {/* SERVICIOS */}
      <Box id="servicios" sx={seccionSx}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
          <Reveal>
            <SeccionTitulo overline="Servicios" titulo="¿Qué hacemos en el taller?" texto="Todo lo que tu moto necesita, en un solo lugar y sin vueltas." />
          </Reveal>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2.5 }}>
            {servicios.map((s, i) => (
              <Reveal key={s.titulo} delay={i * 70}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%', '&:hover': { transform: 'translateY(-4px)' } }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: (t) => t.custom.brandGradient, color: '#fff', mb: 2, boxShadow: (t) => t.custom.shadow }}>
                    <s.icon />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.75 }}>{s.titulo}</Typography>
                  <Typography variant="body2" color="text.secondary">{s.descripcion}</Typography>
                </Paper>
              </Reveal>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CÓMO FUNCIONA */}
      <Box id="como-funciona" sx={{ bgcolor: 'background.paper', borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider', ...seccionSx }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
          <Reveal>
            <SeccionTitulo overline="Cómo funciona" titulo="De la reserva a la moto lista" texto="Tres pasos simples. Sin esperas innecesarias y con la información clara." />
          </Reveal>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            {pasos.map((p, i) => (
              <Reveal key={p.titulo} delay={i * 90}>
                <Stack spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 46, height: 46, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: (t) => t.palette.primary.main, color: '#fff', boxShadow: (t) => t.custom.shadow }}>
                      <p.icon fontSize="small" />
                    </Box>
                    <Typography sx={{ fontWeight: 800, color: (t) => t.palette.secondary.main }}>Paso {i + 1}</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{p.titulo}</Typography>
                  <Typography variant="body2" color="text.secondary">{p.descripcion}</Typography>
                </Stack>
              </Reveal>
            ))}
          </Box>
        </Container>
      </Box>

      {/* TRABAJOS */}
      <Box id="trabajos" sx={seccionSx}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
          <Reveal>
            <SeccionTitulo overline="Trabajos" titulo="Motos que ya salieron andando" texto="Una muestra de los trabajos que hacemos a diario en el taller." />
          </Reveal>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2.5 }}>
            {trabajos.map((t, i) => (
              <Reveal key={t.titulo} delay={i * 70}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%', textAlign: 'center', '&:hover': { transform: 'translateY(-4px)' } }}>
                  <Box sx={{ width: 52, height: 52, borderRadius: 2, mx: 'auto', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: (theme) => theme.custom.brandGradient, color: '#fff', boxShadow: (theme) => theme.custom.shadow }}>
                    <t.icon />
                  </Box>
                  <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{t.titulo}</Typography>
                  <Typography variant="body2" color="text.secondary">{t.detalle}</Typography>
                </Paper>
              </Reveal>
            ))}
          </Box>
        </Container>
      </Box>

      {/* PRECIOS */}
      <Box id="precios" sx={{ bgcolor: 'background.paper', borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider', ...seccionSx }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
          <Reveal>
            <SeccionTitulo overline="Precios" titulo="Valores orientativos" texto="Presupuesto cerrado y sin cargos ocultos. El precio final se confirma al revisar tu moto." />
          </Reveal>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2.5, alignItems: 'stretch' }}>
            {precios.map((p, i) => (
              <Reveal key={p.titulo} delay={i * 90}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3.5,
                    borderRadius: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    ...(p.destacado
                      ? { border: '2px solid', borderColor: 'primary.main', boxShadow: (t) => t.custom.shadowHover }
                      : {}),
                  }}
                >
                  {p.destacado && (
                    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: (t) => t.custom.brandGradient }} />
                  )}
                  {p.destacado && (
                    <Chip label="Más pedido" size="small" color="primary" sx={{ position: 'absolute', top: 16, right: 16, fontWeight: 700 }} />
                  )}
                  <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>{p.titulo}</Typography>
                  <Typography sx={{ fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-0.02em', my: 1 }}>{p.precio}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{p.descripcion}</Typography>
                  <Stack spacing={1} sx={{ mb: 3, flex: 1 }}>
                    {p.items.map((item) => (
                      <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon sx={{ fontSize: 17, color: 'primary.main' }} />
                        <Typography variant="body2">{item}</Typography>
                      </Box>
                    ))}
                  </Stack>
                  <Button
                    component={RouterLink}
                    to="/agendar"
                    variant={p.destacado ? 'contained' : 'outlined'}
                    color={p.destacado ? 'primary' : 'inherit'}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ color: p.destacado ? undefined : 'text.primary' }}
                  >
                    Reservar este trabajo
                  </Button>
                </Paper>
              </Reveal>
            ))}
          </Box>
        </Container>
      </Box>

      {/* RESEÑAS */}
      <Box id="opiniones" sx={seccionSx}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
          <Reveal>
            <SeccionTitulo overline="Opiniones" titulo="Lo que dicen nuestros clientes" />
          </Reveal>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2.5 }}>
            {reseñas.map((r, i) => (
              <Reveal key={r.nombre} delay={i * 90}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                  <Stack direction="row" spacing={0.5} sx={{ mb: 1.5 }}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <StarIcon key={j} sx={{ fontSize: 18, color: (t) => t.palette.warning.main }} />
                    ))}
                  </Stack>
                  <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>“{r.texto}”</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{r.nombre}</Typography>
                </Paper>
              </Reveal>
            ))}
          </Box>
        </Container>
      </Box>

      {/* FAQ */}
      <Box id="faq" sx={{ bgcolor: 'background.paper', borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider', ...seccionSx }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
          <Reveal>
            <SeccionTitulo overline="Preguntas frecuentes" titulo="Dudas que siempre nos consultan" texto="Si no encontrás tu respuesta, escribinos por WhatsApp y te ayudamos." />
          </Reveal>
          <Box sx={{ maxWidth: 780, mx: 'auto' }}>
            {preguntas.map((p, i) => (
              <Reveal key={p.q} delay={i * 60} direction="none">
                <Accordion
                  slotProps={{ transition: { unmountOnExit: true } }}
                  sx={{
                    mb: 1.5,
                    borderRadius: 2,
                    '&:before': { display: 'none' },
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 'none',
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ '& .MuiAccordionSummary-content': { my: 1.5 } }}>
                    <Typography sx={{ fontWeight: 700 }}>{p.q}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary">{p.a}</Typography>
                  </AccordionDetails>
                </Accordion>
              </Reveal>
            ))}
          </Box>
        </Container>
      </Box>

      {/* UBICACIÓN */}
      <Box id="ubicacion" sx={seccionSx}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
          <Reveal>
            <SeccionTitulo overline="Ubicación" titulo="Encontrarnos es fácil" texto="Estamos en el centro de la ciudad, con fácil estacionamiento. Tocá el mapa para abrir la dirección directamente en Google Maps." />
          </Reveal>
          <Reveal delay={120}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' }, gap: { xs: 3, md: 5 }, alignItems: 'center' }}>
              <Stack spacing={1.5} sx={{ mb: { xs: 1, md: 0 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <LocationOnIcon sx={{ fontSize: 22, color: (t) => t.palette.secondary.main }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{DIRECCION}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <ScheduleIcon sx={{ fontSize: 22, color: (t) => t.palette.secondary.main }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>Lun a Vie 8:00–18:00 · Sáb 8:00–13:00</Typography>
                </Box>
                <Button
                  component="a"
                  href={MAPS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="contained"
                  size="large"
                  startIcon={<MapIcon />}
                  sx={{ background: (t) => t.custom.brandGradient, px: 3.5, alignSelf: { xs: 'center', md: 'flex-start' }, '&:hover': { opacity: 0.92 } }}
                >
                  Cómo llegar (Google Maps)
                </Button>
              </Stack>
              <Box
                component="iframe"
                src={MAPS_EMBED}
                title="Ubicación del taller en Google Maps"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                sx={{ width: '100%', height: { xs: 280, md: 380 }, border: 0, borderRadius: 3, display: 'block', boxShadow: (t) => t.custom.shadow }}
              />
            </Box>
          </Reveal>
        </Container>
      </Box>

      {/* CTA BANNER */}
      <Box sx={{ color: '#fff', background: (t) => t.custom.brandGradient, position: 'relative', overflow: 'hidden' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 }, textAlign: 'center' }}>
          <Reveal>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, mb: 1.5, fontSize: { xs: '1.7rem', md: '2.4rem' } }}>
              ¿Tenés un problema con tu moto?
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.85)', mb: 3, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
              Reservá tu turno online o escribinos por WhatsApp. Te respondemos rápido.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'center' }}>
              <Button component={RouterLink} to="/agendar" variant="contained" size="large" startIcon={<CalendarMonthIcon />} sx={{ bgcolor: '#fff', color: '#0b1513', fontSize: '0.95rem', px: 3.5, '&:hover': { bgcolor: '#f0f0f0' } }}>
                Reservá tu turno
              </Button>
              {wa && (
                <Button component="a" href={wa} target="_blank" rel="noopener noreferrer" variant="outlined" size="large" startIcon={<WhatsAppIcon />} sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', px: 3.5, '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                  Escribinos por WhatsApp
                </Button>
              )}
            </Stack>
          </Reveal>
        </Container>
      </Box>

      <Divider sx={{ borderColor: dark ? 'rgba(255,255,255,0.1)' : 'divider' }} />
      <PublicFooter />
      <WhatsAppFloat />
    </Box>
  )
}