import { create } from 'zustand'
import type { User } from '@/types/auth'
import { authService } from '@/services/auth.service'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  checkAuth: () => Promise<void>
  setUser: (user: User | null) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  checkAuth: async () => {
    try {
      const res = await authService.me()
      set({
        user: res.user,
        isAuthenticated: res.authenticated,
        isLoading: false,
      })
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user })
  },

  logout: async () => {
    try {
      await authService.logout()
    } finally {
      set({ user: null, isAuthenticated: false })
    }
  },
}))
