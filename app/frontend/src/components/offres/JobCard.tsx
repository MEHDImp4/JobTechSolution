import { useNavigate } from 'react-router-dom'
import { MapPin, Banknote, Users, ArrowUpRight, Clock } from 'lucide-react'
import { StatusBadge, Badge } from '@/components/ui/Badge'
import { formatDate, formatSalary } from '@/lib/utils'
import { TYPE_CONTRAT, OFFRE_STATUTS } from '@/lib/constants'
import type { Offre } from '@/types/offre'
import { cn } from '@/lib/utils'

interface JobCardProps {
  offre: Offre
  variant?: 'public' | 'manage'
  onToggleStatus?: (id: number) => void
  onDelete?: (id: number) => void
}

export function JobCard({ offre, variant = 'public' }: JobCardProps) {
  const navigate = useNavigate()
  const statusConf = OFFRE_STATUTS[offre.statut] ?? { label: offre.statut, color: 'bg-gray-100 text-gray-700' }
  const contractLabel = TYPE_CONTRAT[offre.type_contrat] ?? offre.type_contrat

  return (
    <div 
      onClick={() => variant === 'public' && navigate(`/offres/${offre.id}`)}
      data-testid="job-card"
      className={cn(
        "group flex flex-col bg-white dark:bg-slate-900 border border-[#EAEAEA] dark:border-white/10 p-6 transition-all duration-200",
        variant === 'public' 
          ? "cursor-pointer hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-gray-300 dark:hover:border-white/20" 
          : ""
      )}
    >
      <div className="flex flex-col h-full">
        {/* Top Info Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-[#F7F6F3] dark:bg-white/5 text-[#37352F] dark:text-slate-300 border-none px-2 py-0.5 rounded text-[10px] font-bold tracking-tight uppercase">
              {contractLabel}
            </Badge>
            <span className="text-gray-300 dark:text-slate-700">/</span>
            <span className="text-[11px] font-medium text-gray-500 dark:text-slate-400">
              Exp. {offre.experience_requise}+ ans
            </span>
          </div>
          <StatusBadge className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded-sm border-none shadow-none uppercase tracking-tighter",
            statusConf.color
          )}>
            {statusConf.label}
          </StatusBadge>
        </div>

        {/* Title & Location */}
        <div className="mb-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[18px] font-bold text-[#1A1A1A] dark:text-white leading-[1.2] tracking-tight group-hover:underline decoration-brand-500 underline-offset-4 decoration-2">
              {offre.titre}
            </h3>
            {variant === 'public' && (
              <ArrowUpRight className="h-5 w-5 text-gray-300 group-hover:text-brand-500 transition-colors shrink-0" />
            )}
          </div>
          
          <div className="flex items-center gap-4 mt-3 text-[13px] text-[#787774] dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span>Casablanca, Maroc</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Banknote className="h-3.5 w-3.5" />
              <span className="font-semibold text-[#37352F] dark:text-slate-200">{formatSalary(offre.salaire_min, offre.salaire_max)}</span>
            </div>
          </div>
        </div>

        {/* Competences / Tags */}
        {offre.competences && offre.competences.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto mb-6">
            {offre.competences.slice(0, 4).map((comp, idx) => (
              <Badge 
                key={`${comp}-${idx}`} 
                className="bg-[#EDF3EC] dark:bg-emerald-500/10 text-[#346538] dark:text-emerald-400 border-none px-2 py-0.5 text-[11px] font-medium lowercase"
              >
                #{comp.toLowerCase()}
              </Badge>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#F0F0F0] dark:border-white/5 text-[12px]">
          <div className="flex items-center gap-5 text-[#787774] dark:text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span><span className="text-[#37352F] dark:text-slate-300 font-bold">{offre.candidatures_count}</span> candidats</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatDate(offre.created_at)}</span>
            </div>
          </div>
          
          <div className="text-brand-600 dark:text-brand-400 font-bold tracking-tight opacity-0 group-hover:opacity-100 transition-opacity">
            Détails
          </div>
        </div>
      </div>
    </div>
  )
}
