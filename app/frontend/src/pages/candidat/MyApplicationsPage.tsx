import { useEffect, useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { StatusBadge } from '@/components/ui/Badge'
import { LoadingState, ErrorState, EmptyState } from '@/components/feedback/States'
import { candidaturesService } from '@/services/candidatures.service'
import { CANDIDATURE_STATUTS, IA_STATUS } from '@/lib/constants'
import { formatDate, formatScore, getScoreColor } from '@/lib/utils'
import type { Candidature } from '@/types/candidature'
import { CandidatureIAModal } from '@/components/rh/CandidatureIAModal'
import { useAuthStore } from '@/stores/authStore'

const STEP_LABELS = ['Reçue', 'Analyse IA', 'Examen RH', 'Entretien', 'Décision']

function Stepper({ step, refused }: { step: number; refused: boolean }) {
  return (
    <div className="flex items-center gap-1">
      {STEP_LABELS.map((label, i) => {
        const current = i + 1
        const isActive = current <= step
        const isFinal = current === 5 && refused
        return (
          <div key={label} className="flex items-center">
            <div
              className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                isFinal ? 'bg-danger' : isActive ? 'bg-brand-600' : 'bg-gray-200'
              }`}
            />
            {i < 4 && <div className={`w-6 h-0.5 transition-colors duration-500 ${isActive ? 'bg-brand-300' : 'bg-gray-200'}`} />}
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

  // Polling si une analyse est en cours
  useEffect(() => {
    const hasProcessing = applications.some(app => app.ia_status === 'pending' || app.ia_status === 'processing')
    
    if (hasProcessing) {
      const interval = setInterval(() => {
        void candidaturesService.myApplications()
          .then((data) => {
            setApplications(data)
          })
          .catch(() => {})
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [applications])

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Mes candidatures</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Suivez l'avancement de vos candidatures</p>
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
          {applications.map((app) => {
            const step = getStep(app.statut)
            const statusConfig = CANDIDATURE_STATUTS[app.statut] ?? { label: app.statut, color: 'bg-gray-100 text-gray-700' }
            const iaConfig = IA_STATUS[app.ia_status] ?? { label: app.ia_status, color: 'bg-gray-100 text-gray-600' }
            const isAnalyzing = app.ia_status === 'pending' || app.ia_status === 'processing'

            return (
              <div 
                key={app.id} 
                className={`bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-xl border p-4 sm:p-5 space-y-4 transition-all hover:shadow-card ${
                  isAnalyzing 
                    ? 'border-brand-500/50 animate-pulse-subtle' 
                    : 'border-gray-200 dark:border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-1" title={app.offre_titre}>
                      {app.offre_titre}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-0.5">Postulé le {formatDate(app.date_candidature)}</p>
                  </div>
                  <StatusBadge className={`${statusConfig.color} shrink-0`}>{statusConfig.label}</StatusBadge>
                </div>

                <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
                  <Stepper step={step} refused={app.statut === 'refuse'} />
                </div>

                <div className="flex items-center justify-between gap-4 text-sm pt-2 border-t border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-slate-400 text-xs uppercase font-medium tracking-wider">Score IA</span>
                    {isAnalyzing ? (
                      <span className="text-gray-400 italic text-xs">Calcul en cours...</span>
                    ) : (
                      <button 
                        onClick={() => setIaModal(app)}
                        className={`font-bold hover:underline cursor-pointer ${getScoreColor(app.score_ia)}`}
                      >
                        {formatScore(app.score_ia)}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-slate-400 text-xs uppercase font-medium tracking-wider">Analyse</span>
                    <StatusBadge className={`${iaConfig.color} flex items-center gap-1.5`}>
                      {isAnalyzing && <Loader2 className="h-3 w-3 animate-spin" />}
                      {iaConfig.label}
                    </StatusBadge>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {iaModal && (
        <CandidatureIAModal
          open={!!iaModal}
          onClose={() => setIaModal(null)}
          candidatureId={iaModal.id}
          candidatNom={iaModal.candidat_nom || (user?.nom ? `${user.nom} ${user.prenom}` : 'Ma candidature')}
        />
      )}
    </div>
  )
}

function getStep(statut: string): number {
  const map: Record<string, number> = {
    recue: 1, analyse_ia: 2, examen_rh: 3, entretien: 4, retenu: 5, refuse: 5,
  }
  return map[statut] ?? 1
}
