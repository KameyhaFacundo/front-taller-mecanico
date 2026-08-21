import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import StorefrontIcon from '@mui/icons-material/Storefront'
import PeopleIcon from '@mui/icons-material/People'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import BuildIcon from '@mui/icons-material/Build'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import SearchIcon from '@mui/icons-material/Search'
import RefreshIcon from '@mui/icons-material/Refresh'
import AddIcon from '@mui/icons-material/Add'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { listTalleresSuperadmin, toggleTallerActivo } from '../../services/superadminApi'
import { useAsyncData } from '../../hooks/useAsyncData'
import PageHeader from '../../components/PageHeader'
import SkeletonTable from '../../components/SkeletonTable'
import EmptyState from '../../components/EmptyState'
import { useNotify } from '../../context/useNotify'
import { fmtDate, fmtMoney } from '../../utils/format'
import { FONT_DISPLAY, FONT_MONO, SAFETY } from '../../theme/workshopBrand'

function StatCard({ icon: Icon, label, value, color = SAFETY, suffix = null }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: color, color: '#fff' }}>
            <Icon fontSize="small" />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontFamily: FONT_DISPLAY, fontWeight: 800, lineHeight: 1 }}>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              {label}
            </Typography>
            {suffix && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {suffix}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default function SuperadminTalleres() {
  const notify = useNotify()
  const talleres = useAsyncData(listTalleresSuperadmin, { errorMessage: 'No se pudieron cargar los talleres.' })
  const [search, setSearch] = useState('')
  const [copiado, setCopiado] = useState(null)
  const [togglingId, setTogglingId] = useState(null)

  const data = talleres.data ?? []
  const q = search.trim().toLowerCase()
  const filtered = q
    ? data.filter((t) => t.nombre.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q))
    : data

  const totals = data.reduce(
    (acc, t) => {
      acc.talleres += 1
      acc.activos += t.activo ? 1 : 0
      acc.pausados += t.activo ? 0 : 1
      acc.usuarios += t.usuarios_count ?? 0
      acc.clientes += t.clientes_count ?? 0
      acc.ordenes += t.ordenes_count ?? 0
      acc.ordenesMes += t.ordenes_mes_count ?? 0
      acc.turnos += t.turnos_count ?? 0
      acc.ingresos += t.ingresos_total ?? 0
      acc.ingresosMes += t.ingresos_mes ?? 0
      return acc
    },
    { talleres: 0, activos: 0, pausados: 0, usuarios: 0, clientes: 0, ordenes: 0, ordenesMes: 0, turnos: 0, ingresos: 0, ingresosMes: 0 }
  )

  const copiar = async (texto, id) => {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(id)
      setTimeout(() => setCopiado(null), 1500)
      notify.success('Link copiado al portapapeles')
    } catch {
      notify.error('No se pudo copiar el link')
    }
  }

  const linkPublico = (slug) => `${window.location.origin}/taller/${slug}`

  const handleToggle = async (taller) => {
    setTogglingId(taller.id)
    try {
      const result = await toggleTallerActivo(taller.id)
      talleres.refresh()
      notify.success(result.message)
    } catch {
      notify.error('No se pudo cambiar el estado del taller')
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <>
      <PageHeader
        title="Talleres registrados"
        subtitle="Administración de todos los talleres dados de alta en la plataforma."
        actions={
          <Button
            component={RouterLink}
            to="/registro"
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Nuevo taller
          </Button>
        }
      />

      {talleres.loading ? (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[1, 2, 3, 4].map((i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card variant="outlined" sx={{ height: 88 }} />
              </Grid>
            ))}
          </Grid>
          <SkeletonTable columns={6} />
        </>
      ) : data.length === 0 ? (
        <EmptyState icon={StorefrontIcon} title="Todavía no hay talleres" description="Cuando alguien se registre desde /registro va a aparecer acá." />
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard icon={StorefrontIcon} label="Talleres" value={totals.talleres} suffix={`${totals.activos} activos · ${totals.pausados} pausados`} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard icon={PeopleIcon} label="Usuarios totales" value={totals.usuarios} color="#3b82f6" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard icon={DirectionsCarIcon} label="Clientes totales" value={totals.clientes} color="#10b981" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard icon={AttachMoneyIcon} label="Ingresos totales" value={fmtMoney(totals.ingresos)} suffix={`${fmtMoney(totals.ingresosMes)} este mes`} color="#f59e0b" />
            </Grid>
          </Grid>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2, alignItems: 'center' }}>
            <TextField
              placeholder="Buscar por nombre o slug…"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ flexGrow: 1, maxWidth: { sm: 360 } }}
            />
            <Tooltip title="Recargar listado">
              <IconButton size="small" onClick={talleres.refresh} sx={{ color: 'text.secondary' }}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
              {filtered.length} de {data.length} talleres
            </Typography>
          </Stack>

          {/* Desktop: table */}
          <TableContainer component={Paper} variant="outlined" sx={{ display: { xs: 'none', md: 'block' } }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Taller</TableCell>
                  <TableCell>Slug / Link</TableCell>
                  <TableCell align="right">Usuarios</TableCell>
                  <TableCell align="right">Clientes</TableCell>
                  <TableCell align="right">Órdenes</TableCell>
                  <TableCell align="right">Ingresos</TableCell>
                  <TableCell align="right">Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((taller) => (
                  <TableRow key={taller.id} hover sx={{ opacity: taller.activo ? 1 : 0.6 }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {taller.nombre}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID #{taller.id} · Alta {fmtDate(taller.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                        <Chip label={taller.slug} size="small" variant="outlined" sx={{ fontFamily: FONT_MONO }} />
                        <Tooltip title={copiado === taller.id ? 'Copiado' : 'Copiar link público'}>
                          <IconButton size="small" onClick={() => copiar(linkPublico(taller.slug), taller.id)}>
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ver página pública">
                          <IconButton size="small" component="a" href={linkPublico(taller.slug)} target="_blank" rel="noopener noreferrer">
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">{taller.usuarios_count}</TableCell>
                    <TableCell align="right">{taller.clientes_count}</TableCell>
                    <TableCell align="right">
                      <Tooltip title={`${taller.ordenes_mes_count} este mes`}>
                        <span>{taller.ordenes_count}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={`${fmtMoney(taller.ingresos_mes)} este mes`}>
                        <span>{fmtMoney(taller.ingresos_total)}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={taller.activo ? 'Activo' : 'Pausado'}
                        size="small"
                        color={taller.activo ? 'success' : 'default'}
                        variant={taller.activo ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={taller.activo ? 'Pausar taller' : 'Reactivar taller'}>
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => handleToggle(taller)}
                            disabled={togglingId === taller.id}
                            color={taller.activo ? 'warning' : 'success'}
                          >
                            {taller.activo ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No se encontraron talleres con “{search}”.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Mobile: cards */}
          <Stack spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' } }}>
            {filtered.map((taller) => (
              <Card key={taller.id} variant="outlined" sx={{ opacity: taller.activo ? 1 : 0.7 }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', mb: 1.5 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: taller.activo ? SAFETY : '#9ca3af', color: '#fff', flexShrink: 0 }}>
                      <StorefrontIcon fontSize="small" />
                    </Box>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        {taller.nombre}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Alta: {fmtDate(taller.created_at)}
                      </Typography>
                    </Box>
                    <Chip
                      label={taller.activo ? 'Activo' : 'Pausado'}
                      size="small"
                      color={taller.activo ? 'success' : 'default'}
                      variant={taller.activo ? 'filled' : 'outlined'}
                    />
                  </Stack>

                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5, flexWrap: 'wrap' }}>
                    <Chip label={taller.slug} size="small" variant="outlined" sx={{ fontFamily: FONT_MONO }} />
                    <Tooltip title={copiado === taller.id ? 'Copiado' : 'Copiar link público'}>
                      <IconButton size="small" onClick={() => copiar(linkPublico(taller.slug), taller.id)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ver página pública">
                      <IconButton size="small" component="a" href={linkPublico(taller.slug)} target="_blank" rel="noopener noreferrer">
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>

                  <Grid container spacing={1} sx={{ mb: 1.5 }}>
                    <Grid size={{ xs: 6 }}>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                        <PeopleIcon fontSize="small" color="action" />
                        <Typography variant="body2">{taller.usuarios_count} usuarios</Typography>
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                        <DirectionsCarIcon fontSize="small" color="action" />
                        <Typography variant="body2">{taller.clientes_count} clientes</Typography>
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                        <BuildIcon fontSize="small" color="action" />
                        <Typography variant="body2">{taller.ordenes_count} órdenes</Typography>
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                        <AttachMoneyIcon fontSize="small" color="action" />
                        <Typography variant="body2">{fmtMoney(taller.ingresos_total)}</Typography>
                      </Stack>
                    </Grid>
                  </Grid>

                  <Button
                    fullWidth
                    size="small"
                    variant={taller.activo ? 'outlined' : 'contained'}
                    color={taller.activo ? 'warning' : 'success'}
                    startIcon={taller.activo ? <PauseIcon /> : <PlayArrowIcon />}
                    onClick={() => handleToggle(taller)}
                    disabled={togglingId === taller.id}
                  >
                    {taller.activo ? 'Pausar taller' : 'Reactivar taller'}
                  </Button>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">No se encontraron talleres con “{search}”.</Typography>
              </Box>
            )}
          </Stack>
        </>
      )}
    </>
  )
}
