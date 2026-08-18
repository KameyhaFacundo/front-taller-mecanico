import { useEffect, useState } from 'react'
import { loginApi, meApi } from '../services/authApi'
import { AuthContext } from './authContext.js'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

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
    }

    meApi()
      .then((freshUser) => {
        localStorage.setItem('user', JSON.stringify(freshUser))
        setUser(freshUser)
        setToken(storedToken)
      })
      .catch(() => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('expires_at')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null)
      setUser(null)
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [])

  const login = async (email, password) => {
    const data = await loginApi(email, password)
    localStorage.setItem('access_token', data.token.access_token)
    localStorage.setItem('expires_at', data.token.expires_at)
    localStorage.setItem('user', JSON.stringify(data.user))
    setToken(data.token.access_token)
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('expires_at')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const value = {
    token,
    user,
    role: user?.role ?? null,
    loading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
