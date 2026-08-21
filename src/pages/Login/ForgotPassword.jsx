import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { Alert, Box, Button, IconButton, InputAdornment, LinearProgress, Stack, TextField, Tooltip, Typography } from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead'
import BuildIcon from '@mui/icons-material/Build'
import SpeedIcon from '@mui/icons-material/Speed'
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeIcon from '@mui/icons-material/LightModeOutlined'
import { useColorMode } from '../../context/useColorMode'
import BrandMark from '../../components/BrandMark'
import TicketTag from '../../components/TicketTag'
import { forgotPasswordApi } from '../../services/authApi'
import { INK, SAFETY, FONT_DISPLAY, FONT_MONO, pegboard, getWorkshopTheme } from '../../theme/workshopBrand'

export default function ForgotPassword() {
  const { mode, toggleColorMode } = useColorMode()
  const dark = mode === 'dark'
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await forgotPasswordApi(email)
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message || 'No pudimos procesar el pedido. Probá de nuevo.')
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
            <TicketTag sx={{ mb: 2.5, color: SAFETY, borderColor: SAFETY }}>N.º 000 · Recuperación de acceso</TicketTag>
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
              Pasa,{' '}
              <Box component="span" sx={{ color: SAFETY }}>
                que te ayudamos.
              </Box>
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.75 }}>
              Te mandamos un link por mail para que elijas una contraseña nueva y sigas trabajando.
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
              {sent ? (
                <>
                  <Box sx={{ width: 56, height: 56, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: SAFETY, color: '#fff', mb: 2.5 }}>
                    <MarkEmailReadIcon />
                  </Box>
                  <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', fontSize: '1.7rem', color: textPrimary, mb: 1 }}>
                    Revisá tu correo
                  </Typography>
                  <Typography variant="body2" sx={{ color: textSecondary, mb: 3 }}>
                    Si <strong>{email}</strong> está registrado, te llegó un mail con un link para elegir una contraseña nueva. Puede tardar unos minutos — revisá también spam.
                  </Typography>
                  <Button component={RouterLink} to="/login" variant="outlined" fullWidth startIcon={<ArrowBackIcon />}>
                    Volver al login
                  </Button>
                </>
              ) : (
                <>
                  <TicketTag ink={!dark} sx={{ mb: 2, color: SAFETY, borderColor: SAFETY }}>
                    Recuperar acceso
                  </TicketTag>
                  <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 800, textTransform: 'uppercase', fontSize: '2rem', color: textPrimary, mb: 0.5 }}>
                    ¿Olvidaste tu contraseña?
                  </Typography>
                  <Typography variant="body2" sx={{ color: textSecondary, mb: 3 }}>
                    Ingresá el correo con el que te registraste y te mandamos un link para elegir una nueva.
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
                      <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting}>
                        {submitting ? 'Enviando…' : 'Enviar link de recuperación'}
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
