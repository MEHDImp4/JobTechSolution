import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore, type Theme } from '@/stores/uiStore'
import { ToastProvider } from '@/components/feedback/Toast'

import { AuthLayout } from '@/layouts/AuthLayout'
import { AppLayout } from '@/layouts/AppLayout'
import { ProtectedRoute } from '@/layouts/ProtectedRoute'

// Auth — lazy loaded
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))

// Shared — lazy loaded
const ProfilePage = lazy(() => import('@/pages/shared/ProfilePage'))
const NotFoundPage = lazy(() => import('@/pages/shared/NotFoundPage'))
const EntretiensPage = lazy(() => import('@/pages/shared/EntretiensPage'))
const EvaluationsPage = lazy(() => import('@/pages/shared/EvaluationsPage'))

// Candidat — lazy loaded
const OffresListPage = lazy(() => import('@/pages/candidat/OffresListPage'))
const OffreDetailPage = lazy(() => import('@/pages/candidat/OffreDetailPage'))
const ApplyPage = lazy(() => import('@/pages/candidat/ApplyPage'))
const MyApplicationsPage = lazy(() => import('@/pages/candidat/MyApplicationsPage'))

// RH — lazy loaded
const RHDashboardPage = lazy(() => import('@/pages/rh/DashboardPage'))
const OffresManagePage = lazy(() => import('@/pages/rh/OffresManagePage'))
const OffreFormPage = lazy(() => import('@/pages/rh/OffreFormPage'))
const CandidaturesPage = lazy(() => import('@/pages/rh/CandidaturesPage'))
const StatistiquesPage = lazy(() => import('@/pages/rh/StatistiquesPage'))

// Admin — lazy loaded
const UsersPage = lazy(() => import('@/pages/admin/UsersPage'))
const AuditLogPage = lazy(() => import('@/pages/admin/AuditLogPage'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-gray-400 animate-pulse">Chargement…</p>
      </div>
    </div>
  )
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function AppRoutes() {
  const { checkAuth, isAuthenticated, user } = useAuthStore()
  const theme = useUIStore((s) => s.theme)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    const root = window.document.documentElement
    
    function applyTheme(t: Theme) {
      root.classList.remove('light', 'dark')
      
      if (t === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        root.classList.add(systemTheme)
      } else {
        root.classList.add(t)
      }
    }

    applyTheme(theme)

    // Listener for system changes if theme is 'system'
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => applyTheme('system')
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  return (
    <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/connexion" element={<LoginPage />} />
        <Route path="/inscription" element={<RegisterPage />} />
      </Route>

      {/* Protected app shell */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Root redirect */}
        <Route
          path="/"
          element={
            isAuthenticated && user
              ? user.role === 'candidat'
                ? <Navigate to="/offres" replace />
                : <Navigate to="/dashboard" replace />
              : <Navigate to="/connexion" replace />
          }
        />

        {/* Candidat */}
        <Route path="/offres" element={<OffresListPage />} />
        <Route path="/offres/:id" element={<OffreDetailPage />} />
        <Route path="/postuler/:id" element={<ApplyPage />} />
        <Route path="/mes-candidatures" element={<MyApplicationsPage />} />

        {/* Dashboard — Recruteur / RH / Admin */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['recruteur', 'rh', 'admin']}>
              <RHDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* RH */}
        <Route
          path="/gestion-offres"
          element={
            <ProtectedRoute roles={['rh', 'admin']}>
              <OffresManagePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gestion-offres/nouvelle"
          element={
            <ProtectedRoute roles={['rh', 'admin']}>
              <OffreFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gestion-offres/:id/modifier"
          element={
            <ProtectedRoute roles={['rh', 'admin']}>
              <OffreFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidatures"
          element={
            <ProtectedRoute roles={['rh', 'admin']}>
              <CandidaturesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/statistiques"
          element={
            <ProtectedRoute roles={['rh', 'admin']}>
              <StatistiquesPage />
            </ProtectedRoute>
          }
        />

        {/* Shared (candidat + recruteur + rh + admin) */}
        <Route
          path="/entretiens"
          element={
            <ProtectedRoute roles={['candidat', 'recruteur', 'rh', 'admin']}>
              <EntretiensPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/evaluations"
          element={
            <ProtectedRoute roles={['recruteur', 'rh', 'admin']}>
              <EvaluationsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin/utilisateurs"
          element={
            <ProtectedRoute roles={['admin']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit"
          element={
            <ProtectedRoute roles={['admin']}>
              <AuditLogPage />
            </ProtectedRoute>
          }
        />

        {/* Profile */}
        <Route path="/profil" element={<ProfilePage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider />
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
