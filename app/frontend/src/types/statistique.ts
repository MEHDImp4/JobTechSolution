export interface RHDashboardStats {
  total_offres: number
  total_candidatures: number
  total_entretiens: number
  recrutements_reussis: number
  top_candidats: TopCandidat[]
}

export interface TopCandidat {
  nom: string
  offre: string
  score: number
}

export interface Funnel {
  total: number
  preselectionnes: number
  entretiens: number
  retenus: number
  taux: number
}

export interface ScoreStats {
  avg: number | null
  max: number | null
  min: number | null
}

export interface KPIData {
  funnel: Funnel
  delai_moyen: number
  score_stats: ScoreStats
  top_competences: [string, number][]
}
