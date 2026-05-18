import { Brain, FileText, Mail, MessageSquareQuote, Phone, Sparkles } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Badge } from '../ui/Badge'
import { cn, formatScore, getScoreColor } from '@/lib/utils'
import type { Candidature } from '@/types/candidature'

interface CandidatureIAModalProps {
  open: boolean
  onClose: () => void
  candidature: Candidature | null
  candidatNom: string
}

export function CandidatureIAModal({ open, onClose, candidature, candidatNom }: CandidatureIAModalProps) {
  const competencesDetectees = candidature?.ai_extracted_data?.competences_detectees ?? []
  const totalCompetences = candidature?.ai_extracted_data?.total_competences_requises ?? 0

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Analyse du CV : ${candidatNom}`}
      size="lg"
    >
      {!candidature ? null : (
        <div className="space-y-8 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-slate-900 dark:bg-brand-500/10 p-6 rounded-3xl border border-slate-800 dark:border-brand-500/20 shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
              <Sparkles className="h-20 w-20 absolute -right-5 -top-5 text-brand-500/10 rotate-12" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 relative z-10">
                Score de compatibilité
              </span>
              <div className={cn('text-5xl font-black relative z-10', getScoreColor(candidature.matching_score))}>
                {formatScore(candidature.matching_score)}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm space-y-4">
              <div className="flex items-center gap-3 text-gray-700 dark:text-slate-300">
                <Brain className="h-5 w-5 text-brand-500" />
                <span className="text-xs font-bold uppercase tracking-widest">Résultat rapide</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                {candidature.ai_summary || 'Le CV a bien été analysé.'}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                <FileText className="h-4 w-4" />
                <span>{competencesDetectees.length} compétence(s) détectée(s) sur {totalCompetences}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-white">
                <Mail className="h-4 w-4 text-brand-500" />
                <h4 className="text-xs font-black uppercase tracking-[0.15em]">Informations détectées</h4>
              </div>
              <div className="space-y-2 text-sm text-gray-600 dark:text-slate-300">
                <p>Email : {candidature.ai_extracted_data?.email || 'Non détecté'}</p>
                <p>Téléphone : {candidature.ai_extracted_data?.telephone || candidature.telephone || 'Non détecté'}</p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-white">
                <Phone className="h-4 w-4 text-brand-500" />
                <h4 className="text-xs font-black uppercase tracking-[0.15em]">Compétences trouvées</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {competencesDetectees.length > 0 ? (
                  competencesDetectees.map((competence) => (
                    <Badge
                      key={competence}
                      className="bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-100 dark:border-brand-500/20 font-bold px-3 py-1 text-[10px] uppercase"
                    >
                      {competence}
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">Aucune compétence détectée automatiquement.</p>
                )}
              </div>
            </div>
          </div>

          {candidature.lettre_motivation && (
            <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-brand-500/10 rounded-xl">
                  <MessageSquareQuote className="h-5 w-5 text-brand-500" />
                </div>
                <h4 className="font-black text-xs uppercase tracking-[0.2em] text-gray-900 dark:text-white">Message du candidat</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                {candidature.lettre_motivation}
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
