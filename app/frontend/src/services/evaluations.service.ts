import { apiGet, apiPost } from './client'
import type { Evaluation, EvaluationCreatePayload } from '@/types/evaluation'

export const evaluationsService = {
  list: (statut?: string) =>
    apiGet<Evaluation[]>('evaluations', statut ? { statut } : undefined),

  get: (id: number) => apiGet<Evaluation>(`evaluations/${id}`),

  create: (data: EvaluationCreatePayload) => apiPost<Evaluation>('evaluations', data),

  downloadPdf: (id: number) => `/api/evaluations/${id}/pdf`,
}
