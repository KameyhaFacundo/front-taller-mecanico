import { useState } from 'react'
import { Link as RouterLink, Navigate, useNavigate } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { Alert, Box, Button, IconButton, InputAdornment, LinearProgress, Stack, TextField, Tooltip, Typography } from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import SpeedIcon from '@mui/icons-material/Speed'
import BuildIcon from '@mui/icons-material/Build'
import CheckIcon from '@mui/icons-material/Check'
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeIcon from '@mui/icons-material/LightModeOutlined'
import { useAuth } from '../../hooks/useAuth'
import { useColorMode } from '../../context/useColorMode'
import BrandMark from '../../components/BrandMark'
import TicketTag from '../../components/TicketTag'
import { INK, SAFETY, FONT_DISPLAY, FONT_MONO, pegboard, getWorkshopTheme } from '../../theme/workshopBrand'

const features = [
  'Órdenes de trabajo con control de stock automático',
  'Turnos online que tus clientes solicitan solos',
  'Caja, cobros y reportes financieros en tiempo real',
]

export default function Login() {
  const { token, activeTallerId, login } = useAuth()
  const { mode, toggleColorMode } = useColorMode()
  const dark = mode === 'dark'
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (token) {
    return <Navigate to={activeTallerId ? '/panel' : '/seleccionar-taller'} replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { memberships } = await login(email, password)
      navigate(memberships.length > 1 ? '/seleccionar-taller' : '/panel', { replace: true })
    } catch (err) {
      const backendMessage = err.response?.data?.errors?.email?.[0] || err.response?.data?.message
      setError(backendMessage || 'Credenciales inválidas. Verificá tu correo y contraseña.')
    } finally {
      setSubmitting(false)
    }
  }

  const textPrimary = dark ? '#f3ede0' : INK
  const textSecondary = dark ? 'rgba(243,237,224,0.66)' : '#57534a'
  const pageBg = dark ? INK : '#e9e4d8'

  return (
    <ThemeProvider theme={getWorkshopTheme(mode)}>
      <Box sx={{ minHeight: '100svh', display: 'flex', bgcolor: pageBg }}>
        <Box
          sx={{
            display: { xs: 'none', lg: 'flex' },
            width: '46%',
            position: 'relative',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 5,
            color: '#f3ede0',
            overflow: 'hidden',
            bgcolor: INK,
            ...pegboard('rgba(243,237,224,0.06)'),
          }}
        >
          <Box sx={{ position: 'absolute', inset: 0, opacity: 0.07, pointerEvents: 'none', color: SAFETY }}>
            <Box sx={{ position: 'absolute', top: '15%', left: '10%', transform: 'rotate(-15deg)' }}>
              <BuildIcon sx={{ fontSize: 180 }} />
            </Box>
            <Box sx={{ position: 'absolute', bottom: '18%', right: '12%', transform: 'rotate(10deg)' }}>
              <SpeedIcon sx={{ fontSize: 220 }} />
            </Box>
          </Box>

          <Box sx={{ position: 'relative' }}>
            <BrandMark color="#f3ede0" />
          </Box>

          <Box sx={{ position: 'relative', maxWidth: 420 }}>
            <TicketTag sx={{ mb: 2.5, color: SAFETY, borderColor: SAFETY }}>N.º 000 · Panel de gestión</TicketTag>
            <Typography
              sx={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.005em',
                lineHeight: 0.98,
                mb: 2,
                fontSize: { lg: '2.6rem', xl: '3rem' },
              }}
            >
              Tu taller,{' '}
              <Box component="span" sx={{ color: SAFETY }}>
                digital.
              </Box>
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.75, mb: 3 }}>
              Todo el taller en un solo lugar: clientes, turnos, órdenes, stock, caja y reportes.
            </Typography>
            <Stack spacing={1.5}>
              {features.map((feature) => (
                <Box key={feature} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CheckIcon sx={{ color: SAFETY, fontSize: 20, flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {feature}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          <Typography sx={{ position: 'relative', opacity: 0.5, fontFamily: FONT_MONO, fontSize: 11 }}>
            © {new Date().getFullYear()} · Gestión de Talleres
          </Typography>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: { xs: 2, sm: 4 } }}>
          <Stack direction="row" sx={{ justifyContent: { xs: 'flex-end', lg: 'space-between' }, alignItems: 'center', mb: { xs: 2, lg: 0 } }}>
            <Box sx={{ display: { xs: 'none', lg: 'flex' } }} />
            <Box sx={{ display: { xs: 'flex', lg: 'none' }, mr: 'auto' }}>
              <BrandMark color={textPrimary} size={17} iconSize={30} />
            </Box>
            <Tooltip title={dark ? 'Modo claro' : 'Modo oscuro'}>
              <IconButton
                size="small"
                onClick={toggleColorMode}
                sx={{ borderRadius: 1, color: textSecondary, border: '1px solid', borderColor: dark ? 'rgba(243,237,224,0.14)' : 'rgba(24,20,15,0.14)' }}
              >
                {dark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Stack>

          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ width: '100%', maxWidth: 400 }}>
              <TicketTag ink={!dark} sx={{ mb: 2, color: SAFETY, borderColor: SAFETY }}>
                Acceso al panel
              </TicketTag>
              <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', fontSize: '2rem', color: textPrimary, mb: 0.5 }}>
                Hola, bienvenido
              </Typography>
              <Typography variant="body2" sx={{ color: textSecondary, mb: 3 }}>
                Ingresá con tu cuenta para acceder al panel de gestión.
              </Typography>

              {error && (
                <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={2}>
                  <TextField
                    label="Correo electrónico"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    autoFocus
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                  <TextField
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon fontSize="small" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} edge="end">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                  <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting}>
                    {submitting ? 'Ingresando…' : 'Ingresar al panel'}
                  </Button>
                </Stack>
              </Box>

              {submitting && <LinearProgress sx={{ mt: 2 }} />}

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: textSecondary }}>
                  ¿No tenés cuenta?{' '}
                  <Typography component={RouterLink} to="/registro" variant="caption" sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                    Creá tu taller
                  </Typography>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  )
}
