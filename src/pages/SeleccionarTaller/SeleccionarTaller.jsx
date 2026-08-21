import { Navigate, useNavigate } from 'react-router-dom'
import { Box, Card, CardActionArea, Chip, Stack, Tooltip, Typography } from '@mui/material'
import StorefrontIcon from '@mui/icons-material/Storefront'
import { useAuth } from '../../hooks/useAuth'

export default function SeleccionarTaller() {
  const { token, memberships, setActiveTaller } = useAuth()
  const navigate = useNavigate()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  const elegir = (tallerId) => {
    setActiveTaller(tallerId)
    navigate('/panel', { replace: true })
  }

  return (
    <Box sx={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, bgcolor: 'background.default' }}>
      <Box sx={{ width: '100%', maxWidth: 420 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
          Elegí un taller
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Tu cuenta tiene acceso a más de un taller. Seleccioná con cuál querés trabajar.
        </Typography>

        <Stack spacing={1.5}>
          {memberships.map((membership) => {
            const suspendido = membership.activo === false
            return (
              <Card key={membership.taller_id} variant="outlined" sx={{ opacity: suspendido ? 0.65 : 1 }}>
                <Tooltip title={suspendido ? 'Este taller está pausado. Contactá al administrador.' : ''}>
                  <CardActionArea
                    onClick={() => !suspendido && elegir(membership.taller_id)}
                    disabled={suspendido}
                    sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}
                  >
                    <StorefrontIcon color={suspendido ? 'disabled' : 'primary'} />
                    <Box sx={{ textAlign: 'left', flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {membership.nombre}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {membership.role === 'admin' ? 'Admin' : 'Empleado'}
                      </Typography>
                    </Box>
                    {suspendido && <Chip label="Pausado" size="small" variant="outlined" color="default" />}
                  </CardActionArea>
                </Tooltip>
              </Card>
            )
          })}
        </Stack>
      </Box>
    </Box>
  )
}
