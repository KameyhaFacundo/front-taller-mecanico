import axiosClient from './axiosClient'

export async function getConfiguracion() {
  const response = await axiosClient.get('/configuracion')
  return response.data
}

export async function updateConfiguracion(payload) {
  const response = await axiosClient.put('/configuracion', payload)
  return response.data
}
