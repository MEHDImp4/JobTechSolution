export type CandidatureStatut =
  | 'en_attente'
  | 'en_cours'
  | 'preselectionne'
  | 'rejete'
  | 'accepte'

export interface AIExtractedData {
  email?: string
  telephone?: string
  competences_detectees?: string[]
  total_competences_requises?: number
}

export interface Candidature {
  id: number
  offre: number
  offre_titre: string
  candidat?: number
  candidat_username?: string
  cv_file: string
  telephone: string
  experience_annees: number | null
  lettre_motivation: string
  linkedin_url: string
  statut: CandidatureStatut
  matching_score: number | null
  cv_text: string
  ai_summary: string
  ai_extracted_data: AIExtractedData | null
  date_soumission: string
}

export interface CandidatureStatus {
  statut: CandidatureStatut
  matching_score: number | null
  ai_summary: string
}
