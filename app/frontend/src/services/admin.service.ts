import { apiGet, apiPost, apiPatch, apiPostForm } from './client'
import type { User, AuditLog, ImportResult } from '@/types/auth'
import type { PaginatedResponse } from '@/types/pagination'

export const adminService = {
  listUsers: (params?: { role?: string; search?: string; page?: string; page_size?: string }) =>
    apiGet<PaginatedResponse<User>>('users', params as Record<string, string>),

  createUser: (data: {
    email: string
    nom: string
    prenom: string
    role: string
    password: string
    username?: string
  }) => apiPost<User>('users', {
    ...data,
    role: data.role.toUpperCase(),
  }),

  updateUser: (id: number, data: { role?: string; is_active?: boolean }) =>
    apiPatch<User>(`users/${id}`, data),

  toggleActive: (id: number) => apiPost<User>(`users/${id}/toggle-active`),

  importUsers: (formData: FormData) =>
    apiPostForm<ImportResult>('users/import', formData),

  auditLogs: (params?: { search?: string; page?: string; page_size?: string }) =>
    apiGet<PaginatedResponse<AuditLog>>('audit', params as Record<string, string>),
}
