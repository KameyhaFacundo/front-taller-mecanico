import { useState } from 'react'
import { Box, Button, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import { createProveedor, deleteProveedor, importProveedores, listProveedores, updateProveedor } from '../../services/stockApi'
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
import { plural } from '../../utils/format'

const emptyForm = { id: null, nombre: '', codigo: '', cuit: '', domicilio: '', telefonos: [''], emails: [] }

export default function Proveedores() {
  const notify = useNotify()
  const [form, setForm] = useState(emptyForm)
  const [open, setOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const proveedores = usePaginatedData(listProveedores, { errorMessage: 'No se pudieron cargar los proveedores.' })
  const filtered = proveedores.rows

  const handleChange = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))

  const addTelefono = () => setForm((prev) => ({ ...prev, telefonos: [...prev.telefonos, ''] }))
  const removeTelefono = (index) => setForm((prev) => ({ ...prev, telefonos: prev.telefonos.filter((_, i) => i !== index) }))
  const handleTelefonoChange = (index, value) =>
    setForm((prev) => ({ ...prev, telefonos: prev.telefonos.map((t, i) => (i === index ? value : t)) }))

  const addEmail = () => setForm((prev) => ({ ...prev, emails: [...prev.emails, ''] }))
  const removeEmail = (index) => setForm((prev) => ({ ...prev, emails: prev.emails.filter((_, i) => i !== index) }))
  const handleEmailChange = (index, value) =>
    setForm((prev) => ({ ...prev, emails: prev.emails.map((e, i) => (i === index ? value : e)) }))

  const openForm = (proveedor) => {
    setForm(
      proveedor
        ? {
            id: proveedor.id,
            nombre: proveedor.nombre,
            codigo: proveedor.codigo ?? '',
            cuit: proveedor.cuit ?? '',
            domicilio: proveedor.domicilio ?? '',
            telefonos: proveedor.telefonos?.length ? proveedor.telefonos.map((t) => t.telefono) : [''],
            emails: proveedor.emails?.map((e) => e.email) ?? [],
          }
        : emptyForm
    )
    setOpen(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const payload = {
      nombre: form.nombre,
      codigo: form.codigo.trim() || null,
      cuit: form.cuit.trim() || null,
      domicilio: form.domicilio.trim() || null,
      telefonos: form.telefonos.map((t) => t.trim()).filter(Boolean),
      emails: form.emails.map((e) => e.trim()).filter(Boolean),
    }
    try {
      if (form.id) {
        await updateProveedor(form.id, payload)
        notify.success('Proveedor actualizado.')
      } else {
        await createProveedor(payload)
        notify.success('Proveedor creado.')
      }
      setOpen(false)
      proveedores.reload()
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo guardar el proveedor.')
    }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await deleteProveedor(deleteTarget.id)
      notify.success('Proveedor eliminado.')
      setDeleteTarget(null)
      proveedores.reload()
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo eliminar el proveedor.')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const handleImport = async (rows) => {
    // Excel cells are flat strings — "telefonos"/"emails" columns may hold
    // several values separated by , or ; ; the backend splits them the same way.
    const payload = rows.map((row) => ({
      nombre: row.nombre,
      codigo: row.codigo ?? null,
      cuit: row.cuit ?? null,
      domicilio: row.domicilio ?? null,
      telefonos: row.telefonos ?? row.telefono ?? '',
      emails: row.emails ?? row.email ?? '',
    }))
    const { creados, fallos, errores } = await importProveedores(payload)
    if (creados) notify.success(`${plural(creados, 'proveedor')} importados.`)
    if (fallos) notify.warning(`${plural(fallos, 'fila')} no importadas: ${errores.slice(0, 3).join('; ')}${fallos > 3 ? '…' : ''}`)
    proveedores.reload()
  }

  const columns = [
    { header: 'Nombre', key: 'nombre' },
    { header: 'Código', key: 'codigo' },
    { header: 'Teléfonos', key: 'telefonos', render: (p) => (p.telefonos ?? []).map((t) => t.telefono).join('; ') },
    { header: 'Emails', key: 'emails', render: (p) => (p.emails ?? []).map((e) => e.email).join('; ') },
    { header: 'CUIT', key: 'cuit' },
    { header: 'Domicilio', key: 'domicilio' },
  ]

  return (
    <Box>
      <PageHeader
        title="Proveedores"
        subtitle="Proveedores de productos e insumos del taller."
        actions={
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            <ExportExcelButton
              filename="proveedores"
              sheetName="Proveedores"
              columns={columns}
              rowsFetcher={async () => (await listProveedores({ q: proveedores.q, per_page: 5000 })).data}
            />
            <ImportExcelButton onImport={handleImport} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openForm(null)}>
              Nuevo proveedor
            </Button>
          </Stack>
        }
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 1.5, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <LocalShippingIcon fontSize="small" color="text.secondary" />
          <Typography variant="body2" color="text.secondary">
            {plural(proveedores.total, 'proveedor')}
          </Typography>
        </Box>
        <SearchInput value={proveedores.q} onChange={proveedores.setQ} placeholder="Buscar por nombre, teléfono o CUIT…" width={{ xs: '100%', sm: 300 }} />
      </Stack>

      {proveedores.loading ? (
        <SkeletonTable columns={7} />
      ) : filtered.length === 0 ? (
        <Paper variant="outlined">
          <EmptyState
            icon={LocalShippingIcon}
            title={proveedores.q ? 'Sin resultados' : 'No hay proveedores'}
            description={proveedores.q ? 'Probá con otro término de búsqueda.' : 'Cargá proveedores para asociarlos a productos y compras.'}
            actionLabel={!proveedores.q ? 'Nuevo proveedor' : undefined}
            onAction={() => openForm(null)}
          />
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Código</TableCell>
                <TableCell>Teléfonos</TableCell>
                <TableCell>Emails</TableCell>
                <TableCell>CUIT</TableCell>
                <TableCell>Domicilio</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.selected' }}>
                        <LocalShippingIcon fontSize="small" color="primary" />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {p.nombre}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{p.codigo || '—'}</TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      {(p.telefonos ?? []).map((t, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon fontSize="inherit" sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2">{t.telefono}</Typography>
                        </Box>
                      ))}
                      {(p.telefonos ?? []).length === 0 && (
                        <Typography variant="body2" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      {(p.emails ?? []).map((e, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon fontSize="inherit" sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2">{e.email}</Typography>
                        </Box>
                      ))}
                      {(p.emails ?? []).length === 0 && (
                        <Typography variant="body2" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>{p.cuit || '—'}</TableCell>
                  <TableCell>{p.domicilio || '—'}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => openForm(p)} aria-label="Editar">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(p)} aria-label="Eliminar">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            count={proveedores.total}
            page={proveedores.page}
            rowsPerPage={proveedores.perPage}
            onPageChange={proveedores.onPageChange}
            onRowsPerPageChange={proveedores.onPerPageChange}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </TableContainer>
      )}

      <AppDialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        title={form.id ? 'Editar proveedor' : 'Nuevo proveedor'}
        subtitle="Datos del proveedor de productos."
        icon={<LocalShippingIcon />}
        iconBg="primary.main"
        actions={
          <>
            <Button onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" form="proveedor-form" variant="contained">
              {form.id ? 'Guardar' : 'Crear'}
            </Button>
          </>
        }
      >
        <Box component="form" id="proveedor-form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Stack spacing={2}>
              <TextField label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required autoFocus />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField label="Código" name="codigo" value={form.codigo} onChange={handleChange} fullWidth placeholder="Opcional" />
                <TextField label="CUIT" name="cuit" value={form.cuit} onChange={handleChange} fullWidth placeholder="Opcional" />
              </Stack>
              <TextField label="Domicilio" name="domicilio" value={form.domicilio} onChange={handleChange} placeholder="Opcional" />

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Teléfonos
                </Typography>
                {form.telefonos.map((tel, i) => (
                  <Stack key={i} direction="row" spacing={1} sx={{ mb: 1 }}>
                    <TextField
                      label={`Teléfono ${i + 1}`}
                      value={tel}
                      onChange={(e) => handleTelefonoChange(i, e.target.value)}
                      fullWidth
                      placeholder="+54 9 11 0000 0000"
                    />
                    {form.telefonos.length > 1 && (
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
                {form.emails.map((email, i) => (
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
        </AppDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar proveedor"
        message={`¿Eliminar a ${deleteTarget?.nombre}?`}
        busy={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </Box>
  )
}