import axiosClient from './axiosClient'

export async function listTalleresSuperadmin() {
  const response = await axiosClient.get('/superadmin/talleres')
  return response.data
}

export async function toggleTallerActivo(tallerId) {
  const response = await axiosClient.patch(`/superadmin/talleres/${tallerId}/toggle-activo`)
  return response.data
}
