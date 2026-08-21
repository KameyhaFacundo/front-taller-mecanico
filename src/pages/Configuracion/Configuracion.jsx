import { useEffect, useState } from 'react'
import { Box, Button, Chip, Grid, IconButton, InputAdornment, Paper, Skeleton, Stack, TextField, Tooltip, Typography } from '@mui/material'
import StoreIcon from '@mui/icons-material/Store'
import LockIcon from '@mui/icons-material/Lock'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { getConfiguracion, updateConfiguracion } from '../../services/configuracionApi'
import { updatePasswordApi } from '../../services/authApi'
import { useAsyncData } from '../../hooks/useAsyncData'
import { useAuth } from '../../hooks/useAuth'
import { useNotify } from '../../context/useNotify'
import PageHeader from '../../components/PageHeader'

const emptyPasswordForm = { current_password: '', password: '', password_confirmation: '' }

// Orden de exhibición lunes-a-domingo; el value es el dayOfWeek de Carbon en
// el backend (0=domingo), no el orden de la semana argentina.
const DIAS = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
  { value: 0, label: 'Dom' },
]

export default function Configuracion() {
  const notify = useNotify()
  const { role, activeTaller } = useAuth()
  const esAdmin = role === 'admin'
  const linkPublico = activeTaller ? `${window.location.origin}/taller/${activeTaller.slug}` : ''

  const copiarLinkPublico = async () => {
    try {
      await navigator.clipboard.writeText(linkPublico)
      notify.success('Link copiado.')
    } catch {
      notify.error('No se pudo copiar el link.')
    }
  }

  const config = useAsyncData(getConfiguracion, { errorMessage: 'No se pudo cargar la configuración del negocio.' })
  const [negocio, setNegocio] = useState({
    nombre_negocio: '',
    tipo_vehiculo: '',
    direccion: '',
    whatsapp: '',
    whatsapp_phone_number_id: '',
    dias_laborables: [1, 2, 3, 4, 5],
    hora_apertura: '08:00',
    hora_cierre: '20:00',
  })
  const [guardandoNegocio, setGuardandoNegocio] = useState(false)

  useEffect(() => {
    if (config.data) {
      setNegocio({
        nombre_negocio: config.data.nombre_negocio ?? '',
        tipo_vehiculo: config.data.tipo_vehiculo ?? '',
        direccion: config.data.direccion ?? '',
        whatsapp: config.data.whatsapp ?? '',
        whatsapp_phone_number_id: config.data.whatsapp_phone_number_id ?? '',
        dias_laborables: config.data.dias_laborables ?? [1, 2, 3, 4, 5],
        hora_apertura: config.data.hora_apertura ?? '08:00',
        hora_cierre: config.data.hora_cierre ?? '20:00',
      })
    }
  }, [config.data])

  const toggleDia = (dia) =>
    setNegocio((prev) => ({
      ...prev,
      dias_laborables: prev.dias_laborables.includes(dia) ? prev.dias_laborables.filter((d) => d !== dia) : [...prev.dias_laborables, dia].sort((a, b) => a - b),
    }))

  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm)
  const [guardandoPassword, setGuardandoPassword] = useState(false)

  const handleNegocioSubmit = async (event) => {
    event.preventDefault()
    setGuardandoNegocio(true)
    try {
      await updateConfiguracion({
        nombre_negocio: negocio.nombre_negocio.trim(),
        tipo_vehiculo: negocio.tipo_vehiculo.trim() || null,
        direccion: negocio.direccion.trim() || null,
        whatsapp: negocio.whatsapp.trim() || null,
        whatsapp_phone_number_id: negocio.whatsapp_phone_number_id.trim() || null,
        dias_laborables: negocio.dias_laborables,
        hora_apertura: negocio.hora_apertura,
        hora_cierre: negocio.hora_cierre,
      })
      notify.success('Datos del negocio actualizados.')
      config.refresh()
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo guardar los datos del negocio.')
    } finally {
      setGuardandoNegocio(false)
    }
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    if (passwordForm.password !== passwordForm.password_confirmation) {
      notify.error('La nueva contraseña y su confirmación no coinciden.')
      return
    }
    setGuardandoPassword(true)
    try {
      await updatePasswordApi(passwordForm)
      notify.success('Contraseña actualizada.')
      setPasswordForm(emptyPasswordForm)
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo cambiar la contraseña. Verificá la contraseña actual.')
    } finally {
      setGuardandoPassword(false)
    }
  }

  return (
    <Box>
      <PageHeader title="Configuración" subtitle="Datos del negocio y de tu cuenta." />

      <Grid container spacing={3}>
        {esAdmin && (
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'primary.main', color: '#fff', flexShrink: 0 }}>
                <StoreIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Negocio
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Nombre y datos públicos que ve la gente en tu página de reservas.
                </Typography>
              </Box>
            </Stack>
            {config.loading ? (
              <Skeleton variant="rounded" height={56} />
            ) : (
              <Box component="form" onSubmit={handleNegocioSubmit}>
                <Stack spacing={2}>
                  <TextField label="Nombre del negocio" value={negocio.nombre_negocio} onChange={(e) => setNegocio((prev) => ({ ...prev, nombre_negocio: e.target.value }))} required fullWidth />
                  <TextField
                    label="Tipo de vehículo"
                    value={negocio.tipo_vehiculo}
                    onChange={(e) => setNegocio((prev) => ({ ...prev, tipo_vehiculo: e.target.value }))}
                    placeholder="Motos, autos, bicicletas…"
                    fullWidth
                  />
                  <TextField label="Dirección" value={negocio.direccion} onChange={(e) => setNegocio((prev) => ({ ...prev, direccion: e.target.value }))} fullWidth />
                  <TextField
                    label="WhatsApp"
                    value={negocio.whatsapp}
                    onChange={(e) => setNegocio((prev) => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="+54 9 11 0000 0000"
                    helperText="El número que ven tus clientes (botón de WhatsApp de tu página)."
                    fullWidth
                  />
                  <TextField
                    label="Phone Number ID de WhatsApp Business (Meta)"
                    value={negocio.whatsapp_phone_number_id}
                    onChange={(e) => setNegocio((prev) => ({ ...prev, whatsapp_phone_number_id: e.target.value }))}
                    placeholder="Ej: 109876543210987"
                    helperText="Solo si conectaste el bot de WhatsApp: es el ID técnico de Meta para tu número (no el número en sí). Con esto el sistema sabe que los mensajes de ese número son tuyos."
                    fullWidth
                  />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Días de atención
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                      {DIAS.map((dia) => (
                        <Chip
                          key={dia.value}
                          label={dia.label}
                          onClick={() => toggleDia(dia.value)}
                          color={negocio.dias_laborables.includes(dia.value) ? 'primary' : 'default'}
                          variant={negocio.dias_laborables.includes(dia.value) ? 'filled' : 'outlined'}
                        />
                      ))}
                    </Stack>
                    {negocio.dias_laborables.length === 0 && (
                      <Typography variant="caption" color="error">
                        Elegí al menos un día.
                      </Typography>
                    )}
                  </Box>
                  <Stack direction="row" spacing={2}>
                    <TextField
                      label="Hora de apertura"
                      type="time"
                      value={negocio.hora_apertura}
                      onChange={(e) => setNegocio((prev) => ({ ...prev, hora_apertura: e.target.value }))}
                      fullWidth
                      required
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <TextField
                      label="Hora de cierre"
                      type="time"
                      value={negocio.hora_cierre}
                      onChange={(e) => setNegocio((prev) => ({ ...prev, hora_cierre: e.target.value }))}
                      fullWidth
                      required
                      error={negocio.hora_cierre <= negocio.hora_apertura}
                      helperText={negocio.hora_cierre <= negocio.hora_apertura ? 'Tiene que ser después de la apertura' : ' '}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Esto define tanto lo que ven tus clientes en tu página pública como los horarios que se ofrecen para pedir un turno — fuera de este rango no se puede reservar.
                  </Typography>
                  {linkPublico && (
                    <TextField
                      label="Página pública para reservar turnos"
                      value={linkPublico}
                      fullWidth
                      slotProps={{
                        input: {
                          readOnly: true,
                          endAdornment: (
                            <InputAdornment position="end">
                              <Tooltip title="Copiar link">
                                <IconButton size="small" onClick={copiarLinkPublico}>
                                  <ContentCopyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Abrir en una pestaña nueva">
                                <IconButton size="small" component="a" href={linkPublico} target="_blank" rel="noopener noreferrer">
                                  <OpenInNewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  )}
                  <Box>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={guardandoNegocio || !negocio.nombre_negocio.trim() || negocio.dias_laborables.length === 0 || negocio.hora_cierre <= negocio.hora_apertura}
                    >
                      {guardandoNegocio ? 'Guardando…' : 'Guardar'}
                    </Button>
                  </Box>
                </Stack>
              </Box>
            )}
          </Paper>
        </Grid>
        )}

        <Grid size={{ xs: 12, lg: esAdmin ? 5 : 12 }}>
        <Paper variant="outlined" sx={{ p: 2.5, maxWidth: esAdmin ? 'none' : 480 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'secondary.main', color: '#fff', flexShrink: 0 }}>
              <LockIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Cambiar contraseña
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Actualizá la contraseña de tu propia cuenta.
              </Typography>
            </Box>
          </Stack>
          <Box component="form" onSubmit={handlePasswordSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Contraseña actual"
                type="password"
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, current_password: e.target.value }))}
                required
                fullWidth
              />
              <TextField
                label="Nueva contraseña"
                type="password"
                value={passwordForm.password}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, password: e.target.value }))}
                required
                fullWidth
                helperText="Mínimo 6 caracteres"
                slotProps={{ htmlInput: { minLength: 6 } }}
              />
              <TextField
                label="Confirmar nueva contraseña"
                type="password"
                value={passwordForm.password_confirmation}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, password_confirmation: e.target.value }))}
                required
                fullWidth
                slotProps={{ htmlInput: { minLength: 6 } }}
              />
              <Box>
                <Button type="submit" variant="contained" disabled={guardandoPassword}>
                  {guardandoPassword ? 'Guardando…' : 'Cambiar contraseña'}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
