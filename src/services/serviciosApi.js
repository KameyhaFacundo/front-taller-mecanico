import axiosClient from './axiosClient'

export async function listServicios(params = {}) {
  const response = await axiosClient.get('/servicios', { params })
  return response.data
}

// Unwrapped, "give me everything" variant for dropdown/picker use (e.g. the
// turnos agenda) — not for paginated table views.
export async function listServiciosOptions() {
  const response = await axiosClient.get('/servicios', { params: { per_page: 1000 } })
  return response.data?.data ?? response.data
}

export async function createServicio(payload) {
  const response = await axiosClient.post('/servicios', payload)
  return response.data
}

export async function updateServicio(id, payload) {
  const response = await axiosClient.put(`/servicios/${id}`, payload)
  return response.data
}

export async function deleteServicio(id) {
  const response = await axiosClient.delete(`/servicios/${id}`)
  return response.data
}

export async function importServicios(rows) {
  const response = await axiosClient.post('/servicios/import', { rows })
  return response.data
}
