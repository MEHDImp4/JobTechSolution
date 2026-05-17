import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/components/feedback/Toast'
import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/services/auth.service'
import { ApiError } from '@/services/client'
import { ROLES, type UserRole } from '@/lib/constants'
import { formatDate } from '@/lib/utils'

const profileSchema = z.object({
  nom: z.string().min(2),
  prenom: z.string().min(2),
  phone: z.string().optional(),
})

const passwordSchema = z.object({
  old_password: z.string().min(1, 'Ancien mot de passe requis'),
  new_password: z.string().min(8, '8 caractères minimum'),
  new_password_confirm: z.string(),
}).refine((d) => d.new_password === d.new_password_confirm, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['new_password_confirm'],
})

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nom: user?.nom ?? '',
      prenom: user?.prenom ?? '',
      phone: user?.phone ?? '',
    },
  })

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      old_password: '',
      new_password: '',
      new_password_confirm: '',
    },
  })

  const onProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
    setProfileLoading(true)
    try {
      const updated = await authService.updateProfile(data)
      setUser(updated)
      toast('success', 'Profil mis à jour')
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : 'Erreur')
    } finally {
      setProfileLoading(false)
    }
  }

  const onPasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
    setPasswordLoading(true)
    try {
      const res = await authService.changePassword(data)
      toast('success', res.message)
      passwordForm.reset()
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : 'Erreur')
    } finally {
      setPasswordLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Mon profil</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          {ROLES[user.role as UserRole]} · Inscrit le {formatDate(user.date_joined)}
        </p>
      </div>

      {/* Profile Info */}
      <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-xl border border-gray-200 dark:border-white/10 shadow-card dark:shadow-glow-blue/5 p-6 transition-colors">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations personnelles</h2>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nom"
              error={profileForm.formState.errors.nom?.message}
              {...profileForm.register('nom')}
            />
            <Input
              label="Prénom"
              error={profileForm.formState.errors.prenom?.message}
              {...profileForm.register('prenom')}
            />
          </div>
          <Input label="E-mail" value={user.email} disabled />
          <Input
            label="Téléphone"
            placeholder="+212 6XX XXX XXX"
            error={profileForm.formState.errors.phone?.message}
            {...profileForm.register('phone')}
          />
          <div className="flex justify-end">
            <Button type="submit" loading={profileLoading} icon={<Save className="h-4 w-4" />}>
              Enregistrer
            </Button>
          </div>
        </form>
      </div>
      {/* Password Change */}
      <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-xl border border-gray-200 dark:border-white/10 shadow-card dark:shadow-glow-blue/5 p-6 transition-colors">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Changer le mot de passe</h2>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          <Input
            label="Ancien mot de passe"
            type="password"
            error={passwordForm.formState.errors.old_password?.message}
            {...passwordForm.register('old_password')}
          />
          <Input
            label="Nouveau mot de passe"
            type="password"
            error={passwordForm.formState.errors.new_password?.message}
            {...passwordForm.register('new_password')}
          />
          <Input
            label="Confirmer le nouveau mot de passe"
            type="password"
            error={passwordForm.formState.errors.new_password_confirm?.message}
            {...passwordForm.register('new_password_confirm')}
          />
          <div className="flex justify-end">
            <Button type="submit" loading={passwordLoading} variant="secondary" icon={<Lock className="h-4 w-4" />}>
              Mettre à jour
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
