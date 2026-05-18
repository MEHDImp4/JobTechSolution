import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { StatusBadge } from '@/components/ui/Badge'
import { LoadingState, ErrorState, EmptyState } from '@/components/feedback/States'
import { candidaturesService } from '@/services/candidatures.service'
import { CANDIDATURE_STATUTS } from '@/lib/constants'
import { formatDate, formatScore, getScoreColor } from '@/lib/utils'
import type { Candidature } from '@/types/candidature'
import { CandidatureIAModal } from '@/components/rh/CandidatureIAModal'
import { useAuthStore } from '@/stores/authStore'

const STEP_LABELS = ['Candidature', 'Traitement', 'Présélection', 'Décision']

function Stepper({ step, rejected }: { step: number; rejected: boolean }) {
  return (
    <div className="flex items-center gap-1">
      {STEP_LABELS.map((label, index) => {
        const current = index + 1
        const isActive = current <= step
        const isFinalRejected = current === STEP_LABELS.length && rejected

        return (
          <div key={label} className="flex items-center">
            <div
              className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                isFinalRejected ? 'bg-danger' : isActive ? 'bg-brand-600' : 'bg-gray-200'
              }`}
            />
            {index < STEP_LABELS.length - 1 && (
              <div className={`w-6 h-0.5 transition-colors duration-500 ${isActive ? 'bg-brand-300' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function MyApplicationsPage() {
  const { user } = useAuthStore()
  const [applications, setApplications] = useState<Candidature[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [iaModal, setIaModal] = useState<Candidature | null>(null)

  useEffect(() => {
    let ignore = false

    async function fetchApplications() {
      try {
        const data = await candidaturesService.myApplications()
        if (!ignore) {
          setApplications(data)
        }
      } catch {
        if (!ignore) {
          setError('Impossible de charger vos candidatures')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    void fetchApplications()

    return () => {
      ignore = true
    }
  }, [])

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Mes candidatures</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Suivez le score et l’analyse de votre CV</p>
        </div>
        <Sparkles className="h-6 w-6 text-brand-500/20" />
      </div>

      {applications.length === 0 ? (
        <EmptyState
          title="Aucune candidature"
          description="Parcourez les offres pour postuler à un poste."
        />
      ) : (
        <div className="grid gap-4">
          {applications.map((application) => {
            const statusConfig = CANDIDATURE_STATUTS[application.statut] ?? { label: application.statut, color: 'bg-gray-100 text-gray-700' }
            const step = getStep(application.statut)

            return (
              <div
                key={application.id}
                className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-xl border border-gray-200 dark:border-white/10 p-4 sm:p-5 space-y-4 transition-all hover:shadow-card"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-1" title={application.offre_titre}>
                      {application.offre_titre}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                      Postulé le {formatDate(application.date_soumission)}
                    </p>
                  </div>
                  <StatusBadge className={`${statusConfig.color} shrink-0`}>{statusConfig.label}</StatusBadge>
                </div>

                <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
                  <Stepper step={step} rejected={application.statut === 'rejete'} />
                </div>

                <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-gray-100 dark:border-white/5">
                  <div className="space-y-1">
                    <span className="text-gray-500 dark:text-slate-400 text-xs uppercase font-medium tracking-wider">Score CV</span>
                    <button
                      onClick={() => setIaModal(application)}
                      className={`block font-bold hover:underline cursor-pointer ${getScoreColor(application.matching_score)}`}
                    >
                      {formatScore(application.matching_score)}
                    </button>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-500 dark:text-slate-400 text-xs uppercase font-medium tracking-wider">Résumé</span>
                    <p className="text-sm text-gray-700 dark:text-slate-300">
                      {application.ai_summary || 'Analyse disponible après traitement du CV.'}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <CandidatureIAModal
        open={!!iaModal}
        onClose={() => setIaModal(null)}
        candidature={iaModal}
        candidatNom={user?.nom ? `${user.nom} ${user.prenom}` : 'Ma candidature'}
      />
    </div>
  )
}

function getStep(statut: string): number {
  const map: Record<string, number> = {
    en_attente: 1,
    en_cours: 2,
    preselectionne: 3,
    rejete: 4,
    accepte: 4,
  }

  return map[statut] ?? 1
}
