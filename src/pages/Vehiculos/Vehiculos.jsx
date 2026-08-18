import { useMemo, useState } from 'react'
import { Box, Button, Card, CardContent, Chip, Grid, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import PersonIcon from '@mui/icons-material/Person'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import { createVehiculo, deleteVehiculo, importVehiculos, listClientesOptions, listVehiculos, updateVehiculo } from '../../services/clientesApi'
import { useAsyncData } from '../../hooks/useAsyncData'
import { usePaginatedData } from '../../hooks/usePaginatedData'
import { useNotify } from '../../context/useNotify'
import PageHeader from '../../components/PageHeader'
import SearchInput from '../../components/SearchInput'
import SkeletonTable from '../../components/SkeletonTable'
import EmptyState from '../../components/EmptyState'
import AppDialog from '../../components/AppDialog'
import ConfirmDialog from '../../components/ConfirmDialog'
import VehiculoFormFields from '../../components/VehiculoFormFields'
import GestionarMarcasDialog from '../../components/GestionarMarcasDialog'
import GestionarModelosDialog from '../../components/GestionarModelosDialog'
import ExportExcelButton from '../../components/ExportExcelButton'
import ImportExcelButton from '../../components/ImportExcelButton'
import Pagination from '../../components/Pagination'
import { fmtNum, plural } from '../../utils/format'

const emptyForm = { id: null, marca: '', modelo: '', anio: '', patente: '', kilometros: '', imagen_url: '' }

const fallbackColor = (v) => {
  const seed = ((v?.marca ?? 'auto').length + (v?.modelo ?? '').length + (v?.patente ?? '').length) % 6
  return ['#0e7c66', '#0f766e', '#7c2d12', '#3b0764', '#14532d', '#581c87'][seed]
}

export default function Vehiculos() {
  const notify = useNotify()
  const [form, setForm] = useState(emptyForm)
  const [open, setOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [marcasOpen, setMarcasOpen] = useState(false)
  const [marcasVersion, setMarcasVersion] = useState(0)
  const [modelosOpen, setModelosOpen] = useState(false)
  const [modelosVersion, setModelosVersion] = useState(0)

  // Full unwrapped list — used as a lookup/dropdown source (owner picker,
  // import-by-name), not rendered as its own paginated table.
  const clientes = useAsyncData(listClientesOptions, { cacheKey: 'clientes' })
  const vehiculos = usePaginatedData(listVehiculos, { errorMessage: 'No se pudieron cargar los vehículos.', perPage: 12 })

  const clienteById = useMemo(() => Object.fromEntries((clientes.data ?? []).map((c) => [c.id, c])), [clientes.data])
  const filtered = vehiculos.rows

  const openForm = (vehiculo) => {
    setForm(
      vehiculo
        ? { id: vehiculo.id, marca: vehiculo.marca, modelo: vehiculo.modelo, anio: vehiculo.anio ?? '', patente: vehiculo.patente, kilometros: vehiculo.kilometros ?? '', imagen_url: vehiculo.imagen_url ?? '' }
        : emptyForm
    )
    setOpen(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const payload = { marca: form.marca, modelo: form.modelo, patente: form.patente }
    if (form.anio) payload.anio = Number(form.anio)
    if (form.kilometros) payload.kilometros = Number(form.kilometros)
    if (form.imagen_url) payload.imagen_url = form.imagen_url
    try {
      if (form.id) {
        await updateVehiculo(form.id, payload)
        notify.success('Vehículo actualizado.')
      } else {
        await createVehiculo(payload)
        notify.success('Vehículo cargado.')
      }
      setOpen(false)
      vehiculos.reload()
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo guardar el vehículo.')
    }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await deleteVehiculo(deleteTarget.id)
      notify.success('Vehículo eliminado.')
      setDeleteTarget(null)
      vehiculos.reload()
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo eliminar el vehículo.')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const handleImport = async (rows) => {
    const payload = rows.map((row) => {
      const cliente = (clientes.data ?? []).find((c) => c.nombre.toLowerCase() === String(row.cliente ?? '').toLowerCase())
      return {
        ...(cliente ? { cliente_id: cliente.id } : {}),
        marca: row.marca,
        modelo: row.modelo,
        anio: row.anio ? Number(row.anio) : undefined,
        patente: row.patente,
        kilometros: Number(row.kilometros) || undefined,
        imagen_url: row.imagen_url || undefined,
      }
    })
    const { creados, fallos, errores } = payload.length ? await importVehiculos(payload) : { creados: 0, fallos: 0, errores: [] }
    if (creados) notify.success(`${plural(creados, 'vehículo')} importados.`)
    if (fallos) notify.warning(`${plural(fallos, 'fila')} no importadas: ${errores.slice(0, 3).join('; ')}${fallos > 3 ? '…' : ''}`)
    vehiculos.reload()
  }

  const columns = [
    { header: 'Marca', key: 'marca' },
    { header: 'Modelo', key: 'modelo' },
    { header: 'Año', key: 'anio', render: (v) => v.anio ?? '' },
    { header: 'Patente', key: 'patente' },
    { header: 'Cliente', key: 'cliente_id', render: (v) => clienteById[v.cliente_id]?.nombre ?? '' },
    { header: 'Kilómetros', key: 'kilometros', render: (v) => v.kilometros ?? '' },
  ]

  return (
    <Box>
      <PageHeader
        title="Vehículos"
        subtitle="Catálogo de vehículos cargados una sola vez. Se crean al cargar un cliente o un turno; acá solo se editan y buscan."
        actions={
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            <ExportExcelButton
              filename="vehiculos"
              sheetName="Vehículos"
              columns={columns}
              rowsFetcher={async () => (await listVehiculos({ q: vehiculos.q, per_page: 5000 })).data}
            />
            <ImportExcelButton onImport={handleImport} />
            <Button variant="outlined" startIcon={<LocalOfferIcon />} onClick={() => setMarcasOpen(true)}>
              Marcas
            </Button>
            <Button variant="outlined" startIcon={<DirectionsCarIcon />} onClick={() => setModelosOpen(true)}>
              Modelos
            </Button>
          </Stack>
        }
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 1.5, mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {plural(vehiculos.total, 'vehículo')}
        </Typography>
        <SearchInput value={vehiculos.q} onChange={vehiculos.setQ} placeholder="Buscar por patente, marca o modelo…" width={{ xs: '100%', sm: 300 }} />
      </Stack>

      {vehiculos.loading ? (
        <SkeletonTable columns={4} />
      ) : filtered.length === 0 ? (
        <PaperEmpty query={vehiculos.q} />
      ) : (
        <>
        <Grid container spacing={2.5}>
          {filtered.map((v) => {
            const cliente = clienteById[v.cliente_id]
            return (
              <Grid key={v.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Card variant="outlined" sx={{ height: '100%', overflow: 'hidden' }}>
                  <Box
                    sx={{
                      height: 150,
                      position: 'relative',
                      background: `linear-gradient(135deg, ${fallbackColor(v)} 0%, ${fallbackColor({ ...v, marca: 'x' })} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {v.imagen_url ? (
                      <Box component="img" src={v.imagen_url} alt={`${v.marca} ${v.modelo}`} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <DirectionsCarIcon sx={{ fontSize: 72, color: 'rgba(255,255,255,0.9)' }} />
                    )}
                    <Chip size="small" label={v.patente} sx={{ position: 'absolute', bottom: 8, left: 8, bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', fontWeight: 800 }} />
                    <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Editar">
                        <IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: '#fff' } }} onClick={() => openForm(v)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.9)', color: 'error.main', '&:hover': { bgcolor: '#fff' } }} onClick={() => setDeleteTarget(v)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
                      {v.marca} {v.modelo}
                    </Typography>
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mt: 0.5 }}>
                      <PersonIcon fontSize="inherit" sx={{ fontSize: 15, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {cliente?.nombre ?? 'Sin cliente'}
                      </Typography>
                    </Stack>
                    {v.kilometros != null && v.kilometros !== '' && (
                      <Typography variant="caption" color="text.secondary">
                        {v.anio ? `${v.anio} · ` : ''}
                        {fmtNum(v.kilometros)} km
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
        <Pagination
          count={vehiculos.total}
          page={vehiculos.page}
          rowsPerPage={vehiculos.perPage}
          onPageChange={vehiculos.onPageChange}
          onRowsPerPageChange={vehiculos.onPerPageChange}
          rowsPerPageOptions={[12, 24, 48, 96]}
          sx={{ mt: 1, borderTop: 'none' }}
        />
        </>
      )}

      <AppDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Editar vehículo"
        subtitle="El vehículo se carga una sola vez y se vincula a sus dueños desde Clientes."
        icon={<DirectionsCarIcon />}
        iconBg={(t) => t.custom.brandGradient}
        actions={
          <>
            <Button onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" form="vehiculo-form" variant="contained">
              Guardar
            </Button>
          </>
        }
      >
        <Box component="form" id="vehiculo-form" onSubmit={handleSubmit}>
          <VehiculoFormFields form={form} setForm={setForm} marcasVersion={marcasVersion} modelosVersion={modelosVersion} showImagen autoFocus />
        </Box>
      </AppDialog>

      <GestionarMarcasDialog open={marcasOpen} onClose={() => setMarcasOpen(false)} onChanged={() => setMarcasVersion((v) => v + 1)} />
      <GestionarModelosDialog open={modelosOpen} onClose={() => setModelosOpen(false)} onChanged={() => setModelosVersion((v) => v + 1)} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar vehículo"
        message={`¿Eliminar ${deleteTarget?.marca} ${deleteTarget?.modelo} (${deleteTarget?.patente})?`}
        busy={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </Box>
  )
}

function PaperEmpty({ query }) {
  return (
    <Box component={Card} variant="outlined" sx={{ p: 4 }}>
      <EmptyState
        icon={DirectionsCarIcon}
        title={query ? 'Sin resultados' : 'No hay vehículos'}
        description={query ? 'Probá con otro término de búsqueda.' : 'Los vehículos se crean al cargar un cliente o pedir un turno, y aparecen acá para buscarlos.'}
      />
    </Box>
  )
}