export interface Evaluation {
  id: number
  moyenne_score: number
  candidat_nom: string
  offre_titre: string
  score_global: number
  date_creation: string
  date_maj: string | null
  competences_rate: number
  communication_rate: number
  motivation_rate: number
  adaptabilite_rate: number
  culture_fit_rate: number
  commentaires: string
  points_forts: string
  points_amelioration: string
  recommandation: 'retenu' | 'a_reconsiderer' | 'non_retenu'
  statut: 'brouillon' | 'soumise'
  soumise_at: string | null
  pdf_file: string | null
}

export interface EvaluationCreatePayload {
  entretien_id: number
  competences_rate: number
  communication_rate: number
  motivation_rate: number
  adaptabilite_rate: number
  culture_fit_rate: number
  commentaires: string
  points_forts?: string
  points_amelioration?: string
  recommandation: string
  statut?: string
}
