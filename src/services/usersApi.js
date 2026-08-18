import axiosClient from './axiosClient'

export async function listUsers(params = {}) {
  const response = await axiosClient.get('/users', { params })
  return response.data
}

// Lightweight, non-admin-gated list for pickers (e.g. assigning a técnico to
// an order) — any authenticated user can call this, unlike listUsers().
export async function listUsuariosOpciones() {
  const response = await axiosClient.get('/usuarios/opciones')
  return response.data
}

export async function createUser(payload) {
  const response = await axiosClient.post('/users', payload)
  return response.data
}

export async function updateUser(id, payload) {
  const response = await axiosClient.put(`/users/${id}`, payload)
  return response.data
}

export async function deleteUser(id) {
  const response = await axiosClient.delete(`/users/${id}`)
  return response.data
}

export async function importUsers(rows) {
  const response = await axiosClient.post('/users/import', { rows })
  return response.data
}
