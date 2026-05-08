import { apiGet, apiPost, apiPatch } from './client'
import type { AuthMeResponse, LoginPayload, MessageResponse, ProfileUpdatePayload, PasswordChangePayload, RegisterPayload, User } from '@/types/auth'

export const authService = {
  me: () => apiGet<AuthMeResponse>('auth/me'),

  login: (data: LoginPayload) => apiPost<User>('auth/login', data),

  register: (data: RegisterPayload) => apiPost<MessageResponse>('auth/register', data),

  logout: () => apiPost<MessageResponse>('auth/logout'),

  updateProfile: (data: ProfileUpdatePayload) => apiPatch<User>('auth/me', data),

  changePassword: (data: PasswordChangePayload) => apiPost<MessageResponse>('auth/me/password', data),

  listRecruteurs: () => apiGet<User[]>('auth/recruteurs'),
}
