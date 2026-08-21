import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function RequireSuperadmin() {
  const { isSuperadmin } = useAuth()
  return isSuperadmin ? <Outlet /> : <Navigate to="/forbidden" replace />
}
