import { apiGet, apiPost, apiPatch, apiPostForm } from './client'
import type { User, AuditLog, ImportResult } from '@/types/auth'

export const adminService = {
  listUsers: (params?: { role?: string; search?: string }) =>
    apiGet<User[]>('admin/users', params as Record<string, string>),

  updateUser: (id: number, data: { role?: string; is_active?: boolean }) =>
    apiPatch<User>(`admin/users/${id}`, data),

  toggleActive: (id: number) => apiPost<User>(`admin/users/${id}/toggle-active`),

  importUsers: (formData: FormData) =>
    apiPostForm<ImportResult>('admin/users/import', formData),

  auditLogs: () => apiGet<AuditLog[]>('admin/audit-logs'),
}
