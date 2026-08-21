import axiosClient from './axiosClient'

export async function getSuscripcionEstado() {
  const response = await axiosClient.get('/suscripcion/estado')
  return response.data
}

export async function crearSuscripcionCheckout() {
  const response = await axiosClient.post('/suscripcion/checkout')
  return response.data
}
