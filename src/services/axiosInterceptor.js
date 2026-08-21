import axiosClient from './axiosClient'

const PUBLIC_URL_PATTERNS = ['/auth/login', '/auth/register', '/publico/']

axiosClient.interceptors.request.use((config) => {
  const isPublic = PUBLIC_URL_PATTERNS.some((pattern) => config.url?.includes(pattern))
  if (!isPublic) {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    const activeTallerId = localStorage.getItem('active_taller_id')
    if (activeTallerId) {
      config.headers['X-Taller-Id'] = activeTallerId
    }
  }
  return config
})

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('expires_at')
      localStorage.removeItem('user')
      localStorage.removeItem('memberships')
      localStorage.removeItem('active_taller_id')
      window.dispatchEvent(new Event('auth:unauthorized'))
    }
    // 422 con `memberships` (sin taller elegido) o 403 "No pertenecés a ese
    // taller" (taller guardado ya no es válido): se limpia el taller activo
    // y se avisa para mandar a la pantalla de selección, sin cerrar sesión.
    const status = error.response?.status
    const hasMemberships = Array.isArray(error.response?.data?.memberships)
    if (status === 422 && hasMemberships) {
      localStorage.removeItem('active_taller_id')
      window.dispatchEvent(new CustomEvent('taller:seleccion-requerida', { detail: error.response.data.memberships }))
    } else if (status === 403 && error.response?.data?.message === 'No pertenecés a ese taller.') {
      localStorage.removeItem('active_taller_id')
      window.dispatchEvent(new Event('taller:invalido'))
    }
    return Promise.reject(error)
  },
)
