import { useState } from 'react'
import { Box, Stack, TextField, Button } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import { createCliente } from '../services/clientesApi'
import { useNotify } from '../context/useNotify'
import AppDialog from './AppDialog'

const emptyForm = { nombre: '', telefono: '', email: '' }

export default function NuevoClienteDialog({ open, onClose, onCreated }) {
  const notify = useNotify()
  const [form, setForm] = useState(emptyForm)
  const [busy, setBusy] = useState(false)

  const reset = () => {
    setForm(emptyForm)
    setBusy(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleChange = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setBusy(true)
    try {
      const payload = {
        nombre: form.nombre.trim(),
        telefonos: form.telefono.trim() ? [form.telefono.trim()] : [],
        emails: form.email.trim() ? [form.email.trim()] : [],
      }
      const cliente = await createCliente(payload)
      notify.success('Cliente creado.')
      onCreated(cliente)
      handleClose()
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo crear el cliente.')
      setBusy(false)
    }
  }

  return (
    <AppDialog
      open={open}
      onClose={handleClose}
      title="Nuevo cliente"
      subtitle="Cargá los datos básicos para poder asociarle un vehículo."
      icon={<PersonIcon />}
      iconBg="primary.main"
      maxWidth="sm"
      actions={
        <>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button type="submit" form="nuevo-cliente-form" variant="contained" disabled={busy}>
            {busy ? 'Guardando…' : 'Crear cliente'}
          </Button>
        </>
      }
    >
      <Box component="form" id="nuevo-cliente-form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required autoFocus />
          <TextField label="Teléfono (opcional)" name="telefono" value={form.telefono} onChange={handleChange} placeholder="+54 9 11 0000 0000" />
          <TextField label="Email (opcional)" name="email" type="email" value={form.email} onChange={handleChange} />
        </Stack>
      </Box>
    </AppDialog>
  )
}
