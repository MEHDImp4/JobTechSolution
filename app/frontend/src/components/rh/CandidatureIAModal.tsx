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
      setLoading(true)
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
        <div className="py-12">
          <LoadingState />
          <p className="text-center text-sm text-gray-500 mt-4">L'IA analyse le profil...</p>
        </div>
      ) : error ? (
        <div className="py-12 flex flex-col items-center gap-3 text-danger">
          <AlertCircle className="h-10 w-10" />
          <p>{error}</p>
        </div>
      ) : data ? (
        <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          {/* Score Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Score Global</span>
              <div className={cn("text-3xl font-black", getScoreColor(data.score_global))}>
                {formatScore(data.score_global)}
              </div>
              <div className="w-full bg-gray-100 dark:bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-1000", getScoreColor(data.score_global).replace('text-', 'bg-'))}
                  style={{ width: `${data.score_global ?? 0}%` }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-2 mb-2 text-gray-500">
                <Brain className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Compétences</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {formatScore(data.score_competences)}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Match technique direct et sémantique</p>
            </div>

            <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-2 mb-2 text-gray-500">
                <BarChart3 className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Expérience</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {formatScore(data.score_experience)}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                {data.experience_annees ?? 0} ans détectés
              </p>
            </div>
          </div>

          {/* Points Forts / Faibles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                <h4 className="font-bold text-sm uppercase tracking-wide">Points forts</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.matching_competences.length > 0 ? (
                  data.matching_competences.map((s, i) => (
                    <Badge key={i} className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-none lowercase">
                      {s}
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">Aucune correspondance directe trouvée</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <XCircle className="h-5 w-5" />
                <h4 className="font-bold text-sm uppercase tracking-wide">Points à vérifier</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.missing_competences.length > 0 ? (
                  data.missing_competences.map((s, i) => (
                    <Badge key={i} className="bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-none lowercase">
                      {s}
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">Toutes les compétences requises sont présentes</p>
                )}
              </div>
            </div>
          </div>

          {/* Résumé IA */}
          {data.resume_ia && (
            <div className="bg-[#F7F6F3] dark:bg-white/5 p-6 rounded-2xl border border-[#EAEAEA] dark:border-white/10">
              <div className="flex items-center gap-2 mb-4 text-[#37352F] dark:text-slate-300">
                <Sparkles className="h-5 w-5 text-brand-500" />
                <h4 className="font-black text-sm uppercase tracking-widest">Synthèse décisionnelle</h4>
              </div>
              <div className="prose dark:prose-invert prose-sm max-w-none text-[#37352F] dark:text-slate-300 leading-relaxed italic">
                "{data.resume_ia}"
              </div>
            </div>
          )}

          {/* Questions suggérées */}
          {data.questions_ia && data.questions_ia.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                <MessageSquareQuote className="h-5 w-5" />
                <h4 className="font-bold text-sm uppercase tracking-wide">Questions pour l'entretien</h4>
              </div>
              <ul className="space-y-2">
                {data.questions_ia.map((q, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-100 dark:border-white/10">
                    <span className="font-bold text-brand-500">{i + 1}.</span>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  )
}
