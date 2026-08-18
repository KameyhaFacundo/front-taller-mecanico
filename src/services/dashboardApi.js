import axiosClient from './axiosClient'

export async function getDashboard() {
  const response = await axiosClient.get('/dashboard')
  return response.data
}