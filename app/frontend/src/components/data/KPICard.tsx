import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: { value: string; positive: boolean }
  className?: string
}

export function KPICard({ title, value, subtitle, icon, trend, className }: KPICardProps) {
  return (
    <div className={cn(
      'bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/15 shadow-card dark:shadow-glow-blue p-5 transition-all duration-300 hover:scale-[1.02] hover:border-brand-500/30',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white dark:tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
          {trend && (
            <p className={cn('text-xs font-semibold mt-1', trend.positive ? 'text-success dark:text-emerald-400' : 'text-danger dark:text-rose-400')}>
              {trend.positive ? '+' : ''}{trend.value}
            </p>
          )}
        </div>
        <div className="p-3 rounded-xl bg-brand-100 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 shadow-inner">
          {icon}
        </div>
      </div>
    </div>
  )
}
