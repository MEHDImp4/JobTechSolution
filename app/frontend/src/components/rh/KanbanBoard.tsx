import { motion, AnimatePresence } from 'framer-motion'
import { CANDIDATURE_STATUTS } from '@/lib/constants'
import { formatScore, getScoreColor } from '@/lib/utils'
import type { Candidature } from '@/types/candidature'
import { StatusBadge } from '../ui/Badge'
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react'

interface KanbanBoardProps {
  candidatures: Candidature[]
  onStatusChange: (id: number, newStatus: string) => void
}

const COLUMNS = [
  { id: 'recue', label: 'Reçue' },
  { id: 'examen_rh', label: 'Examen RH' },
  { id: 'entretien', label: 'Entretien' },
  { id: 'retenu', label: 'Retenu' },
  { id: 'refuse', label: 'Refusé' },
]

export function KanbanBoard({ candidatures, onStatusChange }: KanbanBoardProps) {
  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData('candidatureId', id.toString())
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    const id = parseInt(e.dataTransfer.getData('candidatureId'))
    if (!isNaN(id)) {
      onStatusChange(id, status)
    }
  }

  const moveCandidature = (id: number, currentStatus: string, direction: 'left' | 'right') => {
    const currentIndex = COLUMNS.findIndex(col => col.id === currentStatus)
    const nextIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1
    
    if (nextIndex >= 0 && nextIndex < COLUMNS.length) {
      onStatusChange(id, COLUMNS[nextIndex]?.id || '')
    }
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 min-h-[600px] -mx-4 px-4 scrollbar-hide snap-x snap-mandatory md:snap-none">
      {COLUMNS.map((col) => {
        const colCands = candidatures.filter((c) => c.statut === col.id)
        const statusConfig = CANDIDATURE_STATUTS[col.id as keyof typeof CANDIDATURE_STATUTS]

        return (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            className="flex-shrink-0 w-[280px] sm:w-80 flex flex-col gap-3 snap-center"
          >
            <div className="flex items-center justify-between px-1 sticky top-0 bg-white dark:bg-slate-950 z-10 py-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${statusConfig?.color?.replace('bg-', 'bg-').split(' ')[0] || 'bg-gray-400'}`} />
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{col.label}</h3>
              </div>
              <span className="text-xs font-medium text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                {colCands.length}
              </span>
            </div>

            <div className="flex-1 bg-gray-50/50 dark:bg-slate-900/40 rounded-xl border border-gray-100 dark:border-white/5 p-2 flex flex-col gap-2 min-h-[150px]">
              <AnimatePresence mode="popLayout">
                {colCands.map((cand) => (
                  <motion.div
                    key={cand.id}
                    layoutId={cand.id.toString()}
                    draggable
                    onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, cand.id)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98, cursor: 'grabbing' }}
                    className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-white/10 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">
                          {(cand as Candidature & { candidat_nom?: string }).candidat_nom}
                        </p>
                        {cand.cv_file && (
                          <a 
                            href={cand.cv_file} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-gray-400 hover:text-brand-600 transition-colors shrink-0" 
                            title="Voir le CV"
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <span className={`text-xs font-bold ${getScoreColor(cand.score_ia)}`}>
                        {formatScore(cand.score_ia)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex -space-x-1">
                         <div className="h-6 w-6 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-[10px] font-bold text-brand-600">
                           {(cand as Candidature & { candidat_nom?: string }).candidat_nom?.charAt(0)}
                         </div>
                      </div>
                      <StatusBadge className="text-[10px] px-1.5 py-0">
                         {CANDIDATURE_STATUTS[cand.statut as keyof typeof CANDIDATURE_STATUTS]?.label}
                      </StatusBadge>
                    </div>

                    {/* Mobile Controls */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-white/5 md:hidden">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveCandidature(cand.id, cand.statut, 'left');
                        }}
                        disabled={cand.statut === COLUMNS[0]?.id}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-20 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 text-gray-500" />
                      </button>
                      <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Déplacer</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveCandidature(cand.id, cand.statut, 'right');
                        }}
                        disabled={cand.statut === COLUMNS[COLUMNS.length - 1]?.id}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-20 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {colCands.length === 0 && (
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-100 dark:border-white/5 rounded-lg p-4">
                  <span className="text-xs text-gray-400">Aucun candidat</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}


