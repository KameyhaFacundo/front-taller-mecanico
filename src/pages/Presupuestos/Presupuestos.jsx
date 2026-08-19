import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Chip, IconButton, MenuItem, Paper, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import PrintIcon from '@mui/icons-material/Print'
import RequestQuoteIcon from '@mui/icons-material/RequestQuote'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import { createPresupuesto, deletePresupuesto, getPresupuesto, listPresupuestos, updatePresupuesto, convertirPresupuesto } from '../../services/presupuestosApi'
import { listClientesOptions, listVehiculosOptions } from '../../services/clientesApi'
import { listRepuestosOptions } from '../../services/stockApi'
import { useAsyncData } from '../../hooks/useAsyncData'
import { usePaginatedData } from '../../hooks/usePaginatedData'
import { useNotify } from '../../context/useNotify'
import AppDialog from '../../components/AppDialog'
import PageHeader from '../../components/PageHeader'
import SearchInput from '../../components/SearchInput'
import SkeletonTable from '../../components/SkeletonTable'
import EmptyState from '../../components/EmptyState'
import ConfirmDialog from '../../components/ConfirmDialog'
import Pagination from '../../components/Pagination'
import TicketDialog from '../../components/TicketDialog'
import VehiculoPicker from '../../components/VehiculoPicker'
import NuevoClienteDialog from '../../components/NuevoClienteDialog'
import { presupuestoEstadoMeta } from '../../utils/meta'
import { fmtMoney, fmtDateTime, parseNumero, plural } from '../../utils/format'
import { waLink, waMensajePresupuesto } from '../../utils/wa'

const emptyForm = { id: null, cliente_id: '', vehiculo_id: '', estado: 'pendiente', validez_dias: '', notas: '', items: [] }
const emptyItem = { tipo: 'mano_obra', repuesto_id: '', descripcion: '', cantidad: 1, precio: '' }
// Clave estable por item (no el índice): al borrar un item del medio, React
// conserva el estado/foco de los inputs correctos.
const uid = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `k-${Date.now()}-${Math.random().toString(36).slice(2)}`)

export default function Presupuestos() {
  const notify = useNotify()
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [open, setOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [estado, setEstado] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [convertirTarget, setConvertirTarget] = useState(null)
  const [convirtiendo, setConvirtiendo] = useState(false)
  const [ticket, setTicket] = useState(null)
  const [clienteNuevoOpen, setClienteNuevoOpen] = useState(false)

  const clientes = useAsyncData(listClientesOptions, { errorMessage: 'No se pudieron cargar los clientes.', cacheKey: 'clientes' })
  const vehiculos = useAsyncData(listVehiculosOptions, { errorMessage: 'No se pudieron cargar los vehículos.', cacheKey: 'vehiculos' })
  const repuestos = useAsyncData(listRepuestosOptions, { errorMessage: 'No se pudieron cargar los repuestos.', cacheKey: 'repuestos' })

  const estadoParams = useMemo(() => (estado ? { estado } : undefined), [estado])
  const presupuestos = usePaginatedData(listPresupuestos, {
    errorMessage: 'No se pudieron cargar los presupuestos.',
    extraParams: estadoParams,
  })

  const vehById = useMemo(() => Object.fromEntries((vehiculos.data ?? []).map((v) => [v.id, v])), [vehiculos.data])
  const repById = useMemo(() => Object.fromEntries((repuestos.data ?? []).map((r) => [r.id, r])), [repuestos.data])
  // El presupuesto trae el cliente solo con nombre (sin teléfonos); para el
  // link de WhatsApp hay que resolverlo contra el catálogo de clientes.
  const clienteById = useMemo(() => Object.fromEntries((clientes.data ?? []).map((c) => [c.id, c])), [clientes.data])
  const filtered = presupuestos.rows

  const vehTexto = (v) => (v ? `${v.marca} ${v.modelo}${v.anio ? ` ${v.anio}` : ''} · ${v.patente}` : '—')
  const clienteDe = (p) => p.cliente?.nombre ?? p.vehiculo?.cliente?.nombre ?? '—'
  const clienteWaDe = (p) => clienteById[p.cliente_id ?? vehById[p.vehiculo_id]?.cliente_id] ?? p.cliente ?? p.vehiculo?.cliente ?? null

  const handleChange = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))

  const handleItemChange = (index, field, value) => setForm((prev) => ({ ...prev, items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)) }))

  const handleItemTipo = (index, tipo) => setForm((prev) => ({ ...prev, items: prev.items.map((item, i) => (i === index ? { ...item, tipo, repuesto_id: '', precio: '' } : item)) }))

  // El precio de un item de producto viene de la tabla de repuestos (precio de
  // venta cargado en Repuestos), no se tipea a mano.
  const handleItemProducto = (index, repuestoId) =>
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, repuesto_id: repuestoId, precio: repById[repuestoId]?.precio_venta ?? 0 } : item)),
    }))

  const addItem = () => setForm((prev) => ({ ...prev, items: [...prev.items, { ...emptyItem, _key: uid() }] }))
  const removeItem = (index) => setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))

  const subtotalItem = (item) => (Number.isNaN(parseNumero(item.cantidad)) ? 0 : parseNumero(item.cantidad)) * (Number.isNaN(parseNumero(item.precio)) ? 0 : parseNumero(item.precio))
  const totalForm = form.items.reduce((acc, item) => acc + subtotalItem(item), 0)

  const buildPresupuestoTicket = (p) => {
    const notas = []
    if (p.validez_dias) notas.push(`Válido por ${plural(p.validez_dias, 'día')}.`)
    if (p.notas) notas.push(p.notas)
    return {
      titulo: 'Presupuesto',
      numero: p.id,
      fecha: fmtDateTime(p.created_at),
      meta: [
        { label: 'Cliente', value: clienteDe(p) },
        { label: 'Vehículo', value: vehTexto(p.vehiculo) },
        { label: 'Estado', value: presupuestoEstadoMeta[p.estado]?.label ?? p.estado },
      ],
      items: (p.items ?? []).map((item) => ({
        descripcion: item.tipo === 'repuesto' ? (repById[item.repuesto_id]?.nombre ?? item.descripcion ?? 'Producto') : item.descripcion || 'Mano de obra',
        detalle: `${item.tipo === 'repuesto' ? 'Producto' : 'Mano de obra'} · ${item.cantidad} × ${fmtMoney(item.precio)}`,
        subtotal: fmtMoney(subtotalItem(item)),
      })),
      totales: [{ label: 'Total', value: fmtMoney(p.total) }],
      notas,
    }
  }

  const buildPresupuestoWaUrl = (p) => {
    const itemsTexto = (p.items ?? []).map((item) => {
      const nombre = item.tipo === 'repuesto' ? (repById[item.repuesto_id]?.nombre ?? item.descripcion ?? 'Producto') : item.descripcion || 'Mano de obra'
      return `• ${nombre} (${item.cantidad} × ${fmtMoney(item.precio)}) = ${fmtMoney(subtotalItem(item))}`
    })
    const clienteWa = clienteWaDe(p)
    return waLink(clienteWa?.telefonos?.[0]?.telefono, waMensajePresupuesto(p, p.vehiculo ?? vehById[p.vehiculo_id], itemsTexto))
  }

  const reload = () => {
    presupuestos.reload()
    repuestos.refresh()
    vehiculos.refresh()
  }

  const openForm = async (presupuesto) => {
    if (!presupuesto) {
      setForm(emptyForm)
      setOpen(true)
      return
    }
    // La lista trae el resumen; para editar se carga el presupuesto completo
    // (todos los items) bajo demanda.
    setOpen(true)
    setFormLoading(true)
    try {
      const data = await getPresupuesto(presupuesto.id)
      setForm({
        id: data.id,
        cliente_id: data.cliente_id ?? vehById[data.vehiculo_id]?.cliente_id ?? '',
        vehiculo_id: data.vehiculo_id,
        estado: data.estado,
        validez_dias: data.validez_dias ?? '',
        notas: data.notas ?? '',
        items: (data.items ?? []).map((item) => ({
          _key: uid(),
          id: item.id,
          tipo: item.tipo,
          repuesto_id: item.repuesto_id ?? '',
          descripcion: item.descripcion ?? '',
          cantidad: item.cantidad,
          precio: item.precio,
        })),
      })
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo cargar el presupuesto.')
      setOpen(false)
    } finally {
      setFormLoading(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (form.items.length === 0) {
      notify.error('Cargá al menos un item en el presupuesto.')
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
        notify.error('El precio de cada item debe ser un número mayor o igual a 0.')
        return
      }
      if (item.tipo === 'repuesto' && !item.repuesto_id) {
        notify.error('Elegí el producto de cada item de tipo producto.')
        return
      }
      if (item.tipo === 'mano_obra' && !String(item.descripcion ?? '').trim()) {
        notify.error('Cargá la descripción de cada item de mano de obra.')
        return
      }
    }
    const payload = {
      vehiculo_id: form.vehiculo_id,
      cliente_id: form.cliente_id || null,
      estado: form.estado,
      validez_dias: form.validez_dias ? parseNumero(form.validez_dias) : null,
      notas: form.notas || null,
      items: form.items.map((item) => ({
        id: item.id ?? null,
        tipo: item.tipo,
        repuesto_id: item.tipo === 'repuesto' && item.repuesto_id ? item.repuesto_id : null,
        descripcion: item.descripcion,
        cantidad: parseNumero(item.cantidad),
        precio: parseNumero(item.precio),
      })),
    }
    setFormLoading(true)
    try {
      if (form.id) {
        await updatePresupuesto(form.id, payload)
        notify.success('Presupuesto actualizado.')
      } else {
        const presupuesto = await createPresupuesto(payload)
        notify.success(`Presupuesto #${presupuesto.id} creado.`)
      }
      setOpen(false)
      reload()
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo guardar el presupuesto.')
    } finally {
      setFormLoading(false)
    }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await deletePresupuesto(deleteTarget.id)
      notify.success('Presupuesto eliminado.')
      setDeleteTarget(null)
      reload()
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo eliminar el presupuesto.')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const confirmConvertir = async () => {
    setConvirtiendo(true)
    try {
      const orden = await convertirPresupuesto(convertirTarget.id)
      notify.success(`Convertido en orden #${orden.id}.`)
      setConvertirTarget(null)
      reload()
      navigate('/ordenes')
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo convertir el presupuesto.')
      setConvertirTarget(null)
    } finally {
      setConvirtiendo(false)
    }
  }

  return (
    <Box>
      <PageHeader
        title="Presupuestos"
        subtitle="Cotizaciones a clientes. Podés aprobarlos e imprimirlos, o convertirlos en órdenes de trabajo."
        actions={
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openForm(null)}>
              Nuevo presupuesto
            </Button>
          </Stack>
        }
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 1.5, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <RequestQuoteIcon fontSize="small" color="text.secondary" />
          <Typography variant="body2" color="text.secondary">
            {plural(presupuestos.total, 'presupuesto')}
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField select label="Estado" value={estado} onChange={(e) => setEstado(e.target.value)} size="small" sx={{ width: { xs: '100%', sm: 200 } }}>
            <MenuItem value="">
              <em>Todos</em>
            </MenuItem>
            {Object.entries(presupuestoEstadoMeta).map(([key, meta]) => (
              <MenuItem key={key} value={key}>
                {meta.label}
              </MenuItem>
            ))}
          </TextField>
          <SearchInput value={presupuestos.q} onChange={presupuestos.setQ} placeholder="Buscar por cliente, patente o N°…" width={{ xs: '100%', sm: 300 }} />
        </Stack>
      </Stack>

      {presupuestos.loading ? (
        <SkeletonTable columns={6} />
      ) : filtered.length === 0 ? (
        <Paper variant="outlined">
          <EmptyState
            icon={RequestQuoteIcon}
            title={presupuestos.q || estado ? 'Sin resultados' : 'No hay presupuestos'}
            description={presupuestos.q || estado ? 'Probá con otro término de búsqueda o filtro.' : 'Creá cotizaciones y conviertelas en órdenes cuando el cliente apruebe.'}
            actionLabel={!presupuestos.q && !estado ? 'Nuevo presupuesto' : undefined}
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
                <TableCell>Cliente</TableCell>
                <TableCell>Vehículo</TableCell>
                <TableCell align="right">Items</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center" sx={{ width: 210 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((presupuesto) => {
                const waUrl = buildPresupuestoWaUrl(presupuesto)
                return (
                <TableRow key={presupuesto.id} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      #{presupuesto.id}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{fmtDateTime(presupuesto.created_at)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {clienteDe(presupuesto)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{vehTexto(presupuesto.vehiculo)}</TableCell>
                  <TableCell align="right">{plural(presupuesto.items?.length ?? 0, 'item')}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      {fmtMoney(presupuesto.total)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={presupuestoEstadoMeta[presupuesto.estado]?.label ?? presupuesto.estado} color={presupuestoEstadoMeta[presupuesto.estado]?.color ?? 'default'} />
                  </TableCell>
                  <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                    <IconButton
                      size="small"
                      component="a"
                      href={waUrl ?? undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      disabled={!waUrl}
                      aria-label="Enviar presupuesto por WhatsApp"
                      title="Enviar por WhatsApp"
                      sx={{ color: 'success.main' }}
                    >
                      <WhatsAppIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setTicket(buildPresupuestoTicket(presupuesto))} aria-label="Imprimir presupuesto" title="Imprimir">
                      <PrintIcon fontSize="small" />
                    </IconButton>
                    {presupuesto.estado !== 'convertido' && (
                      <IconButton size="small" onClick={() => setConvertirTarget(presupuesto)} aria-label="Convertir a orden" title="Convertir a orden">
                        <AssignmentTurnedInIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton size="small" onClick={() => openForm(presupuesto)} aria-label="Editar presupuesto" title="Editar">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {presupuesto.estado !== 'convertido' && (
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(presupuesto)} aria-label="Eliminar presupuesto" title="Eliminar">
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
            count={presupuestos.total}
            page={presupuestos.page}
            rowsPerPage={presupuestos.perPage}
            onPageChange={presupuestos.onPageChange}
            onRowsPerPageChange={presupuestos.onPerPageChange}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </TableContainer>
      )}

      <AppDialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        title={form.id ? `Editar presupuesto #${form.id}` : 'Nuevo presupuesto'}
        subtitle="Cotizá los trabajos de una moto con sus items y precio final."
        icon={<RequestQuoteIcon />}
        iconBg="primary.main"
        actions={
          <>
            <Button onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" form="presupuesto-form" variant="contained" disabled={formLoading || form.items.length === 0}>
              {formLoading ? 'Guardando…' : form.id ? 'Guardar' : 'Crear presupuesto'}
            </Button>
          </>
        }
      >
        {formLoading ? (
          <Stack spacing={2}>
            <Skeleton variant="rounded" height={56} />
            <Skeleton variant="rounded" height={56} />
            <Skeleton variant="rounded" height={160} />
          </Stack>
        ) : (
          <Box component="form" id="presupuesto-form" onSubmit={handleSubmit}>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <VehiculoPicker
                clientes={clientes.data ?? []}
                vehiculos={vehiculos.data ?? []}
                vehiculoId={form.vehiculo_id}
                clienteId={form.cliente_id}
                onVehiculoChange={(id) => setForm((prev) => ({ ...prev, vehiculo_id: id }))}
                onClienteChange={(id) => setForm((prev) => ({ ...prev, cliente_id: id, vehiculo_id: '' }))}
                onCreateCliente={() => setClienteNuevoOpen(true)}
                required
                autoFocus
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField select label="Estado" name="estado" value={form.estado} onChange={handleChange} sx={{ width: { xs: '100%', sm: 200 } }}>
                  {Object.entries(presupuestoEstadoMeta).map(([key, meta]) => (
                    <MenuItem key={key} value={key}>
                      {meta.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField label="Validez (días, opcional)" type="number" name="validez_dias" value={form.validez_dias} onChange={handleChange} slotProps={{ htmlInput: { min: 1, max: 365 } }} sx={{ width: { xs: '100%', sm: 180 } }} />
                <TextField label="Notas (opcional)" name="notas" value={form.notas} onChange={handleChange} multiline minRows={1} sx={{ flexGrow: 1 }} />
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
                    <Stack key={item._key} direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ alignItems: { md: 'center' }, p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                      <ToggleButtonGroup size="small" exclusive value={item.tipo} onChange={(_, value) => value && handleItemTipo(index, value)}>
                        <ToggleButton value="mano_obra">Mano de obra</ToggleButton>
                        <ToggleButton value="repuesto">Producto</ToggleButton>
                      </ToggleButtonGroup>
                      {item.tipo === 'repuesto' ? (
                        <TextField select label="Producto" value={item.repuesto_id} onChange={(e) => handleItemProducto(index, e.target.value)} required size="small" sx={{ flexGrow: 1 }}>
                          {(repuestos.data ?? []).map((r) => (
                            <MenuItem key={r.id} value={r.id}>
                              {r.nombre} (stock: {r.stock_actual})
                            </MenuItem>
                          ))}
                        </TextField>
                      ) : (
                        <TextField label="Descripción" value={item.descripcion} onChange={(e) => handleItemChange(index, 'descripcion', e.target.value)} size="small" sx={{ flexGrow: 1 }} />
                      )}
                      <TextField label="Cant." type="number" value={item.cantidad} onChange={(e) => handleItemChange(index, 'cantidad', e.target.value)} size="small" slotProps={{ htmlInput: { min: 1 } }} sx={{ width: { xs: '100%', md: 80 } }} />
                      <TextField
                        label="Precio unit."
                        type="number"
                        value={item.precio}
                        onChange={(e) => handleItemChange(index, 'precio', e.target.value)}
                        size="small"
                        disabled={item.tipo === 'repuesto'}
                        slotProps={{ htmlInput: { min: 0 } }}
                        sx={{ width: { xs: '100%', md: 130 } }}
                      />
                      <IconButton size="small" color="error" onClick={() => removeItem(index)} aria-label="Quitar item">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  ))}
                  {form.items.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                      Agregá productos o mano de obra al presupuesto.
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
        )}
      </AppDialog>

      <TicketDialog open={Boolean(ticket)} onClose={() => setTicket(null)} {...ticket} />

      <NuevoClienteDialog
        open={clienteNuevoOpen}
        onClose={() => setClienteNuevoOpen(false)}
        onCreated={(cliente) => {
          clientes.refresh()
          setForm((prev) => ({ ...prev, cliente_id: cliente.id, vehiculo_id: '' }))
        }}
      />

      <ConfirmDialog
        open={Boolean(convertirTarget)}
        title="Convertir en orden de trabajo"
        message={`¿Convertir el presupuesto #${convertirTarget?.id} por ${fmtMoney(convertirTarget?.total)} en una orden de trabajo? Se descontará el stock de los productos incluidos.`}
        busy={convirtiendo}
        onClose={() => setConvertirTarget(null)}
        onConfirm={confirmConvertir}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar presupuesto"
        message={`¿Eliminar el presupuesto #${deleteTarget?.id} por ${fmtMoney(deleteTarget?.total)}?`}
        busy={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </Box>
  )
}