import { apiGet, apiPost, apiPatch } from './client'
import type { Entretien, EntretienCreatePayload } from '@/types/entretien'

export const entretiensService = {
  list: () => apiGet<Entretien[]>('entretiens'),

  getById: (id: number) => apiGet<Entretien>(`entretiens/${id}`),

  create: (data: EntretienCreatePayload) => apiPost<Entretien>('entretiens', data),

  updateStatut: (id: number, statut: string) =>
    apiPatch<Entretien>(`entretiens/${id}/statut`, { statut }),

  updateNotes: (id: number, notes: string) =>
    apiPatch<Entretien>(`entretiens/${id}/notes`, { notes }),
}
