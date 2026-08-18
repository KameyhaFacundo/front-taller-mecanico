import { useEffect } from 'react'
import { useAuth } from './useAuth'

export function useTokenExpirationCheck() {
  const { token, logout } = useAuth()

  useEffect(() => {
    if (!token) return undefined

    const checkExpiration = () => {
      const expiresAt = localStorage.getItem('expires_at')
      if (expiresAt && new Date(expiresAt) <= new Date()) {
        logout()
      }
    }

    checkExpiration()
    const intervalId = setInterval(checkExpiration, 60000)

    const handleStorage = (event) => {
      if (event.key === 'access_token' && event.newValue === null) {
        logout()
      }
    }
    window.addEventListener('storage', handleStorage)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener('storage', handleStorage)
    }
  }, [token, logout])
}
