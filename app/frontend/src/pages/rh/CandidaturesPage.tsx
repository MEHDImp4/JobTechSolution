import { useState, useEffect, useMemo } from 'react'
import { LayoutGrid, List, FileText, Search, Briefcase, ChevronRight, Filter } from 'lucide-react'
import { StatusBadge } from '@/components/ui/Badge'
import { LoadingState, ErrorState, EmptyState } from '@/components/feedback/States'
import { toast } from '@/components/feedback/Toast'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { candidaturesService } from '@/services/candidatures.service'
import { offresService } from '@/services/offres.service'
import { CANDIDATURE_STATUTS, IA_STATUS } from '@/lib/constants'
import { formatDate, formatScore, getScoreColor, cn } from '@/lib/utils'
import type { Candidature } from '@/types/candidature'
import type { Offre } from '@/types/offre'
import { KanbanBoard } from '@/components/rh/KanbanBoard'
import { TableSkeleton, KanbanSkeleton } from '@/components/ui/Skeleton'
import { PlanifierEntretienModal } from '@/components/rh/PlanifierEntretienModal'
import { CandidatureIAModal } from '@/components/rh/CandidatureIAModal'

export default function CandidaturesPage() {
  const [offres, setOffres] = useState<Offre[]>([])
  const [selectedOffre, setSelectedOffre] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table')
  const [offreSearch, setOffreSearch] = useState('')
  const [showClosed, setShowClosed] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const data = await offresService.list()
        setOffres(data)
        if (data.length > 0 && !selectedOffre) {
          const firstActive = data.find(o => o.statut === 'publiee') || data[0]
          setSelectedOffre(firstActive.id)
        }
      } catch {
        setError('Impossible de charger les offres')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredOffres = useMemo(() => {
    return offres.filter(o => {
      const matchesSearch = o.titre.toLowerCase().includes(offreSearch.toLowerCase())
      const matchesStatus = showClosed ? true : o.statut === 'publiee'
      return matchesSearch && matchesStatus
    })
  }, [offres, offreSearch, showClosed])

  const selectedOffreData = useMemo(() => 
    offres.find(o => o.id === selectedOffre), 
    [offres, selectedOffre]
  )

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-var(--topbar-height)-3rem)] min-h-[600px]">
      {/* Sidebar: Job Offers List */}
      <div className="w-full lg:w-80 flex flex-col bg-white dark:bg-slate-900/40 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shrink-0">
        <div className="p-4 border-b border-gray-100 dark:border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-brand-500" />
              Postes
            </h2>
            <button 
              onClick={() => setShowClosed(!showClosed)}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                showClosed ? "bg-brand-50 text-brand-600" : "text-gray-400 hover:bg-gray-50"
              )}
              title={showClosed ? "Masquer les clôturés" : "Afficher tout"}
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un poste..."
              value={offreSearch}
              onChange={(e) => setOffreSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-white/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {filteredOffres.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-8 italic">Aucun poste trouvé</p>
          ) : (
            filteredOffres.map((o) => (
              <button
                key={o.id}
                onClick={() => setSelectedOffre(o.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group",
                  selectedOffre === o.id
                    ? "bg-brand-50 dark:bg-brand-500/10 border-brand-100 dark:border-brand-500/20"
                    : "hover:bg-gray-50 dark:hover:bg-white/5"
                )}
              >
                <div className={cn(
                  "w-1.5 h-8 rounded-full shrink-0 transition-all",
                  selectedOffre === o.id ? "bg-brand-500" : "bg-transparent group-hover:bg-gray-200"
                )} />
                <div className="min-w-0 flex-1">
                  <p className={cn(
                    "text-sm font-bold truncate",
                    selectedOffre === o.id ? "text-brand-900 dark:text-brand-400" : "text-gray-700 dark:text-slate-300"
                  )}>
                    {o.titre}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-tight">
                      {o.candidatures_count} candidat{o.candidatures_count !== 1 ? 's' : ''}
                    </span>
                    {o.statut === 'cloturee' && (
                      <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 rounded uppercase font-bold">Clôturé</span>
                    )}
                  </div>
                </div>
                <ChevronRight className={cn(
                  "h-4 w-4 shrink-0 transition-transform",
                  selectedOffre === o.id ? "text-brand-500 translate-x-0" : "text-gray-300 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
                )} />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Content: Candidatures List */}
      <div className="flex-1 flex flex-col min-w-0 space-y-4 h-full overflow-hidden">
        {selectedOffreData ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
              <div className="min-w-0">
                <h1 className="text-xl font-black text-gray-900 dark:text-white truncate">
                  {selectedOffreData.titre}
                </h1>
                <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                  <span>{selectedOffreData.type_contrat}</span>
                  <span className="opacity-30">•</span>
                  <span>{selectedOffreData.candidatures_count} candidatures au total</span>
                </p>
              </div>
              
              <div className="flex items-center bg-gray-100 dark:bg-white/5 p-1 rounded-xl shrink-0 self-start sm:self-center">
                <button
                  onClick={() => setViewMode('table')}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    viewMode === 'table' ? "bg-white dark:bg-slate-800 shadow-sm text-brand-600" : "text-gray-500 hover:text-gray-700"
                  )}
                  title="Vue liste"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    viewMode === 'kanban' ? "bg-white dark:bg-slate-800 shadow-sm text-brand-600" : "text-gray-500 hover:text-gray-700"
                  )}
                  title="Vue Kanban"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pb-6 pr-1">
              <CandidatureList offreId={selectedOffreData.id} viewMode={viewMode} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-900/40 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl">
            <EmptyState 
              title="Aucun poste sélectionné" 
              description="Choisissez un poste dans la liste de gauche pour voir les candidats." 
            />
          </div>
        )}
      </div>
    </div>
  )
}


function CandidatureList({ offreId, viewMode }: { offreId: number, viewMode: 'table' | 'kanban' }) {
  const [candidatures, setCandidatures] = useState<Candidature[]>([])
  const [loading, setLoading] = useState(true)
  const [statusModal, setStatusModal] = useState<Candidature | null>(null)
  const [interviewModal, setInterviewModal] = useState<Candidature | null>(null)
  const [iaModal, setIaModal] = useState<Candidature | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    let ignore = false
    async function fetchCandidatures() {
      setLoading(true)
      setSelectedIds(new Set())
      try {
        const data = await candidaturesService.getByOffre(offreId)
        if (!ignore) setCandidatures(data)
      } catch {
        if (!ignore) setCandidatures([])
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    fetchCandidatures()
    return () => { ignore = true }
  }, [offreId])

  async function handleStatusChange(id: number, statut: string) {
    try {
      await candidaturesService.updateStatus(id, statut)
      toast('success', 'Statut mis à jour')
      setStatusModal(null)
      const data = await candidaturesService.getByOffre(offreId)
      setCandidatures(data)
    } catch {
      toast('error', 'Erreur lors de la mise à jour')
    }
  }

  async function handleBulkStatusChange(statut: string) {
    if (selectedIds.size === 0) return
    try {
      await candidaturesService.bulkUpdateStatus(Array.from(selectedIds), statut)
      toast('success', `${selectedIds.size} candidatures mises à jour`)
      setSelectedIds(new Set())
      const data = await candidaturesService.getByOffre(offreId)
      setCandidatures(data)
    } catch {
      toast('error', 'Erreur lors de la mise à jour groupée')
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === candidatures.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(candidatures.map(c => c.id)))
    }
  }

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  if (loading) {
    return viewMode === 'kanban' ? <KanbanSkeleton /> : <TableSkeleton rows={8} cols={6} />
  }

  if (candidatures.length === 0 && viewMode === 'table') {
    return <EmptyState title="Aucune candidature" description="Aucune candidature reçue pour cette offre." />
  }

  if (viewMode === 'kanban') {
    return <KanbanBoard candidatures={candidatures} onStatusChange={handleStatusChange} />
  }

  return (
    <>
      <div className="relative">
        {/* Bulk Action Bar */}
        {selectedIds.size > 0 && (
          <div className="sticky top-0 z-20 flex items-center justify-between bg-brand-600 text-white px-4 py-3 rounded-t-xl animate-in slide-in-from-top duration-300">
            <span className="text-sm font-medium">{selectedIds.size} sélectionné(s)</span>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/10" onClick={() => handleBulkStatusChange('examen_rh')}>
                A examiner
              </Button>
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/10" onClick={() => handleBulkStatusChange('entretien')}>
                Entretien
              </Button>
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/10" onClick={() => handleBulkStatusChange('refuse')}>
                Refuser
              </Button>
            </div>
          </div>
        )}

        <div className={`bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-card dark:shadow-glow-blue/5 overflow-hidden transition-colors ${selectedIds.size > 0 ? 'rounded-b-xl border-t-0' : 'rounded-xl'}`}>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                  <th className="px-4 py-3 w-10">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      checked={selectedIds.size === candidatures.length && candidatures.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Candidat</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Score IA</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Statut IA</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Statut</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Date</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {candidatures.map((c) => {
                  const statusConf = CANDIDATURE_STATUTS[c.statut] ?? { label: c.statut, color: 'bg-gray-100 text-gray-700' }
                  const iaConf = IA_STATUS[c.ia_status] ?? { label: c.ia_status, color: 'bg-gray-100 text-gray-600' }

                  return (
                    <tr key={c.id} className={`border-b border-gray-50 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors ${selectedIds.has(c.id) ? 'bg-brand-50/30' : ''}`}>
                      <td className="px-4 py-3">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                          checked={selectedIds.has(c.id)}
                          onChange={() => toggleSelect(c.id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 dark:text-white">{(c as Candidature & { candidat_nom?: string }).candidat_nom}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">{(c as Candidature & { candidat_email?: string }).candidat_email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => setIaModal(c)}
                          className={`text-sm font-bold hover:underline cursor-pointer ${getScoreColor(c.score_ia)}`}
                        >
                          {formatScore(c.score_ia)}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge className={iaConf.color}>{iaConf.label}</StatusBadge>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge className={statusConf.color}>{statusConf.label}</StatusBadge>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-slate-400 text-xs">{formatDate(c.date_candidature)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {c.cv_file && (
                            <a 
                              href={c.cv_file} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors" 
                              title="Voir le CV"
                            >
                              <FileText className="h-4 w-4" />
                            </a>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => setStatusModal(c)}>
                            Gérer
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-100 dark:divide-white/5">
            {candidatures.map((c) => {
              const statusConf = CANDIDATURE_STATUTS[c.statut] ?? { label: c.statut, color: 'bg-gray-100 text-gray-700' }
              const iaConf = IA_STATUS[c.ia_status] ?? { label: c.ia_status, color: 'bg-gray-100 text-gray-600' }

              return (
                <div key={c.id} className={`p-4 space-y-3 transition-colors ${selectedIds.has(c.id) ? 'bg-brand-50/30' : ''}`}>
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      className="mt-1 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      checked={selectedIds.has(c.id)}
                      onChange={() => toggleSelect(c.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white truncate">{(c as Candidature & { candidat_nom?: string }).candidat_nom}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">{(c as Candidature & { candidat_email?: string }).candidat_email}</p>
                        </div>
                        <div className="text-right">
                          <button 
                            onClick={() => setIaModal(c)}
                            className={`text-sm font-bold block hover:underline cursor-pointer ${getScoreColor(c.score_ia)}`}
                          >
                            {formatScore(c.score_ia)}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <StatusBadge className={iaConf.color}>{iaConf.label}</StatusBadge>
                    <StatusBadge className={statusConf.color}>{statusConf.label}</StatusBadge>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-gray-500 dark:text-slate-400">{formatDate(c.date_candidature)}</span>
                    <div className="flex items-center gap-2">
                      {c.cv_file && (
                        <a 
                          href={c.cv_file} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="p-2 rounded-lg text-gray-400 hover:text-brand-600 bg-gray-50 dark:bg-white/5 transition-colors flex items-center justify-center h-8 w-8" 
                          title="Voir le CV"
                        >
                          <FileText className="h-4 w-4" />
                        </a>
                      )}
                      <Button size="sm" variant="secondary" className="h-8" onClick={() => setStatusModal(c)}>
                        Gérer
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>



        {/* Status Modal */}
        {statusModal && (
          <Modal open={!!statusModal} onClose={() => setStatusModal(null)} title="Changer le statut">
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Action sur la candidature de <strong>{(statusModal as Candidature & { candidat_nom?: string }).candidat_nom}</strong>
              </p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(CANDIDATURE_STATUTS).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => handleStatusChange(statusModal.id, key)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border ${
                    statusModal.statut === key
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {(config as { label: string }).label}
                </button>
              ))}
            </div>

            {statusModal.statut === 'entretien' && (
              <div className="pt-4 border-t border-gray-100 dark:border-white/5 mt-4">
                <Button 
                  className="w-full" 
                  variant="secondary"
                  onClick={() => {
                    setInterviewModal(statusModal)
                    setStatusModal(null)
                  }}
                >
                  Planifier un entretien
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {interviewModal && (
        <PlanifierEntretienModal 
          open={!!interviewModal}
          onClose={() => setInterviewModal(null)}
          candidature={interviewModal}
        />
      )}

      {iaModal && (
        <CandidatureIAModal
          open={!!iaModal}
          onClose={() => setIaModal(null)}
          candidatureId={iaModal.id}
          candidatNom={(iaModal as any).candidat_nom || 'Candidat'}
        />
      )}
    </>
  )
}
