import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, Send, ArrowLeft, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/components/feedback/Toast'
import { useAuthStore } from '@/stores/authStore'
import { candidaturesService } from '@/services/candidatures.service'
import { ApiError } from '@/services/client'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const MAX_PHONE_LENGTH = 20

const schema = z.object({
  telephone: z.string()
    .trim()
    .min(10, 'Numéro de téléphone requis')
    .max(MAX_PHONE_LENGTH, `Le numéro ne doit pas dépasser ${MAX_PHONE_LENGTH} caractères`),
  experience_annees: z.coerce.number()
    .refine((value) => Number.isFinite(value), 'Expérience requise')
    .int('Entrez un nombre entier')
    .min(0, 'L’expérience ne peut pas être négative')
    .max(99, 'Valeur trop élevée'),
  lettre_motivation: z.string().trim().optional(),
  linkedin_url: z.string().trim().url('URL LinkedIn invalide').optional().or(z.literal('')),
})

type FormValues = z.output<typeof schema>
type FormInputValues = z.input<typeof schema>

export default function ApplyPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<FormInputValues, undefined, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      telephone: user?.phone ?? '',
      experience_annees: 0,
    }
  })

  useEffect(() => {
    let cancelled = false

    async function guardDuplicateApplication() {
      if (!id || user?.role !== 'candidat') {
        if (!cancelled) setPageLoading(false)
        return
      }

      try {
        const applications = await candidaturesService.myApplications()
        if (!cancelled && applications.some((application) => application.offre === Number(id))) {
          toast('info', 'Vous avez déjà postulé à cette offre.')
          navigate('/mes-candidatures', { replace: true })
          return
        }
      } catch {
        // La page de candidature reste utilisable même si ce contrôle échoue.
      } finally {
        if (!cancelled) setPageLoading(false)
      }
    }

    void guardDuplicateApplication()

    return () => {
      cancelled = true
    }
  }, [id, navigate, user?.role])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    setFileError('')

    if (!selected) {
      setFile(null)
      return
    }

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setFileError('Format refusé. Seuls les fichiers PDF et DOCX sont acceptés.')
      setFile(null)
      return
    }

    if (selected.size > MAX_FILE_SIZE) {
      setFileError('Le fichier ne doit pas dépasser 5 Mo.')
      setFile(null)
      return
    }

    setFile(selected)
  }

  const onSubmit = async (data: FormValues) => {
    if (!id) {
      toast('error', 'Offre introuvable')
      return
    }

    if (!file) {
      setFileError('Veuillez joindre votre CV')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('offre', String(id))
      formData.append('cv_file', file)
      formData.append('telephone', data.telephone.trim())
      formData.append('experience_annees', String(data.experience_annees))
      if (data.lettre_motivation) formData.append('lettre_motivation', data.lettre_motivation)
      if (data.linkedin_url) formData.append('linkedin_url', data.linkedin_url.trim())

      const candidature = await candidaturesService.apply(formData)
      const score = candidature.matching_score ?? 0
      toast('success', `Candidature envoyée. Score CV détecté : ${Math.round(score)}%`)
      navigate('/mes-candidatures')
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : 'Erreur lors de l\'envoi')
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="max-w-2xl mx-auto rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-card dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-400">
        Vérification de votre candidature en cours...
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </button>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Postuler</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Complétez votre candidature en joignant votre CV
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* CV Upload */}
        <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-xl border border-gray-200 dark:border-white/10 shadow-card dark:shadow-glow-blue/5 p-6 transition-colors">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">CV *</h2>
          <label className="block">
            <div
              className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                fileError ? 'border-danger bg-danger-light/30' : file ? 'border-success bg-success-light/30' : 'border-gray-300 dark:border-white/10 hover:border-brand-400 bg-gray-50 dark:bg-slate-900/50'
              }`}
            >
              {file ? (
                <>
                  <FileText className="h-8 w-8 text-success mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} Mo</p>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Cliquez pour uploader votre CV</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">PDF ou DOCX · 5 Mo max</p>
                </>
              )}
            </div>
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {fileError && <p className="text-sm text-danger mt-2">{fileError}</p>}
        </div>

        {/* Required fields */}
        <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-xl border border-gray-200 dark:border-white/10 shadow-card dark:shadow-glow-blue/5 p-6 space-y-4 transition-colors">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Informations de contact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Téléphone *"
              placeholder="+212 6XX XXX XXX"
              maxLength={MAX_PHONE_LENGTH}
              error={errors.telephone?.message}
              {...register('telephone')}
            />
            <Input
              label="Années d'expérience *"
              type="number"
              placeholder="Ex: 3"
              min={0}
              step={1}
              error={errors.experience_annees?.message}
              {...register('experience_annees')}
            />
          </div>
        </div>

        {/* Optional fields */}
        <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-xl border border-gray-200 dark:border-white/10 shadow-card dark:shadow-glow-blue/5 p-6 space-y-4 transition-colors">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Informations complémentaires</h2>

          <Input
            label="Profil LinkedIn"
            placeholder="https://linkedin.com/in/votre-profil"
            error={errors.linkedin_url?.message}
            {...register('linkedin_url')}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Lettre de motivation
            </label>
            <textarea
              placeholder="Décrivez votre motivation pour ce poste..."
              rows={5}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors resize-none"
              {...register('lettre_motivation')}
            />
          </div>
        </div>

        <Button
          type="submit"
          loading={loading}
          icon={<Send className="h-4 w-4" />}
          className="w-full"
          size="lg"
        >
          {loading ? 'Analyse du CV en cours...' : 'Envoyer ma candidature'}
        </Button>
      </form>
    </div>
  )
}
