import { useState } from 'react'
import { Box, Button, Card, CardContent, Chip, IconButton, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import PersonIcon from '@mui/icons-material/Person'
import { createUser, deleteUser, importUsers, listUsers, updateUser } from '../../services/usersApi'
import { usePaginatedData } from '../../hooks/usePaginatedData'
import { useNotify } from '../../context/useNotify'
import { useAuth } from '../../hooks/useAuth'
import AppDialog from '../../components/AppDialog'
import PageHeader from '../../components/PageHeader'
import SearchInput from '../../components/SearchInput'
import SkeletonTable from '../../components/SkeletonTable'
import EmptyState from '../../components/EmptyState'
import ConfirmDialog from '../../components/ConfirmDialog'
import ImportExcelButton from '../../components/ImportExcelButton'
import Pagination from '../../components/Pagination'
import { initials, plural } from '../../utils/format'

const emptyForm = { id: null, name: '', email: '', password: '', role: 'empleado' }

const randomPassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const rnd = new Uint32Array(12)
  crypto.getRandomValues(rnd)
  return Array.from(rnd, (n) => chars[n % chars.length]).join('')
}

export default function Users() {
  const { user: currentUser } = useAuth()
  const notify = useNotify()
  const [form, setForm] = useState(emptyForm)
  const [open, setOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [passwordsResult, setPasswordsResult] = useState([])

  const users = usePaginatedData(listUsers, { errorMessage: 'No se pudieron cargar los usuarios.' })
  const filtered = users.rows

  const openForm = (targetUser) => {
    setForm(targetUser ? { id: targetUser.id, name: targetUser.name, email: targetUser.email, password: '', role: targetUser.role } : emptyForm)
    setOpen(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      if (form.id) {
        const payload = { name: form.name, email: form.email, role: form.role }
        if (form.password) payload.password = form.password
        await updateUser(form.id, payload)
        notify.success('Usuario actualizado.')
      } else {
        await createUser(form)
        notify.success('Usuario creado.')
      }
      setOpen(false)
      users.reload()
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo guardar el usuario.')
    }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await deleteUser(deleteTarget.id)
      notify.success('Usuario eliminado.')
      setDeleteTarget(null)
      users.reload()
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo eliminar el usuario.')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const handleImport = async (rows) => {
    const fallos = []
    const payload = []
    for (const row of rows) {
      const name = String(row.Nombre ?? row.nombre ?? '').trim()
      const email = String(row.Correo ?? row.email ?? '').trim().toLowerCase()
      if (!name || !email) {
        fallos.push('Fila sin nombre o correo')
        continue
      }
      const role = String(row.Rol ?? row.rol ?? 'empleado').trim().toLowerCase() === 'admin' ? 'admin' : 'empleado'
      payload.push({ name, email, password: randomPassword(), role })
    }
    const result = payload.length ? await importUsers(payload) : { creados: 0, fallos: 0, errores: [] }
    // El backend reporta los fallos como "Fila N: …" (N = posición 1-based en el payload).
    const indicesFallidos = new Set(
      result.errores.map((e) => parseInt((e.match(/Fila (\d+)/) ?? [])[1], 10) - 1).filter((n) => Number.isInteger(n))
    )
    const credenciales = payload.map((u, _i) => ({ name: u.name, email: u.email, password: u.password })).filter((_, i) => !indicesFallidos.has(i))
    const totalFallos = fallos.length + result.fallos
    if (result.creados) notify.success(`Usuarios creados: ${result.creados}.`)
    if (totalFallos) notify.warning(`${plural(totalFallos, 'usuario')} no se pudieron crear (correos existentes o inválidos).`)
    if (credenciales.length) setPasswordsResult(credenciales)
    users.reload()
  }

  return (
    <Box>
      <PageHeader
        title="Usuarios"
        subtitle="Gestión de cuentas y permisos del sistema."
        actions={
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            <ImportExcelButton onImport={handleImport} label="Importar usuarios" />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openForm(null)}>
              Nuevo usuario
            </Button>
          </Stack>
        }
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 1.5, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AdminPanelSettingsIcon fontSize="small" color="text.secondary" />
          <Typography variant="body2" color="text.secondary">
            {plural(users.total, 'usuario')}
          </Typography>
        </Box>
        <SearchInput value={users.q} onChange={users.setQ} placeholder="Buscar por nombre o correo…" width={{ xs: '100%', sm: 280 }} />
      </Stack>

      {users.loading ? (
        <SkeletonTable columns={4} />
      ) : filtered.length === 0 ? (
        <Paper variant="outlined">
          <EmptyState icon={AdminPanelSettingsIcon} title={users.q ? 'Sin resultados' : 'No hay usuarios'} description={users.q ? 'Probá con otro término de búsqueda.' : 'Creá el primer usuario del sistema.'} actionLabel={!users.q ? 'Nuevo usuario' : undefined} onAction={() => openForm(null)} />
        </Paper>
      ) : (
        <>
          {/* Desktop: tabla */}
          <TableContainer component={Paper} variant="outlined" sx={{ display: { xs: 'none', md: 'block' } }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Correo</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((targetUser) => (
                  <TableRow key={targetUser.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: targetUser.role === 'admin' ? 'primary.main' : 'secondary.main', color: '#fff', fontSize: 13, fontWeight: 700 }}>
                          {initials(targetUser.name)}
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {targetUser.name}
                            {targetUser.id === currentUser?.id && (
                              <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                (vos)
                              </Typography>
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{targetUser.email}</TableCell>
                    <TableCell>
                      <Chip size="small" label={targetUser.role === 'admin' ? 'Admin' : 'Empleado'} color={targetUser.role === 'admin' ? 'primary' : 'default'} variant={targetUser.role === 'admin' ? 'filled' : 'outlined'} />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => openForm(targetUser)} aria-label="Editar">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton size="small" color="error" onClick={() => setDeleteTarget(targetUser)} disabled={targetUser.id === currentUser?.id} aria-label="Eliminar">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Mobile: cards — la tabla obligaba a hacer scroll horizontal para
              llegar a Acciones, dejando editar/borrar prácticamente ocultos. */}
          <Stack spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' } }}>
            {filtered.map((targetUser) => (
              <Card key={targetUser.id} variant="outlined">
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: targetUser.role === 'admin' ? 'primary.main' : 'secondary.main', color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                      {initials(targetUser.name)}
                    </Box>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                        {targetUser.name}
                        {targetUser.id === currentUser?.id && (
                          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            (vos)
                          </Typography>
                        )}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                        {targetUser.email}
                      </Typography>
                    </Box>
                    <Chip size="small" label={targetUser.role === 'admin' ? 'Admin' : 'Empleado'} color={targetUser.role === 'admin' ? 'primary' : 'default'} variant={targetUser.role === 'admin' ? 'filled' : 'outlined'} sx={{ flexShrink: 0 }} />
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', mt: 1 }}>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => openForm(targetUser)} aria-label="Editar">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(targetUser)} disabled={targetUser.id === currentUser?.id} aria-label="Eliminar">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>

          <Pagination
            count={users.total}
            page={users.page}
            rowsPerPage={users.perPage}
            onPageChange={users.onPageChange}
            onRowsPerPageChange={users.onPerPageChange}
            rowsPerPageOptions={[10, 25, 50, 100]}
            sx={{ mt: 1 }}
          />
        </>
      )}

      <AppDialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        title={form.id ? 'Editar usuario' : 'Nuevo usuario'}
        subtitle="Datos de acceso y rol del usuario."
        icon={<PersonIcon />}
        iconBg="primary.main"
        actions={
          <>
            <Button onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" form="user-form" variant="contained">
              {form.id ? 'Guardar' : 'Crear'}
            </Button>
          </>
        }
      >
        <Box component="form" id="user-form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Stack spacing={2}>
              <TextField label="Nombre" name="name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required autoFocus />
              <TextField label="Correo" name="email" type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} required />
              <TextField
                label={form.id ? 'Nueva contraseña' : 'Contraseña'}
                name="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                required={!form.id}
                helperText={form.id ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'}
                slotProps={{ htmlInput: { minLength: 6 } }}
              />
              <TextField select label="Rol" name="role" value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}>
                <MenuItem value="empleado">Empleado</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>
            </Stack>
          </Box>
        </AppDialog>

      <AppDialog
        open={passwordsResult.length > 0}
        onClose={() => setPasswordsResult([])}
        maxWidth="sm"
        title="Usuarios importados"
        subtitle="Contraseñas generadas para los usuarios importados."
        icon={<PersonIcon />}
        iconBg="success.main"
        actions={
          <Button onClick={() => setPasswordsResult([])} variant="contained">
            Entendido
          </Button>
        }
      >
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Guardá estas contraseñas y compartilas con cada usuario. Por seguridad, el sistema no las vuelve a mostrar.
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Correo</TableCell>
                  <TableCell>Contraseña</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {passwordsResult.map((u) => (
                  <TableRow key={u.email}>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700, fontFamily: 'monospace' }}>{u.password}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AppDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar usuario"
        message={`¿Eliminar a ${deleteTarget?.name}?`}
        busy={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </Box>
  )
}
