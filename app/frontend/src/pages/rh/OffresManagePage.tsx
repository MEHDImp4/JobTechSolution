import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Eye, Pencil, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { JobCard } from '@/components/offres/JobCard'
import { LoadingState, ErrorState, EmptyState } from '@/components/feedback/States'
import { toast } from '@/components/feedback/Toast'
import { offresService } from '@/services/offres.service'
import { OFFRE_STATUTS, TYPE_CONTRAT } from '@/lib/constants'
import { formatDate, formatSalary } from '@/lib/utils'
import type { Offre } from '@/types/offre'

export default function OffresManagePage() {
  const navigate = useNavigate()
  const [offres, setOffres] = useState<Offre[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatut, setFilterStatut] = useState('')

  useEffect(() => {
    loadOffres()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatut])

  async function loadOffres() {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (filterStatut) params.statut = filterStatut
      setOffres(await offresService.list(params))
    } catch {
      setError('Impossible de charger les offres')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle(id: number) {
    try {
      await offresService.toggleStatus(id)
      toast('success', 'Statut mis à jour')
      loadOffres()
    } catch {
      toast('error', 'Erreur lors de la mise à jour')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Gestion des offres</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Créez et gérez vos offres d'emploi</p>
        </div>
        <Button onClick={() => navigate('/gestion-offres/nouvelle')} icon={<Plus className="h-4 w-4" />}>
          Nouvelle offre
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { value: '', label: 'Toutes' },
          { value: 'brouillon', label: 'Brouillons' },
          { value: 'publiee', label: 'Publiées' },
          { value: 'cloturee', label: 'Clôturées' },
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

      {/* Table & Cards */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : offres.length === 0 ? (
        <EmptyState
          title="Aucune offre"
          description="Créez votre première offre d'emploi."
          action={
            <Button onClick={() => navigate('/gestion-offres/nouvelle')} icon={<Plus className="h-4 w-4" />}>
              Nouvelle offre
            </Button>
          }
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-xl border border-gray-200 dark:border-white/10 shadow-card dark:shadow-glow-blue/5 overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                    <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Titre</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Contrat</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Salaire</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Statut</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Candidatures</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Date</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {offres.map((offre) => {
                    const statusConf = OFFRE_STATUTS[offre.statut] ?? { label: offre.statut, color: 'bg-gray-100 text-gray-700' }
                    return (
                      <tr key={offre.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 dark:text-white truncate max-w-[240px]">{offre.titre}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-slate-300">
                          {TYPE_CONTRAT[offre.type_contrat] ?? offre.type_contrat}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-slate-400 text-xs">
                          {formatSalary(offre.salaire_min, offre.salaire_max)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge className={statusConf.color}>{statusConf.label}</StatusBadge>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-slate-300">{offre.candidatures_count}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-slate-400 text-xs">
                          {formatDate(offre.created_at)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => navigate(`/offres/${offre.id}`)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer"
                              title="Voir"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/gestion-offres/${offre.id}/modifier`)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer"
                              title="Modifier"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggle(offre.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-warning hover:bg-warning-light transition-colors cursor-pointer"
                              title="Basculer le statut"
                            >
                              <ToggleRight className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="grid gap-4 md:hidden">
            {offres.map((offre) => (
              <JobCard 
                key={offre.id} 
                offre={offre} 
                variant="manage" 
                onToggleStatus={handleToggle}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
