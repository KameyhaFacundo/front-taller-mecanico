import { useState } from 'react'
import { Link as RouterLink, Navigate } from 'react-router-dom'
import { Box, Button, Container, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material'
import StoreIcon from '@mui/icons-material/Store'
import BuildIcon from '@mui/icons-material/Build'
import ShareIcon from '@mui/icons-material/Share'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { useAuth } from '../../hooks/useAuth'
import { useColorMode } from '../../context/useColorMode'
import { INK, CONCRETE, SAFETY, FONT_DISPLAY, FONT_MONO, pegboard, btnSx, getWorkshopTheme } from '../../theme/workshopBrand'
import { ThemeProvider } from '@mui/material/styles'

const PASOS = [
  {
    numero: '01',
    titulo: 'Completá los datos de tu taller',
    descripcion: 'Nombre, dirección, horario, WhatsApp y tipo de vehículo. Son los datos que verán tus clientes.',
    icon: StoreIcon,
    to: '/configuracion',
    label: 'Ir a Configuración',
  },
  {
    numero: '02',
    titulo: 'Cargá tus servicios',
    descripcion: 'Agregá todo lo que ofrecés para que tus clientes puedan reservar online.',
    icon: BuildIcon,
    to: '/servicios',
    label: 'Ir a Servicios',
  },
  {
    numero: '03',
    titulo: 'Compartí tu link',
    descripcion: 'Copiá tu página pública y pasala por WhatsApp, redes o pegala donde quieras.',
    icon: ShareIcon,
    accion: 'link',
    label: 'Copiar link',
  },
]

export default function Bienvenida() {
  const { token, activeTaller } = useAuth()
  const { mode } = useColorMode()
  const dark = mode === 'dark'
  const [copiado, setCopiado] = useState(false)

  if (!token) return <Navigate to="/login" replace />

  const textPrimary = dark ? '#f3ede0' : INK
  const textSecondary = dark ? 'rgba(243,237,224,0.66)' : '#57534a'
  const borderColor = dark ? 'rgba(243,237,224,0.14)' : 'rgba(24,20,15,0.14)'
  const pageBg = dark ? INK : CONCRETE
  const linkPublico = activeTaller ? window.location.origin + '/taller/' + activeTaller.slug : ''

  const copiarLink = async () => {
    if (!linkPublico) return
    try {
      await navigator.clipboard.writeText(linkPublico)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      setCopiado(false)
    }
  }

  return (
    <ThemeProvider theme={getWorkshopTheme(mode)}>
      <Box sx={{ minHeight: '100svh', bgcolor: pageBg, color: textPrimary, display: 'flex', flexDirection: 'column', ...pegboard(dark ? 'rgba(243,237,224,0.05)' : 'rgba(24,20,15,0.05)') }}>
        <Container maxWidth="md" sx={{ flex: 1, py: { xs: 4, md: 8 } }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
            <Typography sx={{ display: 'block', fontFamily: FONT_MONO, fontWeight: 600, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: SAFETY, mb: 1.5 }}>
              Bienvenido
            </Typography>
            <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.005em', lineHeight: 0.98, fontSize: { xs: '2.4rem', sm: '3.2rem' }, mb: 2 }}>
              Tu taller está creado
            </Typography>
            <Typography variant="h6" sx={{ color: textSecondary, fontWeight: 500, maxWidth: 520, mx: 'auto' }}>
              Seguí estos 3 pasos para empezar a recibir turnos online.
            </Typography>
          </Box>

          <Stack spacing={2.5} sx={{ mb: 5 }}>
            {PASOS.map((paso) => {
              const Icono = paso.icon
              const esLink = paso.accion === 'link'
              return (
                <Paper key={paso.numero} variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 2, borderColor, bgcolor: dark ? 'rgba(255,255,255,0.03)' : '#fffaf0' }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}>
                    <Box sx={{ width: 52, height: 52, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: SAFETY, color: '#fff', flexShrink: 0, transform: 'rotate(-3deg)', boxShadow: '0 3px 0 rgba(0,0,0,0.15)' }}>
                      <Icono fontSize="medium" />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 0.5 }}>
                        <Typography sx={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color: SAFETY, letterSpacing: '0.08em' }}>
                          PASO {paso.numero}
                        </Typography>
                      </Stack>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{paso.titulo}</Typography>
                      <Typography variant="body2" sx={{ color: textSecondary }}>{paso.descripcion}</Typography>
                      {esLink && linkPublico && (
                        <Stack direction="row" spacing={1} sx={{ mt: 1.5, alignItems: 'center' }}>
                          <Typography sx={{ fontFamily: FONT_MONO, fontSize: 12, color: textSecondary, bgcolor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(24,20,15,0.05)', px: 1.5, py: 0.75, borderRadius: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: { xs: '100%', sm: 360 } }}>
                            {linkPublico}
                          </Typography>
                          <Tooltip title={copiado ? 'Copiado' : 'Copiar link'}>
                            <IconButton size="small" onClick={copiarLink} sx={{ color: SAFETY, border: '1px solid', borderColor: SAFETY, borderRadius: 1 }}>
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      )}
                    </Box>
                    {!esLink && (
                      <Button component={RouterLink} to={paso.to} variant="outlined" size="small" sx={{ ...btnSx, flexShrink: 0, color: textPrimary, borderColor: dark ? 'rgba(243,237,224,0.3)' : 'rgba(24,20,15,0.3)', '&:hover': { borderColor: textPrimary, bgcolor: 'transparent' } }}>
                        {paso.label}
                      </Button>
                    )}
                  </Stack>
                </Paper>
              )
            })}
          </Stack>

          <Box sx={{ textAlign: 'center' }}>
            <Button component={RouterLink} to="/panel" variant="contained" size="large" endIcon={<ArrowForwardIcon />} sx={{ ...btnSx, bgcolor: SAFETY, color: '#fff', px: 4, boxShadow: '0 4px 0 ' + SAFETY, '&:hover': { bgcolor: SAFETY, opacity: 0.92 } }}>
              Ir al panel
            </Button>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  )
}
