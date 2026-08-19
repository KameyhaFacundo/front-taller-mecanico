import axiosClient from './axiosClient'

export async function getDashboard(params) {
  const response = await axiosClient.get('/dashboard', { params })
  return response.data
}