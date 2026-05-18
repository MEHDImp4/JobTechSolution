export interface Entretien {
  id: number
  candidat_nom: string
  candidat_email?: string
  recruteur_name: string
  offre_titre: string
  date_heure: string
  duree_minutes: number
  type_entretien: 'recrutement' | 'annuel' | 'technique' | 'final'
  lieu: string
  statut: 'planifie' | 'en_cours' | 'termine' | 'annule'
  notes: string
  score_ia?: number
  cv_url?: string
  candidature_id?: number
}

export interface EntretienCreatePayload {
  candidature_id: number
  recruteur_id: number
    duree_minutes?: number
  date_heure: string
  duree_minutes?: number
  type_entretien?: string
  lieu?: string
}
