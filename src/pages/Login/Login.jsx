import { useState } from 'react'
import { Link as RouterLink, Navigate, useNavigate } from 'react-router-dom'
import { Alert, Box, Button, IconButton, InputAdornment, LinearProgress, Stack, TextField, Typography } from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import SpeedIcon from '@mui/icons-material/Speed'
import BuildIcon from '@mui/icons-material/Build'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useAuth } from '../../hooks/useAuth'
import { useColorMode } from '../../context/useColorMode'

const features = [
  'Órdenes de trabajo con control de stock automático',
  'Turnos online que tus clientes solicitan solos',
  'Caja, cobros y reportes financieros en tiempo real',
]

export default function Login() {
  const { token, login } = useAuth()
  const { mode } = useColorMode()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (token) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch {
      setError('Credenciales inválidas. Verificá tu correo y contraseña.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100svh', display: 'flex', bgcolor: 'background.default' }}>
      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' },
          width: '46%',
          position: 'relative',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 5,
          color: '#fff',
          overflow: 'hidden',
          background: mode === 'dark' ? 'linear-gradient(160deg, #0a0f0d 0%, #10261f 60%, #0d1714 100%)' : 'linear-gradient(160deg, #0a2e26 0%, #0e4d3f 60%, #11664f 100%)',
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, opacity: 0.08, pointerEvents: 'none' }}>
          <Box sx={{ position: 'absolute', top: '15%', left: '10%', transform: 'rotate(-15deg)' }}>
            <BuildIcon sx={{ fontSize: 180 }} />
          </Box>
          <Box sx={{ position: 'absolute', bottom: '18%', right: '12%', transform: 'rotate(10deg)' }}>
            <SpeedIcon sx={{ fontSize: 220 }} />
          </Box>
        </Box>

        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 52, height: 52, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center', background: (t) => t.custom.brandGradient, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
            <SpeedIcon />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              Exe-Mecanica
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Gestión integral del taller
            </Typography>
          </Box>
        </Box>

        <Box sx={{ position: 'relative', maxWidth: 420 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, mb: 2, fontSize: { xl: '2.4rem' } }}>
            Tu taller,{' '}
            <Box component="span" sx={{ background: (t) => t.custom.brandGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              digital.
            </Box>
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.75, mb: 3 }}>
            Todo el taller en un solo lugar: clientes, turnos, órdenes, stock, caja y reportes.
          </Typography>
          <Stack spacing={1.5}>
            {features.map((feature) => (
              <Box key={feature} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CheckCircleIcon sx={{ color: (t) => t.palette.primary.light, fontSize: 20 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {feature}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        <Typography variant="caption" sx={{ position: 'relative', opacity: 0.5 }}>
          © {new Date().getFullYear()} Exe-Mecanica · Panel de gestión
        </Typography>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2, sm: 4 } }}>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Box sx={{ display: { xs: 'flex', lg: 'none' }, alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 4 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: (t) => t.custom.brandGradient, color: '#fff' }}>
              <SpeedIcon fontSize="small" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Exe-Mecanica
            </Typography>
          </Box>

          <Typography variant="h4" gutterBottom>
            Hola, bienvenido
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
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
          <Box sx={{ mt: 2.5, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              ¿Querés pedir un turno?{' '}
              <Typography component={RouterLink} to="/agendar" variant="caption" sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Solicitá uno online
              </Typography>
            </Typography>
          </Box>

          {submitting && <LinearProgress sx={{ mt: 2 }} />}
        </Box>
      </Box>
    </Box>
  )
}
