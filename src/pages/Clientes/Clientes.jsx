import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { alpha } from '@mui/material/styles'
import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
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
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import VisibilityIcon from '@mui/icons-material/Visibility'
import GroupIcon from '@mui/icons-material/Group'
import PersonIcon from '@mui/icons-material/Person'
import ReceiptIcon from '@mui/icons-material/Receipt'
import PaymentsIcon from '@mui/icons-material/Payments'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import { createCliente, deleteCliente, getCliente, importClientes, listClientes, updateCliente, updateVehiculo, agregarVehiculoCliente, quitarVehiculoCliente } from '../../services/clientesApi'
import { createPago } from '../../services/cajaApi'
import { usePaginatedData } from '../../hooks/usePaginatedData'
import { useAuth } from '../../hooks/useAuth'
import { useNotify } from '../../context/useNotify'
import PageHeader from '../../components/PageHeader'
import SearchInput from '../../components/SearchInput'
import SkeletonTable from '../../components/SkeletonTable'
import EmptyState from '../../components/EmptyState'
import AppDialog from '../../components/AppDialog'
import ConfirmDialog from '../../components/ConfirmDialog'
import Pagination from '../../components/Pagination'
import ImportExcelButton from '../../components/ImportExcelButton'
import VehiculoFormFields from '../../components/VehiculoFormFields'
import TicketDialog from '../../components/TicketDialog'
import CobroDialog from '../../components/CobroDialog'
import { waLink } from '../../utils/wa'
import { plural, fmtMoney, fmtDate, parseNumero } from '../../utils/format'
import { ordenEstadoMeta, pagoMetodoMeta } from '../../utils/meta'

const emptyCliente = { id: null, nombre: '', telefonos: [''], emails: [] }
const emptyVehiculo = { id: null, marca: '', modelo: '', anio: '', patente: '', kilometros: '' }

export default function Clientes() {
  const notify = useNotify()
  const location = useLocation()
  const navigate = useNavigate()
  // Filtro "Sin turno": clientes sin un turno activo (por asignar o
  // confirmado). Puede prenderlo él mismo o llegar desde el Panel.
  const [sinTurno, setSinTurno] = useState(() => Boolean(location.state?.sinTurno))
  const [clienteModal, setClienteModal] = useState(null)
  const [clienteForm, setClienteForm] = useState(emptyCliente)
  // Al crear un cliente nuevo, opcionalmente se le carga el vehículo en el
  // mismo paso — mismo patrón que "cliente nuevo" en Turnos, para no
  // obligar a un viaje extra a Vehículos apenas se termina de cargar.
  const [conVehiculoNuevo, setConVehiculoNuevo] = useState(false)
  const [vehiculoNuevoCliente, setVehiculoNuevoCliente] = useState(emptyVehiculo)
  const [deleteClienteTarget, setDeleteClienteTarget] = useState(null)
  const [deleteClienteBusy, setDeleteClienteBusy] = useState(false)
  const [vehForm, setVehForm] = useState(emptyVehiculo)
  const [vehCliente, setVehCliente] = useState(null)
  const [deleteVehTarget, setDeleteVehTarget] = useState(null)
  const [deleteVehBusy, setDeleteVehBusy] = useState(false)
  const [cobroTarget, setCobroTarget] = useState(null)
  const [cobroOrdenes, setCobroOrdenes] = useState([])
  const [cobroClienteNombre, setCobroClienteNombre] = useState('')
  const [cobroForm, setCobroForm] = useState({ monto: '', metodo: 'efectivo', referencia: '' })
  const [cobrando, setCobrando] = useState(false)
  const [ticket, setTicket] = useState(null)

  const clientes = usePaginatedData(listClientes, { errorMessage: 'No se pudieron cargar los clientes.', extraParams: sinTurno ? { sin_turno: 1 } : {} })
  const filtered = clientes.rows

  // Limpia el estado de navegación: el filtro ya quedó seteado al montar.
  useEffect(() => {
    if (location.state?.sinTurno) navigate(location.pathname, { replace: true, state: {} })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Recarga el listado y, si el modal está mostrando a este cliente, lo
  // refresca con los datos nuevos (si no, queda con la foto vieja).
  const reloadAndSync = async (clienteId) => {
    const result = await clientes.reload()
    if (!clienteId || !result?.data) return
    const updated = result.data.find((c) => c.id === clienteId)
    if (!updated) {
      clientes.onPageChange(null, 0)
      return
    }
    const modal = clienteModal
    if (modal?.cliente?.id !== clienteId) return
    if (modal.mode === 'ver') {
      // En modo ver se muestra el historial completo: recarga el detalle.
      setClienteModal((prev) => ({ ...prev, loading: true }))
      const full = await getCliente(clienteId)
      setClienteModal((prev) => (prev?.cliente?.id === clienteId ? { ...prev, cliente: full, full, loading: false } : prev))
    } else {
      setClienteModal((prev) => (prev?.cliente?.id === clienteId ? { ...prev, cliente: updated } : prev))
    }
  }

  const openCliente = (cliente, mode = 'editar') => {
    setClienteForm(
      cliente
        ? {
            id: cliente.id,
            nombre: cliente.nombre,
            telefonos: cliente.telefonos?.length ? cliente.telefonos.map((t) => t.telefono) : [''],
            emails: cliente.emails?.map((e) => e.email) ?? [],
          }
        : emptyCliente
    )
    setConVehiculoNuevo(false)
    setVehiculoNuevoCliente(emptyVehiculo)
    setClienteModal({ cliente, mode, full: null, loading: mode === 'ver' })
    if (mode === 'ver' && cliente) {
      getCliente(cliente.id)
        .then((full) => setClienteModal((prev) => (prev?.cliente?.id === cliente.id ? { ...prev, cliente: full, full, loading: false } : prev)))
        .catch(() => setClienteModal((prev) => (prev?.cliente?.id === cliente.id ? { ...prev, loading: false } : prev)))
    }
  }

  const addTelefono = () => setClienteForm((prev) => ({ ...prev, telefonos: [...prev.telefonos, ''] }))
  const removeTelefono = (index) => setClienteForm((prev) => ({ ...prev, telefonos: prev.telefonos.filter((_, i) => i !== index) }))
  const handleTelefonoChange = (index, value) =>
    setClienteForm((prev) => ({ ...prev, telefonos: prev.telefonos.map((t, i) => (i === index ? value : t)) }))

  const addEmail = () => setClienteForm((prev) => ({ ...prev, emails: [...prev.emails, ''] }))
  const removeEmail = (index) => setClienteForm((prev) => ({ ...prev, emails: prev.emails.filter((_, i) => i !== index) }))
  const handleEmailChange = (index, value) =>
    setClienteForm((prev) => ({ ...prev, emails: prev.emails.map((e, i) => (i === index ? value : e)) }))

  const handleClienteSubmit = async (event) => {
    event.preventDefault()
    const payload = {
      nombre: clienteForm.nombre,
      telefonos: clienteForm.telefonos.map((t) => t.trim()).filter(Boolean),
      emails: clienteForm.emails.map((e) => e.trim()).filter(Boolean),
    }
    try {
      if (clienteForm.id) {
        await updateCliente(clienteForm.id, payload)
        notify.success('Cliente actualizado.')
        // Refresca lista + datos del modal y vuelve al modo ver.
        await reloadAndSync(clienteForm.id)
        setClienteModal((prev) => (prev ? { ...prev, mode: 'ver', loading: true } : prev))
        getCliente(clienteForm.id)
          .then((full) => setClienteModal((prev) => (prev?.cliente?.id === clienteForm.id ? { ...prev, cliente: full, full, loading: false } : prev)))
          .catch(() => setClienteModal((prev) => (prev?.cliente?.id === clienteForm.id ? { ...prev, loading: false } : prev)))
      } else {
        const cliente = await createCliente(payload)
        let vehiculoCreado = false
        if (conVehiculoNuevo && vehiculoNuevoCliente.marca.trim() && vehiculoNuevoCliente.modelo.trim() && vehiculoNuevoCliente.patente.trim()) {
          const vehPayload = {
            marca: vehiculoNuevoCliente.marca.trim(),
            modelo: vehiculoNuevoCliente.modelo.trim(),
            patente: vehiculoNuevoCliente.patente.trim().toUpperCase(),
          }
          if (vehiculoNuevoCliente.anio) vehPayload.anio = Number(vehiculoNuevoCliente.anio)
          if (vehiculoNuevoCliente.kilometros) vehPayload.kilometros = Number(vehiculoNuevoCliente.kilometros)
          try {
            await agregarVehiculoCliente(cliente.id, vehPayload)
            vehiculoCreado = true
          } catch (err) {
            notify.warning(`Cliente creado, pero no se pudo cargar el vehículo: ${err.response?.data?.message || 'intentá de nuevo'}.`)
          }
        }
        notify.success(vehiculoCreado ? 'Cliente y vehículo creados.' : 'Cliente creado.')
        setClienteModal(null)
        clientes.reload()
      }
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo guardar el cliente.')
    }
  }

  const confirmDeleteCliente = async () => {
    setDeleteClienteBusy(true)
    try {
      await deleteCliente(deleteClienteTarget.id)
      notify.success('Cliente eliminado.')
      if (clienteModal?.cliente?.id === deleteClienteTarget.id) setClienteModal(null)
      setDeleteClienteTarget(null)
      clientes.reload()
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo eliminar el cliente.')
      setDeleteClienteTarget(null)
    } finally {
      setDeleteClienteBusy(false)
    }
  }

  const openVehiculo = (cliente, vehiculo) => {
    setVehCliente(cliente)
    setVehForm(vehiculo ? { ...vehiculo } : emptyVehiculo)
  }

  const handleVehSubmit = async (event) => {
    event.preventDefault()
    const payload = { marca: vehForm.marca, modelo: vehForm.modelo, patente: vehForm.patente }
    if (vehForm.anio) payload.anio = Number(vehForm.anio)
    if (vehForm.kilometros) payload.kilometros = Number(vehForm.kilometros)
    try {
      if (vehForm.id) {
        await updateVehiculo(vehForm.id, payload)
        notify.success('Vehículo actualizado.')
      } else {
        await agregarVehiculoCliente(vehCliente.id, payload)
        notify.success('Vehículo vinculado al cliente.')
      }
      const clienteId = vehCliente.id
      setVehCliente(null)
      reloadAndSync(clienteId)
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo guardar el vehículo.')
    }
  }

  const confirmDeleteVeh = async () => {
    setDeleteVehBusy(true)
    try {
      await quitarVehiculoCliente(deleteVehTarget.cliente.id, deleteVehTarget.veh.id)
      notify.success('Vehículo desvinculado del cliente.')
      const clienteId = deleteVehTarget.cliente.id
      setDeleteVehTarget(null)
      reloadAndSync(clienteId)
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo desvincular el vehículo.')
      setDeleteVehTarget(null)
    } finally {
      setDeleteVehBusy(false)
    }
  }

  const openCobro = (orden, nombre) => {
    setCobroOrdenes([orden])
    setCobroClienteNombre(nombre)
    setCobroTarget(orden)
    setCobroForm({ monto: String(orden.saldo_pendiente ?? ''), metodo: 'efectivo', referencia: '' })
  }

  // Cobro directo desde la lista: carga las órdenes con saldo del cliente y
  // abre el diálogo con un selector si hay más de una.
  const openCobroCliente = async (cliente) => {
    try {
      const full = await getCliente(cliente.id)
      const ordenes = (full.vehiculos ?? [])
        .flatMap((v) => (v.ordenesTrabajo ?? []).filter((o) => Number(o.saldo_pendiente ?? 0) > 0).map((o) => ({ ...o, vehiculo: v })))
        .sort((a, b) => a.id - b.id)
      if (ordenes.length === 0) {
        notify.info('Este cliente no tiene saldos pendientes.')
        return
      }
      setCobroOrdenes(ordenes)
      setCobroClienteNombre(cliente.nombre)
      setCobroTarget(ordenes[0])
      setCobroForm({ monto: String(ordenes[0].saldo_pendiente ?? ''), metodo: 'efectivo', referencia: '' })
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudieron cargar las deudas del cliente.')
    }
  }

  const confirmCobro = async () => {
    const monto = parseNumero(cobroForm.monto)
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
      const pago = await createPago({ orden_id: cobroTarget.id, monto, metodo: cobroForm.metodo, referencia: cobroForm.referencia || null })
      notify.success('Cobro registrado.')
      setCobroTarget(null)
      setCobroOrdenes([])
      // Comprobante listo para imprimir, usando el movimiento recién creado.
      setTicket({
        titulo: 'Comprobante de cobro',
        numero: pago.id,
        fecha: fmtDateTime(pago.fecha),
        meta: [
          { label: 'Cliente', value: pago.orden_trabajo?.cliente?.nombre ?? pago.orden_trabajo?.vehiculo?.cliente?.nombre ?? cobroClienteNombre },
          { label: 'Orden', value: `#${pago.orden_trabajo?.id ?? cobroTarget.id}` },
          { label: 'Método', value: pagoMetodoMeta[pago.metodo]?.label ?? pago.metodo },
          ...(pago.referencia ? [{ label: 'Referencia', value: pago.referencia }] : []),
        ],
        items: [],
        totales: [{ label: 'Cobrado', value: fmtMoney(pago.monto ?? monto) }],
        notas: [],
      })
      // Refresca la deuda en el listado y el historial del modal abierto.
      const clienteId = clienteModal?.cliente?.id
      await clientes.reload()
      if (clienteId) {
        const full = await getCliente(clienteId)
        setClienteModal((prev) => (prev?.cliente?.id === clienteId ? { ...prev, cliente: full, full, loading: false } : prev))
      }
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo registrar el cobro.')
    } finally {
      setCobrando(false)
    }
  }

  const handleImport = async (rows) => {
    // Excel cells are flat strings — "telefonos"/"emails" columns may hold
    // several values separated by , or ; ; the backend splits them the same way.
    const payload = rows.map((row) => ({ nombre: row.nombre, telefonos: row.telefonos ?? row.telefono ?? '', emails: row.emails ?? row.email ?? '' }))
    const { creados, fallos, errores } = await importClientes(payload)
    if (creados) notify.success(`${plural(creados, 'cliente')} importados.`)
    if (fallos) notify.warning(`${plural(fallos, 'fila')} no importadas: ${errores.slice(0, 3).join('; ')}${fallos > 3 ? '…' : ''}`)
    clientes.reload()
  }

  return (
    <Box>
      <PageHeader
        title="Clientes"
        subtitle="Base de datos de clientes y sus vehículos."
        actions={
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            <ImportExcelButton onImport={handleImport} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openCliente(null, 'editar')}>
              Nuevo cliente
            </Button>
          </Stack>
        }
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 1.5, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <GroupIcon fontSize="small" color="text.secondary" />
          <Typography variant="body2" color="text.secondary">
            {plural(clientes.total, sinTurno ? 'cliente sin turno' : 'cliente')}
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'center' } }}>
          <ToggleButtonGroup size="small" exclusive value={sinTurno ? 'sin_turno' : 'todos'} onChange={(_, v) => v && setSinTurno(v === 'sin_turno')} sx={{ alignSelf: { xs: 'flex-start', sm: 'auto' } }}>
            <ToggleButton value="todos">Todos</ToggleButton>
            <ToggleButton value="sin_turno">Sin turno</ToggleButton>
          </ToggleButtonGroup>
          <SearchInput value={clientes.q} onChange={clientes.setQ} placeholder="Buscar por nombre, teléfono o patente…" width={{ xs: '100%', sm: 300 }} />
        </Stack>
      </Stack>

      {clientes.loading ? (
        <SkeletonTable columns={6} />
      ) : filtered.length === 0 ? (
        <Paper variant="outlined">
          <EmptyState
            icon={sinTurno ? CalendarMonthIcon : GroupIcon}
            title={clientes.q ? 'Sin resultados' : sinTurno ? 'No hay clientes sin turno' : 'No hay clientes'}
            description={clientes.q ? 'Probá con otro término de búsqueda.' : sinTurno ? 'Todos tus clientes ya tienen un turno asignado o pendiente.' : 'Cargá tu primer cliente para empezar a gestionar.'}
            actionLabel={!clientes.q && !sinTurno ? 'Nuevo cliente' : undefined}
            onAction={() => openCliente(null, 'editar')}
          />
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Cliente</TableCell>
                <TableCell>Teléfonos</TableCell>
                <TableCell>Emails</TableCell>
                <TableCell align="center">Vehículos</TableCell>
                <TableCell align="right">Deuda</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((cliente) => (
                <ClienteRow
                  key={cliente.id}
                  cliente={cliente}
                  onView={() => openCliente(cliente, 'ver')}
                  onEdit={() => openCliente(cliente, 'editar')}
                  onDelete={() => setDeleteClienteTarget(cliente)}
                  onCobrar={() => openCobroCliente(cliente)}
                  mostrarAgendar={sinTurno}
                  onAgendar={() =>
                    navigate('/turnos', {
                      state: { nuevoTurno: { cliente_id: cliente.id, vehiculo_id: cliente.vehiculos?.[0]?.id ?? '' } },
                    })
                  }
                />
              ))}
            </TableBody>
          </Table>
          <Pagination
            count={clientes.total}
            page={clientes.page}
            rowsPerPage={clientes.perPage}
            onPageChange={clientes.onPageChange}
            onRowsPerPageChange={clientes.onPerPageChange}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </TableContainer>
      )}

      <AppDialog
        open={Boolean(clienteModal)}
        onClose={() => setClienteModal(null)}
        maxWidth="md"
        title={
          clienteModal?.mode === 'editar'
            ? clienteForm.id
              ? 'Editar cliente'
              : 'Nuevo cliente'
            : clienteModal?.cliente?.nombre
        }
        subtitle={clienteModal?.mode === 'editar' ? 'Datos de contacto del cliente.' : 'Detalle del cliente y sus vehículos.'}
        icon={<PersonIcon />}
        iconBg="primary.main"
        actions={
          clienteModal?.mode === 'editar' ? (
            <>
              <Button onClick={() => (clienteModal?.cliente ? openCliente(clienteModal.cliente, 'ver') : setClienteModal(null))}>Cancelar</Button>
              <Button type="submit" form="cliente-form" variant="contained">
                {clienteForm.id ? 'Guardar' : 'Crear'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setClienteModal(null)}>Cerrar</Button>
          )
        }
      >
        {clienteModal?.mode === 'editar' ? (
          <Box component="form" id="cliente-form" onSubmit={handleClienteSubmit}>
            <Stack spacing={2}>
              <TextField label="Nombre" name="nombre" value={clienteForm.nombre} onChange={(e) => setClienteForm((prev) => ({ ...prev, nombre: e.target.value }))} required autoFocus />

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Teléfonos
                </Typography>
                {clienteForm.telefonos.map((tel, i) => (
                  <Stack key={i} direction="row" spacing={1} sx={{ mb: 1 }}>
                    <TextField
                      label={`Teléfono ${i + 1}`}
                      value={tel}
                      onChange={(e) => handleTelefonoChange(i, e.target.value)}
                      fullWidth
                      placeholder="+54 9 11 0000 0000"
                    />
                    {clienteForm.telefonos.length > 1 && (
                      <IconButton color="error" onClick={() => removeTelefono(i)} aria-label="Quitar teléfono">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
                ))}
                <Button size="small" startIcon={<AddIcon />} onClick={addTelefono}>
                  Agregar teléfono
                </Button>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Emails
                </Typography>
                {clienteForm.emails.map((email, i) => (
                  <Stack key={i} direction="row" spacing={1} sx={{ mb: 1 }}>
                    <TextField
                      label={`Email ${i + 1}`}
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(i, e.target.value)}
                      fullWidth
                    />
                    <IconButton color="error" onClick={() => removeEmail(i)} aria-label="Quitar email">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
                <Button size="small" startIcon={<AddIcon />} onClick={addEmail}>
                  Agregar email
                </Button>
              </Box>

              {!clienteForm.id && (
                <Box>
                  <FormControlLabel
                    control={<Checkbox checked={conVehiculoNuevo} onChange={(e) => setConVehiculoNuevo(e.target.checked)} />}
                    label={
                      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                        <DirectionsCarIcon fontSize="small" color="primary" />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Cargar vehículo
                        </Typography>
                      </Stack>
                    }
                    sx={{ ml: 0 }}
                  />
                  {conVehiculoNuevo && (
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        Si la patente ya existe, se vincula automáticamente a este cliente.
                      </Typography>
                      <VehiculoFormFields form={vehiculoNuevoCliente} setForm={setVehiculoNuevoCliente} />
                    </Box>
                  )}
                </Box>
              )}
            </Stack>
          </Box>
        ) : (
          clienteModal?.cliente && (
            <DetailCliente
              cliente={clienteModal.full ?? clienteModal.cliente}
              loading={clienteModal.loading}
              onEdit={() => setClienteModal((prev) => ({ ...prev, mode: 'editar' }))}
              onDelete={() => setDeleteClienteTarget(clienteModal.cliente)}
              onAddVeh={() => openVehiculo(clienteModal.cliente)}
              onEditVeh={(veh) => openVehiculo(clienteModal.cliente, veh)}
              onDeleteVeh={(veh) => setDeleteVehTarget({ cliente: clienteModal.cliente, veh })}
              onCobrar={(orden) => openCobro(orden, clienteModal.cliente?.nombre)}
            />
          )
        )}
      </AppDialog>

      <AppDialog
        open={Boolean(vehCliente)}
        onClose={() => setVehCliente(null)}
        title={vehForm.id ? 'Editar vehículo' : 'Agregar vehículo'}
        subtitle={
          vehCliente?.nombre
            ? `Se vinculará a ${vehCliente.nombre}. Si la patente ya existe, el auto se comparte.`
            : ''
        }
        icon={<DirectionsCarIcon />}
        iconBg={(t) => t.custom.brandGradient}
        actions={
          <>
            <Button onClick={() => setVehCliente(null)}>Cancelar</Button>
            <Button type="submit" form="vehiculo-form" variant="contained">
              {vehForm.id ? 'Guardar' : 'Vincular'}
            </Button>
          </>
        }
      >
        <Box component="form" id="vehiculo-form" onSubmit={handleVehSubmit}>
          <VehiculoFormFields form={vehForm} setForm={setVehForm} autoFocus />
        </Box>
      </AppDialog>

      <CobroDialog
        open={Boolean(cobroTarget)}
        onClose={() => { setCobroTarget(null); setCobroOrdenes([]) }}
        title={`Cobrar ${cobroClienteNombre || `orden #${cobroTarget?.id}`}`}
        subtitle={cobroOrdenes.length > 1 ? 'El cliente tiene varias deudas: elegí cuál cobrar.' : 'Registrá el pago de la orden.'}
        orden={cobroTarget}
        ordenes={cobroOrdenes}
        ordenesOnChange={(id) => {
          const orden = cobroOrdenes.find((o) => o.id === id)
          if (orden) {
            setCobroTarget(orden)
            setCobroForm((prev) => ({ ...prev, monto: String(orden.saldo_pendiente ?? '') }))
          }
        }}
        form={cobroForm}
        setForm={setCobroForm}
        saving={cobrando}
        onConfirm={confirmCobro}
      />

      <ConfirmDialog
        open={Boolean(deleteClienteTarget)}
        title="Eliminar cliente"
        message={`¿Eliminar a ${deleteClienteTarget?.nombre}? Dejará de aparecer en el listado; su historial de vehículos y órdenes se conserva.`}
        busy={deleteClienteBusy}
        onClose={() => setDeleteClienteTarget(null)}
        onConfirm={confirmDeleteCliente}
      />

      <ConfirmDialog
        open={Boolean(deleteVehTarget)}
        title="Desvincular vehículo"
        message={`¿Desvincular ${deleteVehTarget?.veh.marca} ${deleteVehTarget?.veh.modelo} (${deleteVehTarget?.veh.patente}) de ${deleteVehTarget?.cliente.nombre}? El vehículo queda en el catálogo.`}
        busy={deleteVehBusy}
        onClose={() => setDeleteVehTarget(null)}
        onConfirm={confirmDeleteVeh}
      />

      <TicketDialog open={Boolean(ticket)} onClose={() => setTicket(null)} {...ticket} />
    </Box>
  )
}

function ClienteRow({ cliente, onView, onEdit, onDelete, onCobrar, onAgendar, mostrarAgendar }) {
  const { activeTaller } = useAuth()
  const nombreTaller = activeTaller?.nombre ?? 'el taller'
  const vehiculos = cliente.vehiculos ?? []
  return (
    <TableRow hover onClick={onView} sx={{ cursor: 'pointer' }}>
      <TableCell>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {cliente.nombre}
        </Typography>
      </TableCell>
      <TableCell>
        <Stack spacing={0.5}>
          {(cliente.telefonos ?? []).map((t, i) => {
            const waUrl = waLink(t.telefono, `Hola ${cliente.nombre} 👋, te escribo desde ${nombreTaller}.`)
            return (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <IconButton
                  component="a"
                  href={waUrl ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  disabled={!waUrl}
                  aria-label={`WhatsApp ${t.telefono || cliente.nombre}`}
                  sx={{ color: 'success.main', p: 0.25 }}
                >
                  <WhatsAppIcon fontSize="small" />
                </IconButton>
                <Typography variant="body2">{t.telefono || '—'}</Typography>
              </Box>
            )
          })}
          {(cliente.telefonos ?? []).length === 0 && (
            <Typography variant="body2" color="text.secondary">
              —
            </Typography>
          )}
        </Stack>
      </TableCell>
      <TableCell>
        <Stack spacing={0.5}>
          {(cliente.emails ?? []).map((e, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon fontSize="inherit" sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="body2">{e.email}</Typography>
            </Box>
          ))}
          {(cliente.emails ?? []).length === 0 && (
            <Typography variant="body2" color="text.secondary">
              —
            </Typography>
          )}
        </Stack>
      </TableCell>
      <TableCell align="center">
        <Chip size="small" label={vehiculos.length} icon={<DirectionsCarIcon />} variant="outlined" />
      </TableCell>
      <TableCell align="right">
        <Chip
          size="small"
          label={fmtMoney(cliente.saldo_total)}
          color={cliente.saldo_total > 0 ? 'error' : 'success'}
          variant={cliente.saldo_total > 0 ? 'filled' : 'outlined'}
          sx={{ fontWeight: 700 }}
        />
      </TableCell>
      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
        {mostrarAgendar && !cliente.tiene_turno && (
          <IconButton size="small" color="primary" onClick={onAgendar} aria-label="Agendar turno" title="Agendar turno" disabled={vehiculos.length === 0}>
            <CalendarMonthIcon fontSize="small" />
          </IconButton>
        )}
        {cliente.saldo_total > 0 && (
          <IconButton size="small" color="success" onClick={onCobrar} aria-label="Cobrar">
            <PaymentsIcon fontSize="small" />
          </IconButton>
        )}
        <IconButton size="small" onClick={onView} aria-label="Ver cliente" title="Ver">
          <VisibilityIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={onEdit} aria-label="Editar cliente" title="Editar">
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" color="error" onClick={onDelete} aria-label="Eliminar cliente" title="Eliminar">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  )
}

function DetailCliente({ cliente, loading, onEdit, onDelete, onAddVeh, onEditVeh, onDeleteVeh, onCobrar }) {
  const { activeTaller } = useAuth()
  const nombreTaller = activeTaller?.nombre ?? 'el taller'
  const vehiculos = cliente.vehiculos ?? []
  const deuda = Number(cliente.saldo_total ?? 0)
  const ordenesTotales = vehiculos.reduce((acc, v) => acc + (v.ordenesTrabajo?.length ?? 0), 0)
  const waUrl = waLink(cliente.telefonos?.[0]?.telefono, `Hola ${cliente.nombre} 👋, te escribo desde ${nombreTaller}.`)
  return (
    <>
      <Box
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: deuda > 0 ? 'error.main' : 'success.main',
          bgcolor: (t) => (deuda > 0 ? alpha(t.palette.error.main, 0.08) : alpha(t.palette.success.main, 0.06)),
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: deuda > 0 ? 'error.main' : 'success.main',
            color: '#fff',
            flexShrink: 0,
          }}
        >
          <ReceiptIcon fontSize="small" />
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Deuda total
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: deuda > 0 ? 'error.main' : 'success.main' }}>
            {fmtMoney(deuda)}
          </Typography>
        </Box>
        {deuda > 0 && (
          <Chip size="small" color="error" label={`${ordenesTotales} ${plural(ordenesTotales, 'orden')}`} />
        )}
      </Box>

      <Stack spacing={1.5} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Teléfonos
          </Typography>
          {(cliente.telefonos ?? []).length > 0 ? (
            (cliente.telefonos ?? []).map((t, i) => (
              <Stack key={i} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <PhoneIcon fontSize="inherit" sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {t.telefono}
                </Typography>
              </Stack>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              —
            </Typography>
          )}
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Emails
          </Typography>
          {(cliente.emails ?? []).length > 0 ? (
            (cliente.emails ?? []).map((e, i) => (
              <Stack key={i} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <EmailIcon fontSize="inherit" sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {e.email}
                </Typography>
              </Stack>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              —
            </Typography>
          )}
        </Box>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <Button
          size="small"
          variant="outlined"
          color="success"
          startIcon={<WhatsAppIcon />}
          component="a"
          href={waUrl ?? undefined}
          disabled={!waUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </Button>
        <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={onEdit}>
          Editar
        </Button>
        <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={onDelete}>
          Eliminar
        </Button>
      </Stack>

      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DirectionsCarIcon fontSize="small" color="primary" />
          Vehículos y deudas
        </Typography>
        <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={onAddVeh}>
          Agregar
        </Button>
      </Stack>
      {vehiculos.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Este cliente todavía no tiene vehículos cargados.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {vehiculos.map((veh) => {
            const ordenes = veh.ordenesTrabajo ?? []
            const saldoVeh = ordenes.reduce((acc, o) => acc + Number(o.saldo_pendiente ?? 0), 0)
            return (
              <Paper key={veh.id} variant="outlined" sx={{ p: 1.5 }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: ordenes.length ? 1 : 0 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {veh.marca} {veh.modelo}
                      {veh.anio ? ` · ${veh.anio}` : ''}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.25 }}>
                      <Chip size="small" label={veh.patente} variant="outlined" />
                      <Typography variant="caption" color="text.secondary">
                        {veh.kilometros ? `${Number(veh.kilometros).toLocaleString('es-AR')} km` : 'Sin km cargado'}
                      </Typography>
                    </Stack>
                  </Box>
                  <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                    {ordenes.length > 0 && (
                      <Typography variant="caption" sx={{ fontWeight: 800, color: saldoVeh > 0 ? 'error.main' : 'success.main' }}>
                        Saldo: {fmtMoney(saldoVeh)}
                      </Typography>
                    )}
                    <IconButton size="small" onClick={() => onEditVeh(veh)} aria-label="Editar vehículo">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => onDeleteVeh(veh)} aria-label="Eliminar vehículo">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>

                {loading && ordenes.length === 0 && (
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    <Skeleton variant="rounded" height={40} />
                    <Skeleton variant="rounded" height={40} />
                  </Stack>
                )}
                {!loading && ordenes.length === 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Sin órdenes para este auto.
                  </Typography>
                )}
                {ordenes.length > 0 && (
                  <Stack spacing={0.75}>
                    {ordenes.map((orden) => {
                      const meta = ordenEstadoMeta[orden.estado] ?? { label: orden.estado, color: 'default' }
                      const saldo = Number(orden.saldo_pendiente ?? 0)
                      return (
                        <Box key={orden.id} sx={{ p: 1, borderRadius: 1.5, border: '1px dashed', borderColor: 'divider', bgcolor: 'background.default' }}>
                          <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', gap: 0.5, alignItems: { sm: 'center' } }}>
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
                              <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                                #{orden.id}
                              </Typography>
                              <Chip size="small" label={meta.label} color={meta.color} sx={{ height: 18, fontSize: 10 }} />
                              <Typography variant="caption" color="text.secondary">
                                {fmtDate(orden.fecha_inicio ?? orden.fecha_fin)}
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexShrink: 0 }}>
                              <Typography variant="caption" color="text.secondary">
                                Total {fmtMoney(orden.total)} · Pagado {fmtMoney(orden.total_pagado)} ·{' '}
                                <Box component="span" sx={{ fontWeight: 800, color: saldo > 0 ? 'error.main' : 'success.main' }}>
                                  Saldo {fmtMoney(saldo)}
                                </Box>
                              </Typography>
                              {saldo > 0 && (
                                <Button size="small" variant="contained" color="success" startIcon={<ReceiptIcon />} onClick={() => onCobrar(orden)} sx={{ height: 26, fontSize: 11, px: 1 }}>
                                  Cobrar
                                </Button>
                              )}
                            </Stack>
                          </Stack>
                        </Box>
                      )
                    })}
                  </Stack>
                )}
              </Paper>
            )
          })}
        </Stack>
      )}
    </>
  )
}
