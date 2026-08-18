import { useState } from 'react'
import { Box, Button, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import { createModelo, deleteModelo, listMarcas, listModelos } from '../services/clientesApi'
import { useAsyncData } from '../hooks/useAsyncData'
import { useNotify } from '../context/useNotify'
import AppDialog from './AppDialog'
import ConfirmDialog from './ConfirmDialog'

export default function GestionarModelosDialog({ open, onClose, onChanged }) {
  const notify = useNotify()
  const modelos = useAsyncData(listModelos)
  const marcas = useAsyncData(listMarcas)
  const [nombre, setNombre] = useState('')
  const [marcaId, setMarcaId] = useState('')
  const [busy, setBusy] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  const handleAdd = async (event) => {
    event.preventDefault()
    const v = nombre.trim()
    if (!v || busy) return
    setBusy(true)
    try {
      await createModelo(v, marcaId || null)
      notify.success('Modelo agregado.')
      setNombre('')
      setMarcaId('')
      modelos.refresh()
      onChanged()
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo agregar el modelo.')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    setDeleteBusy(true)
    try {
      await deleteModelo(deleteTarget.id)
      notify.success('Modelo eliminado.')
      setDeleteTarget(null)
      modelos.refresh()
      onChanged()
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo eliminar el modelo.')
      setDeleteTarget(null)
    } finally {
      setDeleteBusy(false)
    }
  }

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title="Modelos"
      subtitle="Administrá el catálogo de modelos por marca."
      icon={<DirectionsCarIcon />}
      iconBg="warning.main"
      maxWidth="sm"
      actions={<Button onClick={onClose}>Cerrar</Button>}
    >
      <Box component="form" onSubmit={handleAdd} sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <TextField label="Nuevo modelo" value={nombre} onChange={(e) => setNombre(e.target.value)} fullWidth autoFocus />
        <TextField
          select
          label="Marca (opcional)"
          value={marcaId}
          onChange={(e) => setMarcaId(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">
            <em>Sin marca</em>
          </MenuItem>
          {(marcas.data ?? []).map((m) => (
            <MenuItem key={m.id} value={m.id}>
              {m.nombre}
            </MenuItem>
          ))}
        </TextField>
        <Button type="submit" variant="contained" disabled={busy || !nombre.trim()} sx={{ alignSelf: 'flex-start' }}>
          Agregar
        </Button>
      </Box>
      <Stack spacing={1}>
        {(modelos.data ?? []).map((m) => (
          <Stack
            key={m.id}
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between', border: '1px solid', borderColor: 'divider', borderRadius: 2, px: 1.5, py: 0.75 }}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {m.nombre}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {m.marca?.nombre ?? 'Sin marca'}
              </Typography>
            </Box>
            <IconButton size="small" color="error" onClick={() => setDeleteTarget(m)} aria-label={`Eliminar ${m.nombre}`}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
      </Stack>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar modelo"
        message={`¿Eliminar el modelo "${deleteTarget?.nombre}"?`}
        busy={deleteBusy}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </AppDialog>
  )
}