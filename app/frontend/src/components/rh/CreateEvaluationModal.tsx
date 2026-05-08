import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Star, MessageSquare, ThumbsUp, ThumbsDown, Save } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/feedback/Toast'
import { evaluationsService } from '@/services/evaluations.service'
import type { Entretien } from '@/types/entretien'

const schema = z.object({
  competences_rate: z.number().min(1, 'Note requise').max(5),
  communication_rate: z.number().min(1, 'Note requise').max(5),
  motivation_rate: z.number().min(1, 'Note requise').max(5),
  adaptabilite_rate: z.number().min(1, 'Note requise').max(5),
  culture_fit_rate: z.number().min(1, 'Note requise').max(5),
  commentaires: z.string().min(100, 'Commentaire trop court (min 100 car.)'),
  points_forts: z.string().optional(),
  points_amelioration: z.string().optional(),
  recommandation: z.enum(['retenu', 'a_reconsiderer', 'non_retenu']),
  statut: z.enum(['brouillon', 'soumise']),
})

type FormValues = z.infer<typeof schema>

interface CreateEvaluationModalProps {
  open: boolean
  onClose: () => void
  entretien: Entretien
  onSuccess?: () => void
}

function StarInput({ value, onChange, label }: { value: number, onChange: (v: number) => void, label: string }) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex flex-col items-center gap-1 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
      <span className="text-[11px] font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-1" data-testid={`stars-${label.toLowerCase().replace(/\s+/g, '-')}`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(n)}
            className="p-0.5 transition-transform active:scale-90"
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                n <= (hover || value)
                  ? 'fill-warning text-warning'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

export function CreateEvaluationModal({ open, onClose, entretien, onSuccess }: CreateEvaluationModalProps) {
  const [loading, setLoading] = useState(false)

  const { control, register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      competences_rate: 0,
      communication_rate: 0,
      motivation_rate: 0,
      adaptabilite_rate: 0,
      culture_fit_rate: 0,
      commentaires: '',
      points_forts: '',
      points_amelioration: '',
      recommandation: 'a_reconsiderer',
      statut: 'soumise',
    }
  })

  const onSubmit = async (data: FormValues) => {
    console.log('Submitting evaluation:', data)
    setLoading(true)
    try {
      await evaluationsService.create({
        ...data,
        entretien_id: entretien.id,
        points_forts: data.points_forts || '',
        points_amelioration: data.points_amelioration || '',
      })
      toast('success', 'Évaluation soumise avec succès')
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Submission error:', err)
      const error = err as Error
      toast('error', error?.message || 'Erreur lors de la soumission')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Évaluer le candidat — ${entretien.candidat_nom}`} size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header Info */}
        <div className="flex items-center justify-between bg-brand-50 dark:bg-brand-500/10 p-4 rounded-2xl border border-brand-100 dark:border-brand-500/20">
          <div>
            <h4 className="font-semibold text-brand-900 dark:text-brand-300">{entretien.offre_titre}</h4>
            <p className="text-xs text-brand-700/70 dark:text-brand-400/70">Entretien du {new Date(entretien.date_heure).toLocaleDateString()}</p>
          </div>
          <Star className="h-8 w-8 text-brand-500/20" />
        </div>

        {/* 5-Star Ratings */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Controller
            name="competences_rate"
            control={control}
            render={({ field }) => <StarInput label="Compétences" value={field.value} onChange={field.onChange} />}
          />
          <Controller
            name="communication_rate"
            control={control}
            render={({ field }) => <StarInput label="Communication" value={field.value} onChange={field.onChange} />}
          />
          <Controller
            name="motivation_rate"
            control={control}
            render={({ field }) => <StarInput label="Motivation" value={field.value} onChange={field.onChange} />}
          />
          <Controller
            name="adaptabilite_rate"
            control={control}
            render={({ field }) => <StarInput label="Adaptabilité" value={field.value} onChange={field.onChange} />}
          />
          <Controller
            name="culture_fit_rate"
            control={control}
            render={({ field }) => <StarInput label="Culture Fit" value={field.value} onChange={field.onChange} />}
          />
        </div>
        {(errors.competences_rate || errors.communication_rate || errors.motivation_rate || errors.adaptabilite_rate || errors.culture_fit_rate) && (
          <p className="text-center text-xs text-danger">Veuillez noter tous les critères sur 5 étoiles.</p>
        )}

        {/* Recommendation */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Recommandation finale</label>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: 'retenu', label: 'Retenu', icon: ThumbsUp, color: 'hover:border-success hover:bg-success/5 peer-checked:bg-success peer-checked:text-white' },
              { value: 'a_reconsiderer', label: 'À reconsidérer', icon: MessageSquare, color: 'hover:border-warning hover:bg-warning/5 peer-checked:bg-warning peer-checked:text-white' },
              { value: 'non_retenu', label: 'Non retenu', icon: ThumbsDown, color: 'hover:border-danger hover:bg-danger/5 peer-checked:bg-danger peer-checked:text-white' },
            ].map((r) => (
              <label key={r.value} className="relative cursor-pointer">
                <input type="radio" {...register('recommandation')} value={r.value} className="sr-only peer" />
                <div className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-gray-100 dark:border-white/5 transition-all duration-200 ${r.color} dark:text-slate-300`}>
                  <r.icon className="h-6 w-6" />
                  <span className="text-sm font-medium">{r.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Commentaires & Justification</label>
          <textarea
            {...register('commentaires')}
            className={`w-full h-32 p-4 rounded-2xl border ${errors.commentaires ? 'border-danger' : 'border-gray-200 dark:border-white/10'} bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-brand-500/20`}
            placeholder="Détaillez votre avis sur le candidat..."
          />
          {errors.commentaires && <p className="text-xs text-danger">{errors.commentaires.message}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
          <Button variant="ghost" onClick={onClose} type="button">Annuler</Button>
          <Button 
            type="submit" 
            loading={loading} 
            icon={<Save className="h-4 w-4" />}
            data-testid="submit-evaluation"
          >
            Soumettre l'évaluation
          </Button>
        </div>
      </form>
    </Modal>
  )
}
