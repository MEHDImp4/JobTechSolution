import { Loader2, AlertCircle, Inbox } from 'lucide-react'

export function LoadingState({ 
  message = 'Chargement...', 
  size = 'md',
  color = 'brand'
}: { 
  message?: string,
  size?: 'xs' | 'sm' | 'md' | 'lg',
  color?: 'brand' | 'white' | 'gray'
}) {
  const sizeClasses = {
    xs: 'h-4 w-4',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const colorClasses = {
    brand: 'text-brand-500',
    white: 'text-white',
    gray: 'text-gray-400'
  }

  return (
    <div className="flex flex-col items-center justify-center py-4 text-gray-500 dark:text-gray-400 animate-fade-in">
      <Loader2 className={`${sizeClasses[size]} animate-spin ${colorClasses[color]} mb-3`} />
      {size !== 'xs' && <p className="text-sm">{message}</p>}
    </div>
  )
}

export function ErrorState({ message = 'Une erreur est survenue.' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400 animate-fade-in">
      <div className="p-3 rounded-full bg-danger-light dark:bg-danger/20 mb-3">
        <AlertCircle className="h-6 w-6 text-danger dark:text-red-400" />
      </div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{message}</p>
    </div>
  )
}

export function EmptyState({
  title = 'Aucun résultat',
  description,
  action,
}: {
  title?: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400 animate-fade-in">
      <div className="p-3 rounded-full bg-gray-100 dark:bg-white/5 mb-3">
        <Inbox className="h-6 w-6 text-gray-400 dark:text-gray-500" />
      </div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{title}</p>
      {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
