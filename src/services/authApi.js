import axiosClient from './axiosClient'

export async function loginApi(email, password) {
  const response = await axiosClient.post('/auth/login', { email, password })
  return response.data
}

export async function meApi() {
  const response = await axiosClient.get('/auth/me')
  return response.data
}

// Cambio de contraseña propio (requiere la contraseña actual), distinto del
// reseteo que hace un admin sobre otro usuario desde /users/{id}.
export async function updatePasswordApi(payload) {
  const response = await axiosClient.put('/auth/password', payload)
  return response.data
}
