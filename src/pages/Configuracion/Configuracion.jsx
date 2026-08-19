import { useEffect, useState } from 'react'
import { Box, Button, Paper, Skeleton, Stack, TextField, Typography } from '@mui/material'
import StoreIcon from '@mui/icons-material/Store'
import LockIcon from '@mui/icons-material/Lock'
import { getConfiguracion, updateConfiguracion } from '../../services/configuracionApi'
import { updatePasswordApi } from '../../services/authApi'
import { useAsyncData } from '../../hooks/useAsyncData'
import { useAuth } from '../../hooks/useAuth'
import { useNotify } from '../../context/useNotify'
import PageHeader from '../../components/PageHeader'

const emptyPasswordForm = { current_password: '', password: '', password_confirmation: '' }

export default function Configuracion() {
  const notify = useNotify()
  const { role } = useAuth()
  const esAdmin = role === 'admin'

  const config = useAsyncData(getConfiguracion, { errorMessage: 'No se pudo cargar la configuración del negocio.' })
  const [nombreNegocio, setNombreNegocio] = useState('')
  const [guardandoNegocio, setGuardandoNegocio] = useState(false)

  useEffect(() => {
    if (config.data) setNombreNegocio(config.data.nombre_negocio ?? '')
  }, [config.data])

  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm)
  const [guardandoPassword, setGuardandoPassword] = useState(false)

  const handleNegocioSubmit = async (event) => {
    event.preventDefault()
    setGuardandoNegocio(true)
    try {
      await updateConfiguracion({ nombre_negocio: nombreNegocio.trim() })
      notify.success('Nombre del negocio actualizado.')
      config.refresh()
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo guardar el nombre del negocio.')
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

      <Stack spacing={3} sx={{ maxWidth: 560 }}>
        {esAdmin && (
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'primary.main', color: '#fff', flexShrink: 0 }}>
                <StoreIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Negocio
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Nombre del taller que se muestra en el sistema.
                </Typography>
              </Box>
            </Stack>
            {config.loading ? (
              <Skeleton variant="rounded" height={56} />
            ) : (
              <Box component="form" onSubmit={handleNegocioSubmit}>
                <Stack spacing={2}>
                  <TextField label="Nombre del negocio" value={nombreNegocio} onChange={(e) => setNombreNegocio(e.target.value)} required fullWidth />
                  <Box>
                    <Button type="submit" variant="contained" disabled={guardandoNegocio || !nombreNegocio.trim()}>
                      {guardandoNegocio ? 'Guardando…' : 'Guardar'}
                    </Button>
                  </Box>
                </Stack>
              </Box>
            )}
          </Paper>
        )}

        <Paper variant="outlined" sx={{ p: 2.5 }}>
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
      </Stack>
    </Box>
  )
}
