import { useState, useEffect, useCallback, useRef } from 'react'
import { FileText, Save, Loader2, CheckCircle2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { entretiensService } from '@/services/entretiens.service'
import type { Entretien } from '@/types/entretien'
import { useDebounce } from '@/hooks/useDebounce'

interface NotesEntretienModalProps {
  open: boolean
  onClose: () => void
  entretien: Entretien
  onSuccess?: (updated: Entretien) => void
}

export function NotesEntretienModal({ open, onClose, entretien, onSuccess }: NotesEntretienModalProps) {
  const [notes, setNotes] = useState(entretien.notes || '')
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const lastSavedContent = useRef(entretien.notes || '')
  
  const debouncedNotes = useDebounce(notes, 500) // Faster debounce

  const saveNotes = useCallback(async (val: string) => {
    // Don't save if content hasn't changed since last save
    if (val === lastSavedContent.current) return
    
    setSaving(true)
    try {
      const updated = await entretiensService.updateNotes(entretien.id, val)
      // Small artificial delay to prevent flickering on fast connections
      await new Promise(resolve => setTimeout(resolve, 500))
      lastSavedContent.current = val
      setLastSaved(new Date())
      onSuccess?.(updated)
    } catch (err) {
      console.error('Failed to auto-save notes', err)
    } finally {
      setSaving(false)
    }
  }, [entretien.id, onSuccess])

  useEffect(() => {
    if (open && debouncedNotes !== lastSavedContent.current) {
      saveNotes(debouncedNotes)
    }
  }, [debouncedNotes, saveNotes, open])

  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      title={`Notes d'entretien — ${entretien.candidat_nom}`}
      size="xl"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-gray-50 dark:bg-white/5 p-3 rounded-lg">
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-400">
             <div className="flex items-center gap-1.5">
               <FileText className="h-4 w-4" />
               <span className="font-medium text-gray-900 dark:text-white">{entretien.offre_titre}</span>
             </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] sm:text-xs shrink-0" data-testid="save-indicator">
            {saving ? (
              <span className="flex items-center gap-1.5 text-brand-600 animate-pulse">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="hidden xs:inline">Sauvegarde...</span>
              </span>
            ) : lastSaved ? (
              <span className="flex items-center gap-1.5 text-success">
                <CheckCircle2 className="h-3 w-3" />
                <span className="hidden xs:inline">Enregistré à</span> {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            ) : (
              <span className="text-gray-400 italic hidden xs:inline">Prêt pour la saisie</span>
            )}
          </div>
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Saisissez vos notes ici... Elles seront enregistrées automatiquement."
          className="w-full h-[400px] p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-brand-500/20 outline-none resize-none font-sans leading-relaxed"
          autoFocus
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>Fermer</Button>
          <Button 
            onClick={() => saveNotes(notes)} 
            loading={saving} 
            icon={<Save className="h-4 w-4" />}
          >
            Sauvegarder maintenant
          </Button>
        </div>
      </div>
    </Modal>
  )
}
