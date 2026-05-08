import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UserPlus } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { toast } from '@/components/feedback/Toast'
import { authService } from '@/services/auth.service'
import { ApiError } from '@/services/client'

const schema = z.object({
  nom: z.string().min(2, 'Nom requis (2 caractères min.)'),
  prenom: z.string().min(2, 'Prénom requis (2 caractères min.)'),
  email: z.string().email('Adresse e-mail invalide'),
  password: z
    .string()
    .min(8, '8 caractères minimum')
    .regex(/[A-Z]/, 'Une majuscule requise')
    .regex(/\d/, 'Un chiffre requis')
    .regex(/[!@#$%^&*(),.?":{}|<>\-_+=[\]\\;'`~/]/, 'Un caractère spécial requis'),
  password_confirm: z.string(),
}).refine((d) => d.password === d.password_confirm, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['password_confirm'],
})

type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      const res = await authService.register(data)
      toast('success', res.message)
      navigate('/connexion')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erreur lors de l\'inscription'
      toast('error', message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Créer un compte</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Rejoignez JobTech Solutions
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nom"
            placeholder="Diouri"
            error={errors.nom?.message}
            {...register('nom')}
          />
          <Input
            label="Prénom"
            placeholder="Mehdi"
            error={errors.prenom?.message}
            {...register('prenom')}
          />
        </div>

        <Input
          label="Adresse e-mail"
          type="email"
          placeholder="vous@exemple.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Mot de passe"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          hint="8 car. min., 1 majuscule, 1 chiffre, 1 spécial"
          {...register('password')}
        />

        <Input
          label="Confirmer le mot de passe"
          type="password"
          placeholder="••••••••"
          error={errors.password_confirm?.message}
          {...register('password_confirm')}
        />

        <Button
          type="submit"
          loading={loading}
          icon={<UserPlus className="h-4 w-4" />}
          className="w-full"
        >
          S'inscrire
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-6">
        Déjà un compte ?{' '}
        <Link to="/connexion" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium">
          Se connecter
        </Link>
      </p>
    </>
  )
}
