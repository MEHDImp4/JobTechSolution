import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/components/feedback/Toast'
import { entretiensService } from '@/services/entretiens.service'
import { authService } from '@/services/auth.service'
import type { User } from '@/types/auth'
import type { Candidature } from '@/types/candidature'

const schema = z.object({
  recruteur_id: z.string().min(1, 'Veuillez choisir un recruteur'),
  date_heure: z.string().min(1, 'Date et heure requises'),
  duree_minutes: z.string().min(1, 'Durée requise'),
  type_entretien: z.string().min(1, 'Type requis'),
  lieu: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const getDefaultValues = (): FormValues => ({
  recruteur_id: '',
  duree_minutes: '60',
  type_entretien: 'recrutement',
  date_heure: new Date(Date.now() + 86400000).toISOString().slice(0, 16), // Tomorrow
  lieu: '',
})

interface PlanifierEntretienModalProps {
  open: boolean
  onClose: () => void
  candidature: Candidature
  onSuccess?: () => void
}

export function PlanifierEntretienModal({ open, onClose, candidature, onSuccess }: PlanifierEntretienModalProps) {
  const [recruteurs, setRecruteurs] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues()
  })

  useEffect(() => {
    if (open) {
      authService.listRecruteurs()
        .then(setRecruteurs)
        .catch(() => toast('error', 'Impossible de charger la liste des recruteurs'))
    }
  }, [open])

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      await entretiensService.create({
        candidature_id: candidature.id,
        recruteur_id: parseInt(data.recruteur_id),
        date_heure: data.date_heure,
        duree_minutes: parseInt(data.duree_minutes),
        type_entretien: data.type_entretien,
        lieu: data.lieu,
      })
      toast('success', 'Entretien planifié avec succès')
      onSuccess?.()
      onClose()
    } catch (err) {
      const error = err as Error
      toast('error', error?.message || 'Erreur lors de la planification')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Planifier un entretien" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-lg mb-4">
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Candidat : <span className="font-semibold text-gray-900 dark:text-white">{(candidature as Candidature & { candidat_nom?: string }).candidat_nom}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Poste : <span className="font-semibold text-gray-900 dark:text-white">{candidature.offre_titre}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Recruteur *</label>
            <select
              {...register('recruteur_id')}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
            >
              <option value="">Choisir un recruteur...</option>
              {recruteurs.map(r => (
                <option key={r.id} value={r.id}>{r.prenom} {r.nom}</option>
              ))}
            </select>
            {errors.recruteur_id && <p className="text-xs text-danger">{errors.recruteur_id.message}</p>}
          </div>

          <Input
            label="Date et heure *"
            type="datetime-local"
            error={errors.date_heure?.message}
            {...register('date_heure')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type d'entretien *</label>
            <select
              {...register('type_entretien')}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
            >
              <option value="recrutement">Recrutement</option>
              <option value="technique">Technique</option>
              <option value="final">Final</option>
              <option value="annuel">Annuel</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Durée *</label>
            <select
              {...register('duree_minutes')}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
            >
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">1 heure</option>
              <option value="90">1h30</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Lieu (si physique)"
            placeholder="Bureau 402, Casablanca"
            error={errors.lieu?.message}
            {...register('lieu')}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={onClose} type="button">Annuler</Button>
          <Button type="submit" loading={loading} icon={<Save className="h-4 w-4" />}>
            Planifier l'entretien
          </Button>
        </div>
      </form>
    </Modal>
  )
}
