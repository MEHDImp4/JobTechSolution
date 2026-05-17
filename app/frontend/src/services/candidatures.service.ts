import { apiGet, apiPost, apiPostForm } from './client'
import type { Candidature, CandidatureStatus } from '@/types/candidature'
import type { PaginatedResponse } from '@/types/pagination'

export const candidaturesService = {
  myApplications: () => apiGet<Candidature[]>('candidatures/my-applications'),
  getByOffre: (offreId: number, params?: { page?: string; page_size?: string }) =>
    apiGet<PaginatedResponse<Candidature>>(`candidatures/offre/${offreId}`, params as Record<string, string>),

  getStatus: (id: number) => apiGet<CandidatureStatus>(`candidatures/${id}/status`),

  apply: (formData: FormData) => apiPostForm<Candidature>('candidatures', formData),

  updateStatus: (id: number, statut: string) =>
    apiPost<CandidatureStatus>(`candidatures/${id}/statut`, { statut }),

  bulkUpdateStatus: (ids: number[], statut: string) =>
    apiPost<number[]>('candidatures/bulk-statut', { ids, statut }),
}
