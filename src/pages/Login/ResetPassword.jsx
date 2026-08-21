import { useState } from 'react'
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { Alert, Box, Button, IconButton, InputAdornment, LinearProgress, Stack, TextField, Tooltip, Typography } from '@mui/material'
import LockIcon from '@mui/icons-material/Lock'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import BuildIcon from '@mui/icons-material/Build'
import SpeedIcon from '@mui/icons-material/Speed'
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeIcon from '@mui/icons-material/LightModeOutlined'
import { useColorMode } from '../../context/useColorMode'
import BrandMark from '../../components/BrandMark'
import TicketTag from '../../components/TicketTag'
import { resetPasswordApi } from '../../services/authApi'
import { INK, SAFETY, FONT_DISPLAY, FONT_MONO, pegboard, getWorkshopTheme } from '../../theme/workshopBrand'

export default function ResetPassword() {
  const { mode, toggleColorMode } = useColorMode()
  const dark = mode === 'dark'
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const email = searchParams.get('email') ?? ''

  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const linkInvalido = !token || !email

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await resetPasswordApi({ token, email, password, password_confirmation: passwordConfirmation })
      setDone(true)
      setTimeout(() => navigate('/login', { replace: true }), 2500)
    } catch (err) {
      const backendMessage = err.response?.data?.errors?.email?.[0] || err.response?.data?.errors?.password?.[0] || err.response?.data?.message
      setError(backendMessage || 'No pudimos actualizar la contraseña. Probá de nuevo.')
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
            <TicketTag sx={{ mb: 2.5, color: SAFETY, borderColor: SAFETY }}>N.º 000 · Nueva contraseña</TicketTag>
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
              Última{' '}
              <Box component="span" sx={{ color: SAFETY }}>
                vuelta de tuerca.
              </Box>
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.75 }}>
              Elegí una contraseña nueva y volvés a entrar al panel como siempre.
            </Typography>
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
              {linkInvalido ? (
                <>
                  <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', fontSize: '1.7rem', color: textPrimary, mb: 1 }}>
                    Link incompleto
                  </Typography>
                  <Typography variant="body2" sx={{ color: textSecondary, mb: 3 }}>
                    Este link no tiene los datos necesarios para restablecer la contraseña. Pedí uno nuevo.
                  </Typography>
                  <Button component={RouterLink} to="/olvide-password" variant="contained" fullWidth>
                    Pedir un link nuevo
                  </Button>
                </>
              ) : done ? (
                <>
                  <Box sx={{ width: 56, height: 56, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: SAFETY, color: '#fff', mb: 2.5 }}>
                    <CheckCircleIcon />
                  </Box>
                  <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', fontSize: '1.7rem', color: textPrimary, mb: 1 }}>
                    Contraseña actualizada
                  </Typography>
                  <Typography variant="body2" sx={{ color: textSecondary, mb: 3 }}>
                    Ya podés iniciar sesión con tu contraseña nueva. Te llevamos al login…
                  </Typography>
                  <Button component={RouterLink} to="/login" variant="outlined" fullWidth>
                    Ir al login ahora
                  </Button>
                </>
              ) : (
                <>
                  <TicketTag ink={!dark} sx={{ mb: 2, color: SAFETY, borderColor: SAFETY }}>
                    Elegí tu nueva contraseña
                  </TicketTag>
                  <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', fontSize: '2rem', color: textPrimary, mb: 0.5 }}>
                    Casi listo
                  </Typography>
                  <Typography variant="body2" sx={{ color: textSecondary, mb: 3 }}>
                    Restableciendo la contraseña de <strong>{email}</strong>.
                  </Typography>

                  {error && (
                    <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}

                  <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Stack spacing={2}>
                      <TextField
                        label="Contraseña nueva"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        autoFocus
                        fullWidth
                        helperText="Mínimo 6 caracteres."
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
                      <TextField
                        label="Repetí la contraseña"
                        type={showPassword ? 'text' : 'password'}
                        value={passwordConfirmation}
                        onChange={(event) => setPasswordConfirmation(event.target.value)}
                        required
                        fullWidth
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockIcon fontSize="small" />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                      <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting}>
                        {submitting ? 'Guardando…' : 'Guardar nueva contraseña'}
                      </Button>
                    </Stack>
                  </Box>

                  {submitting && <LinearProgress sx={{ mt: 2 }} />}

                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography
                      component={RouterLink}
                      to="/login"
                      variant="caption"
                      sx={{ color: textSecondary, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 0.5, '&:hover': { color: 'primary.main' } }}
                    >
                      <ArrowBackIcon sx={{ fontSize: 14 }} /> Volver al login
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  )
}
