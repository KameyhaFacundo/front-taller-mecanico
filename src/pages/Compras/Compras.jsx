import { useMemo, useState } from 'react'
import { Box, Button, Chip, IconButton, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import PrintIcon from '@mui/icons-material/Print'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { createCompra, deleteCompra, importCompras, listCompras, listProveedoresOptions, listRepuestosOptions, updateCompra } from '../../services/stockApi'
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
import TicketDialog from '../../components/TicketDialog'
import { compraEstadoMeta } from '../../utils/meta'
import { fmtMoney, fmtDate, parseNumero, plural } from '../../utils/format'

const emptyCompra = { id: null, proveedor_id: '', fecha: '', estado_pago: 'pagado', items: [] }
const emptyItem = { repuesto_id: '', descripcion: '', cantidad: 1, precio: '' }

export default function Compras() {
  const notify = useNotify()
  const [form, setForm] = useState(emptyCompra)
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [ticket, setTicket] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)

  // Full unwrapped lists — used as lookup/dropdown sources, not their own
  // paginated tables.
  const proveedores = useAsyncData(listProveedoresOptions, { cacheKey: 'proveedores' })
  const repuestos = useAsyncData(listRepuestosOptions, { cacheKey: 'repuestos' })
  const compras = usePaginatedData(listCompras, { errorMessage: 'No se pudieron cargar las compras.' })

  const provById = useMemo(() => Object.fromEntries((proveedores.data ?? []).map((p) => [p.id, p])), [proveedores.data])
  const repById = useMemo(() => Object.fromEntries((repuestos.data ?? []).map((r) => [r.id, r])), [repuestos.data])
  const filtered = compras.rows

  const handleChange = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))

  const handleItemChange = (index, field, value) => setForm((prev) => ({ ...prev, items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)) }))

  const handleItemRepuesto = (index, repuestoId) =>
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i !== index) return item
        const repuesto = repById[repuestoId]
        // Pre-carga el nombre y el costo del repuesto; el usuario ajusta el
        // precio final si el proveedor cobró distinto.
        return { ...item, repuesto_id: repuestoId, descripcion: repuesto ? repuesto.nombre : item.descripcion, precio: item.precio || repuesto?.precio_costo || '' }
      }),
    }))

  const addItem = () => setForm((prev) => ({ ...prev, items: [...prev.items, { ...emptyItem }] }))
  const removeItem = (index) => setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))

  const subtotalItem = (item) => (Number.isNaN(parseNumero(item.cantidad)) ? 0 : parseNumero(item.cantidad)) * (Number.isNaN(parseNumero(item.precio)) ? 0 : parseNumero(item.precio))

  const totalForm = form.items.reduce((acc, item) => acc + subtotalItem(item), 0)

  const openForm = (compra) => {
    setForm(
      compra
        ? {
            id: compra.id,
            proveedor_id: compra.proveedor_id,
            fecha: compra.fecha?.slice(0, 10),
            estado_pago: compra.estado_pago,
            items: (compra.items ?? []).map((item) => ({ repuesto_id: item.repuesto_id ?? '', descripcion: item.descripcion ?? '', cantidad: item.cantidad, precio: item.precio })),
          }
        : emptyCompra
    )
    setOpen(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (form.items.length === 0) {
      notify.error('Agregá al menos un item a la compra.')
      return
    }
    for (const item of form.items) {
      const cantidad = parseNumero(item.cantidad)
      const precio = parseNumero(item.precio)
      if (Number.isNaN(cantidad) || cantidad < 1) {
        notify.error('La cantidad de cada item debe ser un número mayor a 0.')
        return
      }
      if (Number.isNaN(precio) || precio < 0) {
        notify.error('El precio de cada item debe ser un número válido.')
        return
      }
      if (!item.repuesto_id && !String(item.descripcion ?? '').trim()) {
        notify.error('Cada item necesita un repuesto o una descripción.')
        return
      }
    }
    setSaving(true)
    const payload = {
      proveedor_id: form.proveedor_id,
      fecha: form.fecha,
      estado_pago: form.estado_pago,
      items: form.items.map((item) => ({
        repuesto_id: item.repuesto_id || null,
        descripcion: item.descripcion,
        cantidad: parseNumero(item.cantidad),
        precio: parseNumero(item.precio),
      })),
    }
    try {
      if (form.id) {
        await updateCompra(form.id, payload)
        notify.success('Compra actualizada. Stock actualizado.')
      } else {
        const compra = await createCompra(payload)
        notify.success(`Compra #${compra.id} registrada. Stock aumentado.`)
      }
      setOpen(false)
      repuestos.refresh()
      compras.reload()
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo guardar la compra.')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await deleteCompra(deleteTarget.id)
      notify.success('Compra eliminada. Stock restituido.')
      setDeleteTarget(null)
      repuestos.refresh()
      compras.reload()
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo eliminar la compra.')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const handleImport = async (rows) => {
    // Group raw Excel rows into one compra per distinct proveedor+fecha
    // combo (each row is a line item), then send the whole batch in one
    // request instead of one createCompra() call per group.
    const grupos = new Map()
    const sinProveedor = new Set()
    for (const row of rows) {
      const proveedor = (proveedores.data ?? []).find((p) => p.nombre.toLowerCase() === String(row.proveedor ?? '').toLowerCase())
      if (!proveedor) {
        sinProveedor.add(row.proveedor ?? '?')
        continue
      }
      const hoyLocal = new Date()
      const fecha = row.fecha ?? `${hoyLocal.getFullYear()}-${String(hoyLocal.getMonth() + 1).padStart(2, '0')}-${String(hoyLocal.getDate()).padStart(2, '0')}`
      const key = `${proveedor.id}__${fecha}`
      if (!grupos.has(key)) {
        grupos.set(key, {
          proveedor_id: proveedor.id,
          fecha,
          estado_pago: String(row.estado_pago ?? row.estado ?? '').toLowerCase() === 'pendiente' ? 'pendiente' : 'pagado',
          items: [],
        })
      }
      const repuesto = (repuestos.data ?? []).find((x) => x.nombre.toLowerCase() === String(row.repuesto ?? '').toLowerCase())
      grupos.get(key).items.push({
        repuesto_id: repuesto?.id ?? null,
        descripcion: repuesto?.nombre ?? row.repuesto ?? row.descripcion ?? '',
        cantidad: Number.isNaN(parseNumero(row.cantidad)) ? 1 : parseNumero(row.cantidad),
        precio: Number.isNaN(parseNumero(row.precio)) ? 0 : parseNumero(row.precio),
      })
    }

    const payload = [...grupos.values()]
    const result = payload.length ? await importCompras(payload) : { creados: 0, fallos: 0, errores: [] }
    const totalFallos = result.fallos + sinProveedor.size
    if (result.creados) notify.success(`${plural(result.creados, 'compra')} importadas.`)
    if (totalFallos === 0 && result.creados === 0) {
      notify.warning('No se pudo importar: verificá que existan proveedor y repuestos con esos nombres.')
    } else if (totalFallos) {
      const detalle = [...result.errores, ...[...sinProveedor].map((p) => `Proveedor "${p}" no encontrado`)]
      notify.warning(`${plural(totalFallos, 'fila')} no importadas: ${detalle.slice(0, 3).join('; ')}${totalFallos > 3 ? '…' : ''}`)
    }
    repuestos.refresh()
    compras.reload()
  }

  const totalDetail = (detail?.items ?? []).reduce((acc, item) => acc + subtotalItem(item), 0)

  const buildCompraTicket = (compra) => ({
    titulo: 'Compra',
    numero: compra.id,
    fecha: fmtDate(compra.fecha),
    meta: [
      { label: 'Proveedor', value: provById[compra.proveedor_id]?.nombre ?? '—' },
      { label: 'Estado de pago', value: compraEstadoMeta[compra.estado_pago]?.label ?? compra.estado_pago },
    ],
    items: (compra.items ?? []).map((item) => ({
      descripcion: repById[item.repuesto_id]?.nombre ?? item.descripcion ?? '—',
      detalle: `${item.cantidad} × ${fmtMoney(item.precio)}`,
      subtotal: fmtMoney(subtotalItem(item)),
    })),
    totales: [{ label: 'Total', value: fmtMoney(compra.importe ?? totalDetail) }],
    notas: [],
  })

  const columns = [
    { header: 'Repuesto', key: 'repuesto', render: (i) => repById[i.repuesto_id]?.nombre ?? i.descripcion ?? '—' },
    { header: 'Cantidad', key: 'cantidad' },
    { header: 'Precio', key: 'precio', render: (i) => fmtMoney(i.precio) },
    { header: 'Proveedor', key: 'proveedor' },
    { header: 'Fecha', key: 'fecha' },
    { header: 'Estado', key: 'estado_pago' },
  ]

  return (
    <Box>
      <PageHeader
        title="Compras"
        subtitle="Compras a proveedores. Cada compra aumenta el stock automáticamente."
        actions={
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            <ExportExcelButton
              filename="compras"
              sheetName="Compras"
              columns={columns}
              rowsFetcher={async () => {
                const compras = (await listCompras({ q: compras.q, per_page: 5000 })).data
                return compras.flatMap((c) =>
                  (c.items ?? []).map((i) => ({ ...i, proveedor: provById[c.proveedor_id]?.nombre ?? '', fecha: c.fecha, estado_pago: c.estado_pago }))
                )
              }}
            />
            <ImportExcelButton onImport={handleImport} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openForm(null)}>
              Nueva compra
            </Button>
          </Stack>
        }
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 1.5, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ShoppingCartIcon fontSize="small" color="text.secondary" />
          <Typography variant="body2" color="text.secondary">
            {plural(compras.total, 'compra')}
          </Typography>
        </Box>
        <SearchInput value={compras.q} onChange={compras.setQ} placeholder="Buscar por proveedor o repuesto…" width={{ xs: '100%', sm: 300 }} />
      </Stack>

      {compras.loading ? (
        <SkeletonTable columns={6} />
      ) : filtered.length === 0 ? (
        <Paper variant="outlined">
          <EmptyState
            icon={ShoppingCartIcon}
            title={compras.q ? 'Sin resultados' : 'No hay compras'}
            description={compras.q ? 'Probá con otro término de búsqueda.' : 'Registrá compras a proveedores; el stock se actualiza solo.'}
            actionLabel={!compras.q ? 'Nueva compra' : undefined}
            onAction={() => openForm(null)}
          />
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 60 }}>N°</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Proveedor</TableCell>
                <TableCell align="right">Importe</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((compra) => (
                <TableRow key={compra.id} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      #{compra.id}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{fmtDate(compra.fecha)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {provById[compra.proveedor_id]?.nombre ?? '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      {fmtMoney(compra.importe)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={compraEstadoMeta[compra.estado_pago]?.label ?? compra.estado_pago} color={compraEstadoMeta[compra.estado_pago]?.color ?? 'default'} />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => setTicket(buildCompraTicket(compra))} aria-label="Imprimir ticket">
                      <PrintIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setDetail(compra)} aria-label="Ver detalle">
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => openForm(compra)} aria-label="Editar">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget(compra)} aria-label="Eliminar">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            count={compras.total}
            page={compras.page}
            rowsPerPage={compras.perPage}
            onPageChange={compras.onPageChange}
            onRowsPerPageChange={compras.onPerPageChange}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </TableContainer>
      )}

      <AppDialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        title={form.id ? `Editar compra #${form.id}` : 'Nueva compra'}
        subtitle="Registrá la compra de repuestos a un proveedor."
        icon={<ShoppingCartIcon />}
        iconBg="primary.main"
        actions={
          <>
            <Button onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" form="compra-form" variant="contained" disabled={form.items.length === 0 || saving}>
              {saving ? 'Guardando…' : form.id ? 'Guardar' : 'Registrar compra'}
            </Button>
          </>
        }
      >
        <Box component="form" id="compra-form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField select label="Proveedor" name="proveedor_id" value={form.proveedor_id} onChange={handleChange} required fullWidth autoFocus>
                  {(proveedores.data ?? []).map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.nombre}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField label="Fecha" name="fecha" type="date" value={form.fecha} onChange={handleChange} required fullWidth InputLabelProps={{ shrink: true }} />
                <TextField select label="Estado de pago" name="estado_pago" value={form.estado_pago} onChange={handleChange} sx={{ width: { xs: '100%', sm: 180 } }}>
                  {Object.entries(compraEstadoMeta).map(([estado, meta]) => (
                    <MenuItem key={estado} value={estado}>
                      {meta.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Box>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2">Items</Typography>
                  <Button size="small" startIcon={<AddIcon />} onClick={addItem}>
                    Agregar item
                  </Button>
                </Stack>
                <Stack spacing={1.5}>
                  {form.items.map((item, index) => (
                    <Box key={index} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ alignItems: { md: 'center' } }}>
                        <TextField select label="Repuesto" value={item.repuesto_id} onChange={(e) => handleItemRepuesto(index, e.target.value)} size="small" sx={{ flexGrow: 1 }}>
                          <MenuItem value="">
                            <em>Repuesto suelto (ingresá descripción)</em>
                          </MenuItem>
                          {(repuestos.data ?? []).map((r) => (
                            <MenuItem key={r.id} value={r.id}>
                              {r.nombre} (stock: {r.stock_actual})
                            </MenuItem>
                          ))}
                        </TextField>
                        <TextField label="Descripción" value={item.descripcion} onChange={(e) => handleItemChange(index, 'descripcion', e.target.value)} size="small" sx={{ flexGrow: 1 }} />
                        <TextField label="Cant." type="number" value={item.cantidad} onChange={(e) => handleItemChange(index, 'cantidad', e.target.value)} size="small" slotProps={{ htmlInput: { min: 1 } }} sx={{ width: { xs: '100%', md: 90 } }} />
                        <TextField label="Precio unit." type="number" inputMode="decimal" value={item.precio} onChange={(e) => handleItemChange(index, 'precio', e.target.value)} size="small" slotProps={{ htmlInput: { min: 0 } }} sx={{ width: { xs: '100%', md: 130 } }} />
                        <IconButton size="small" color="error" onClick={() => removeItem(index)} aria-label="Quitar item">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mt: 0.75 }}>
                        Subtotal: <strong>{fmtMoney(subtotalItem(item))}</strong>
                      </Typography>
                    </Box>
                  ))}
                  {form.items.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                      Agregá los repuestos o insumos comprados.
                    </Typography>
                  )}
                </Stack>
                {form.items.length > 0 && (
                  <Stack direction="row" sx={{ justifyContent: 'flex-end', mt: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      Total: {fmtMoney(totalForm)}
                    </Typography>
                  </Stack>
                )}
              </Box>
            </Stack>
          </Box>
        </AppDialog>

      <AppDialog
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        maxWidth="sm"
        title={`Compra #${detail?.id}`}
        subtitle="Detalle de la compra."
        icon={<VisibilityIcon />}
        iconBg="primary.main"
        actions={
          <>
            <Button onClick={() => setDetail(null)}>Cerrar</Button>
            <Button variant="contained" startIcon={<PrintIcon />} onClick={() => detail && setTicket(buildCompraTicket(detail))}>
              Imprimir ticket
            </Button>
          </>
        }
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', rowGap: 1.5 }}>
            <Box sx={{ flexGrow: 1, minWidth: 160 }}>
              <Typography variant="caption" color="text.secondary">
                Proveedor
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {provById[detail?.proveedor_id]?.nombre ?? '—'}
              </Typography>
            </Box>
            <Box sx={{ minWidth: 110 }}>
              <Typography variant="caption" color="text.secondary">
                Fecha
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {fmtDate(detail?.fecha)}
              </Typography>
            </Box>
            <Box sx={{ minWidth: 110 }}>
              <Typography variant="caption" color="text.secondary">
                Estado
              </Typography>
              <Box sx={{ mt: 0.25 }}>
                <Chip size="small" label={compraEstadoMeta[detail?.estado_pago]?.label ?? detail?.estado_pago} color={compraEstadoMeta[detail?.estado_pago]?.color ?? 'default'} />
              </Box>
            </Box>
          </Stack>

          <Box sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <TableContainer component={Box}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Repuesto / Detalle</TableCell>
                    <TableCell align="right">Cant.</TableCell>
                    <TableCell align="right">Precio unit.</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(detail?.items ?? []).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{repById[item.repuesto_id]?.nombre ?? item.descripcion ?? '—'}</TableCell>
                      <TableCell align="right">{item.cantidad}</TableCell>
                      <TableCell align="right">{fmtMoney(item.precio)}</TableCell>
                      <TableCell align="right">{fmtMoney(subtotalItem(item))}</TableCell>
                    </TableRow>
                  ))}
                  {(detail?.items?.length ?? 0) === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        Sin items
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Total: {fmtMoney(detail?.importe ?? totalDetail)}
            </Typography>
          </Stack>
        </Stack>
      </AppDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar compra"
        message={`¿Eliminar la compra por ${fmtMoney(deleteTarget?.importe)}? Se restituirá el stock.`}
        busy={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      <TicketDialog open={Boolean(ticket)} onClose={() => setTicket(null)} {...ticket} />
    </Box>
  )
}