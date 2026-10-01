export type UserRole = 'admin' | 'rh' | 'recruteur' | 'candidat' | 'manager'

export interface NavItem {
  path: string
  label: string
  icon: string
  roles: UserRole[]
}

export const ROLES: Record<UserRole, string> = {
  admin: 'Administrateur',
  rh: 'Recruteur',
  recruteur: 'Recruteur',
  candidat: 'Candidat',
  manager: 'Manager',
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Tableau de bord', icon: 'LayoutDashboard', roles: ['admin', 'rh', 'recruteur', 'manager'] },
  { path: '/offres', label: 'Offres', icon: 'Briefcase', roles: ['candidat', 'rh', 'recruteur', 'manager'] },
  { path: '/mes-candidatures', label: 'Mes candidatures', icon: 'FileText', roles: ['candidat'] },
  { path: '/candidatures', label: 'Candidatures', icon: 'Users', roles: ['rh', 'recruteur', 'manager'] },
  { path: '/entretiens', label: 'Entretiens', icon: 'Calendar', roles: ['admin', 'rh', 'recruteur', 'candidat', 'manager'] },
  { path: '/evaluations', label: 'Évaluations', icon: 'ClipboardCheck', roles: ['admin', 'rh', 'recruteur', 'manager'] },
  { path: '/statistiques', label: 'Statistiques', icon: 'BarChart3', roles: ['admin', 'rh', 'manager'] },
  { path: '/admin/utilisateurs', label: 'Utilisateurs', icon: 'UserCog', roles: ['admin'] },
]

export const TYPE_CONTRAT: Record<string, string> = {
  CDI: 'CDI',
  CDD: 'CDD',
  STAGE: 'Stage',
  FREELANCE: 'Freelance',
}

export const OFFRE_STATUTS: Record<string, { label: string; color: string }> = {
  brouillon: { label: 'Brouillon', color: 'bg-gray-100 text-gray-700' },
  publiee: { label: 'Publiée', color: 'bg-blue-100 text-blue-700' },
  ouverte: { label: 'Ouverte', color: 'bg-emerald-100 text-emerald-700' },
  en_cours: { label: 'En cours', color: 'bg-amber-100 text-amber-700' },
  cloturee: { label: 'Clôturée', color: 'bg-gray-100 text-gray-600' },
}

export const CANDIDATURE_STATUTS: Record<string, { label: string; color: string }> = {
  en_attente: { label: 'En attente', color: 'bg-gray-100 text-gray-700' },
  preselectionne: { label: 'Présélectionné', color: 'bg-blue-100 text-blue-700' },
  en_cours: { label: 'En cours', color: 'bg-amber-100 text-amber-700' },
  accepte: { label: 'Acceptée', color: 'bg-emerald-100 text-emerald-700' },
  refuse: { label: 'Refusée', color: 'bg-red-100 text-red-700' },
  rejetee: { label: 'Rejetée', color: 'bg-red-100 text-red-700' },
}

export const ENTRETIEN_STATUTS: Record<string, { label: string; color: string }> = {
  planifie: { label: 'Planifié', color: 'bg-blue-100 text-blue-700' },
  en_cours: { label: 'En cours', color: 'bg-amber-100 text-amber-700' },
  termine: { label: 'Terminé', color: 'bg-emerald-100 text-emerald-700' },
  annule: { label: 'Annulé', color: 'bg-red-100 text-red-700' },
}

export const ENTRETIEN_TYPES: Record<string, string> = {
  recrutement: 'Recrutement',
  annuel: 'Annuel',
  technique: 'Technique',
  final: 'Final',
}

export const EVALUATION_RECOMMANDATIONS: Record<string, { label: string; color: string }> = {
  favorable: { label: 'Favorable', color: 'bg-emerald-100 text-emerald-700' },
  a_retenir: { label: 'À retenir', color: 'bg-blue-100 text-blue-700' },
  reserve: { label: 'Réservé', color: 'bg-amber-100 text-amber-700' },
  defavorable: { label: 'Défavorable', color: 'bg-red-100 text-red-700' },
}
