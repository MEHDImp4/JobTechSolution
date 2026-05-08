import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LogIn } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { toast } from '@/components/feedback/Toast'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/authStore'
import { ApiError } from '@/services/client'

const schema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      const user = await authService.login(data)
      setUser(user)
      toast('success', `Bienvenue, ${user.prenom} !`)

      // Redirect based on role
      if (user.role === 'candidat') {
        navigate('/offres')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erreur de connexion'
      toast('error', message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Connexion</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Accédez à votre espace JobTech
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Adresse e-mail"
          type="email"
          placeholder="vous@exemple.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Mot de passe"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button
          type="submit"
          loading={loading}
          icon={<LogIn className="h-4 w-4" />}
          className="w-full"
        >
          Se connecter
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-6">
        Pas encore de compte ?{' '}
        <Link to="/inscription" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium">
          Créer un compte
        </Link>
      </p>
    </>
  )
}
