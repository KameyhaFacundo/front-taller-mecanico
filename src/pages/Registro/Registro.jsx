import { useState } from 'react'
import { Link as RouterLink, Navigate, useNavigate } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { Alert, Box, Button, IconButton, InputAdornment, Stack, TextField, Tooltip, Typography } from '@mui/material'
import StorefrontIcon from '@mui/icons-material/Storefront'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeIcon from '@mui/icons-material/LightModeOutlined'
import { useAuth } from '../../hooks/useAuth'
import { useColorMode } from '../../context/useColorMode'
import { registerApi } from '../../services/authApi'
import BrandMark from '../../components/BrandMark'
import TicketTag from '../../components/TicketTag'
import { INK, CONCRETE, SAFETY, FONT_DISPLAY, pegboard, getWorkshopTheme } from '../../theme/workshopBrand'

export default function Registro() {
  const { token, login } = useAuth()
  const { mode, toggleColorMode } = useColorMode()
  const dark = mode === 'dark'
  const navigate = useNavigate()
  const [form, setForm] = useState({ nombre_taller: '', name: '', email: '', password: '', password_confirmation: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (token) {
    return <Navigate to="/panel" replace />
  }

  const handleChange = (field) => (event) => setForm((f) => ({ ...f, [field]: event.target.value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (form.password !== form.password_confirmation) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setSubmitting(true)
    try {
      await registerApi({
        nombre_taller: form.nombre_taller,
        name: form.name,
        email: form.email,
        password: form.password,
      })
      // El registro siempre crea exactamente una membresía (admin del taller
      // nuevo), así que un login inmediato con las mismas credenciales entra
      // derecho al panel sin pasar por el selector de talleres.
      await login(form.email, form.password)
      navigate('/bienvenida', { replace: true })
    } catch (err) {
      const message = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(' ')
        : 'No pudimos crear la cuenta. Revisá los datos e intentá de nuevo.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const textPrimary = dark ? '#f3ede0' : INK
  const textSecondary = dark ? 'rgba(243,237,224,0.66)' : '#57534a'
  const borderColor = dark ? 'rgba(243,237,224,0.14)' : 'rgba(24,20,15,0.14)'
  const pageBg = dark ? INK : CONCRETE

  return (
    <ThemeProvider theme={getWorkshopTheme(mode)}>
      <Box sx={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', bgcolor: pageBg, ...pegboard(dark ? 'rgba(243,237,224,0.05)' : 'rgba(24,20,15,0.05)') }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', p: { xs: 2, sm: 3 } }}>
          <BrandMark color={textPrimary} size={17} iconSize={30} />
          <Tooltip title={dark ? 'Modo claro' : 'Modo oscuro'}>
            <IconButton size="small" onClick={toggleColorMode} sx={{ borderRadius: 1, color: textSecondary, border: '1px solid', borderColor }}>
              {dark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Stack>

        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
          <Box sx={{ width: '100%', maxWidth: 440 }}>
            <TicketTag ink={!dark} sx={{ mb: 2, color: SAFETY, borderColor: SAFETY }}>
              N.º 000 · Alta de taller
            </TicketTag>
            <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', fontSize: { xs: '2rem', sm: '2.3rem' }, color: textPrimary, lineHeight: 1, mb: 0.75 }}>
              Creá tu taller
            </Typography>
            <Typography variant="body2" sx={{ color: textSecondary, mb: 3 }}>
              Registrá tu taller y tu cuenta de administrador para empezar a usar el panel.
            </Typography>

            {error && (
              <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2}>
                <TextField
                  label="Nombre del taller"
                  value={form.nombre_taller}
                  onChange={handleChange('nombre_taller')}
                  required
                  fullWidth
                  autoFocus
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><StorefrontIcon fontSize="small" /></InputAdornment> } }}
                />
                <TextField
                  label="Tu nombre"
                  value={form.name}
                  onChange={handleChange('name')}
                  required
                  fullWidth
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><PersonIcon fontSize="small" /></InputAdornment> } }}
                />
                <TextField
                  label="Correo electrónico"
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  required
                  fullWidth
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" /></InputAdornment> } }}
                />
                <TextField
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange('password')}
                  required
                  fullWidth
                  helperText="Mínimo 6 caracteres"
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" /></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <TextField
                  label="Repetir contraseña"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password_confirmation}
                  onChange={handleChange('password_confirmation')}
                  required
                  fullWidth
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" /></InputAdornment> } }}
                />
                <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting}>
                  {submitting ? 'Creando taller…' : 'Crear taller'}
                </Button>
              </Stack>
            </Box>

            <Box sx={{ mt: 2.5, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: textSecondary }}>
                ¿Ya tenés una cuenta?{' '}
                <Typography component={RouterLink} to="/login" variant="caption" sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  Iniciá sesión
                </Typography>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  )
}
