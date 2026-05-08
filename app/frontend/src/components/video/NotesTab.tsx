import React, { useState, useMemo } from 'react'
import { entretiensService } from '@/services/entretiens.service'
import { CheckCircle2, Loader2 } from 'lucide-react'
import debounce from 'lodash/debounce'

interface NotesTabProps {
  entretienId: number
  initialNotes: string
}

export const NotesTab: React.FC<NotesTabProps> = ({ entretienId, initialNotes }) => {
  const [notes, setNotes] = useState(initialNotes)
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  // Memoize the save function to avoid recreating it on every render
  const saveNotes = useMemo(
    () =>
      debounce(async (newNotes: string) => {
        setSavingStatus('saving')
        try {
          await entretiensService.updateNotes(entretienId, newNotes)
          setSavingStatus('saved')
          setTimeout(() => setSavingStatus('idle'), 2000)
        } catch (error) {
          console.error('Failed to save notes:', error)
          setSavingStatus('idle')
        }
      }, 1500),
    [entretienId]
  )

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setNotes(value)
    saveNotes(value)
  }

  return (
    <div className="flex flex-col h-full bg-slate-900/50 p-4">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Prise de notes
        </h3>
        <div className="flex items-center gap-1.5 text-[10px]">
          {savingStatus === 'saving' && (
            <>
              <Loader2 className="h-3 w-3 text-brand-400 animate-spin" />
              <span className="text-slate-400 italic">Sauvegarde...</span>
            </>
          )}
          {savingStatus === 'saved' && (
            <>
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">Enregistré</span>
            </>
          )}
        </div>
      </div>
      
      <textarea
        value={notes}
        onChange={handleChange}
        placeholder="Commencez à rédiger vos observations ici..."
        className="flex-1 w-full bg-slate-800/50 border border-white/5 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:ring-1 focus:ring-brand-500/50 focus:border-brand-500/50 outline-none transition-all resize-none shadow-inner"
      />

      <div className="mt-4 p-3 rounded-lg bg-brand-500/5 border border-brand-500/10">
        <p className="text-[10px] text-slate-500 leading-relaxed italic">
          Vos notes sont enregistrées automatiquement. Elles seront utilisées par l'IA pour générer le compte-rendu final de l'entretien.
        </p>
      </div>
    </div>
  )
}
