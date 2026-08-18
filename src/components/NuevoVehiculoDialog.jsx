import { useState } from 'react'
import { Box, Button } from '@mui/material'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import { agregarVehiculoCliente, createVehiculo } from '../services/clientesApi'
import { useNotify } from '../context/useNotify'
import VehiculoFormFields from './VehiculoFormFields'
import AppDialog from './AppDialog'

const emptyVehiculo = { marca: '', modelo: '', anio: '', patente: '', kilometros: '' }

export default function NuevoVehiculoDialog({ open, cliente, onClose, onCreated }) {
  const notify = useNotify()
  const [form, setForm] = useState(emptyVehiculo)
  const [busy, setBusy] = useState(false)

  const reset = () => {
    setForm(emptyVehiculo)
    setBusy(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setBusy(true)
    try {
      const payload = { marca: form.marca.trim(), modelo: form.modelo.trim(), patente: form.patente.trim().toUpperCase(), cliente_id: cliente.id }
      if (form.anio) payload.anio = Number(form.anio)
      if (form.kilometros) payload.kilometros = Number(form.kilometros)
      const vehiculo = cliente ? await agregarVehiculoCliente(cliente.id, payload) : await createVehiculo(payload)
      notify.success('Vehículo creado.')
      onCreated(vehiculo)
      handleClose()
    } catch (err) {
      notify.error(err.response?.data?.message || 'No se pudo crear el vehículo.')
      setBusy(false)
    }
  }

  return (
    <AppDialog
      open={open}
      onClose={handleClose}
      title="Nuevo vehículo"
      subtitle={`Se asignará a ${cliente?.nombre}`}
      icon={<DirectionsCarIcon />}
      iconBg={(t) => t.custom.brandGradient}
      maxWidth="sm"
      actions={
        <>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button type="submit" form="nuevo-vehiculo-form" variant="contained" disabled={busy}>
            {busy ? 'Guardando…' : 'Crear vehículo'}
          </Button>
        </>
      }
    >
      <Box component="form" id="nuevo-vehiculo-form" onSubmit={handleSubmit}>
        <VehiculoFormFields form={form} setForm={setForm} autoFocus />
      </Box>
    </AppDialog>
  )
}