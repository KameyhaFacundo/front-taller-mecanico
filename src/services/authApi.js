import axiosClient from './axiosClient'

export async function loginApi(email, password) {
  const response = await axiosClient.post('/auth/login', { email, password })
  return response.data
}

export async function meApi() {
  const response = await axiosClient.get('/auth/me')
  return response.data
}
