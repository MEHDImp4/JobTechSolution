import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './Button'

interface PaginationControlsProps {
  page: number
  pageSize: number
  total: number
  hasNext: boolean
  hasPrevious: boolean
  onPageChange: (page: number) => void
}

export function PaginationControls({
  page,
  pageSize,
  total,
  hasNext,
  hasPrevious,
  onPageChange,
}: PaginationControlsProps) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-col gap-3 border-t border-gray-100 dark:border-white/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-500 dark:text-slate-400">
        {total === 0 ? 'Aucun résultat' : `${start}-${end} sur ${total}`}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={!hasPrevious}
          onClick={() => onPageChange(page - 1)}
          icon={<ChevronLeft className="h-4 w-4" />}
        >
          Précédent
        </Button>
        <span className="min-w-16 text-center text-sm font-medium text-gray-700 dark:text-slate-200">
          Page {page}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
          icon={<ChevronRight className="h-4 w-4" />}
        >
          Suivant
        </Button>
      </div>
    </div>
  )
}
