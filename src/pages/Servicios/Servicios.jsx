import { useState } from 'react'
import { Box, Button, Chip, IconButton, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import BuildIcon from '@mui/icons-material/Build'
import HandymanIcon from '@mui/icons-material/Handyman'
import ScheduleIcon from '@mui/icons-material/Schedule'
import { createServicio, deleteServicio, importServicios, listServicios, updateServicio } from '../../services/serviciosApi'
import { usePaginatedData } from '../../hooks/usePaginatedData'
import { useNotify } from '../../context/useNotify'
import AppDialog from '../../components/AppDialog'
import PageHeader from '../../components/PageHeader'
import SearchInput from '../../components/SearchInput'
import SkeletonTable from '../../components/SkeletonTable'
import EmptyState from '../../components/EmptyState'
import ConfirmDialog from '../../components/ConfirmDialog'
import ExportExcelButton from '../../components/ExportExcelButton'
import ImportExcelButton from '../../components/ImportExcelButton'
import Pagination from '../../components/Pagination'
import { fmtMoney, parseNumero, plural } from '../../utils/format'

const emptyForm = { id: null, nombre: '', duracion_min: '', autogestionable: false, precio_base: '' }

export default function Servicios() {
  const notify = useNotify()
  const [form, setForm] = useState(emptyForm)
  const [open, setOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const servicios = usePaginatedData(listServicios, { errorMessage: 'No se pudieron cargar los servicios.' })
  const filtered = servicios.rows

  const handleChange = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))

  const openForm = (servicio) => {
    setForm(
      servicio
        ? {
            id: servicio.id,
            nombre: servicio.nombre,
            duracion_min: servicio.duracion_min,
            autogestionable: Boolean(servicio.autogestionable),
            precio_base: servicio.precio_base ?? '',
          }
        : emptyForm
    )
    setOpen(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const payload = {
      nombre: form.nombre,
      duracion_min: Number(form.duracion_min) || 0,
      autogestionable: Boolean(form.autogestionable),
      precio_base: form.precio_base === '' ? null : Number(form.precio_base),
    }
    try {
      if (form.id) {
        await updateServicio(form.id, payload)
        notify.success('Servicio actualizado.')
      } else {
        await createServicio(payload)
        notify.success('Servicio creado.')
      }
      setOpen(false)
      servicios.reload()
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo guardar el servicio.')
    }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await deleteServicio(deleteTarget.id)
      notify.success('Servicio eliminado.')
      setDeleteTarget(null)
      servicios.reload()
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo eliminar el servicio.')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const handleImport = async (rows) => {
    const payload = rows.map((row) => {
      const precio = parseNumero(row.precio_base)
      return {
        nombre: row.nombre,
        duracion_min: Number(row.duracion_min ?? row.duracion ?? 0) || 0,
        autogestionable: String(row.autogestionable ?? '').toLowerCase() === 'si',
        precio_base: Number.isNaN(precio) ? null : precio,
      }
    })
    const { creados, fallos, errores } = await importServicios(payload)
    if (creados) notify.success(`${plural(creados, 'servicio')} importados.`)
    if (fallos) notify.warning(`${plural(fallos, 'fila')} no importadas: ${errores.slice(0, 3).join('; ')}${fallos > 3 ? '…' : ''}`)
    servicios.reload()
  }

  const columns = [
    { header: 'Nombre', key: 'nombre' },
    { header: 'Duración (min)', key: 'duracion_min' },
    { header: 'Precio base', key: 'precio_base', render: (s) => (s.precio_base != null ? fmtMoney(s.precio_base) : '') },
    { header: 'Autogestionable', key: 'autogestionable', render: (s) => (s.autogestionable ? 'Sí' : 'No') },
  ]

  return (
    <Box>
      <PageHeader
        title="Servicios"
        subtitle="Servicios ofrecidos por el taller y su duración estimada."
        actions={
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            <ExportExcelButton
              filename="servicios"
              sheetName="Servicios"
              columns={columns}
              rowsFetcher={async () => (await listServicios({ q: servicios.q, per_page: 5000 })).data}
            />
            <ImportExcelButton onImport={handleImport} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openForm(null)}>
              Nuevo servicio
            </Button>
          </Stack>
        }
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 1.5, mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {plural(servicios.total, 'servicio')}
        </Typography>
        <SearchInput value={servicios.q} onChange={servicios.setQ} placeholder="Buscar servicio…" width={{ xs: '100%', sm: 280 }} />
      </Stack>

      {servicios.loading ? (
        <SkeletonTable columns={5} />
      ) : filtered.length === 0 ? (
        <Paper variant="outlined">
          <EmptyState
            icon={BuildIcon}
            title={servicios.q ? 'Sin resultados' : 'No hay servicios'}
            description={servicios.q ? 'Probá con otro término de búsqueda.' : 'Cargá los servicios que el taller ofrece.'}
            actionLabel={!servicios.q ? 'Nuevo servicio' : undefined}
            onAction={() => openForm(null)}
          />
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Servicio</TableCell>
                <TableCell align="center">Duración</TableCell>
                <TableCell align="right">Precio base</TableCell>
                <TableCell>Origen</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.selected' }}>
                        <BuildIcon fontSize="small" color="primary" />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {s.nombre}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                      <ScheduleIcon fontSize="inherit" sx={{ fontSize: 14, color: 'text.secondary' }} />
                      {s.duracion_min} min
                    </Box>
                  </TableCell>
                  <TableCell align="right">{s.precio_base != null ? fmtMoney(s.precio_base) : '—'}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={s.autogestionable ? 'Auto (bot)' : 'Manual'}
                      color={s.autogestionable ? 'success' : 'warning'}
                      variant={s.autogestionable ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openForm(s)} aria-label="Editar">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget(s)} aria-label="Eliminar">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            count={servicios.total}
            page={servicios.page}
            rowsPerPage={servicios.perPage}
            onPageChange={servicios.onPageChange}
            onRowsPerPageChange={servicios.onPerPageChange}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </TableContainer>
      )}

      <AppDialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        title={form.id ? 'Editar servicio' : 'Nuevo servicio'}
        subtitle="Servicio ofrecido por el taller."
        icon={<HandymanIcon />}
        iconBg="primary.main"
        actions={
          <>
            <Button onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" form="servicio-form" variant="contained">
              {form.id ? 'Guardar' : 'Crear'}
            </Button>
          </>
        }
      >
        <Box component="form" id="servicio-form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Stack spacing={2}>
              <TextField label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required autoFocus />
              <TextField label="Duración (min)" name="duracion_min" type="number" value={form.duracion_min} onChange={handleChange} required slotProps={{ htmlInput: { min: 0 } }} />
              <TextField
                label="Precio base (opcional)"
                name="precio_base"
                type="number"
                value={form.precio_base}
                onChange={handleChange}
                helperText="Se usa para pre-cargar el precio al crear una orden desde un turno de este servicio."
                slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
              />
              <TextField select label="Origen" name="autogestionable" value={form.autogestionable ? 'true' : 'false'} onChange={(event) => setForm((prev) => ({ ...prev, autogestionable: event.target.value === 'true' }))}>
                <MenuItem value="false">Manual (lo agenda el taller)</MenuItem>
                <MenuItem value="true">Auto (autogestionable por el bot)</MenuItem>
              </TextField>
            </Stack>
          </Box>
        </AppDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar servicio"
        message={`¿Eliminar ${deleteTarget?.nombre}?`}
        busy={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </Box>
  )
}
