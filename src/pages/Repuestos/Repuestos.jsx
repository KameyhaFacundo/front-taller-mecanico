import { useMemo, useState } from 'react'
import { Box, Button, IconButton, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import { createRepuesto, deleteRepuesto, importRepuestos, listRepuestos, updateRepuesto, listProveedoresOptions, getStockBajo } from '../../services/stockApi'
import { useAsyncData } from '../../hooks/useAsyncData'
import { usePaginatedData } from '../../hooks/usePaginatedData'
import { useNotify } from '../../context/useNotify'
import AppDialog from '../../components/AppDialog'
import PageHeader from '../../components/PageHeader'
import SearchInput from '../../components/SearchInput'
import SkeletonTable from '../../components/SkeletonTable'
import EmptyState from '../../components/EmptyState'
import ConfirmDialog from '../../components/ConfirmDialog'
import ExportExcelButton from '../../components/ExportExcelButton'
import Pagination from '../../components/Pagination'
import ImportExcelButton from '../../components/ImportExcelButton'
import { fmtMoney, parseNumero, plural } from '../../utils/format'

const emptyForm = { id: null, proveedor_id: '', nombre: '', stock_actual: '', stock_minimo: '', precio_costo: '', margen: '', precio_venta: '' }

export default function Repuestos() {
  const notify = useNotify()
  const [form, setForm] = useState(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [open, setOpen] = useState(false)

  const proveedores = useAsyncData(listProveedoresOptions, { cacheKey: 'proveedores' })
  const repuestos = usePaginatedData(listRepuestos, { errorMessage: 'No se pudieron cargar los repuestos.' })
  // Alert banner needs the whole inventory's low-stock items, not just the
  // page currently on screen — fetched separately from the paginated table.
  const stockBajo = useAsyncData(getStockBajo, { errorMessage: 'No se pudo cargar el alerta de stock.' })

  const proveedorById = useMemo(() => Object.fromEntries((proveedores.data ?? []).map((p) => [p.id, p])), [proveedores.data])
  const filtered = repuestos.rows
  const bajos = stockBajo.data ?? []

  const handleChange = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))

  // El margen (%) define el precio de venta: se recalcula automáticamente
  // cuando cambia el costo o el margen. El precio de venta no se edita a mano.
  const handlePrecioChange = (event) => {
    const { name, value } = event.target
    if (name === 'precio_costo') {
      setForm((prev) => {
        const costo = Number(value)
        const margen = Number(prev.margen)
        if (prev.margen === '') {
          // Sin margen definido: conservar el precio de venta ya cargado.
          return { ...prev, precio_costo: value }
        }
        const venta = costo > 0 && !Number.isNaN(margen) ? Math.max(0, Math.round(costo * (1 + margen / 100) * 100) / 100) : ''
        return { ...prev, precio_costo: value, precio_venta: venta }
      })
    } else if (name === 'margen') {
      setForm((prev) => {
        const costo = Number(prev.precio_costo)
        const margen = Number(value)
        if (value === '') {
          // Se vació el margen: no pisar el precio de venta ya cargado.
          return { ...prev, margen: '' }
        }
        const venta = prev.precio_costo !== '' && costo > 0 && !Number.isNaN(margen) ? Math.max(0, Math.round(costo * (1 + margen / 100) * 100) / 100) : ''
        return { ...prev, margen: value, precio_venta: venta }
      })
    }
  }

  const openForm = (repuesto) => {
    setForm(
      repuesto
        ? {
            id: repuesto.id,
            proveedor_id: repuesto.proveedor_id ?? '',
            nombre: repuesto.nombre,
            stock_actual: repuesto.stock_actual,
            stock_minimo: repuesto.stock_minimo,
            precio_costo: repuesto.precio_costo ?? '',
            margen: repuesto.precio_costo > 0 && repuesto.precio_venta > 0 ? Math.round(((repuesto.precio_venta / repuesto.precio_costo - 1) * 100) * 100) / 100 : '',
            precio_venta: repuesto.precio_venta ?? '',
          }
        : emptyForm
    )
    setOpen(true)
  }

  const reloadAll = () => {
    repuestos.reload()
    stockBajo.reload()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const costo = parseNumero(form.precio_costo)
    const venta = parseNumero(form.precio_venta)
    const margen = form.margen === '' ? NaN : parseNumero(form.margen)
    const stockActual = Number(form.stock_actual)
    const stockMinimo = Number(form.stock_minimo)
    if (form.precio_costo !== '' && (Number.isNaN(costo) || costo < 0)) {
      notify.error('El precio de costo debe ser un número mayor o igual a 0.')
      return
    }
    if (form.precio_venta !== '' && (Number.isNaN(venta) || venta < 0)) {
      notify.error('El precio de venta debe ser un número mayor o igual a 0.')
      return
    }
    if (form.margen !== '' && (Number.isNaN(margen) || margen < -100)) {
      notify.error('El margen no puede ser menor a -100%.')
      return
    }
    if (!Number.isInteger(stockActual) || stockActual < 0) {
      notify.error('El stock actual debe ser un número entero mayor o igual a 0.')
      return
    }
    if (!Number.isInteger(stockMinimo) || stockMinimo < 0) {
      notify.error('El stock mínimo debe ser un número entero mayor o igual a 0.')
      return
    }
    const payload = { proveedor_id: form.proveedor_id || null, nombre: form.nombre, stock_actual: stockActual, stock_minimo: stockMinimo, precio_costo: form.precio_costo === '' ? null : costo, precio_venta: form.precio_venta === '' ? null : venta }
    try {
      if (form.id) {
        await updateRepuesto(form.id, payload)
        notify.success('Producto actualizado.')
      } else {
        await createRepuesto(payload)
        notify.success('Producto creado.')
      }
      setOpen(false)
      reloadAll()
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo guardar el producto.')
    }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await deleteRepuesto(deleteTarget.id)
      notify.success('Producto eliminado.')
      setDeleteTarget(null)
      reloadAll()
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo eliminar el producto.')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const handleImport = async (rows) => {
    const payload = rows.map((row) => {
      const proveedor = (proveedores.data ?? []).find((p) => p.nombre.toLowerCase() === String(row.proveedor ?? '').toLowerCase())
      return {
        proveedor_id: proveedor?.id ?? null,
        nombre: row.nombre ?? row.producto,
        stock_actual: Number(row.stock_actual ?? row.stock ?? 0) || 0,
        stock_minimo: Number(row.stock_minimo ?? row.minimo ?? 0) || 0,
        precio_costo: row.precio_costo !== '' && row.precio_costo != null ? Number(row.precio_costo) : null,
        precio_venta: row.precio_venta !== '' && row.precio_venta != null ? Number(row.precio_venta) : null,
      }
    })
    const { creados, fallos, errores } = await importRepuestos(payload)
    if (creados) notify.success(`${plural(creados, 'producto')} importados.`)
    if (fallos) notify.warning(`${plural(fallos, 'fila')} no importadas: ${errores.slice(0, 3).join('; ')}${fallos > 3 ? '…' : ''}`)
    reloadAll()
  }

  const columns = [
    { header: 'Producto', key: 'nombre' },
    { header: 'Proveedor', key: 'proveedor_id', render: (r) => proveedorById[r.proveedor_id]?.nombre ?? '' },
    { header: 'Stock actual', key: 'stock_actual' },
    { header: 'Stock mínimo', key: 'stock_minimo' },
    { header: 'Precio costo', key: 'precio_costo' },
    { header: 'Precio venta', key: 'precio_venta' },
  ]

  return (
    <Box>
      <PageHeader
        title="Productos"
        subtitle="Inventario de productos con control de stock mínimo."
        actions={
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            <ExportExcelButton
              filename="productos"
              sheetName="Productos"
              columns={columns}
              rowsFetcher={async () => (await listRepuestos({ q: repuestos.q, per_page: 5000 })).data}
            />
            <ImportExcelButton onImport={handleImport} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openForm(null)}>
              Nuevo producto
            </Button>
          </Stack>
        }
      />

      {bajos.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2, borderColor: 'warning.main' }}>
          <WarningAmberIcon color="warning" />
          <Box>
            <Typography fontWeight={700}>Atención al stock</Typography>
            <Typography variant="body2" color="text.secondary">
              {plural(bajos.length, 'producto')} por debajo del mínimo: {bajos.map((r) => r.nombre).join(', ')}
            </Typography>
          </Box>
        </Paper>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 1.5, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Inventory2Icon fontSize="small" color="text.secondary" />
          <Typography variant="body2" color="text.secondary">
            {plural(repuestos.total, 'producto')}
          </Typography>
        </Box>
        <SearchInput value={repuestos.q} onChange={repuestos.setQ} placeholder="Buscar por nombre…" width={{ xs: '100%', sm: 280 }} />
      </Stack>

      {repuestos.loading ? (
        <SkeletonTable columns={7} />
      ) : filtered.length === 0 ? (
        <Paper variant="outlined">
          <EmptyState
            icon={Inventory2Icon}
            title={repuestos.q ? 'Sin resultados' : 'No hay productos'}
            description={repuestos.q ? 'Probá con otro término de búsqueda.' : 'Cargá el primer producto para comenzar a controlar el stock.'}
            actionLabel={!repuestos.q ? 'Nuevo producto' : undefined}
            onAction={() => openForm(null)}
          />
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Proveedor</TableCell>
                <TableCell align="center">Stock</TableCell>
                <TableCell align="center">Mínimo</TableCell>
                <TableCell align="right">Precio costo</TableCell>
                <TableCell align="right">Precio venta</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((r) => {
                const bajo = r.stock_actual <= r.stock_minimo
                return (
                  <TableRow key={r.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{r.nombre}</TableCell>
                    <TableCell>{proveedorById[r.proveedor_id]?.nombre ?? '—'}</TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: bajo ? 800 : 600, color: bajo ? 'error.main' : 'inherit' }}>
                        {r.stock_actual}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" color="text.secondary">
                      {r.stock_minimo}
                    </TableCell>
                    <TableCell align="right">{r.precio_costo != null ? fmtMoney(r.precio_costo) : '—'}</TableCell>
                    <TableCell align="right">{r.precio_venta != null ? fmtMoney(r.precio_venta) : '—'}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openForm(r)} aria-label="Editar">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(r)} aria-label="Eliminar">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          <Pagination
            count={repuestos.total}
            page={repuestos.page}
            rowsPerPage={repuestos.perPage}
            onPageChange={repuestos.onPageChange}
            onRowsPerPageChange={repuestos.onPerPageChange}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </TableContainer>
      )}

      <AppDialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        title={form.id ? 'Editar producto' : 'Nuevo producto'}
        subtitle="Repuesto o insumo del taller con su stock y precios."
        icon={<Inventory2Icon />}
        iconBg="primary.main"
        actions={
          <>
            <Button onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" form="repuesto-form" variant="contained">
              {form.id ? 'Guardar' : 'Crear'}
            </Button>
          </>
        }
      >
        <Box component="form" id="repuesto-form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Stack spacing={2}>
              <TextField label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required autoFocus />
              <TextField select label="Proveedor" name="proveedor_id" value={form.proveedor_id} onChange={handleChange}>
                <MenuItem value="">
                  <em>Sin proveedor</em>
                </MenuItem>
                {(proveedores.data ?? []).map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.nombre}
                  </MenuItem>
                ))}
              </TextField>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField label="Stock actual" name="stock_actual" type="number" value={form.stock_actual} onChange={handleChange} required fullWidth slotProps={{ htmlInput: { min: 0 } }} />
                <TextField label="Stock mínimo" name="stock_minimo" type="number" value={form.stock_minimo} onChange={handleChange} required fullWidth slotProps={{ htmlInput: { min: 0 } }} />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField label="Precio costo" name="precio_costo" type="number" value={form.precio_costo} onChange={handlePrecioChange} fullWidth slotProps={{ htmlInput: { min: 0, step: 0.01 } }} />
                <TextField label="Margen %" name="margen" type="number" value={form.margen} onChange={handlePrecioChange} fullWidth slotProps={{ htmlInput: { step: 0.01, min: -100 } }} />
              </Stack>
              <TextField
                label="Precio venta (auto)"
                name="precio_venta"
                type="number"
                value={form.precio_venta}
                fullWidth
                disabled
                slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                helperText={form.precio_costo !== '' && form.margen !== '' ? `Venta = costo × (1 + margen) → ${fmtMoney(Number(form.precio_venta) || 0)}` : 'Ingresá costo y margen para calcular el precio de venta.'}
              />
            </Stack>
          </Box>
        </AppDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar producto"
        message={`¿Eliminar ${deleteTarget?.nombre}? Esta acción es irreversible.`}
        busy={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </Box>
  )
}
