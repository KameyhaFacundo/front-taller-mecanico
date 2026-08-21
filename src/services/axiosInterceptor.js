import axiosClient from './axiosClient'

const PUBLIC_URL_PATTERNS = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/publico/']

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
    const message = error.response?.data?.message ?? ''
    const hasMemberships = Array.isArray(error.response?.data?.memberships)
    if (status === 422 && hasMemberships) {
      localStorage.removeItem('active_taller_id')
      window.dispatchEvent(new CustomEvent('taller:seleccion-requerida', { detail: error.response.data.memberships }))
    } else if (status === 403 && message === 'No pertenecés a ese taller.') {
      localStorage.removeItem('active_taller_id')
      window.dispatchEvent(new Event('taller:invalido'))
    } else if (status === 403 && /suspendido|pausado|fuera de servicio/i.test(message)) {
      // El taller activo fue suspendido mientras la sesión estaba abierta.
      localStorage.removeItem('active_taller_id')
      window.dispatchEvent(new Event('taller:suspendido'))
    } else if (status === 402) {
      // Trial de 7 días vencido sin suscripción activa. No se limpia
      // active_taller_id: el taller sigue siendo válido, solo hay que pagar
      // para volver a usarlo.
      window.dispatchEvent(new Event('taller:suscripcion-vencida'))
    }
    return Promise.reject(error)
  },
)
