import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { alpha } from '@mui/material/styles'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Stepper,
  Step,
  StepLabel,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ReceiptIcon from '@mui/icons-material/Receipt'
import AssignmentIcon from '@mui/icons-material/Assignment'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import ConstructionIcon from '@mui/icons-material/Construction'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import EventIcon from '@mui/icons-material/Event'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import PrintIcon from '@mui/icons-material/Print'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import PersonIcon from '@mui/icons-material/Person'
import EngineeringIcon from '@mui/icons-material/Engineering'
import HandymanIcon from '@mui/icons-material/Handyman'
import { cambiarEstadoOrden, createOrden, deleteOrden, getOrden, listOrdenes, marcarItemOrden, updateOrden } from '../../services/ordenesApi'
import { listClientesOptions, listVehiculosOptions } from '../../services/clientesApi'
import { listRepuestosOptions } from '../../services/stockApi'
import { listUsuariosOpciones } from '../../services/usersApi'
import { createPago } from '../../services/cajaApi'
import { useAsyncData } from '../../hooks/useAsyncData'
import { usePaginatedData } from '../../hooks/usePaginatedData'
import { useNotify } from '../../context/useNotify'
import PageHeader from '../../components/PageHeader'
import SearchInput from '../../components/SearchInput'
import EmptyState from '../../components/EmptyState'
import ConfirmDialog from '../../components/ConfirmDialog'
import RowActionsMenu from '../../components/RowActionsMenu'
import CobroDialog from '../../components/CobroDialog'
import AppDialog from '../../components/AppDialog'
import ExportExcelButton from '../../components/ExportExcelButton'
import VehiculoPicker from '../../components/VehiculoPicker'
import NuevoVehiculoDialog from '../../components/NuevoVehiculoDialog'
import TicketDialog from '../../components/TicketDialog'
import { ordenEstadoMeta, ordenNextEstados, pagoMetodoMeta } from '../../utils/meta'
import { fmtMoney, fmtDateTime, fmtDateTimeShort, fmtVehiculo, parseNumero, toISODate } from '../../utils/format'
import { waLink, waMensajeOrden } from '../../utils/wa'

const emptyForm = { id: null, cliente_id: '', vehiculo_id: '', asignado_a: '', estado: 'pendiente', items: [] }
const emptyItem = { tipo: 'mano_obra', repuesto_id: '', descripcion: '', cantidad: 1, precio: '' }
// Clave estable por item (no el índice): al borrar un item del medio, React
// conserva el estado/foco de los inputs correctos.
const uid = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `k-${Date.now()}-${Math.random().toString(36).slice(2)}`)

const boardColumns = [
  { key: 'pendiente', icon: HourglassEmptyIcon },
  { key: 'en_ejecucion', icon: ConstructionIcon },
  { key: 'terminado', icon: CheckCircleIcon },
  { key: 'entregado', icon: LocalShippingIcon },
]

export default function Ordenes() {
  const notify = useNotify()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState(emptyForm)
  const [open, setOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [cobroTarget, setCobroTarget] = useState(null)
  const [cobrando, setCobrando] = useState(false)
  const [pagoForm, setPagoForm] = useState({ monto: '', metodo: 'efectivo', referencia: '' })
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [ticket, setTicket] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [vehNuevoOpen, setVehNuevoOpen] = useState(false)
  const [rango, setRango] = useState('todo')
  const [reabrirTarget, setReabrirTarget] = useState(null)
  const [reabrirBusy, setReabrirBusy] = useState(false)
  const [marcarTodosBusy, setMarcarTodosBusy] = useState(false)

  // "cobrar" llega desde el Dashboard (estado de navegación): abre el cobro
  // de esa orden directamente sin buscarla en el tablero.
  useEffect(() => {
    if (location.state?.cobrar) {
      const id = Number(location.state.cobrar)
      navigate(location.pathname, { replace: true, state: {} })
      ;(async () => {
        try {
          const orden = await getOrden(id)
          setCobroTarget(orden)
          setPagoForm({ monto: String(orden.saldo_pendiente ?? ''), metodo: 'efectivo', referencia: '' })
        } catch {
          notify.error('No se pudo cargar la orden a cobrar.')
        }
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Full unwrapped lists — used as lookup/dropdown sources, not their own
  // paginated tables (Vehiculos/Repuestos already have those elsewhere).
  const clientes = useAsyncData(listClientesOptions, { errorMessage: 'No se pudieron cargar los clientes.', cacheKey: 'clientes' })
  const vehiculos = useAsyncData(listVehiculosOptions, { errorMessage: 'No se pudieron cargar los vehículos.', cacheKey: 'vehiculos' })
  const repuestos = useAsyncData(listRepuestosOptions, { errorMessage: 'No se pudieron cargar los repuestos.', cacheKey: 'repuestos' })
  const tecnicos = useAsyncData(listUsuariosOpciones, { errorMessage: 'No se pudieron cargar los usuarios.', cacheKey: 'tecnicos' })

  // "Semana"/"Mes"/"Año" filtran por fecha de creación de la orden — sin
  // filtro (Todo) no se manda nada y el back no filtra.
  const fechaParams = useMemo(() => {
    if (rango === 'todo') return undefined
    const hoy = new Date()
    if (rango === 'semana') {
      const dia = hoy.getDay()
      const diffLunes = dia === 0 ? -6 : 1 - dia
      const lunes = new Date(hoy)
      lunes.setDate(hoy.getDate() + diffLunes)
      const domingo = new Date(lunes)
      domingo.setDate(lunes.getDate() + 6)
      return { fecha_desde: toISODate(lunes), fecha_hasta: toISODate(domingo) }
    }
    if (rango === 'mes') {
      const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
      const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
      return { fecha_desde: toISODate(inicio), fecha_hasta: toISODate(fin) }
    }
    return { fecha_desde: `${hoy.getFullYear()}-01-01`, fecha_hasta: `${hoy.getFullYear()}-12-31` }
  }, [rango])

  // El tablero Kanban necesita ver los 4 estados a la vez, así que no se
  // pagina por estado — se trae una página grande y se agrupa en columnas.
  const ordenes = usePaginatedData(listOrdenes, {
    errorMessage: 'No se pudieron cargar las órdenes.',
    perPage: 200,
    extraParams: fechaParams,
  })

  const vehById = useMemo(() => Object.fromEntries((vehiculos.data ?? []).map((v) => [v.id, v])), [vehiculos.data])
  const repById = useMemo(() => Object.fromEntries((repuestos.data ?? []).map((r) => [r.id, r])), [repuestos.data])
  const filtered = ordenes.rows

  const handleChange = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))

  const handleItemChange = (index, field, value) => setForm((prev) => ({ ...prev, items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)) }))

  const handleItemTipo = (index, tipo) => setForm((prev) => ({ ...prev, items: prev.items.map((item, i) => (i === index ? { ...item, tipo, repuesto_id: '' } : item)) }))

  const addItem = () => setForm((prev) => ({ ...prev, items: [...prev.items, { ...emptyItem, _key: uid() }] }))
  const removeItem = (index) => setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))

  const subtotalForm = form.items.reduce((acc, item) => acc + (Number.isNaN(parseNumero(item.precio)) ? 0 : parseNumero(item.precio)) * (Number.isNaN(parseNumero(item.cantidad)) ? 0 : parseNumero(item.cantidad)), 0)

  const buildOrdenTicket = (orden) => {
    const veh = orden.vehiculo
    return {
      titulo: 'Orden de trabajo',
      numero: orden.id,
      fecha: fmtDateTime(orden.fecha_inicio ?? orden.fecha_fin),
      meta: [
        { label: 'Cliente', value: veh?.cliente?.nombre ?? '—' },
        { label: 'Vehículo', value: veh ? fmtVehiculo(veh) : '—' },
        { label: 'Responsable', value: orden.asignado?.name ?? 'Sin responsable' },
        { label: 'Estado', value: ordenEstadoMeta[orden.estado]?.label ?? orden.estado },
      ],
      items: (orden.items ?? []).map((item) => ({
        descripcion: item.tipo === 'repuesto' ? (repById[item.repuesto_id]?.nombre ?? item.descripcion ?? 'Producto') : item.descripcion || 'Mano de obra',
        detalle: `${item.tipo === 'repuesto' ? 'Producto' : 'Mano de obra'} · ${item.cantidad} × ${fmtMoney(item.precio)}`,
        subtotal: fmtMoney(Number(item.cantidad) * Number(item.precio)),
      })),
      totales: [
        { label: 'Total', value: fmtMoney(orden.total) },
        { label: 'Pagado', value: fmtMoney(orden.total_pagado) },
        { label: 'Saldo', value: fmtMoney(orden.saldo_pendiente) },
      ],
      notas: (orden.pagos ?? []).map((pago) => `Pago: ${pagoMetodoMeta[pago.metodo]?.label ?? pago.metodo} · ${fmtMoney(pago.monto)}${pago.referencia ? ` · ${pago.referencia}` : ''}`),
    }
  }

  const reload = () => {
    ordenes.reload()
    repuestos.refresh()
    vehiculos.refresh()
  }

  const openForm = async (orden) => {
    if (!orden) {
      setForm(emptyForm)
      setOpen(true)
      return
    }
    // La lista trae solo el resumen de mano de obra; para editar se carga la
    // orden completa (todos los items) bajo demanda.
    setOpen(true)
    setFormLoading(true)
    try {
      const data = await getOrden(orden.id)
      setForm({
        id: data.id,
        // El cliente es el que figura en la orden (snapshot original), no el
        // dueño actual del vehículo: así editar no reasigna la orden a otro.
        cliente_id: data.cliente_id ?? vehById[data.vehiculo_id]?.cliente_id ?? '',
        vehiculo_id: data.vehiculo_id,
        asignado_a: data.asignado_a ?? '',
        estado: data.estado,
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
      notify.error(err.response?.data?.message || 'No se pudo cargar la orden.')
      setOpen(false)
    } finally {
      setFormLoading(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (form.items.length === 0) {
      notify.error('Cargá al menos un item en la orden.')
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
      asignado_a: form.asignado_a || null,
      estado: form.estado,
      items: form.items.map((item) => ({
        id: item.id ?? null,
        tipo: item.tipo,
        repuesto_id: item.tipo === 'repuesto' && item.repuesto_id ? item.repuesto_id : null,
        descripcion: item.descripcion,
        cantidad: parseNumero(item.cantidad),
        precio: parseNumero(item.precio),
      })),
    }
    try {
      if (form.id) {
        await updateOrden(form.id, payload)
        notify.success('Orden actualizada.')
      } else {
        const orden = await createOrden(payload)
        notify.success(`Orden #${orden.id} creada.`)
      }
      setOpen(false)
      reload()
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo guardar la orden.')
    }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await deleteOrden(deleteTarget.id)
      notify.success('Orden eliminada. Se restituyó el stock.')
      setDeleteTarget(null)
      reload()
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo eliminar la orden.')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const prevEstadoMap = { entregado: 'terminado', terminado: 'en_ejecucion', en_ejecucion: 'pendiente' }

  const handleEstado = async (orden, estado) => {
    try {
      await cambiarEstadoOrden(orden.id, estado)
      const sinCompletar = (orden.items ?? []).filter((i) => !i.completado).length
      if (estado === 'entregado' && orden.saldo_pendiente > 0) {
        notify.warning(`Falta cobrar ${fmtMoney(orden.saldo_pendiente)} — se abrió el cobro.`)
      } else if (estado === 'terminado' && sinCompletar > 0) {
        notify.warning(`Quedan ${sinCompletar} item(s) sin marcar como completados.`)
      } else {
        notify.success(`Orden marcada como "${ordenEstadoMeta[estado].label}".`)
      }
      // Si la orden está abierta en el detalle, actualizarla al toque para que
      // el header de progreso no quede desactualizado (reload() refresca la lista).
      if (detail?.id === orden.id) setDetail((prev) => (prev ? { ...prev, estado } : prev))
      reload()
      if (estado === 'entregado' && orden.saldo_pendiente > 0) {
        openCobro(orden)
      }
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo actualizar la orden.')
    }
  }

  const confirmReabrir = async () => {
    if (!reabrirTarget) return
    setReabrirBusy(true)
    try {
      const prev = prevEstadoMap[reabrirTarget.estado]
      await cambiarEstadoOrden(reabrirTarget.id, prev)
      notify.success(`Orden reabierta como "${ordenEstadoMeta[prev].label}".`)
      if (detail?.id === reabrirTarget.id) setDetail((prev) => (prev ? { ...prev, estado: prev } : prev))
      setReabrirTarget(null)
      reload()
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo reabrir la orden.')
    } finally {
      setReabrirBusy(false)
    }
  }

  const marcarTodosItems = async () => {
    if (!detail) return
    const incompletos = (detail.items ?? []).filter((i) => !i.completado)
    if (incompletos.length === 0) return
    setMarcarTodosBusy(true)
    try {
      await Promise.all(incompletos.map((i) => marcarItemOrden(detail.id, i.id, true)))
      setDetail((prev) => (prev ? { ...prev, items: (prev.items ?? []).map((i) => ({ ...i, completado: true })) } : prev))
      notify.success('Todos los items quedaron marcados como completados.')
      reload()
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudieron marcar los items.')
    } finally {
      setMarcarTodosBusy(false)
    }
  }

  const openCobro = async (orden) => {
    setCobroTarget(orden)
    setPagoForm({ monto: String(orden.saldo_pendiente ?? ''), metodo: 'efectivo', referencia: '' })
    // La lista no trae los pagos; se cargan bajo demanda para mostrar el
    // historial dentro del modal de cobro (saldo/total ya vienen en la lista).
    try {
      const data = await getOrden(orden.id)
      setCobroTarget((prev) => (prev?.id === orden.id ? data : prev))
    } catch {
      // Con el objeto de la lista alcanza para cobrar; solo falta el historial.
    }
  }

  const openDetail = async (orden) => {
    setDetail(null)
    setDetailLoading(true)
    try {
      const data = await getOrden(orden.id)
      setDetail(data)
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo cargar el detalle de la orden.')
    } finally {
      setDetailLoading(false)
    }
  }

  const confirmCobro = async () => {
    const monto = parseNumero(pagoForm.monto)
    if (Number.isNaN(monto) || monto <= 0) {
      notify.error('Ingresá un monto válido.')
      return
    }
    if (monto > cobroTarget.saldo_pendiente) {
      notify.error('El monto supera el saldo pendiente.')
      return
    }
    setCobrando(true)
    try {
      await createPago({ orden_id: cobroTarget.id, monto, metodo: pagoForm.metodo, referencia: pagoForm.referencia || null })
      notify.success('Cobro registrado.')
      // Reflejar el saldo en el detalle abierto sin esperar el reload.
      if (detail?.id === cobroTarget.id) {
        setDetail((prev) =>
          prev
            ? {
                ...prev,
                total_pagado: (prev.total_pagado ?? 0) + monto,
                saldo_pendiente: Math.max(0, (prev.saldo_pendiente ?? 0) - monto),
              }
            : prev
        )
      }
      setCobroTarget(null)
      reload()
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo registrar el cobro.')
    } finally {
      setCobrando(false)
    }
  }

  const columns = [
    { header: 'N°', key: 'id', render: (o) => `#${o.id}` },
    { header: 'Cliente', key: 'vehiculo_id', render: (o) => vehById[o.vehiculo_id]?.cliente?.nombre ?? '—' },
    { header: 'Vehículo', key: 'vehiculo_id', render: (o) => { const v = vehById[o.vehiculo_id]; return v ? `${v.marca} ${v.modelo} ${v.patente}` : '—' } },
    { header: 'Responsable', key: 'asignado_a', render: (o) => o.asignado?.name ?? '' },
    { header: 'Estado', key: 'estado', render: (o) => ordenEstadoMeta[o.estado]?.label ?? o.estado },
    { header: 'Total', key: 'total', render: (o) => fmtMoney(o.total) },
    { header: 'Pagado', key: 'total_pagado', render: (o) => fmtMoney(o.total_pagado) },
    { header: 'Saldo', key: 'saldo_pendiente', render: (o) => fmtMoney(o.saldo_pendiente) },
  ]

  return (
    <Box>
      <PageHeader
        title="Órdenes de trabajo"
        subtitle="Reparaciones en curso, terminadas y entregadas."
        actions={
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            <ExportExcelButton
              filename="ordenes"
              sheetName="Órdenes"
              columns={columns}
              rowsFetcher={async () => (await listOrdenes({ q: ordenes.q, per_page: 5000, ...fechaParams })).data}
            />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openForm(null)}>
              Nueva orden
            </Button>
          </Stack>
        }
      />

      <ToggleButtonGroup value={rango} exclusive size="small" onChange={(_, value) => value && setRango(value)} sx={{ mb: 2 }}>
        <ToggleButton value="semana">Esta semana</ToggleButton>
        <ToggleButton value="mes">Este mes</ToggleButton>
        <ToggleButton value="año">Este año</ToggleButton>
        <ToggleButton value="todo">Todo</ToggleButton>
      </ToggleButtonGroup>

      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 1.5, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AssignmentIcon fontSize="small" color="text.secondary" />
          <Typography variant="body2" color="text.secondary">
            {plural(ordenes.total, 'orden')}
          </Typography>
        </Box>
        <SearchInput value={ordenes.q} onChange={ordenes.setQ} placeholder="Buscar por cliente, vehículo o n°…" width={{ xs: '100%', sm: 260 }} />
      </Stack>

      {ordenes.loading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
          {boardColumns.map((col) => (
            <Skeleton key={col.key} variant="rounded" height={420} sx={{ borderRadius: 3 }} />
          ))}
        </Box>
      ) : filtered.length === 0 ? (
        <Paper variant="outlined">
          <EmptyState
            icon={AssignmentIcon}
            title={ordenes.q ? 'Sin resultados' : 'No hay órdenes'}
            description={ordenes.q ? 'Probá con otro término de búsqueda.' : 'Creá una orden desde un turno confirmado o manualmente.'}
            actionLabel={!ordenes.q ? 'Nueva orden' : undefined}
            onAction={() => openForm(null)}
          />
        </Paper>
      ) : (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, alignItems: 'start' }}>
            {boardColumns.map((col) => {
            const meta = ordenEstadoMeta[col.key]
            const ColIcon = col.icon
            const items = filtered.filter((o) => o.estado === col.key)
            return (
              <Box
                key={col.key}
                sx={{
                  bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'background.default'),
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  p: 1.25,
                  minWidth: 0,
                }}
              >
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 1.25, px: 0.5, pt: 0.25 }}>
                  <Box sx={{ width: 26, height: 26, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${meta.color}.main`, color: '#fff', flexShrink: 0 }}>
                    <ColIcon sx={{ fontSize: 15 }} />
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, flexGrow: 1 }} noWrap>
                    {meta.label}
                  </Typography>
                  <Chip size="small" label={items.length} sx={{ fontWeight: 800, minWidth: 30 }} />
                </Stack>

                <Stack spacing={1.25} sx={{ maxHeight: 640, overflowY: 'auto', px: 0.25, pb: 0.25 }}>
                  {items.map((orden) => {
                    const veh = vehById[orden.vehiculo_id]
                    const waUrl = waLink(veh?.cliente?.telefonos?.[0]?.telefono, waMensajeOrden(orden, veh))
                    const servicios = (orden.items ?? [])
                      .filter((it) => it.tipo === 'mano_obra')
                      .map((it) => it.descripcion)
                      .filter(Boolean)
                    return (
                      <Card
                        key={orden.id}
                        variant="outlined"
                        onClick={() => openDetail(orden)}
                        sx={{
                          cursor: 'pointer',
                          borderLeft: '3px solid',
                          borderLeftColor: `${meta.color}.main`,
                          transition: 'transform 0.15s ease, box-shadow 0.2s ease',
                          '&:hover': { transform: 'translateY(-2px)' },
                        }}
                      >
                        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                              #{orden.id}
                            </Typography>
                            <Box onClick={(e) => e.stopPropagation()} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: -0.5, mr: -0.5 }}>
                              <IconButton
                                component="a"
                                href={waUrl ?? undefined}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="small"
                                aria-label={`Notificar estado de la orden #${orden.id} por WhatsApp`}
                                disabled={!waUrl}
                                sx={{ color: 'success.main' }}
                              >
                                <WhatsAppIcon fontSize="small" />
                              </IconButton>
                              <RowActionsMenu
                                items={[
                                  ...(orden.saldo_pendiente > 0
                                    ? [{ label: 'Cobrar', icon: <ReceiptIcon fontSize="small" />, onClick: () => openCobro(orden) }]
                                    : []),
                                  { label: 'Editar', icon: <EditIcon fontSize="small" />, onClick: () => openForm(orden) },
                                  { label: 'Eliminar', icon: <DeleteIcon fontSize="small" />, color: 'error', onClick: () => setDeleteTarget(orden) },
                                ]}
                              />
                            </Box>
                          </Stack>

                          <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3 }} noWrap>
                            {veh?.cliente?.nombre ?? '—'}
                          </Typography>
                          <Typography variant="caption" noWrap sx={{ display: 'block', fontWeight: 600 }}>
                            {servicios.length > 0 ? servicios.join(' · ') : 'Sin servicio cargado'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                            {fmtVehiculo(veh) || '—'}
                          </Typography>
                          <Stack spacing={0.15} sx={{ mb: 1, mt: 0.25 }}>
                            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                              <EventIcon sx={{ fontSize: 13, color: 'text.secondary', flexShrink: 0 }} />
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {fmtDateTimeShort(orden.created_at)}
                              </Typography>
                            </Stack>
                            {(orden.fecha_inicio || orden.fecha_fin) && (
                              <Typography variant="caption" color="text.secondary" noWrap sx={{ pl: 2.5 }}>
                                {orden.fecha_inicio && `Inicio ${fmtDateTimeShort(orden.fecha_inicio)}`}
                                {orden.fecha_inicio && orden.fecha_fin && ' · '}
                                {orden.fecha_fin && `Fin ${fmtDateTimeShort(orden.fecha_fin)}`}
                              </Typography>
                            )}
                          </Stack>

                          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                            {orden.asignado ? (
                              <Chip size="small" icon={<EngineeringIcon sx={{ fontSize: 14 }} />} label={orden.asignado.name} variant="outlined" sx={{ height: 22, fontSize: 11 }} />
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                Sin responsable
                              </Typography>
                            )}
                            <Typography variant="caption" sx={{ fontWeight: 800, color: orden.saldo_pendiente > 0 ? 'error.main' : 'success.main' }}>
                              {orden.saldo_pendiente > 0 ? fmtMoney(orden.saldo_pendiente) : 'Pagado'}
                            </Typography>
                          </Stack>

                          {(ordenNextEstados[orden.estado] ?? []).length > 0 && (
                            <Button
                              fullWidth
                              size="small"
                              variant="outlined"
                              color={ordenEstadoMeta[ordenNextEstados[orden.estado][0]]?.color}
                              endIcon={<ArrowForwardIcon fontSize="small" />}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEstado(orden, ordenNextEstados[orden.estado][0])
                              }}
                              sx={{ mt: 1.25 }}
                            >
                              {`Marcar ${ordenEstadoMeta[ordenNextEstados[orden.estado][0]]?.label}`}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                  {items.length === 0 && (
                    <Box sx={{ py: 3, border: '1px dashed', borderColor: 'divider', borderRadius: 2, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Sin órdenes
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            )
          })}
        </Box>
          {ordenes.total > ordenes.rows.length && (
            <Stack direction="row" sx={{ justifyContent: 'center', mt: 2 }}>
              <Button variant="outlined" size="small" onClick={() => ordenes.onPerPageChange({ target: { value: String(ordenes.perPage + 200) } })}>
                Cargar más ({ordenes.total - ordenes.rows.length} restantes)
              </Button>
            </Stack>
          )}
        </>
      )}

      <AppDialog
        open={open}
        onClose={() => setOpen(false)}
        title={form.id ? `Editar orden #${form.id}` : 'Nueva orden de trabajo'}
        subtitle="Armá la orden con vehículo, estado y sus items."
        icon={<AssignmentIcon />}
        iconBg="primary.main"
        maxWidth="md"
        actions={
          <>
            <Button onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" form="orden-form" variant="contained" disabled={formLoading || form.items.length === 0}>
              {formLoading ? 'Cargando…' : form.id ? 'Guardar' : 'Crear orden'}
            </Button>
          </>
        }
      >
        {formLoading ? (
          <Stack spacing={2}>
            <Skeleton variant="rounded" height={56} />
            <Skeleton variant="rounded" height={56} />
            <Skeleton variant="rounded" height={56} />
            <Skeleton variant="rounded" height={160} />
          </Stack>
        ) : (
        <Box component="form" id="orden-form" onSubmit={handleSubmit}>
          <Stack spacing={2} sx={{ mt: 1 }}>
              <VehiculoPicker
                clientes={clientes.data ?? []}
                vehiculos={vehiculos.data ?? []}
                vehiculoId={form.vehiculo_id}
                clienteId={form.cliente_id}
                onVehiculoChange={(id) => setForm((prev) => ({ ...prev, vehiculo_id: id }))}
                onClienteChange={(id) => setForm((prev) => ({ ...prev, cliente_id: id, vehiculo_id: '' }))}
                onCreateVehiculo={() => setVehNuevoOpen(true)}
                required
                autoFocus
              />
              <TextField select label="Estado" name="estado" value={form.estado} onChange={handleChange} sx={{ width: { xs: '100%', sm: 180 } }}>
                {Object.entries(ordenEstadoMeta).map(([estado, meta]) => (
                  <MenuItem key={estado} value={estado}>
                    {meta.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField select label="Responsable (opcional)" name="asignado_a" value={form.asignado_a} onChange={handleChange} fullWidth>
                <MenuItem value="">
                  <em>Sin responsable</em>
                </MenuItem>
                {(tecnicos.data ?? []).map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))}
              </TextField>

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
                        <TextField select label="Producto" value={item.repuesto_id} onChange={(e) => handleItemChange(index, 'repuesto_id', e.target.value)} required size="small" sx={{ flexGrow: 1 }}>
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
                      <TextField label="Precio unit." type="number" value={item.precio} onChange={(e) => handleItemChange(index, 'precio', e.target.value)} size="small" slotProps={{ htmlInput: { min: 0 } }} sx={{ width: { xs: '100%', md: 130 } }} />
                      <IconButton size="small" color="error" onClick={() => removeItem(index)} aria-label="Quitar item">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  ))}
                  {form.items.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                      Agregá productos o mano de obra a la orden.
                    </Typography>
                  )}
                </Stack>
                {form.items.length > 0 && (
                  <Stack direction="row" sx={{ justifyContent: 'flex-end', mt: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      Total: {fmtMoney(subtotalForm)}
                    </Typography>
                  </Stack>
                )}
              </Box>
            </Stack>
          </Box>
        )}
      </AppDialog>

      <CobroDialog
        open={Boolean(cobroTarget)}
        onClose={() => setCobroTarget(null)}
        title={`Cobrar orden #${cobroTarget?.id}`}
        subtitle="Registrá el pago de la orden."
        orden={cobroTarget}
        form={pagoForm}
        setForm={setPagoForm}
        saving={cobrando}
        onConfirm={confirmCobro}
      />

      <AppDialog
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        maxWidth="md"
        title={detail ? `Orden #${detail.id}` : ''}
        subtitle={detail ? ordenEstadoMeta[detail.estado]?.label ?? detail.estado : ''}
        icon={<AssignmentIcon />}
        iconBg={detail ? `${ordenEstadoMeta[detail.estado]?.color}.main` : 'primary.main'}
      >
          {detailLoading ? (
            <Box sx={{ p: 3 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Skeleton variant="circular" width={46} height={46} />
                <Box sx={{ flexGrow: 1 }}>
                  <Skeleton width="35%" height={28} />
                  <Skeleton width="20%" height={18} sx={{ mt: 0.5 }} />
                </Box>
              </Stack>
              <Skeleton variant="rounded" height={180} sx={{ mt: 2.5 }} />
              <Skeleton variant="rounded" height={120} sx={{ mt: 2.5 }} />
              <Skeleton variant="rounded" height={200} sx={{ mt: 2.5 }} />
            </Box>
          ) : (
            detail && (
              <DetailOrden
                orden={detail}
                repById={repById}
                onClose={() => setDetail(null)}
                onCobrar={() => { setDetail(null); openCobro(detail) }}
                onEstado={(estado) => handleEstado(detail, estado)}
                onTicket={() => setTicket(buildOrdenTicket(detail))}
                onEdit={() => { setDetail(null); openForm(detail) }}
                onDelete={() => { setDetail(null); setDeleteTarget(detail) }}
                onReabrir={() => setReabrirTarget(detail)}
                onMarcarTodos={marcarTodosItems}
                marcarTodosBusy={marcarTodosBusy}
              />
            )
          )}
      </AppDialog>

      <TicketDialog open={Boolean(ticket)} onClose={() => setTicket(null)} {...ticket} />

      <NuevoVehiculoDialog
        open={vehNuevoOpen}
        cliente={(clientes.data ?? []).find((c) => c.id === Number(form.cliente_id)) ?? null}
        onClose={() => setVehNuevoOpen(false)}
        onCreated={(vehiculo) => {
          vehiculos.refresh()
          setForm((prev) => ({ ...prev, vehiculo_id: vehiculo.id, cliente_id: vehiculo.cliente_id }))
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar orden"
        message={`¿Eliminar la orden #${deleteTarget?.id}? Se devolverá el stock de los productos utilizados.`}
        busy={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      <ConfirmDialog
        open={Boolean(reabrirTarget)}
        title="Reabrir orden"
        message={`¿Volver la orden #${reabrirTarget?.id} a "${ordenEstadoMeta[prevEstadoMap[reabrirTarget?.estado]]?.label}"? Vas a poder seguir trabajándola.`}
        busy={reabrirBusy}
        onClose={() => setReabrirTarget(null)}
        onConfirm={confirmReabrir}
      />
    </Box>
  )
}

function DetailOrden({ orden, repById, onCobrar, onEstado, onTicket, onEdit, onDelete, onReabrir, onMarcarTodos, marcarTodosBusy }) {
  const etapas = ['pendiente', 'en_ejecucion', 'terminado', 'entregado']
  const actualIndex = etapas.indexOf(orden.estado)
  const pctProgreso = Math.max(0, Math.round((actualIndex / (etapas.length - 1)) * 100))
  const totalItems = orden.items?.length ?? 0
  const doneItems = (orden.items ?? []).filter((item) => item.completado).length
  const servicios = (orden.items ?? [])
    .filter((it) => it.tipo === 'mano_obra')
    .map((it) => it.descripcion)
    .filter(Boolean)
  const veh = orden.vehiculo

  const infoRows = [
    { icon: <DirectionsCarIcon fontSize="small" />, label: 'Vehículo', value: veh ? `${veh.marca} ${veh.modelo}`.trim() : '—', sub: veh?.patente },
    { icon: <PersonIcon fontSize="small" />, label: 'Cliente', value: veh?.cliente?.nombre ?? '—', sub: veh?.cliente?.telefonos?.[0]?.telefono },
    { icon: <EngineeringIcon fontSize="small" />, label: 'Responsable', value: orden.asignado?.name ?? 'Sin responsable' },
    { icon: <HandymanIcon fontSize="small" />, label: 'Servicio', value: servicios.length > 0 ? servicios.join(' · ') : 'Sin servicio cargado', full: true },
    { icon: <EventIcon fontSize="small" />, label: 'Inicio', value: fmtDateTime(orden.fecha_inicio) },
    ...(orden.fecha_fin ? [{ icon: <EventIcon fontSize="small" />, label: 'Fin', value: fmtDateTime(orden.fecha_fin) }] : []),
  ]

  return (
    <Box>
      <Box sx={{ p: 0 }}>
        <Box sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'background.default') }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              Progreso
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
              {pctProgreso}%
            </Typography>
          </Stack>
          <LinearProgress variant="determinate" value={pctProgreso} sx={{ height: 6, borderRadius: 1, mb: 2 }} color="primary" />
          <Stepper activeStep={actualIndex} alternativeLabel sx={{ '& .MuiStepLabel-root': { p: 0 }, '& .MuiStepConnector-root': { top: 20 }, '& .MuiStepLabel-label': { mt: 0.75 } }}>
            {etapas.map((etapa) => {
              const fecha = etapa === 'en_ejecucion' ? orden.fecha_inicio : ['terminado', 'entregado'].includes(etapa) ? orden.fecha_fin : null
              return (
                <Step key={etapa} completed={etapas.indexOf(etapa) <= actualIndex}>
                  <StepLabel slotProps={{ stepIcon: { sx: { fontSize: 20 } } }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                      {ordenEstadoMeta[etapa]?.label}
                    </Typography>
                    {fecha && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                        {fmtDateTime(fecha)}
                      </Typography>
                    )}
                  </StepLabel>
                </Step>
              )
            })}
          </Stepper>
        </Box>

        <Box sx={{ mt: 2.5, display: 'grid', gap: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
            {infoRows.map((row) => (
              <Box
                key={row.label}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  p: 1.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  gridColumn: row.full ? '1 / -1' : undefined,
                }}
              >
                <Box sx={{ color: 'text.secondary', flexShrink: 0, display: 'flex' }}>{row.icon}</Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {row.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap={!row.full}>
                    {row.value}
                  </Typography>
                  {row.sub && (
                    <Typography variant="caption" color="text.secondary">
                      {row.sub}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>

          <Box>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1, gap: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                Items ({totalItems})
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                {totalItems > 0 && (
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    {doneItems}/{totalItems} listos
                  </Typography>
                )}
                {totalItems > 0 && doneItems < totalItems && (
                  <Button size="small" onClick={onMarcarTodos} disabled={marcarTodosBusy} sx={{ textTransform: 'none' }}>
                    {marcarTodosBusy ? 'Marcando…' : 'Marcar todos'}
                  </Button>
                )}
              </Stack>
            </Stack>
            {totalItems > 0 && (
              <LinearProgress
                variant="determinate"
                value={(doneItems / totalItems) * 100}
                sx={{ height: 6, borderRadius: 1, mb: 1.5 }}
                color={doneItems === totalItems ? 'success' : 'primary'}
              />
            )}
            <Stack spacing={1}>
              {(orden.items ?? []).map((item, index) => (
                <Box
                  key={item.id ?? index}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: item.completado ? 'success.main' : 'divider',
                    bgcolor: item.completado ? (t) => alpha(t.palette.success.main, 0.06) : 'transparent',
                  }}
                >
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
                      {item.completado ? (
                        <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                      ) : (
                        <RadioButtonUncheckedIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                      )}
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, textDecoration: item.completado ? 'line-through' : 'none', color: item.completado ? 'text.secondary' : 'text.primary' }} noWrap>
                          {item.tipo === 'repuesto' ? (repById[item.repuesto_id]?.nombre ?? item.descripcion ?? 'Producto') : item.descripcion || 'Mano de obra'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.tipo === 'repuesto' ? 'Producto' : 'Mano de obra'} · {item.cantidad} × {fmtMoney(item.precio)}
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography variant="body2" sx={{ fontWeight: 700, flexShrink: 0 }}>
                      {fmtMoney(Number(item.cantidad) * Number(item.precio))}
                    </Typography>
                  </Stack>
                </Box>
              ))}
              {totalItems === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                  Sin items cargados
                </Typography>
              )}
            </Stack>
          </Box>

          <Box sx={{ display: 'grid', gap: 1.5 }}>
            <Box sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'background.default'), display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
              {[
                { label: 'Total', value: fmtMoney(orden.total), color: 'inherit', fontSize: { xs: '1.05rem', sm: '1.2rem' } },
                { label: 'Pagado', value: fmtMoney(orden.total_pagado), color: 'success.main', fontSize: { xs: '1rem', sm: '1.1rem' } },
                { label: 'Saldo', value: fmtMoney(orden.saldo_pendiente), color: orden.saldo_pendiente > 0 ? 'error.main' : 'success.main', fontSize: { xs: '1rem', sm: '1.1rem' } },
              ].map((row) => (
                <Box key={row.label} sx={{ textAlign: { xs: 'left', sm: 'center' } }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {row.label}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, fontSize: row.fontSize, color: row.color, lineHeight: 1.3 }}>
                    {row.value}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
              {ordenNextEstados[orden.estado]?.map((estado) => (
                <Button key={estado} variant="outlined" color="primary" onClick={() => onEstado(estado)} sx={{ flexGrow: 1 }}>
                  Marcar como {ordenEstadoMeta[estado].label}
                </Button>
              ))}
              {orden.saldo_pendiente > 0 && (
                <Button variant="contained" color="success" startIcon={<ReceiptIcon />} onClick={onCobrar} sx={{ flexGrow: 1 }}>
                  Cobrar {fmtMoney(orden.saldo_pendiente)}
                </Button>
              )}
              <Button variant="outlined" startIcon={<PrintIcon />} onClick={onTicket} sx={{ flexGrow: 1 }}>
                Imprimir ticket
              </Button>
              {actualIndex > 0 && (
                <Button variant="text" color="inherit" onClick={onReabrir} sx={{ flexGrow: 1 }}>
                  Reabrir
                </Button>
              )}
              <Button variant="outlined" startIcon={<EditIcon />} onClick={onEdit} sx={{ flexGrow: 1 }}>
                Editar
              </Button>
              <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={onDelete} sx={{ flexGrow: 1 }}>
                Eliminar
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
