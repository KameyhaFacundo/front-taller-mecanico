import { useEffect, useState } from 'react'
import { Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import { createMarca, deleteMarca, listMarcas } from '../services/clientesApi'
import { useAsyncData } from '../hooks/useAsyncData'
import { useNotify } from '../context/useNotify'
import AppDialog from './AppDialog'
import ConfirmDialog from './ConfirmDialog'

export default function GestionarMarcasDialog({ open, onClose, onChanged }) {
  const notify = useNotify()
  const marcas = useAsyncData(listMarcas)
  const refreshMarcas = marcas.refresh

  useEffect(() => {
    if (open) refreshMarcas()
  }, [open, refreshMarcas])

  const [nombre, setNombre] = useState('')
  const [busy, setBusy] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  const handleAdd = async (event) => {
    event.preventDefault()
    const v = nombre.trim()
    if (!v || busy) return
    setBusy(true)
    try {
      await createMarca(v)
      notify.success('Marca agregada.')
      setNombre('')
      marcas.refresh()
      onChanged()
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo agregar la marca.')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    setDeleteBusy(true)
    try {
      await deleteMarca(deleteTarget.id)
      notify.success('Marca eliminada.')
      setDeleteTarget(null)
      marcas.refresh()
      onChanged()
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo eliminar la marca.')
      setDeleteTarget(null)
    } finally {
      setDeleteBusy(false)
    }
  }

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title="Marcas"
      subtitle="Administrá el catálogo de marcas del taller."
      icon={<LocalOfferIcon />}
      iconBg="warning.main"
      maxWidth="sm"
      actions={<Button onClick={onClose}>Cerrar</Button>}
    >
      <Box component="form" onSubmit={handleAdd} sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField label="Nueva marca" value={nombre} onChange={(e) => setNombre(e.target.value)} fullWidth autoFocus />
        <Button type="submit" variant="contained" disabled={busy || !nombre.trim()}>
          Agregar
        </Button>
      </Box>
      <Stack spacing={1}>
        {(marcas.data ?? []).map((m) => (
          <Stack
            key={m.id}
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between', border: '1px solid', borderColor: 'divider', borderRadius: 2, px: 1.5, py: 0.75 }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {m.nombre}
            </Typography>
            <IconButton size="small" color="error" onClick={() => setDeleteTarget(m)} aria-label={`Eliminar ${m.nombre}`}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
      </Stack>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar marca"
        message={`¿Eliminar la marca "${deleteTarget?.nombre}"?`}
        busy={deleteBusy}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </AppDialog>
  )
}