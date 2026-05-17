import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, MapPin, Video } from 'lucide-react'
import { StatusBadge } from '@/components/ui/Badge'
import { toast } from '@/components/feedback/Toast'
import { LoadingState, ErrorState, EmptyState } from '@/components/feedback/States'
import { entretiensService } from '@/services/entretiens.service'
import { ENTRETIEN_STATUTS, ENTRETIEN_TYPES } from '@/lib/constants'
import { formatDateTime } from '@/lib/utils'
import type { Entretien } from '@/types/entretien'
import { useAuthStore } from '@/stores/authStore'
import { NotesEntretienModal } from '@/components/rh/NotesEntretienModal'
import { CreateEvaluationModal } from '@/components/rh/CreateEvaluationModal'

export default function EntretiensPage() {
  const { user } = useAuthStore()
  const [entretiens, setEntretiens] = useState<Entretien[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const [notesModal, setNotesModal] = useState<Entretien | null>(null)
  const [evalModal, setEvalModal] = useState<Entretien | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await entretiensService.list()
        setEntretiens(data)
      } catch {
        setError('Impossible de charger les entretiens')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = filterStatut
    ? entretiens.filter((e) => e.statut === filterStatut)
    : entretiens

  const handleStatusChange = async (id: number, newStatut: string) => {
    try {
      const updated = await entretiensService.updateStatut(id, newStatut)
      setEntretiens(prev => prev.map(e => e.id === id ? updated : e))
    } catch {
      toast('error', 'Erreur lors du changement de statut')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Entretiens</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Planning et suivi des entretiens</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { value: '', label: 'Tous' },
          { value: 'planifie', label: 'Planifiés' },
          { value: 'en_cours', label: 'En cours' },
          { value: 'termine', label: 'Terminés' },
          { value: 'annule', label: 'Annulés' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilterStatut(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              filterStatut === f.value
                ? 'bg-brand-600 text-white shadow-glow-blue'
                : 'bg-white dark:bg-slate-900/50 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : filtered.length === 0 ? (
        <EmptyState title="Aucun entretien" description="Les entretiens apparaîtront ici." />
      ) : (
        <div className="grid gap-4">
          {filtered.map((e) => {
            const statConf = ENTRETIEN_STATUTS[e.statut] ?? { label: e.statut, color: 'bg-gray-100 text-gray-700' }
            const typeLbl = ENTRETIEN_TYPES[e.type_entretien] ?? e.type_entretien

            return (
              <div key={e.id} className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-xl border border-gray-200 dark:border-white/10 shadow-card dark:shadow-glow-blue/5 p-5 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">{e.candidat_nom}</h3>
                      <StatusBadge className={statConf.color}>{statConf.label}</StatusBadge>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{e.offre_titre} · {typeLbl}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {formatDateTime(e.date_heure)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {e.duree_minutes} min
                      </span>
                      {e.lieu && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          {e.lieu}
                        </span>
                      )}
                      {['planifie', 'en_cours'].includes(e.statut) && (
                        <Link
                          to={`/visio/${e.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                        >
                          <Video className="h-4 w-4" />
                          Rejoindre la visio
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500 dark:text-slate-500">
                        Par {e.recruteur_name}
                      </p>
                      {user && ['rh', 'admin', 'recruteur'].includes(user.role) && (
                        <select
                          value={e.statut}
                          onChange={(ev) => handleStatusChange(e.id, ev.target.value)}
                          className="text-[11px] h-7 px-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-brand-500"
                        >
                          {Object.entries(ENTRETIEN_STATUTS).map(([key, config]) => (
                            <option key={key} value={key}>{(config as { label: string }).label}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {['planifie', 'en_cours'].includes(e.statut) && (
                        <Link
                          to={`/visio/${e.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 text-white shadow-glow-blue hover:bg-brand-700 transition-colors"
                        >
                          Rejoindre Visio
                        </Link>
                      )}
                      {user && ['rh', 'admin', 'recruteur'].includes(user.role) && (
                        <>
                          <button
                            onClick={() => setNotesModal(e)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-colors"
                          >
                            Notes
                          </button>
                          {e.statut === 'termine' && (
                            <button
                              onClick={() => setEvalModal(e)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-warning-light dark:bg-warning/10 text-warning-dark dark:text-warning hover:bg-warning-light/80 transition-colors"
                            >
                              Évaluer
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {notesModal && (
        <NotesEntretienModal
          open={!!notesModal}
          onClose={() => setNotesModal(null)}
          entretien={notesModal}
          onSuccess={(updated) => {
            setEntretiens(prev => prev.map(e => e.id === updated.id ? updated : e))
          }}
        />
      )}

      {evalModal && (
        <CreateEvaluationModal
          open={!!evalModal}
          onClose={() => setEvalModal(null)}
          entretien={evalModal}
          onSuccess={() => {
            // Optional: refresh to show evaluation status or link
          }}
        />
      )}
    </div>
  )
}
