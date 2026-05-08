import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Briefcase, Banknote, Calendar, Clock, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LoadingState, ErrorState } from '@/components/feedback/States'
import { offresService } from '@/services/offres.service'
import { candidaturesService } from '@/services/candidatures.service'
import { useAuthStore } from '@/stores/authStore'
import { TYPE_CONTRAT } from '@/lib/constants'
import { formatDate, formatSalary } from '@/lib/utils'
import type { Offre } from '@/types/offre'

export default function OffreDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [offre, setOffre] = useState<Offre | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasApplied, setHasApplied] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const data = await offresService.get(Number(id))
        setOffre(data)
        
        if (user?.role === 'candidat') {
          const myApps = await candidaturesService.myApplications()
          setHasApplied(myApps.some((app) => app.offre_id === Number(id)))
        }
      } catch {
        setError('Offre introuvable')
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id, user?.role])

  if (loading) return <LoadingState />
  if (error || !offre) return <ErrorState message={error} />

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux offres
      </button>

      {/* Header */}
      <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-xl border border-gray-200 dark:border-white/10 shadow-card dark:shadow-glow-blue/5 p-6 transition-colors">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{offre.titre}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" />
                {TYPE_CONTRAT[offre.type_contrat] ?? offre.type_contrat}
              </span>
              <span className="flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                {formatSalary(offre.salaire_min, offre.salaire_max)}
              </span>
              {offre.date_publication && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Publiée le {formatDate(offre.date_publication)}
                </span>
              )}
              {offre.date_cloture && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  Clôture le {formatDate(offre.date_cloture)}
                </span>
              )}
            </div>
          </div>
        </div>

        {offre.competences.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            {offre.competences.map((comp, idx) => (
              <Badge key={`${comp}-${idx}`} variant="info">{comp}</Badge>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-xl border border-gray-200 dark:border-white/10 shadow-card dark:shadow-glow-blue/5 p-6 transition-colors">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description du poste</h2>
        <div className="prose prose-sm max-w-none text-gray-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
          {offre.description}
        </div>
      </div>

      {/* Apply CTA */}
      {user?.role === 'candidat' && (
        <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-xl border border-gray-200 dark:border-white/10 shadow-card dark:shadow-glow-blue/5 p-6 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {hasApplied ? 'Candidature envoyée' : 'Intéressé par ce poste ?'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                {offre.candidatures_count} candidature{offre.candidatures_count !== 1 ? 's' : ''} reçue{offre.candidatures_count !== 1 ? 's' : ''}
              </p>
            </div>
            <Button
              onClick={() => navigate(`/postuler/${offre.id}`)}
              icon={!hasApplied ? <Send className="h-4 w-4" /> : undefined}
              disabled={hasApplied}
              variant={hasApplied ? 'secondary' : 'primary'}
            >
              {hasApplied ? 'Déjà postulé' : 'Postuler'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
