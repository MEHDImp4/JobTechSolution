import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, ArrowLeft, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/components/feedback/Toast'
import { offresService } from '@/services/offres.service'
import { ApiError } from '@/services/client'
import { LoadingState } from '@/components/feedback/States'

const schema = z.object({
  titre: z.string().min(3, 'Titre requis (3 car. min.)'),
  description: z.string().min(20, 'Description requise (20 car. min.)'),
  experience_requise: z.preprocess(
    (v) => (v === '' || v === undefined ? 0 : Number(v)),
    z.number().min(0, 'Expérience positive requise')
  ),
  type_contrat: z.string().min(1, 'Type de contrat requis'),
  salaire_min: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : Number(v)),
    z.number().optional()
  ),
  salaire_max: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : Number(v)),
    z.number().optional()
  ),
  date_cloture: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function OffreFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(isEdit)
  const [competences, setCompetences] = useState<string[]>([])
  const [compInput, setCompInput] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      type_contrat: 'CDI',
      experience_requise: 0,
    },
  })

  useEffect(() => {
    if (isEdit) {
      offresService.get(Number(id)).then((offre) => {
        reset({
          titre: offre.titre,
          description: offre.description,
          experience_requise: offre.experience_requise,
          type_contrat: offre.type_contrat,
          salaire_min: offre.salaire_min ?? undefined,
          salaire_max: offre.salaire_max ?? undefined,
          date_cloture: offre.date_cloture ?? '',
        })
        setCompetences(offre.competences)
        setPageLoading(false)
      })
    }
  }, [id, isEdit, reset])

  function addCompetence() {
    const val = compInput.trim()
    if (val && !competences.includes(val)) {
      setCompetences([...competences, val])
    }
    setCompInput('')
  }

  function removeCompetence(comp: string) {
    setCompetences(competences.filter((c) => c !== comp))
  }

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      const payload = { 
        ...data, 
        competences,
        date_cloture: data.date_cloture || null 
      }
      if (isEdit) {
        await offresService.update(Number(id), payload)
        toast('success', 'Offre mise à jour')
      } else {
        await offresService.create(payload)
        toast('success', 'Offre créée')
      }
      navigate('/gestion-offres')
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) return <LoadingState />

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/gestion-offres')}
        className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        {isEdit ? 'Modifier l\'offre' : 'Nouvelle offre'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-xl border border-gray-200 dark:border-white/10 shadow-card dark:shadow-glow-blue/5 p-6 space-y-4 transition-colors">
          <Input label="Titre du poste *" placeholder="Ex: Développeur Full Stack" error={errors.titre?.message} {...register('titre')} />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description *</label>
            <textarea
              rows={6}
              placeholder="Décrivez le poste, les missions, le profil recherché..."
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none transition-colors"
              {...register('description')}
            />
            {errors.description && <p className="text-sm text-danger">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type de contrat *</label>
              <select
                className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-gray-200 cursor-pointer outline-none focus:ring-2 focus:ring-brand-500/20"
                {...register('type_contrat')}
              >
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="STAGE">Stage</option>
                <option value="FREELANCE">Freelance</option>
              </select>
            </div>
            <Input label="Expérience requise (années) *" type="number" placeholder="0" error={errors.experience_requise?.message} {...register('experience_requise')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Date de clôture" type="date" {...register('date_cloture')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Salaire min (MAD)" type="number" placeholder="5000" {...register('salaire_min')} />
            <Input label="Salaire max (MAD)" type="number" placeholder="15000" {...register('salaire_max')} />
          </div>
        </div>

        {/* Competences */}
        <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-xl border border-gray-200 dark:border-white/10 shadow-card dark:shadow-glow-blue/5 p-6 transition-colors">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Compétences requises</h2>
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Ex: Python, React, SQL..."
              value={compInput}
              onChange={(e) => setCompInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCompetence() } }}
            />
            <Button type="button" variant="secondary" onClick={addCompetence} icon={<Plus className="h-4 w-4" />}>
              Ajouter
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {competences.map((comp) => (
              <span key={comp} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-brand-100 text-brand-700">
                {comp}
                <button type="button" onClick={() => removeCompetence(comp)} className="text-brand-400 hover:text-brand-700 cursor-pointer">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <Button type="submit" loading={loading} icon={<Save className="h-4 w-4" />} className="w-full" size="lg">
          {isEdit ? 'Mettre à jour' : 'Créer l\'offre'}
        </Button>
      </form>
    </div>
  )
}
