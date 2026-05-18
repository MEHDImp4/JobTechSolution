export interface Offre {
  id: number
  titre: string
  description: string
  experience_requise: number
  competences: string[]
  type_contrat: 'CDI' | 'CDD' | 'STAGE' | 'FREELANCE'
  salaire_min: number | null
  salaire_max: number | null
  statut: 'brouillon' | 'publiee' | 'ouverte' | 'en_cours' | 'cloturee'
  date_publication: string | null
  date_cloture: string | null
  created_at: string
  candidatures_count: number
}

export interface OffreCreatePayload {
  titre: string
  description: string
  experience_requise: number
  competences: string[]
  type_contrat: string
  salaire_min?: number | null
  salaire_max?: number | null
  date_cloture?: string | null
  statut?: string
}

export interface Competence {
  id: number
  nom: string
  categorie: string
  count_usage: number
}
