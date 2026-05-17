import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MessageSquare, Save, Star, ThumbsDown, ThumbsUp } from 'lucide-react'
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

function StarInput({
  value,
  onChange,
  label,
  error,
}: {
  value: number
  onChange: (v: number) => void
  label: string
  error?: string
}) {
  const [hover, setHover] = useState(0)

  return (
    <div className={`flex flex-col gap-3 rounded-2xl border p-4 transition-all ${error ? 'border-danger/40 bg-danger/5' : 'border-slate-200 bg-slate-50'}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{label}</p>
          <p className="text-xs text-slate-500">Choisir une note entre 1 et 5</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${value > 0 ? 'bg-brand-50 text-brand-700' : 'bg-slate-200 text-slate-500'}`}>
          {value > 0 ? `${value}/5` : 'Requis'}
        </span>
      </div>

      <div className="flex items-center gap-1.5" data-testid={`stars-${label.toLowerCase().replace(/\s+/g, '-')}`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${label}: ${n} sur 5`}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(n)}
            className="rounded-xl p-1.5 transition-transform hover:scale-110 active:scale-95"
          >
            <Star
              className={`h-7 w-7 transition-all duration-200 ${
                n <= (hover || value)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>

      {error && <p className="text-xs font-medium text-danger">{error}</p>}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-px flex-1 bg-slate-200" />
      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">{children}</span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  )
}

export function CreateEvaluationModal({ open, onClose, entretien, onSuccess }: CreateEvaluationModalProps) {
  const [loading, setLoading] = useState(false)

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
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
    },
  })

  const commentairesValue = watch('commentaires') || ''
  const selectedRecommendation = watch('recommandation')
  const hasCriteriaErrors = Boolean(
    errors.competences_rate ||
    errors.communication_rate ||
    errors.motivation_rate ||
    errors.adaptabilite_rate ||
    errors.culture_fit_rate
  )

  const onSubmit = async (data: FormValues) => {
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
      const error = err as Error
      toast('error', error?.message || 'Erreur lors de la soumission')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Évaluer le candidat — ${entretien.candidat_nom}`} size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 p-6 text-white shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-200">Entretien terminé</p>
              <h4 className="text-xl font-bold">{entretien.offre_titre}</h4>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200">
                <span>Entretien du {new Date(entretien.date_heure).toLocaleDateString()}</span>
                <span className="h-1 w-1 rounded-full bg-slate-500" />
                <span className="font-semibold uppercase tracking-[0.18em] text-brand-200">{entretien.type_entretien}</span>
              </div>
            </div>
            <Star className="hidden h-14 w-14 shrink-0 text-white/20 sm:block" />
          </div>
        </div>

        <div className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-900">
          Tous les critères doivent être notés. Le commentaire final doit contenir au moins 100 caractères.
        </div>

        <div className="space-y-4">
          <SectionTitle>Critères d'évaluation</SectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Controller
              name="competences_rate"
              control={control}
              render={({ field }) => (
                <StarInput
                  label="Compétences"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.competences_rate?.message}
                />
              )}
            />
            <Controller
              name="communication_rate"
              control={control}
              render={({ field }) => (
                <StarInput
                  label="Communication"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.communication_rate?.message}
                />
              )}
            />
            <Controller
              name="motivation_rate"
              control={control}
              render={({ field }) => (
                <StarInput
                  label="Motivation"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.motivation_rate?.message}
                />
              )}
            />
            <Controller
              name="adaptabilite_rate"
              control={control}
              render={({ field }) => (
                <StarInput
                  label="Adaptabilité"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.adaptabilite_rate?.message}
                />
              )}
            />
            <Controller
              name="culture_fit_rate"
              control={control}
              render={({ field }) => (
                <StarInput
                  label="Culture fit"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.culture_fit_rate?.message}
                />
              )}
            />
          </div>
          {hasCriteriaErrors && (
            <p className="text-sm font-medium text-danger">Attribue une note sur 5 à chaque critère avant de valider.</p>
          )}
        </div>

        <div className="space-y-4">
          <SectionTitle>Recommandation finale</SectionTitle>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                value: 'retenu',
                label: 'Retenu',
                icon: ThumbsUp,
                desc: 'Profil solide, à faire avancer',
                activeClass: 'peer-checked:border-success peer-checked:bg-emerald-50 peer-checked:text-success',
              },
              {
                value: 'a_reconsiderer',
                label: 'À reconsidérer',
                icon: MessageSquare,
                desc: 'Besoin d’un second avis',
                activeClass: 'peer-checked:border-warning peer-checked:bg-amber-50 peer-checked:text-warning-dark',
              },
              {
                value: 'non_retenu',
                label: 'Non retenu',
                icon: ThumbsDown,
                desc: 'Ne correspond pas au besoin',
                activeClass: 'peer-checked:border-danger peer-checked:bg-rose-50 peer-checked:text-danger',
              },
            ].map((option) => (
              <label key={option.value} className="cursor-pointer">
                <input type="radio" {...register('recommandation')} value={option.value} className="peer sr-only" />
                <div className={`rounded-3xl border-2 border-slate-200 bg-white p-5 text-slate-700 transition-all duration-200 peer-checked:scale-[1.01] peer-checked:shadow-lg ${option.activeClass}`}>
                  <div className="mb-4 inline-flex rounded-2xl bg-slate-100 p-3">
                    <option.icon className="h-6 w-6" />
                  </div>
                  <p className="text-base font-bold uppercase tracking-wide">{option.label}</p>
                  <p className="mt-1 text-sm opacity-75">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            Recommandation sélectionnée: <span className="font-semibold">{selectedRecommendation.split('_').join(' ')}</span>
          </div>
        </div>

        <div className="space-y-4">
          <SectionTitle>Commentaire global</SectionTitle>

          <div>
            <textarea
              {...register('commentaires')}
              className={`h-40 w-full rounded-3xl border-2 p-5 text-sm text-slate-900 outline-none transition-all focus:ring-4 focus:ring-brand-500/10 ${
                errors.commentaires ? 'border-danger/50 bg-danger/5' : 'border-slate-200 bg-slate-50'
              }`}
              placeholder="Résume l’entretien, les points observés, le niveau du candidat et la justification de ta recommandation."
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className={`text-xs ${errors.commentaires ? 'font-semibold text-danger' : 'text-slate-500'}`}>
                {errors.commentaires?.message || 'Décris précisément ton avis pour générer un rapport exploitable.'}
              </p>
              <span className={`text-xs font-semibold ${commentairesValue.length >= 100 ? 'text-success' : 'text-slate-500'}`}>
                {commentairesValue.length}/100 min
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">Points forts</label>
            <textarea
              {...register('points_forts')}
              className="h-28 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-900 outline-none transition-all focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10"
              placeholder="Compétences, posture, expérience, éléments différenciants..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">Points à améliorer</label>
            <textarea
              {...register('points_amelioration')}
              className="h-28 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-900 outline-none transition-all focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10"
              placeholder="Manques observés, zones de risque, besoins d’accompagnement..."
            />
          </div>
        </div>

        <div className="sticky bottom-0 -mx-6 border-t border-slate-200 bg-white/95 px-6 pb-1 pt-4 backdrop-blur">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">Le bouton reste visible pour finaliser l’évaluation sans rescroller.</p>
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="rounded-2xl"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                loading={loading}
                size="lg"
                icon={<Save className="h-4 w-4" />}
                className="rounded-2xl px-8 shadow-xl shadow-brand-500/20"
                data-testid="submit-evaluation"
              >
                Finaliser l'évaluation
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  )
}
