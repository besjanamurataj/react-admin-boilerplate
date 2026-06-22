
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export const PrivateGuard = (props: any) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  return isAuthenticated ? props.children : <Navigate to="/login" replace />
}
