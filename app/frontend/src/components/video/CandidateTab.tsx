import React from 'react'
import { User, Mail, BarChart3, FileText, ExternalLink } from 'lucide-react'

interface CandidateTabProps {
  candidateName: string
  candidateEmail: string
  scoreIA: number | null
  cvUrl: string | null
}

export const CandidateTab: React.FC<CandidateTabProps> = ({ 
  candidateName, 
  candidateEmail, 
  scoreIA, 
  cvUrl 
}) => {
  return (
    <div className="flex flex-col h-full bg-slate-900/50 p-6">
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-brand-500/10 border-2 border-brand-500/20 flex items-center justify-center mb-4">
          <User className="h-10 w-10 text-brand-400" />
        </div>
        <h2 className="text-xl font-bold text-white text-center">{candidateName}</h2>
        <div className="flex items-center gap-1.5 text-slate-400 mt-1">
          <Mail className="h-3.5 w-3.5" />
          <span className="text-xs">{candidateEmail}</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Score IA */}
        <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-brand-400" />
              <h3 className="text-sm font-semibold text-slate-200">Score IA</h3>
            </div>
            <span className={`text-lg font-bold ${
              scoreIA && scoreIA >= 70 ? 'text-green-400' : 
              scoreIA && scoreIA >= 40 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {scoreIA !== null ? `${scoreIA}%` : 'N/A'}
            </span>
          </div>
          
          <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                scoreIA && scoreIA >= 70 ? 'bg-green-500' : 
                scoreIA && scoreIA >= 40 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${scoreIA || 0}%` }}
            />
          </div>
          <p className="mt-3 text-[10px] text-slate-500 leading-relaxed">
            Ce score représente l'adéquation du profil avec les prérequis du poste selon l'analyse NLP.
          </p>
        </div>

        {/* CV Link */}
        <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-brand-400" />
            <h3 className="text-sm font-semibold text-slate-200">Documents</h3>
          </div>
          
          {cvUrl ? (
            <a 
              href={cvUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-3 bg-slate-700/30 hover:bg-brand-500/10 border border-white/5 hover:border-brand-500/30 rounded-xl transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <FileText className="h-4 w-4 text-red-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-200 group-hover:text-brand-400 transition-colors">Curriculum Vitae</span>
                  <span className="text-[10px] text-slate-500 uppercase">PDF / DOCX</span>
                </div>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-brand-400 transition-colors" />
            </a>
          ) : (
            <div className="text-center py-4 bg-slate-700/20 rounded-xl border border-dashed border-white/10">
              <span className="text-xs text-slate-500 italic">Aucun document disponible</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-white/5">
        <div className="p-4 rounded-xl bg-slate-800/30 border border-white/5">
          <p className="text-[10px] text-slate-500 leading-relaxed text-center italic">
            Consultez les documents du candidat en parallèle pour étayer votre évaluation qualitative.
          </p>
        </div>
      </div>
    </div>
  )
}
