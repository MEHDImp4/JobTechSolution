import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 dark:bg-brand-500 dark:hover:bg-brand-400 dark:shadow-glow-blue',
  secondary: 'bg-white dark:bg-white/5 dark:backdrop-blur-md text-brand-800 dark:text-brand-300 border border-gray-300 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 active:bg-gray-100',
  ghost: 'text-brand-700 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 active:bg-brand-100',
  danger: 'bg-danger text-white hover:bg-red-700 active:bg-red-800 dark:shadow-red-500/20 dark:shadow-lg',
  success: 'bg-success text-white hover:bg-emerald-700 active:bg-emerald-800 dark:shadow-emerald-500/20 dark:shadow-lg',
} as const

const sizes = {
  sm: 'min-h-[44px] md:min-h-0 md:h-8 px-3 text-sm gap-1.5',
  md: 'min-h-[44px] md:min-h-0 md:h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
} as const

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  loading?: boolean
  icon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-semibold rounded-xl text-sm transition-all duration-200 cursor-pointer',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
