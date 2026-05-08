import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { LoadingState } from '@/components/feedback/States'
import type { UserRole } from '@/lib/constants'

interface ProtectedRouteProps {
  children: React.ReactNode
  roles?: UserRole[]
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState message="Vérification de la session..." />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/connexion" replace />
  }

  if (roles && !roles.includes(user.role as UserRole)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
