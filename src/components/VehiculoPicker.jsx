import { useEffect, useState } from 'react'
import { Autocomplete, IconButton, Stack, TextField, Tooltip } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

const matchText = (value, q) => String(value ?? '').toLowerCase().includes(q)

export default function VehiculoPicker({ clientes = [], vehiculos = [], vehiculoId, clienteId, onVehiculoChange, onClienteChange, onCreateVehiculo, onCreateCliente, required = false, autoFocus = false }) {
  const [inputVehiculo, setInputVehiculo] = useState('')
  const cliente = clientes.find((c) => c.id === Number(clienteId)) ?? null
  const vehiculo = vehiculos.find((v) => v.id === Number(vehiculoId)) ?? null
  // A client's vehicles are its pivot links (covers shared cars, not only the
  // principal owner). Falls back to cliente_id for older cached payloads.
  const perteneceACliente = (v) => (v.clientes?.length ? v.clientes.some((c) => c.id === Number(clienteId)) : v.cliente_id === Number(clienteId))
  const opcionesVehiculos = clienteId ? vehiculos.filter(perteneceACliente) : vehiculos

  const textoVehiculo = (v) => `${v.marca} ${v.modelo}${v.anio ? ` ${v.anio}` : ''} · ${v.patente}${v.cliente?.nombre ? ` — ${v.cliente.nombre}` : ''}`

  useEffect(() => {
    setInputVehiculo(vehiculo ? textoVehiculo(vehiculo) : '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehiculo])

  const elegirVehiculo = (v) => {
    // onClienteChange primero: el padre limpia vehiculo_id al cambiar cliente,
    // así que onVehiculoChange tiene que correr al final para dejarlo seteado.
    if (v) {
      const dueñoId = v.cliente_id ?? v.clientes?.[0]?.id
      if (dueñoId) onClienteChange(dueñoId)
    }
    onVehiculoChange(v ? v.id : '')
  }

  // Si el usuario escribe la patente completa pero no pincha la opción,
  // al salir del campo se selecciona el único vehículo que coincide (evita
  // enviar el formulario con vehiculo_id vacío).
  const autoSeleccionarEnBlur = () => {
    const q = inputVehiculo.trim().toLowerCase()
    if (!q || vehiculo) return
    const exacto = opcionesVehiculos.find((v) => String(v.patente).toLowerCase() === q)
    if (exacto) elegirVehiculo(exacto)
  }

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }}>
      <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
        <Autocomplete
          sx={{ flexGrow: 1 }}
          options={clientes}
          getOptionLabel={(c) => c.nombre}
          value={cliente}
          onChange={(_, c) => onClienteChange(c ? c.id : '')}
          filterOptions={(opts, { inputValue }) => {
            const q = inputValue.trim().toLowerCase()
            return q ? opts.filter((c) => matchText(c.nombre, q)) : opts
          }}
          renderInput={(params) => <TextField {...params} label="Cliente" placeholder="Buscar cliente…" />}
          isOptionEqualToValue={(a, b) => a.id === b.id}
        />
        {onCreateCliente && (
          <Tooltip title="Crear nuevo cliente">
            <IconButton color="primary" onClick={onCreateCliente} aria-label="Nuevo cliente" sx={{ mt: 0.5 }}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
      <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
        <Autocomplete
          sx={{ flexGrow: 1 }}
          options={opcionesVehiculos}
          getOptionLabel={textoVehiculo}
          value={vehiculo}
          inputValue={inputVehiculo}
          onInputChange={(_, v) => setInputVehiculo(v)}
          onBlur={autoSeleccionarEnBlur}
          onChange={(_, v) => {
            setInputVehiculo(v ? textoVehiculo(v) : '')
            elegirVehiculo(v)
          }}
          filterOptions={(opts, { inputValue }) => {
            const q = inputValue.trim().toLowerCase()
            if (!q) return opts
            return opts.filter((v) => matchText(v.patente, q) || matchText(v.marca, q) || matchText(v.modelo, q) || matchText(v.cliente?.nombre, q))
          }}
          renderInput={(params) => <TextField {...params} label="Vehículo" placeholder="Buscar por patente, marca o modelo…" required={required} autoFocus={autoFocus} />}
          isOptionEqualToValue={(a, b) => a.id === b.id}
        />
        {onCreateVehiculo && (
          <Tooltip title={cliente ? 'Crear vehículo para este cliente' : 'Seleccioná un cliente primero'}>
            <span>
              <IconButton color="primary" onClick={onCreateVehiculo} disabled={!cliente} aria-label="Nuevo vehículo" sx={{ mt: 0.5 }}>
                <AddIcon />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Stack>
    </Stack>
  )
}