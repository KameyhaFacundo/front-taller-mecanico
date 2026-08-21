import { useEffect, useState } from 'react'
import { loginApi, meApi } from '../services/authApi'
import { AuthContext } from './authContext.js'

function readStoredMemberships() {
  try {
    return JSON.parse(localStorage.getItem('memberships') || '[]')
  } catch {
    return []
  }
}

function persistSession({ user, memberships, activeTallerId }) {
  localStorage.setItem('user', JSON.stringify(user))
  localStorage.setItem('memberships', JSON.stringify(memberships))
  if (activeTallerId) {
    localStorage.setItem('active_taller_id', String(activeTallerId))
  } else {
    localStorage.removeItem('active_taller_id')
  }
}

function clearSession() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('expires_at')
  localStorage.removeItem('user')
  localStorage.removeItem('memberships')
  localStorage.removeItem('active_taller_id')
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [memberships, setMemberships] = useState([])
  const [activeTallerId, setActiveTallerIdState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [suscripcionVencida, setSuscripcionVencida] = useState(false)

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token')
    if (!storedToken) {
      setLoading(false)
      return
    }

    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setToken(storedToken)
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        // User corrupto en storage (otra versión o manipulación): se descarta
        // y se pide fresco con meApi(). Sin esto la app arrancaba en blanco.
        localStorage.removeItem('user')
        setUser(null)
      }
      setMemberships(readStoredMemberships())
      const storedTallerId = localStorage.getItem('active_taller_id')
      setActiveTallerIdState(storedTallerId ? Number(storedTallerId) : null)
    }

    meApi()
      .then(({ memberships: freshMemberships = [], ...freshUser }) => {
        // Si el taller activo guardado ya no es una membresía vigente (se
        // eliminó, se le sacó el usuario, etc.), se descarta y se vuelve a
        // pedir selección — nunca se manda un X-Taller-Id inválido.
        const storedTallerId = localStorage.getItem('active_taller_id')
        const stillValid = freshMemberships.some((m) => String(m.taller_id) === storedTallerId)
        const nextActiveTallerId = stillValid
          ? Number(storedTallerId)
          : freshMemberships.length === 1
            ? freshMemberships[0].taller_id
            : null

        persistSession({ user: freshUser, memberships: freshMemberships, activeTallerId: nextActiveTallerId })
        setUser(freshUser)
        setMemberships(freshMemberships)
        setActiveTallerIdState(nextActiveTallerId)
        setToken(storedToken)
      })
      .catch(() => {
        clearSession()
        setToken(null)
        setUser(null)
        setMemberships([])
        setActiveTallerIdState(null)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null)
      setUser(null)
      setMemberships([])
      setActiveTallerIdState(null)
    }
    const handleTallerInvalido = () => setActiveTallerIdState(null)
    const handleSuscripcionVencida = () => setSuscripcionVencida(true)

    window.addEventListener('auth:unauthorized', handleUnauthorized)
    window.addEventListener('taller:seleccion-requerida', handleTallerInvalido)
    window.addEventListener('taller:invalido', handleTallerInvalido)
    window.addEventListener('taller:suspendido', handleTallerInvalido)
    window.addEventListener('taller:suscripcion-vencida', handleSuscripcionVencida)
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
      window.removeEventListener('taller:seleccion-requerida', handleTallerInvalido)
      window.removeEventListener('taller:invalido', handleTallerInvalido)
      window.removeEventListener('taller:suspendido', handleTallerInvalido)
      window.removeEventListener('taller:suscripcion-vencida', handleSuscripcionVencida)
    }
  }, [])

  const login = async (email, password) => {
    const data = await loginApi(email, password)
    const freshMemberships = data.memberships ?? []
    const nextActiveTallerId = freshMemberships.length === 1 ? freshMemberships[0].taller_id : null

    localStorage.setItem('access_token', data.token.access_token)
    localStorage.setItem('expires_at', data.token.expires_at)
    persistSession({ user: data.user, memberships: freshMemberships, activeTallerId: nextActiveTallerId })

    setToken(data.token.access_token)
    setUser(data.user)
    setMemberships(freshMemberships)
    setActiveTallerIdState(nextActiveTallerId)
    setSuscripcionVencida(false)

    return { user: data.user, memberships: freshMemberships }
  }

  const logout = () => {
    clearSession()
    setToken(null)
    setUser(null)
    setMemberships([])
    setActiveTallerIdState(null)
    setSuscripcionVencida(false)
  }

  const setActiveTaller = (tallerId) => {
    const membership = memberships.find((m) => m.taller_id === tallerId)
    if (!membership) return
    localStorage.setItem('active_taller_id', String(tallerId))
    setActiveTallerIdState(tallerId)
  }

  const activeTaller = memberships.find((m) => m.taller_id === activeTallerId) ?? null

  const value = {
    token,
    user,
    memberships,
    activeTaller,
    activeTallerId,
    role: activeTaller?.role ?? null,
    isSuperadmin: Boolean(user?.is_superadmin),
    loading,
    suscripcionVencida,
    login,
    logout,
    setActiveTaller,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
