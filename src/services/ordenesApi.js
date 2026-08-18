import axiosClient from './axiosClient'

export async function listOrdenes(params = {}) {
  const response = await axiosClient.get('/ordenes', { params })
  return response.data
}

export async function getOrden(id) {
  const response = await axiosClient.get(`/ordenes/${id}`)
  return response.data
}

export async function createOrden(payload) {
  const response = await axiosClient.post('/ordenes', payload)
  return response.data
}

export async function updateOrden(id, payload) {
  const response = await axiosClient.put(`/ordenes/${id}`, payload)
  return response.data
}

export async function deleteOrden(id) {
  const response = await axiosClient.delete(`/ordenes/${id}`)
  return response.data
}

export async function cambiarEstadoOrden(id, estado) {
  const response = await axiosClient.patch(`/ordenes/${id}/estado`, { estado })
  return response.data
}

export async function marcarItemOrden(ordenId, itemId, completado) {
  const response = await axiosClient.patch(`/ordenes/${ordenId}/items/${itemId}`, { completado })
  return response.data
}
