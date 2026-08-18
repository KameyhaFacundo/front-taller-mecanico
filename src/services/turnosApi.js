import axiosClient from './axiosClient'

export async function listTurnos(params = {}) {
  const response = await axiosClient.get('/turnos', { params })
  return response.data
}

export async function createTurno(payload) {
  const response = await axiosClient.post('/turnos', payload)
  return response.data
}

export async function updateTurno(id, payload) {
  const response = await axiosClient.put(`/turnos/${id}`, payload)
  return response.data
}

export async function deleteTurno(id) {
  const response = await axiosClient.delete(`/turnos/${id}`)
  return response.data
}

export async function importTurnos(rows) {
  const response = await axiosClient.post('/turnos/import', { rows })
  return response.data
}

export async function cambiarEstadoTurno(id, estado) {
  const response = await axiosClient.patch(`/turnos/${id}/estado`, { estado })
  return response.data
}

export async function crearOrdenDesdeTurno(id, payload = {}) {
  const response = await axiosClient.post(`/turnos/${id}/crear-orden`, payload)
  return response.data
}

export async function listDisponibilidad(params = {}) {
  const response = await axiosClient.get('/turnos/disponibilidad', { params })
  return response.data
}
