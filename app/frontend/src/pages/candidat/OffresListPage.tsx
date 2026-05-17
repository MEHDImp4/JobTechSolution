import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PaginationControls } from '@/components/ui/PaginationControls'
import { JobCard } from '@/components/offres/JobCard'
import { LoadingState, ErrorState, EmptyState } from '@/components/feedback/States'
import { offresService } from '@/services/offres.service'
import { TYPE_CONTRAT } from '@/lib/constants'
import type { Offre } from '@/types/offre'

export default function OffresListPage() {
  const PAGE_SIZE = 9
  const [offres, setOffres] = useState<Offre[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  async function loadOffres() {
    setLoading(true)
    setError('')
    try {
      const params: Record<string, string> = {
        statut: 'publiee',
        page: String(page),
        page_size: String(PAGE_SIZE),
      }
      if (typeFilter) params.type_contrat = typeFilter
      if (appliedSearch) params.q = appliedSearch
      const response = await offresService.list(params)
      setOffres(response.results)
      setTotal(response.count)
      setHasNext(Boolean(response.next))
      setHasPrevious(Boolean(response.previous))
    } catch {
      setError('Impossible de charger les offres')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // This effect intentionally triggers the page fetch when filters or pagination change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOffres()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, page, appliedSearch])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    setAppliedSearch(search)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Offres d'emploi</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Découvrez les postes disponibles</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Rechercher un poste, une compétence..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" icon={<Search className="h-4 w-4" />}>
            Rechercher
          </Button>
        </form>
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value)
            setPage(1)
          }}
          className="h-10 px-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-gray-200 cursor-pointer outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="">Tous les contrats</option>
          {Object.entries(TYPE_CONTRAT).map(([key, label]) => (
            <option key={key} value={key}>{label as string}</option>
          ))}
        </select>
      </div>

      {/* Results */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : offres.length === 0 ? (
        <EmptyState title="Aucune offre disponible" description="Revenez plus tard ou modifiez vos filtres." />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {offres.map((offre) => (
              <JobCard key={offre.id} offre={offre} variant="public" />
            ))}
          </div>
          <PaginationControls
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  )
}
