import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <p className="text-6xl font-bold text-brand-500/20 dark:text-brand-400/30">404</p>
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">Page introuvable</h1>
      <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 max-w-sm">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link to="/" className="mt-6">
        <Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
          Retour à l'accueil
        </Button>
      </Link>
    </div>
  )
}
