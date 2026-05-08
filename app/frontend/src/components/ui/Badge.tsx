import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

const badgeVariants = {
  default: 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-transparent dark:border-white/5',
  success: 'bg-success-light dark:bg-emerald-500/10 text-success dark:text-emerald-400 border border-transparent dark:border-emerald-500/20',
  warning: 'bg-warning-light dark:bg-amber-500/10 text-warning dark:text-amber-400 border border-transparent dark:border-amber-500/20',
  danger: 'bg-danger-light dark:bg-rose-500/10 text-danger dark:text-rose-400 border border-transparent dark:border-rose-500/20',
  info: 'bg-info-light dark:bg-sky-500/10 text-info dark:text-sky-400 border border-transparent dark:border-sky-500/20',
}

export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

interface StatusBadgeProps {
  className: string
  children: React.ReactNode
}

export function StatusBadge({ className, children }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
        className
      )}
    >
      {children}
    </span>
  )
}
