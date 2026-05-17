import { useState, useEffect } from 'react'
import { Brain, CheckCircle2, XCircle, BarChart3, AlertCircle, FileText, Sparkles, MessageSquareQuote } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Badge } from '../ui/Badge'
import { apiGet } from '@/services/client'
import { cn, formatScore, getScoreColor } from '@/lib/utils'
import { LoadingState } from '../feedback/States'

interface IASummary {
  candidature_id: number
  ia_status: string
  resume_ia: string
  questions_ia: string[]
  competences_extraites: string[]
  experience_annees: number | null
  score_global: number | null
  score_competences: number | null
  score_experience: number | null
  matching_competences: string[]
  missing_competences: string[]
}

interface CandidatureIAModalProps {
  open: boolean
  onClose: () => void
  candidatureId: number
  candidatNom: string
}

export function CandidatureIAModal({ open, onClose, candidatureId, candidatNom }: CandidatureIAModalProps) {
  const [data, setData] = useState<IASummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open && candidatureId) {
      apiGet<IASummary>(`ia/candidatures/${candidatureId}/summary/`)
        .then(res => {
          setData(res)
          setLoading(false)
        })
        .catch(() => {
          setError('Erreur lors du chargement de l\'analyse IA')
          setLoading(false)
        })
    }
  }, [open, candidatureId])

  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      title={`Analyse IA : ${candidatNom}`}
      size="lg"
    >
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <LoadingState />
          <p className="text-center text-sm font-bold text-gray-400 mt-6 uppercase tracking-widest animate-pulse">Algorithme en cours d'exécution...</p>
        </div>
      ) : error ? (
        <div className="py-12 flex flex-col items-center gap-4 text-danger">
          <div className="p-4 bg-danger/10 rounded-full">
            <AlertCircle className="h-10 w-10" />
          </div>
          <p className="font-bold uppercase tracking-wide">{error}</p>
        </div>
      ) : data ? (
        <div className="space-y-10 max-h-[75vh] overflow-y-auto pr-4 custom-scrollbar p-1">
          {/* Score Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 dark:bg-brand-500/10 p-6 rounded-3xl border border-slate-800 dark:border-brand-500/20 shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 relative z-10">Compatibilité Globale</span>
              <div className={cn("text-5xl font-black relative z-10 filter drop-shadow-md", getScoreColor(data.score_global))}>
                {formatScore(data.score_global)}
              </div>
              <div className="w-full bg-slate-800 dark:bg-white/5 h-2 rounded-full mt-6 overflow-hidden relative z-10">
                <div 
                  className={cn("h-full transition-all duration-1000 ease-out", getScoreColor(data.score_global).replace('text-', 'bg-'))}
                  style={{ width: `${data.score_global ?? 0}%` }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-gray-400">
                <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-xl">
                  <Brain className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">Hard Skills</span>
              </div>
              <div className="text-3xl font-black text-gray-900 dark:text-white">
                {formatScore(data.score_competences)}
              </div>
              <p className="text-[11px] font-medium text-gray-500 mt-2 leading-relaxed uppercase tracking-wider opacity-60">Analyse sémantique des technologies</p>
            </div>

            <div className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-gray-400">
                <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-xl">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">Expérience</span>
              </div>
              <div className="text-3xl font-black text-gray-900 dark:text-white">
                {formatScore(data.score_experience)}
              </div>
              <p className="text-[11px] font-medium text-gray-500 mt-2 leading-relaxed uppercase tracking-wider">
                {data.experience_annees ?? 0} ans de carrière identifiés
              </p>
            </div>
          </div>

          {/* Points Forts / Faibles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h4 className="font-black text-xs uppercase tracking-[0.15em]">Arguments Positifs</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.matching_competences.length > 0 ? (
                  data.matching_competences.map((s, i) => (
                    <Badge key={i} className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 font-bold px-3 py-1 text-[10px] uppercase">
                      {s}
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 font-medium italic px-2">Aucune corrélation directe identifiée.</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                <div className="p-2 bg-rose-50 dark:bg-rose-500/10 rounded-xl">
                  <XCircle className="h-5 w-5" />
                </div>
                <h4 className="font-black text-xs uppercase tracking-[0.15em]">Lacunes Détectées</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.missing_competences.length > 0 ? (
                  data.missing_competences.map((s, i) => (
                    <Badge key={i} className="bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 font-bold px-3 py-1 text-[10px] uppercase">
                      {s}
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 font-medium italic px-2">Adéquation technique optimale.</p>
                )}
              </div>
            </div>
          </div>

          {/* Résumé IA */}
          {data.resume_ia && (
            <div className="bg-gray-50 dark:bg-white/5 p-8 rounded-3xl border border-gray-100 dark:border-white/10 relative overflow-hidden group">
              <Sparkles className="h-24 w-24 absolute -right-8 -top-8 text-brand-500/5 rotate-12" />
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2 bg-brand-500/10 rounded-xl">
                  <MessageSquareQuote className="h-5 w-5 text-brand-500" />
                </div>
                <h4 className="font-black text-xs uppercase tracking-[0.2em] text-gray-900 dark:text-white">Synthèse Analytique</h4>
              </div>
              <div className="relative z-10">
                <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed font-medium italic">
                  "{data.resume_ia}"
                </p>
              </div>
            </div>
          )}

          {/* Questions suggérées */}
          {data.questions_ia && data.questions_ia.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-gray-900 dark:text-white">
                <div className="p-2 bg-slate-900 dark:bg-white/5 rounded-xl">
                  <FileText className="h-5 w-5 text-brand-400" />
                </div>
                <h4 className="font-black text-xs uppercase tracking-[0.15em]">Script d'entretien recommandé</h4>
              </div>
              <div className="grid gap-3">
                {data.questions_ia.map((q, i) => (
                  <div key={i} className="flex gap-4 text-sm text-gray-700 dark:text-slate-300 bg-white dark:bg-white/5 p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm hover:border-brand-500/30 transition-colors">
                    <span className="font-black text-brand-500 text-base tabular-nums">0{i + 1}</span>
                    <p className="font-semibold leading-relaxed">{q}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  )
}
