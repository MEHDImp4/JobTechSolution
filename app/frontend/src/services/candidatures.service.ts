import { apiGet, apiPost, apiPostForm } from './client'
import type { Candidature, CandidatureStatus } from '@/types/candidature'

export const candidaturesService = {
  myApplications: () => apiGet<Candidature[]>('candidatures/my-applications'),
  getByOffre: (offreId: number) => apiGet<Candidature[]>(`candidatures/offre/${offreId}`),

  getStatus: (id: number) => apiGet<CandidatureStatus>(`candidatures/${id}/status`),

  apply: (formData: FormData) => apiPostForm<Candidature>('candidatures/apply', formData),

  updateStatus: (id: number, statut: string) =>
    apiPost<CandidatureStatus>(`candidatures/${id}/statut`, { statut }),

  bulkUpdateStatus: (ids: number[], statut: string) =>
    apiPost<number[]>('candidatures/bulk-statut', { ids, statut }),
}
