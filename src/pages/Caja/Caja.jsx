import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import SavingsIcon from '@mui/icons-material/Savings'
import PaymentsIcon from '@mui/icons-material/Payments'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import { deleteMovimiento, getCajaResumen, listMovimientos } from '../../services/cajaApi'
import { useAsyncData } from '../../hooks/useAsyncData'
import { usePaginatedData } from '../../hooks/usePaginatedData'
import { useNotify } from '../../context/useNotify'
import PageHeader from '../../components/PageHeader'
import StatCard from '../../components/StatCard'
import SkeletonTable from '../../components/SkeletonTable'
import EmptyState from '../../components/EmptyState'
import ConfirmDialog from '../../components/ConfirmDialog'
import Pagination from '../../components/Pagination'
import { pagoMetodoMeta } from '../../utils/meta'
import { fmtMoney, fmtDate } from '../../utils/format'

export default function Caja() {
  const notify = useNotify()
  const [tab, setTab] = useState('cobros')
  const [rango, setRango] = useState('mes')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  const params = useMemo(() => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    if (rango === 'mes') return { desde: start.toISOString().slice(0, 10) }
    // "Todo": el backend por defecto filtra el resumen desde el inicio del mes
    // si no se manda "desde", así que se pide un rango que cubra todo el
    // historial para que coincida con la tabla de movimientos.
    return { desde: '1900-01-01' }
  }, [rango])

  const resumen = useAsyncData((p) => getCajaResumen(p ?? params), { errorMessage: 'No se pudo cargar el resumen de caja.' })
  const cobros = usePaginatedData(listMovimientos, {
    errorMessage: 'No se pudieron cargar los cobros.',
    extraParams: { ...params, tipo: 'ingreso' },
  })
  const movimientos = usePaginatedData(listMovimientos, {
    errorMessage: 'No se pudieron cargar los movimientos.',
    extraParams: params,
  })

  const reload = () => {
    resumen.reload(params)
    cobros.reload()
    movimientos.reload()
  }

  // cobros/movimientos re-fetch on their own whenever their extraParams
  // change; resumen doesn't share that hook, so it needs its own trigger.
  useEffect(() => {
    resumen.reload(params)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rango])

  const confirmDelete = async () => {
    setDeleteBusy(true)
    try {
      await deleteMovimiento(deleteTarget.id)
      notify.success('Movimiento eliminado.')
      setDeleteTarget(null)
      reload()
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo eliminar el movimiento.')
      setDeleteTarget(null)
    } finally {
      setDeleteBusy(false)
    }
  }

  const r = resumen.data

  return (
    <Box>
      <PageHeader
        title="Caja"
        subtitle="Ingresos, egresos y movimientos del taller."
        actions={
          <Stack direction="row" spacing={1}>
            <ToggleButtonGroup value={rango} exclusive size="small" onChange={(_, value) => value && setRango(value)}>
              <ToggleButton value="mes">Este mes</ToggleButton>
              <ToggleButton value="todo">Todo</ToggleButton>
            </ToggleButtonGroup>
            <Button variant="outlined" startIcon={<ShoppingCartIcon />} component={RouterLink} to="/compras">
              Ver compras
            </Button>
          </Stack>
        }
      />

      {resumen.loading ? (
        <SkeletonTable columns={4} />
      ) : (
        <GridCards resumen={r} />
      )}

      <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Ingresos por método
        </Typography>
        {resumen.loading ? (
          <Stack spacing={1.5}>
            <Skeleton variant="rounded" height={76} />
            <Skeleton variant="rounded" height={76} />
          </Stack>
        ) : (r?.por_metodo?.length ?? 0) === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Sin cobros registrados en el período.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {r.por_metodo.map((m) => (
              <Box key={m.metodo} sx={{ flexGrow: 1, minWidth: 160, p: 2, borderRadius: 2, bgcolor: 'background.default', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: `${pagoMetodoMeta[m.metodo]?.color ?? 'primary'}.main` }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {pagoMetodoMeta[m.metodo]?.label ?? m.metodo}
                  </Typography>
                </Stack>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {fmtMoney(m.total)}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Paper>

      <ToggleButtonGroup value={tab} exclusive size="small" onChange={(_, value) => value && setTab(value)} sx={{ mb: 2 }}>
        <ToggleButton value="cobros">Cobros</ToggleButton>
        <ToggleButton value="movimientos">Todos los movimientos</ToggleButton>
      </ToggleButtonGroup>

      {tab === 'cobros' ? (
        cobros.loading ? (
          <SkeletonTable columns={6} />
        ) : cobros.rows.length === 0 ? (
          <Paper variant="outlined">
            <EmptyState icon={PaymentsIcon} title="Sin cobros" description="Los cobros registrados desde las órdenes aparecerán acá." />
          </Paper>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Orden</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Método</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cobros.rows.map((pago) => (
                  <TableRow key={pago.id} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{fmtDate(pago.fecha)}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        #{pago.orden_trabajo?.id ?? '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {pago.orden_trabajo?.cliente?.nombre ?? pago.orden_trabajo?.vehiculo?.cliente?.nombre ?? '—'}
                      </Typography>
                      {pago.referencia && (
                        <Typography variant="caption" color="text.secondary">
                          {pago.referencia}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Chip size="small" label={pagoMetodoMeta[pago.metodo]?.label ?? pago.metodo} color={pagoMetodoMeta[pago.metodo]?.color ?? 'default'} />
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>
                        {fmtMoney(pago.monto)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(pago)} aria-label="Eliminar">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination
              count={cobros.total}
              page={cobros.page}
              rowsPerPage={cobros.perPage}
              onPageChange={cobros.onPageChange}
              onRowsPerPageChange={cobros.onPerPageChange}
              rowsPerPageOptions={[10, 25, 50, 100]}
            />
          </TableContainer>
        )
      ) : movimientos.loading ? (
        <SkeletonTable columns={5} />
      ) : movimientos.rows.length === 0 ? (
        <Paper variant="outlined">
          <EmptyState icon={ReceiptLongIcon} title="Sin movimientos" description="Cobros de órdenes y compras pagadas aparecerán acá, en un solo libro." />
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Detalle</TableCell>
                <TableCell align="right">Monto</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {movimientos.rows.map((m) => {
                const esIngreso = m.tipo === 'ingreso'
                const detalle = esIngreso
                  ? (m.orden_trabajo?.cliente?.nombre ?? m.orden_trabajo?.vehiculo?.cliente?.nombre ?? `Orden #${m.orden_trabajo?.id ?? '—'}`)
                  : (m.proveedor?.nombre ?? m.descripcion ?? 'Egreso')
                const esMirror = !esIngreso && Boolean(m.compra_id)
                return (
                  <TableRow key={m.id} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{fmtDate(m.fecha)}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Chip
                        size="small"
                        label={esIngreso ? 'Ingreso' : 'Egreso'}
                        color={esIngreso ? 'success' : 'error'}
                        icon={esIngreso ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {detalle}
                      </Typography>
                      {esMirror && (
                        <Typography variant="caption" color="text.secondary">
                          Compra #{m.compra_id}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: esIngreso ? 'success.main' : 'error.main' }}>
                        {esIngreso ? '+' : '−'}
                        {fmtMoney(m.monto)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      {esMirror ? (
                        <Typography
                          component={RouterLink}
                          to="/compras"
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                        >
                          Ver compra #{m.compra_id}
                        </Typography>
                      ) : (
                        <IconButton size="small" color="error" onClick={() => setDeleteTarget(m)} aria-label="Eliminar">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          <Pagination
            count={movimientos.total}
            page={movimientos.page}
            rowsPerPage={movimientos.perPage}
            onPageChange={movimientos.onPageChange}
            onRowsPerPageChange={movimientos.onPerPageChange}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </TableContainer>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar movimiento"
        message={`¿Eliminar el movimiento de ${fmtMoney(deleteTarget?.monto)}?`}
        busy={deleteBusy}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </Box>
  )
}

function GridCards({ resumen }) {
  if (!resumen) return null
  const balance = resumen.balance == null ? 0 : Number(resumen.balance)
  return (
    <Grid container spacing={2.5} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard label="Ingresos" value={fmtMoney(resumen.ingresos)} icon={TrendingUpIcon} color="success" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard label="Egresos" value={fmtMoney(resumen.egresos)} icon={TrendingDownIcon} color="error" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard label="Balance" value={fmtMoney(balance)} icon={SavingsIcon} color={balance >= 0 ? 'primary' : 'error'} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard label="Cobros pendientes" value={(resumen.cobros_pendientes ?? []).length} icon={AccountBalanceIcon} color="warning" />
      </Grid>
    </Grid>
  )
}
