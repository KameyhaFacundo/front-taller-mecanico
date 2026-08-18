import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function RequireAdmin() {
  const { role } = useAuth()
  return role === 'admin' ? <Outlet /> : <Navigate to="/forbidden" replace />
}
