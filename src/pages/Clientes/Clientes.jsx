import { useState } from 'react'
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
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
import { createCliente, deleteCliente, importClientes, listClientes, updateCliente, updateVehiculo, agregarVehiculoCliente, quitarVehiculoCliente } from '../../services/clientesApi'
import { usePaginatedData } from '../../hooks/usePaginatedData'
import { useNotify } from '../../context/useNotify'
import PageHeader from '../../components/PageHeader'
import SearchInput from '../../components/SearchInput'
import SkeletonTable from '../../components/SkeletonTable'
import EmptyState from '../../components/EmptyState'
import AppDialog from '../../components/AppDialog'
import ConfirmDialog from '../../components/ConfirmDialog'
import Pagination from '../../components/Pagination'
import ExportExcelButton from '../../components/ExportExcelButton'
import ImportExcelButton from '../../components/ImportExcelButton'
import VehiculoFormFields from '../../components/VehiculoFormFields'
import { waLink } from '../../utils/wa'
import { plural } from '../../utils/format'

const emptyCliente = { id: null, nombre: '', telefonos: [''], emails: [] }
const emptyVehiculo = { id: null, marca: '', modelo: '', anio: '', patente: '', kilometros: '' }

export default function Clientes() {
  const notify = useNotify()
  // Modal único con dos modos: 'ver' (detalle, solo lectura) y 'editar'
  // (formulario). Mismo modal, funcionalidad distinta.
  const [clienteModal, setClienteModal] = useState(null)
  const [clienteForm, setClienteForm] = useState(emptyCliente)
  const [deleteClienteTarget, setDeleteClienteTarget] = useState(null)
  const [deleteClienteBusy, setDeleteClienteBusy] = useState(false)
  const [vehForm, setVehForm] = useState(emptyVehiculo)
  const [vehCliente, setVehCliente] = useState(null)
  const [deleteVehTarget, setDeleteVehTarget] = useState(null)
  const [deleteVehBusy, setDeleteVehBusy] = useState(false)

  const clientes = usePaginatedData(listClientes, { errorMessage: 'No se pudieron cargar los clientes.' })
  const filtered = clientes.rows

  // Recarga el listado y, si el modal está mostrando a este cliente, lo
  // refresca con los datos nuevos (si no, queda con la foto vieja).
  const reloadAndSync = async (clienteId) => {
    const result = await clientes.reload()
    if (clienteId && result?.data) {
      const updated = result.data.find((c) => c.id === clienteId)
      if (updated) setClienteModal((prev) => (prev?.cliente?.id === clienteId ? { ...prev, cliente: updated } : prev))
      else clientes.onPageChange(null, 0)
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
    setClienteModal({ cliente, mode })
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
        setClienteModal((prev) => (prev ? { ...prev, mode: 'ver' } : prev))
      } else {
        await createCliente(payload)
        notify.success('Cliente creado.')
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

  const handleImport = async (rows) => {
    // Excel cells are flat strings — "telefonos"/"emails" columns may hold
    // several values separated by , or ; ; the backend splits them the same way.
    const payload = rows.map((row) => ({ nombre: row.nombre, telefonos: row.telefonos ?? row.telefono ?? '', emails: row.emails ?? row.email ?? '' }))
    const { creados, fallos, errores } = await importClientes(payload)
    if (creados) notify.success(`${plural(creados, 'cliente')} importados.`)
    if (fallos) notify.warning(`${plural(fallos, 'fila')} no importadas: ${errores.slice(0, 3).join('; ')}${fallos > 3 ? '…' : ''}`)
    clientes.reload()
  }

  const columns = [
    { header: 'Nombre', key: 'nombre' },
    { header: 'Teléfonos', key: 'telefonos', render: (c) => (c.telefonos ?? []).map((t) => t.telefono).join('; ') },
    { header: 'Emails', key: 'emails', render: (c) => (c.emails ?? []).map((e) => e.email).join('; ') },
    { header: 'Vehículos', key: 'vehiculos', render: (c) => (c.vehiculos ?? []).map((v) => `${v.marca} ${v.modelo} (${v.patente})`).join(', ') },
  ]

  return (
    <Box>
      <PageHeader
        title="Clientes"
        subtitle="Base de datos de clientes y sus vehículos."
        actions={
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            <ExportExcelButton
              filename="clientes"
              sheetName="Clientes"
              columns={columns}
              rowsFetcher={async () => (await listClientes({ q: clientes.q, per_page: 5000 })).data}
            />
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
            {plural(clientes.total, 'cliente')}
          </Typography>
        </Box>
        <SearchInput value={clientes.q} onChange={clientes.setQ} placeholder="Buscar por nombre, teléfono o patente…" width={{ xs: '100%', sm: 300 }} />
      </Stack>

      {clientes.loading ? (
        <SkeletonTable columns={5} />
      ) : filtered.length === 0 ? (
        <Paper variant="outlined">
          <EmptyState
            icon={GroupIcon}
            title={clientes.q ? 'Sin resultados' : 'No hay clientes'}
            description={clientes.q ? 'Probá con otro término de búsqueda.' : 'Cargá tu primer cliente para empezar a gestionar.'}
            actionLabel={!clientes.q ? 'Nuevo cliente' : undefined}
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
                <TableCell align="right">Acciones</TableCell>
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
              <Button onClick={() => (clienteModal?.cliente ? setClienteModal((prev) => ({ ...prev, mode: 'ver' })) : setClienteModal(null))}>Cancelar</Button>
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
            </Stack>
          </Box>
        ) : (
          clienteModal?.cliente && (
            <DetailCliente
              cliente={clienteModal.cliente}
              onEdit={() => setClienteModal((prev) => ({ ...prev, mode: 'editar' }))}
              onDelete={() => setDeleteClienteTarget(clienteModal.cliente)}
              onAddVeh={() => openVehiculo(clienteModal.cliente)}
              onEditVeh={(veh) => openVehiculo(clienteModal.cliente, veh)}
              onDeleteVeh={(veh) => setDeleteVehTarget({ cliente: clienteModal.cliente, veh })}
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
    </Box>
  )
}

function ClienteRow({ cliente, onView, onEdit, onDelete }) {
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
            const waUrl = waLink(t.telefono, `Hola ${cliente.nombre} 👋, te escribo desde Exe-Mecanica.`)
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
      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
        <IconButton size="small" onClick={onView} aria-label="Ver">
          <VisibilityIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={onEdit} aria-label="Editar">
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" color="error" onClick={onDelete} aria-label="Eliminar">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  )
}

function DetailCliente({ cliente, onEdit, onDelete, onAddVeh, onEditVeh, onDeleteVeh }) {
  const vehiculos = cliente.vehiculos ?? []
  return (
    <>
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
          href={waLink(cliente.telefonos?.[0]?.telefono, `Hola ${cliente.nombre} 👋, te escribo desde Exe-Mecanica.`)}
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
          Vehículos
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
        <Stack spacing={1}>
          {vehiculos.map((veh) => (
            <Paper key={veh.id} variant="outlined" sx={{ p: 1.25 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
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
                <Box>
                  <IconButton size="small" onClick={() => onEditVeh(veh)} aria-label="Editar vehículo">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => onDeleteVeh(veh)} aria-label="Eliminar vehículo">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </>
  )
}
