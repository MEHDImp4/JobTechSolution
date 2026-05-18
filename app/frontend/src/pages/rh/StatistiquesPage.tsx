import { useState, useEffect } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { Download, TrendingUp } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell,
} from 'recharts'
import { KPICard } from '@/components/data/KPICard'
import { Button } from '@/components/ui/Button'
import { LoadingState, ErrorState } from '@/components/feedback/States'
import { statistiquesService } from '@/services/statistiques.service'
import type { KPIData } from '@/types/statistique'

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444']
const DARK_CHART_COLORS = ['#38bdf8', '#34d399', '#fbbf24', '#f87171']
const EMPTY_KPI_DATA: KPIData = {
  funnel: {
    total: 0,
    preselectionnes: 0,
    entretiens: 0,
    retenus: 0,
    taux: 0,
  },
  delai_moyen: 0,
  score_stats: {
    avg: null,
    max: null,
    min: null,
  },
  top_competences: [],
}


export default function StatistiquesPage() {
  const theme = useUIStore((s) => s.theme)
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  
  const [data, setData] = useState<KPIData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [periode, setPeriode] = useState('30d')
  const [exporting, setExporting] = useState(false)

  const chartTheme = {
    grid: isDark ? 'rgba(14, 165, 233, 0.1)' : '#E5E7EB',
    axis: isDark ? '#94A3B8' : '#6B7280',
    tooltip: {
      bg: isDark ? 'rgba(15, 23, 42, 0.9)' : '#FFFFFF',
      border: isDark ? 'rgba(14, 165, 233, 0.2)' : '#E5E7EB',
      text: isDark ? '#F1F5F9' : '#374151'
    }
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const kpis = await statistiquesService.kpis(periode)
        setData(kpis ?? EMPTY_KPI_DATA)
      } catch {
        setError('Impossible de charger les statistiques')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [periode])

  if (loading) return <LoadingState />
  if (error || !data) return <ErrorState message={error} />

  const handleExport = async () => {
    setExporting(true)
    try {
      const { blob, filename } = await statistiquesService.exportCsv(periode)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename || 'candidatures_export.csv'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  const safeData = data ?? EMPTY_KPI_DATA

  const funnelData = [
    { name: 'Total', value: safeData.funnel.total },
    { name: 'Présélectionnés', value: safeData.funnel.preselectionnes },
    { name: 'Entretiens', value: safeData.funnel.entretiens },
    { name: 'Retenus', value: safeData.funnel.retenus },
  ]

  const competencesData = safeData.top_competences.map(([name, count]) => ({ name, count }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Statistiques</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Analyse des performances de recrutement</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className="flex-1 sm:flex-none h-10 px-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-gray-200 cursor-pointer focus:ring-2 focus:ring-brand-500 outline-none transition-colors"
          >
            <option value="7d">7j</option>
            <option value="30d">30j</option>
            <option value="90d">90j</option>
            <option value="365d">1 an</option>
          </select>
          <Button
            variant="secondary"
            icon={<Download className="h-4 w-4" />}
            className="w-full sm:w-auto"
            onClick={handleExport}
            loading={exporting}
          >
            Export
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Taux de conversion"
          value={`${safeData.funnel.taux.toFixed(1)}%`}
          subtitle="Candidatures → Retenus"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <KPICard
          title="Délai moyen"
          value={`${safeData.delai_moyen} jours`}
          subtitle="Candidature → Décision"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <KPICard
          title="Score IA moyen"
          value={safeData.score_stats.avg ? `${safeData.score_stats.avg.toFixed(0)}%` : '—'}
          subtitle={safeData.score_stats.min != null && safeData.score_stats.max != null
            ? `Min ${safeData.score_stats.min.toFixed(0)}% · Max ${safeData.score_stats.max.toFixed(0)}%`
            : undefined
          }
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel */}
        <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-card dark:shadow-glow-blue p-5 transition-all duration-300">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Entonnoir de recrutement</h3>
          <div className="h-[280px] sm:h-[320px] w-full min-w-0">
            <ResponsiveContainer width="100%" height={320} minWidth={0}>
              <BarChart data={funnelData} layout="vertical" margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: chartTheme.axis }} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={90} 
                  tick={{ fontSize: 10, fill: isDark ? '#E2E8F0' : '#374151' }}
                />
                <Tooltip
                  contentStyle={{ 
                    borderRadius: 8, 
                    border: `1px solid ${chartTheme.tooltip.border}`, 
                    backgroundColor: chartTheme.tooltip.bg,
                    color: chartTheme.tooltip.text,
                    fontSize: 12 
                  }}
                  itemStyle={{ color: chartTheme.tooltip.text }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={32}>
                  {funnelData.map((_, i) => (
                    <Cell key={i} fill={isDark ? DARK_CHART_COLORS[i % DARK_CHART_COLORS.length] : COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Competences */}
        <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-card dark:shadow-glow-blue p-5 transition-all duration-300">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Top compétences demandées</h3>
          {competencesData.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-slate-400 py-8 text-center">Pas encore de données</p>
          ) : (
            <div className="h-[280px] sm:h-[320px] w-full min-w-0">
              <ResponsiveContainer width="100%" height={320} minWidth={0}>
                <BarChart data={competencesData.slice(0, 6)} margin={{ bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: chartTheme.axis }} 
                    angle={-45} 
                    textAnchor="end" 
                    height={60}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 10, fill: chartTheme.axis }} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: 8, 
                      border: `1px solid ${chartTheme.tooltip.border}`, 
                      backgroundColor: chartTheme.tooltip.bg,
                      color: chartTheme.tooltip.text,
                      fontSize: 12 
                    }} 
                    itemStyle={{ color: chartTheme.tooltip.text }}
                  />
                  <Bar dataKey="count" fill={isDark ? '#38bdf8' : '#2E75B6'} radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
