import { useState, useEffect } from 'react'
import { Download, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { LoadingState, ErrorState, EmptyState } from '@/components/feedback/States'
import { evaluationsService } from '@/services/evaluations.service'
import { EVALUATION_RECOMMANDATIONS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import type { Evaluation } from '@/types/evaluation'

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3.5 w-3.5 ${n <= value ? 'fill-warning text-warning' : 'text-gray-200'}`}
        />
      ))}
    </div>
  )
}

export default function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await evaluationsService.list()
        setEvaluations(data)
      } catch {
        setError('Impossible de charger les évaluations')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Évaluations</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Comptes rendus des entretiens</p>
      </div>

      {evaluations.length === 0 ? (
        <EmptyState title="Aucune évaluation" description="Les évaluations apparaîtront ici après les entretiens." />
      ) : (
        <div className="grid gap-4">
          {evaluations.map((ev) => {
            const recConf = EVALUATION_RECOMMANDATIONS[ev.recommandation] ?? { label: ev.recommandation, color: 'bg-gray-100 text-gray-700' }
            return (
              <div key={ev.id} className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-xl border border-gray-200 dark:border-white/10 shadow-card dark:shadow-glow-blue/5 p-5 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{ev.candidat_nom}</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{ev.offre_titre} · {formatDate(ev.date_creation)}</p>
                  </div>
                  <StatusBadge className={recConf.color}>{recConf.label}</StatusBadge>
                </div>

                {/* Ratings grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                  {[
                    { label: 'Compétences', value: ev.competences_rate },
                    { label: 'Communication', value: ev.communication_rate },
                    { label: 'Motivation', value: ev.motivation_rate },
                    { label: 'Adaptabilité', value: ev.adaptabilite_rate },
                    { label: 'Culture fit', value: ev.culture_fit_rate },
                  ].map((r) => (
                    <div key={r.label} className="text-center p-2 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">{r.label}</p>
                      <StarRating value={r.value} />
                    </div>
                  ))}
                </div>

                {/* Comments */}
                {ev.commentaires && (
                  <p className="text-sm text-gray-600 dark:text-slate-300 border-t border-gray-100 dark:border-white/5 pt-3">{ev.commentaires}</p>
                )}

                {/* PDF Download */}
                {ev.pdf_file && (
                  <div className="flex justify-end mt-3">
                    <a href={evaluationsService.downloadPdf(ev.id)} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="secondary" icon={<Download className="h-4 w-4" />}>
                        Rapport PDF
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
