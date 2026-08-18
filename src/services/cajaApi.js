import axiosClient from './axiosClient'

// Unified caja ledger. Pass { tipo: 'ingreso' } to scope it (used by the
// "Cobros" tab); omit tipo for the full ingresos+egresos ledger.
export async function listMovimientos(params = {}) {
  const response = await axiosClient.get('/movimientos', { params })
  return response.data
}

// Registers a customer payment (ingreso) against an order.
export async function createPago(payload) {
  const response = await axiosClient.post('/movimientos', payload)
  return response.data
}

export async function deleteMovimiento(id) {
  const response = await axiosClient.delete(`/movimientos/${id}`)
  return response.data
}

export async function getCajaResumen(params = {}) {
  const response = await axiosClient.get('/caja/resumen', { params })
  return response.data
}
