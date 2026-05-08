import { apiGet, apiPost, apiPut, apiDelete } from './client'
import type { Offre, OffreCreatePayload, Competence } from '@/types/offre'

export const offresService = {
  list: (params?: { q?: string; type_contrat?: string; statut?: string }) =>
    apiGet<Offre[]>('offres/', params as Record<string, string>),

  get: (id: number) => apiGet<Offre>(`offres/${id}`),

  create: (data: OffreCreatePayload) => apiPost<Offre>('offres/', data),

  update: (id: number, data: OffreCreatePayload) => apiPut<Offre>(`offres/${id}`, data),

  delete: (id: number) => apiDelete<{ message: string }>(`offres/${id}`),

  toggleStatus: (id: number) => apiPost<Offre>(`offres/${id}/toggle-status`),

  autocompleteCompetences: (q: string) =>
    apiGet<Competence[]>('offres/competences/autocomplete', { q }),
}
