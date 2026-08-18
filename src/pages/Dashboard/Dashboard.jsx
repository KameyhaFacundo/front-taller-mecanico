import { useNavigate } from 'react-router-dom'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import ConstructionIcon from '@mui/icons-material/Construction'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import PaymentsIcon from '@mui/icons-material/Payments'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import { getDashboard } from '../../services/dashboardApi'
import { useAsyncData } from '../../hooks/useAsyncData'
import { useAuth } from '../../hooks/useAuth'
import StatCard from '../../components/StatCard'
import EmptyState from '../../components/EmptyState'
import ExportExcelButton from '../../components/ExportExcelButton'
import { fmtMoney, fmtDayName, initials } from '../../utils/format'
import { turnoOrigenMeta } from '../../utils/meta'

function saludo() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function DashboardSkeleton() {
  return (
    <Box>
      <Skeleton variant="rounded" height={72} sx={{ mb: 3, borderRadius: 3 }} />
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
            <Skeleton variant="rounded" height={112} sx={{ borderRadius: 3 }} />
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Skeleton variant="rounded" height={340} sx={{ borderRadius: 3 }} />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Skeleton variant="rounded" height={340} sx={{ borderRadius: 3 }} />
        </Grid>
      </Grid>
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 5, xl: 4 }}>
          <Skeleton variant="rounded" height={300} sx={{ borderRadius: 3 }} />
        </Grid>
        <Grid size={{ xs: 12, lg: 7, xl: 8 }}>
          <Skeleton variant="rounded" height={300} sx={{ borderRadius: 3 }} />
        </Grid>
      </Grid>
    </Box>
  )
}

export default function Dashboard() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { user } = useAuth()
  const dashboard = useAsyncData(getDashboard, { errorMessage: 'No se pudo cargar el panel.' })

  const data = dashboard.data ?? {}

  if (dashboard.loading) {
    return <DashboardSkeleton />
  }

  const stats = data.stats ?? {}
  const turnosHoy = data.turnos_hoy ?? []
  const ordenes = data.ordenes ?? {}
  const alertas = data.alertas ?? {}
  const cobrosPendientes = alertas.cobros_pendientes ?? []
  const stockBajo = alertas.stock_bajo ?? []
  const clientesSinTurno = alertas.clientes_sin_turno ?? 0

  const totalPendiente = cobrosPendientes.reduce((acc, cobro) => acc + Number(cobro.saldo || 0), 0)

  const columns = [
    { key: 'pendiente', label: 'Pendiente', icon: HourglassEmptyIcon, color: 'warning' },
    { key: 'en_ejecucion', label: 'En ejecución', icon: ConstructionIcon, color: 'primary' },
    { key: 'terminado', label: 'Terminado', icon: CheckCircleIcon, color: 'success' },
    { key: 'entregado', label: 'Entregado', icon: LocalShippingIcon, color: 'info' },
  ]

  const exportColumns = [
    { header: 'Cliente', key: 'cliente', render: (t) => t.cliente },
    { header: 'Vehículo', key: 'vehiculo', render: (t) => t.vehiculo },
    { header: 'Servicio', key: 'servicio', render: (t) => t.servicio },
    { header: 'Hora', key: 'hora', render: (t) => t.hora },
  ]

  return (
    <Box>
      <Card
        sx={{
          mb: 3,
          position: 'relative',
          overflow: 'hidden',
          color: '#fff',
          background: (t) => t.custom.brandGradient,
          boxShadow: (t) => t.custom.shadowHover,
        }}
      >
        <Box sx={{ position: 'absolute', top: -70, right: -40, width: 240, height: 240, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)' }} />
        <Box sx={{ position: 'absolute', bottom: -90, right: 160, width: 180, height: 180, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)' }} />
        <CardContent sx={{ p: { xs: 2.5, sm: 3 }, position: 'relative' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Avatar sx={{ width: 52, height: 52, bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 800, fontSize: 18, backdropFilter: 'blur(6px)' }}>
                {initials(user?.name) || '?'}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
                  {saludo()}
                  {user?.name ? `, ${user.name.split(' ')[0]}` : ''}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', textTransform: 'capitalize' }}>
                  {fmtDayName(new Date())}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              <ExportExcelButton
                filename="panel-gestion"
                sheetName="Resumen"
                columns={exportColumns}
                rows={turnosHoy}
                sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}
              />
              <Button
                variant="outlined"
                startIcon={<ReceiptLongIcon />}
                onClick={() => navigate('/ordenes')}
                sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                Ir a órdenes
              </Button>
              <Button
                variant="contained"
                startIcon={<EventAvailableIcon />}
                onClick={() => navigate('/turnos')}
                sx={{ bgcolor: '#fff', color: 'primary.dark', boxShadow: 'none', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
              >
                Ir a turnos
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Turnos hoy" value={stats.turnos_hoy ?? 0} icon={CalendarMonthIcon} color="primary" onClick={() => navigate('/turnos')} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Órdenes en ejecución" value={stats.en_ejecucion ?? 0} icon={ConstructionIcon} color="warning" onClick={() => navigate('/ordenes')} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Por asignar" value={stats.sin_asignar ?? 0} icon={HourglassEmptyIcon} color="warning" onClick={() => navigate('/turnos')} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Saldo por cobrar" value={fmtMoney(totalPendiente)} icon={PaymentsIcon} color="success" onClick={() => navigate('/ordenes')} />
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarMonthIcon color="primary" />
                Turnos de hoy
              </Typography>
              {turnosHoy.length === 0 ? (
                <EmptyState title="Sin turnos" description="No hay turnos confirmados para hoy." />
              ) : (
                <Stack divider={<Box sx={{ borderTop: '1px solid', borderColor: 'divider' }} />}>
                  {turnosHoy.map((turno) => (
                    <Box key={turno.id} onClick={() => navigate('/turnos')} sx={{ py: 1.25, display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', borderRadius: 1.5, transition: 'background-color 0.15s ease', '&:hover': { bgcolor: 'action.hover' } }}>
                      <Typography
                        variant="body2"
                        sx={{
                          minWidth: 52,
                          textAlign: 'center',
                          fontWeight: 700,
                          bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'background.default'),
                          borderRadius: 1.5,
                          px: 1,
                          py: 0.5,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {turno.hora}
                      </Typography>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }} noWrap>
                          {turno.cliente}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {turno.vehiculo} · {turno.servicio}
                        </Typography>
                      </Box>
                      <Chip size="small" label={turnoOrigenMeta[turno.origen]?.label ?? 'Taller'} color={turnoOrigenMeta[turno.origen]?.color ?? 'default'} variant="outlined" />
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningAmberIcon color="warning" />
                Alertas
              </Typography>

              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                <Inventory2Icon fontSize="small" color="text.secondary" />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Stock bajo
                </Typography>
                {stockBajo.length > 0 && (
                  <Chip size="small" label={stockBajo.length} color="warning" sx={{ ml: 'auto' }} />
                )}
              </Stack>
              <Stack sx={{ mb: 3 }} spacing={0.5}>
                {stockBajo.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                    Todo el stock está en niveles correctos.
                  </Typography>
                ) : (
                  stockBajo.map((repuesto) => (
                    <Box
                      key={repuesto.id}
                      onClick={() => navigate('/productos')}
                      sx={{
                        py: 0.75,
                        px: 1,
                        borderRadius: 1.5,
                        cursor: 'pointer',
                        bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'background.default'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1.5,
                        transition: 'background-color 0.15s ease',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                        {repuesto.nombre}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, color: repuesto.stock_actual === 0 ? 'error.main' : 'warning.main', fontVariantNumeric: 'tabular-nums' }}
                      >
                        {repuesto.stock_actual}
                        <Typography component="span" variant="caption" color="text.secondary">
                          {' '}
                          / mín {repuesto.stock_minimo}
                        </Typography>
                      </Typography>
                    </Box>
                  ))
                )}
              </Stack>

              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                <CalendarMonthIcon fontSize="small" color="text.secondary" />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Clientes sin turno
                </Typography>
                {clientesSinTurno > 0 && (
                  <Chip size="small" label={clientesSinTurno} color="warning" sx={{ ml: 'auto' }} />
                )}
              </Stack>
              <Stack sx={{ mb: 3 }} spacing={0.5}>
                <Box
                  onClick={() => navigate('/clientes', { state: { sinTurno: true } })}
                  sx={{
                    py: 0.75,
                    px: 1,
                    borderRadius: 1.5,
                    cursor: 'pointer',
                    bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'background.default'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    transition: 'background-color 0.15s ease',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                    {clientesSinTurno > 0 ? (clientesSinTurno === 1 ? 'Un cliente' : `${clientesSinTurno} clientes`) + ' con autos aún sin turno' : 'Todos los clientes tienen turno'}
                  </Typography>
                  {clientesSinTurno > 0 && (
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main', whiteSpace: 'nowrap' }}>
                      Agendar
                    </Typography>
                  )}
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                <PaymentsIcon fontSize="small" color="text.secondary" />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Cobros pendientes
                </Typography>
                {cobrosPendientes.length > 0 && (
                  <Chip size="small" label={cobrosPendientes.length} color="error" sx={{ ml: 'auto' }} />
                )}
              </Stack>
              <Stack spacing={0.5}>
                {cobrosPendientes.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                    No hay cobros pendientes.
                  </Typography>
                ) : (
                  cobrosPendientes.map((cobro) => (
                    <Box
                      key={cobro.id}
                      onClick={() => navigate('/ordenes', { state: { cobrar: cobro.id } })}
                      sx={{
                        py: 0.75,
                        px: 1,
                        borderRadius: 1.5,
                        cursor: 'pointer',
                        bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'background.default'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1.5,
                        transition: 'background-color 0.15s ease',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }} noWrap>
                          {cobro.cliente}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {cobro.vehiculo}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'error.main', whiteSpace: 'nowrap' }}>
                        {fmtMoney(cobro.saldo)}
                      </Typography>
                    </Box>
                  ))
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ConstructionIcon color="primary" />
                Órdenes de trabajo
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
                {columns.map((column) => {
                  const Icon = column.icon
                  const items = ordenes[column.key] ?? []
                  const color = theme.palette[column.color]?.main
                  return (
                    <Box key={column.key} sx={{ bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'background.default'), borderRadius: 2, p: 1.5, minWidth: 0 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
                        <Box sx={{ width: 26, height: 26, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: color, color: '#fff', flexShrink: 0 }}>
                          <Icon sx={{ fontSize: 15 }} />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 0 }} noWrap>
                          {column.label}
                        </Typography>
                        <Box sx={{ ml: 'auto', minWidth: 22, height: 22, px: 0.5, borderRadius: '50%', bgcolor: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Typography variant="caption" sx={{ fontWeight: 800 }}>
                            {items.length}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack spacing={1}>
                        {items.slice(0, 6).map((orden) => (
                          <Card key={orden.id} variant="outlined" onClick={() => navigate('/ordenes')} sx={{ cursor: 'pointer', '&:hover': { boxShadow: 'none' } }}>
                            <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 } }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }} noWrap>
                                {orden.cliente}
                              </Typography>
                              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 0.75, mt: 0.25 }}>
                                <Typography variant="caption" color="text.secondary" noWrap>
                                  {orden.vehiculo}
                                </Typography>
                                {orden.asignado && (
                                  <Chip size="small" label={orden.asignado} variant="outlined" sx={{ height: 18, fontSize: 11, flexShrink: 0 }} />
                                )}
                              </Stack>
                            </CardContent>
                          </Card>
                        ))}
                        {items.length === 0 && (
                          <Box sx={{ py: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1.5, textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              Sin órdenes
                            </Typography>
                          </Box>
                        )}
                        {items.length > 6 && (
                          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                            +{items.length - 6} más
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  )
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
