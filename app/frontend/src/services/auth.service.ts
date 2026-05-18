import { apiGet, apiPost, apiPut } from './client'
import type { AuthMeResponse, LoginPayload, MessageResponse, ProfileUpdatePayload, PasswordChangePayload, RegisterPayload, User } from '@/types/auth'
import type { PaginatedResponse } from '@/types/pagination'

export const authService = {
  me: () => apiGet<AuthMeResponse>('accounts/profile'),

  login: (data: LoginPayload) => apiPost<User>('accounts/login', data),

  register: (data: RegisterPayload) => apiPost<MessageResponse>('accounts/register', data),

  logout: () => apiPost<MessageResponse>('accounts/logout'),

  updateProfile: (data: ProfileUpdatePayload) => apiPut<User>('accounts/profile', data),

  changePassword: (data: PasswordChangePayload) => apiPost<MessageResponse>('accounts/me/password', data),

  async listRecruteurs() {
    const response = await apiGet<PaginatedResponse<User>>('users', {
      role: 'RECRUTEUR',
      page_size: '100',
    })
    return response.results
  },
}
