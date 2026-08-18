import axiosClient from './axiosClient'

export async function listProveedores(params = {}) {
  const response = await axiosClient.get('/proveedores', { params })
  return response.data
}

// Unwrapped, "give me everything" variant for dropdown/picker use — not for
// paginated table views.
export async function listProveedoresOptions() {
  const response = await axiosClient.get('/proveedores', { params: { per_page: 1000 } })
  return response.data?.data ?? response.data
}

export async function createProveedor(payload) {
  const response = await axiosClient.post('/proveedores', payload)
  return response.data
}

export async function updateProveedor(id, payload) {
  const response = await axiosClient.put(`/proveedores/${id}`, payload)
  return response.data
}

export async function deleteProveedor(id) {
  const response = await axiosClient.delete(`/proveedores/${id}`)
  return response.data
}

export async function importProveedores(rows) {
  const response = await axiosClient.post('/proveedores/import', { rows })
  return response.data
}

export async function listRepuestos(params = {}) {
  const response = await axiosClient.get('/repuestos', { params })
  return response.data
}

// Unwrapped, "give me everything" variant for dropdown/picker use — not for
// paginated table views.
export async function listRepuestosOptions() {
  const response = await axiosClient.get('/repuestos', { params: { per_page: 1000 } })
  return response.data?.data ?? response.data
}

export async function createRepuesto(payload) {
  const response = await axiosClient.post('/repuestos', payload)
  return response.data
}

export async function updateRepuesto(id, payload) {
  const response = await axiosClient.put(`/repuestos/${id}`, payload)
  return response.data
}

export async function deleteRepuesto(id) {
  const response = await axiosClient.delete(`/repuestos/${id}`)
  return response.data
}

export async function importRepuestos(rows) {
  const response = await axiosClient.post('/repuestos/import', { rows })
  return response.data
}

// Low-stock alert list — deliberately not derived from a paginated repuestos
// page, since the alert needs to reflect the whole inventory, not just the
// page currently on screen.
export async function getStockBajo() {
  const response = await axiosClient.get('/reportes/stock-bajo')
  return response.data
}

export async function listCompras(params = {}) {
  const response = await axiosClient.get('/compras', { params })
  return response.data
}

export async function createCompra(payload) {
  const response = await axiosClient.post('/compras', payload)
  return response.data
}

export async function updateCompra(id, payload) {
  const response = await axiosClient.put(`/compras/${id}`, payload)
  return response.data
}

export async function deleteCompra(id) {
  const response = await axiosClient.delete(`/compras/${id}`)
  return response.data
}

export async function importCompras(rows) {
  const response = await axiosClient.post('/compras/import', { rows })
  return response.data
}
