import { useEffect, useState } from 'react'
import { Autocomplete, TextField } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { createMarca, listMarcas } from '../services/clientesApi'
import { listMarcasPublicas } from '../services/publicoApi'
import { useAsyncData } from '../hooks/useAsyncData'

// freeSolo + opción explícita "Crear «nombre»": si escribís una marca que no
// existe, aparece en la lista para crearla en el catálogo (misma mecánica que
// el "+" de servicios). Con publico=true (página de turno online) no se crea
// nada en el catálogo: la opción pasa a ser "Usar «X»" y el texto se guarda tal
// cual en el vehículo, por si no está cargada en la base.
export default function MarcaAutocomplete({ value, onChange, required = false, autoFocus = false, refreshSignal, publico = false }) {
  const marcas = useAsyncData(publico ? listMarcasPublicas : listMarcas)
  const { refresh } = marcas
  const nombres = (marcas.data ?? []).map((m) => m.nombre)
  const [input, setInput] = useState('')

  useEffect(() => {
    if (refreshSignal) refresh()
  }, [refreshSignal, refresh])

  // Al editar, el valor llega después de cargar los datos: lo sincroniza una
  // sola vez, pero no pisa lo que el usuario ya escribió.
  useEffect(() => {
    setInput((prev) => (prev === '' && value ? String(value) : prev))
  }, [value])

  const existe = (v) => nombres.some((n) => n.toLowerCase() === String(v ?? '').toLowerCase())

  const crear = async (v) => {
    const nombre = String(v ?? '').trim()
    if (!nombre || existe(nombre)) return
    if (publico) {
      onChange(nombre)
      return
    }
    try {
      await createMarca(nombre)
      refresh()
    } catch {
      // Marca duplicada o sin conexión: el catálogo no se rompe por eso.
    }
    onChange(nombre)
  }

  const filterOptions = (opciones, state) => {
    const v = String(state.inputValue ?? '').trim()
    const filtradas = opciones.filter((o) => o.toLowerCase().includes(v.toLowerCase()))
    if (v && !existe(v)) {
      filtradas.push({ label: `${publico ? 'Usar' : 'Crear'} “${v}”`, __crear: true, nombre: v })
    }
    return filtradas
  }

  return (
    <Autocomplete
      freeSolo
      options={nombres}
      value={value ?? ''}
      inputValue={input}
      onInputChange={(_, nuevo) => setInput(nuevo ?? '')}
      onChange={(_, nuevo) => {
        if (nuevo && nuevo.__crear) {
          crear(nuevo.nombre)
        } else {
          onChange(String(nuevo ?? '').trim())
        }
      }}
      filterOptions={filterOptions}
      getOptionLabel={(opcion) => (typeof opcion === 'string' ? opcion : opcion.label)}
      isOptionEqualToValue={(opcion, v) => (typeof opcion === 'string' ? opcion === v : false)}
      renderOption={(props, opcion) =>
        opcion.__crear ? (
          <li {...props}>
            <AddIcon fontSize="small" sx={{ mr: 1 }} />
            {opcion.label}
          </li>
        ) : (
          <li {...props}>{opcion}</li>
        )
      }
      renderInput={(params) => (
        <TextField {...params} label="Marca" placeholder="Elegí o escribí una marca…" required={required} autoFocus={autoFocus} />
      )}
    />
  )
}