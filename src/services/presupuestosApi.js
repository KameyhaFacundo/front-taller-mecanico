import axiosClient from './axiosClient'

export async function listPresupuestos(params = {}) {
  const response = await axiosClient.get('/presupuestos', { params })
  return response.data
}

export async function getPresupuesto(id) {
  const response = await axiosClient.get(`/presupuestos/${id}`)
  return response.data
}

export async function createPresupuesto(payload) {
  const response = await axiosClient.post('/presupuestos', payload)
  return response.data
}

export async function updatePresupuesto(id, payload) {
  const response = await axiosClient.put(`/presupuestos/${id}`, payload)
  return response.data
}

export async function deletePresupuesto(id) {
  const response = await axiosClient.delete(`/presupuestos/${id}`)
  return response.data
}

export async function convertirPresupuesto(id) {
  const response = await axiosClient.post(`/presupuestos/${id}/convertir`)
  return response.data
}