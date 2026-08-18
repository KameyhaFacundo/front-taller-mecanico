import axiosClient from './axiosClient'

export async function listClientes(params = {}) {
  const response = await axiosClient.get('/clientes', { params })
  return response.data
}

// Unwrapped, "give me everything" variant for dropdown/picker use — not for
// paginated table views (use listClientes for those).
export async function listClientesOptions() {
  const response = await axiosClient.get('/clientes', { params: { per_page: 1000 } })
  return response.data?.data ?? response.data
}

export async function createCliente(payload) {
  const response = await axiosClient.post('/clientes', payload)
  return response.data
}

// Detalle completo: incluye el historial de órdenes de cada vehículo del
// cliente (con items y pagos) para mostrar saldos y deudas.
export async function getCliente(id) {
  const response = await axiosClient.get(`/clientes/${id}`)
  return response.data
}

export async function updateCliente(id, payload) {
  const response = await axiosClient.put(`/clientes/${id}`, payload)
  return response.data
}

export async function deleteCliente(id) {
  const response = await axiosClient.delete(`/clientes/${id}`)
  return response.data
}

// Link a vehicle to a client: creates it if the patente doesn't exist yet,
// otherwise just attaches the existing catalog vehicle to this client.
export async function agregarVehiculoCliente(clienteId, payload) {
  const response = await axiosClient.post(`/clientes/${clienteId}/vehiculos`, payload)
  return response.data
}

// Unlink a vehicle from a client. The vehicle stays in the catalog.
export async function quitarVehiculoCliente(clienteId, vehiculoId) {
  const response = await axiosClient.delete(`/clientes/${clienteId}/vehiculos/${vehiculoId}`)
  return response.data
}

// One request for the whole batch instead of one createCliente() per row.
export async function importClientes(rows) {
  const response = await axiosClient.post('/clientes/import', { rows })
  return response.data
}

export async function listVehiculos(params = {}) {
  const response = await axiosClient.get('/vehiculos', { params })
  return response.data
}

// Unwrapped, "give me everything" variant for dropdown/picker use (e.g. the
// vehicle selector on Ordenes/Turnos) — not for paginated table views.
export async function listVehiculosOptions(clienteId) {
  const params = { per_page: 1000, ...(clienteId ? { cliente_id: clienteId } : {}) }
  const response = await axiosClient.get('/vehiculos', { params })
  return response.data?.data ?? response.data
}

// Caché simple a nivel módulo para el catálogo de marcas/modelos: se usa en
// componentes reutilizables (MarcaAutocomplete/ModeloAutocomplete) que se
// montan cada vez que se abre un diálogo. Evita re-fetchear /marcas y
// /modelos en cada apertura. Cualquier create/delete invalida el caché.
let marcasCache = null
let modelosCache = null

export async function listMarcas() {
  if (!marcasCache) {
    const response = await axiosClient.get('/marcas')
    marcasCache = response.data
  }
  return marcasCache
}

export async function createMarca(nombre) {
  const response = await axiosClient.post('/marcas', { nombre })
  marcasCache = null
  return response.data
}

export async function deleteMarca(id) {
  const response = await axiosClient.delete(`/marcas/${id}`)
  marcasCache = null
  return response.data
}

export async function listModelos() {
  if (!modelosCache) {
    const response = await axiosClient.get('/modelos')
    modelosCache = response.data
  }
  return modelosCache
}

export async function createModelo(nombre, marcaId = null) {
  const response = await axiosClient.post('/modelos', { nombre, marca_id: marcaId })
  modelosCache = null
  return response.data
}

export async function deleteModelo(id) {
  const response = await axiosClient.delete(`/modelos/${id}`)
  modelosCache = null
  return response.data
}

export async function createVehiculo(payload) {
  const response = await axiosClient.post('/vehiculos', payload)
  return response.data
}

export async function updateVehiculo(id, payload) {
  const response = await axiosClient.put(`/vehiculos/${id}`, payload)
  return response.data
}

export async function deleteVehiculo(id) {
  const response = await axiosClient.delete(`/vehiculos/${id}`)
  return response.data
}

// One request for the whole batch instead of one createVehiculo() per row.
export async function importVehiculos(rows) {
  const response = await axiosClient.post('/vehiculos/import', { rows })
  return response.data
}
