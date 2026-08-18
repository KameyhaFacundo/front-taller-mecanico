import { useEffect, useState } from 'react'
import { Autocomplete, TextField } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { createModelo, listModelos, listMarcas } from '../services/clientesApi'
import { listModelosPublicos, listMarcasPublicas } from '../services/publicoApi'
import { useAsyncData } from '../hooks/useAsyncData'

const fetchModelosPublicos = () => listModelosPublicos()

// freeSolo + opción explícita "Crear «nombre»": si escribís un modelo que no
// existe, aparece en la lista para crearlo en el catálogo (misma mecánica que
// el "+" de servicios). Con publico=true (página de turno online) no se crea
// nada en el catálogo: la opción pasa a ser "Usar «X»" y el texto se guarda tal
// cual en el vehículo, por si no está cargado en la base.
export default function ModeloAutocomplete({ marca, value, onChange, required = false, refreshSignal, publico = false }) {
  const modelos = useAsyncData(publico ? fetchModelosPublicos : listModelos)
  const marcas = useAsyncData(publico ? listMarcasPublicas : listMarcas)
  const refreshModelos = modelos.refresh
  const refreshMarcas = marcas.refresh
  const [input, setInput] = useState('')

  useEffect(() => {
    if (refreshSignal) {
      refreshModelos()
      refreshMarcas()
    }
  }, [refreshSignal, refreshModelos, refreshMarcas])

  useEffect(() => {
    setInput((prev) => (prev === '' && value ? String(value) : prev))
  }, [value])

  const marcaId = marcas.data?.find((m) => String(m.nombre).toLowerCase() === String(marca ?? '').toLowerCase())?.id ?? null
  const opciones = (modelos.data ?? [])
    .filter((m) => (marca ? String(m.marca?.nombre ?? '').toLowerCase() === String(marca).toLowerCase() : true))
    .map((m) => m.nombre)

  const existe = (v) => opciones.some((n) => n.toLowerCase() === String(v ?? '').toLowerCase())

  const crear = async (v) => {
    const nombre = String(v ?? '').trim()
    if (!nombre || existe(nombre)) return
    if (publico) {
      onChange(nombre)
      return
    }
    try {
      await createModelo(nombre, marcaId)
      refreshModelos()
    } catch {
      // Modelo duplicado o sin conexión: el catálogo no se rompe por eso.
    }
    onChange(nombre)
  }

  const filterOptions = (opcionesFiltradas, state) => {
    const v = String(state.inputValue ?? '').trim()
    const filtradas = opcionesFiltradas.filter((o) => o.toLowerCase().includes(v.toLowerCase()))
    if (v && !existe(v)) {
      filtradas.push({ label: `${publico ? 'Usar' : 'Crear'} “${v}”`, __crear: true, nombre: v })
    }
    return filtradas
  }

  return (
    <Autocomplete
      freeSolo
      options={opciones}
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
        <TextField
          {...params}
          label="Modelo"
          placeholder={opciones.length ? 'Elegí el modelo…' : 'Escribí el modelo…'}
          required={required}
        />
      )}
    />
  )
}