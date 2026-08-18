import axiosClient from './axiosClient'

export async function listServiciosPublicos() {
  const response = await axiosClient.get('/publico/servicios')
  return response.data
}

export async function listMarcasPublicas() {
  const response = await axiosClient.get('/publico/marcas')
  return response.data
}

export async function listModelosPublicos(marcaId = null) {
  const response = await axiosClient.get('/publico/modelos', { params: marcaId ? { marca_id: marcaId } : {} })
  return response.data
}

export async function listDisponibilidadPublica({ fecha, ...rest }) {
  const response = await axiosClient.get('/publico/turnos/disponibilidad', { params: { fecha, ...rest } })
  return response.data
}

export async function crearTurnoPublico(payload) {
  const response = await axiosClient.post('/publico/turnos', payload)
  return response.data
}