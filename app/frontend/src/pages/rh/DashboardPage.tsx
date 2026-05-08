import { useState, useEffect } from 'react'
import { Briefcase, Users, Calendar, Trophy } from 'lucide-react'
import { KPICard } from '@/components/data/KPICard'
import { LoadingState, ErrorState } from '@/components/feedback/States'
import { statistiquesService } from '@/services/statistiques.service'
import { formatScore, getScoreColor } from '@/lib/utils'
import type { RHDashboardStats } from '@/types/statistique'

export default function RHDashboardPage() {
  const [stats, setStats] = useState<RHDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await statistiquesService.rhDashboard()
        setStats(data)
      } catch {
        setError('Impossible de charger le tableau de bord')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <LoadingState />
  if (error || !stats) return <ErrorState message={error} />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Tableau de bord</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Vue d'ensemble du recrutement</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Offres actives"
          value={stats.total_offres}
          icon={<Briefcase className="h-5 w-5" />}
        />
        <KPICard
          title="Candidatures"
          value={stats.total_candidatures}
          icon={<Users className="h-5 w-5" />}
        />
        <KPICard
          title="Entretiens"
          value={stats.total_entretiens}
          icon={<Calendar className="h-5 w-5" />}
        />
        <KPICard
          title="Recrutements réussis"
          value={stats.recrutements_reussis}
          icon={<Trophy className="h-5 w-5" />}
        />
      </div>

      {/* Top Candidates */}
      <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-xl border border-gray-200 dark:border-white/10 shadow-card dark:shadow-glow-blue/5 transition-colors duration-200">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Top candidats par score IA</h2>
        </div>
        {stats.top_candidats.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-500 dark:text-slate-400">Aucun candidat évalué pour le moment</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {stats.top_candidats.map((c, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{c.nom}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{c.offre}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${getScoreColor(c.score)}`}>
                  {formatScore(c.score)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
