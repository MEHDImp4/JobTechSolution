export interface Candidature {
  id: number
  offre_id: number
  offre_titre: string
  candidat_nom?: string
  candidat_email?: string
  cv_file: string
  cv_file_original_name: string
  lettre_motivation: string
  experience_annees: number | null
  linkedin_url: string
  statut: 'recue' | 'analyse_ia' | 'examen_rh' | 'entretien' | 'retenu' | 'refuse'
  score_ia: number | null
  ia_status: 'pending' | 'processing' | 'done' | 'error'
  date_candidature: string
  date_maj: string | null
}

export interface CandidatureStatus {
  ia_status: string | null
  score_ia: number | null
  statut: string
}
