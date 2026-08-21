import axiosClient from './axiosClient'

export async function listTalleresSuperadmin() {
  const response = await axiosClient.get('/superadmin/talleres')
  return response.data
}
