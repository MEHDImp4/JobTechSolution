import { type InputHTMLAttributes, forwardRef, useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type
    const generatedId = useId()
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-') ?? generatedId
    const messageId = `${inputId}-message`

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <div className="relative group">
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={cn(
              'w-full h-11 px-4 rounded-xl border bg-white dark:bg-slate-900/50 dark:backdrop-blur-md text-base md:text-sm text-gray-900 dark:text-white',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'transition-all duration-200',
              'focus:outline-none focus:ring-4 focus:ring-brand-500/20 dark:focus:ring-brand-500/30 focus:border-brand-500',       
              'disabled:bg-gray-50 dark:disabled:bg-black disabled:text-gray-500 disabled:cursor-not-allowed',
              isPassword && 'pr-12', // Extra padding for the eye icon
              error
                ? 'border-danger focus:ring-danger/20 focus:border-danger'
                : 'border-gray-200 dark:border-white/15 dark:hover:border-white/20',
              className
            )}
            {...props}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error || hint ? messageId : undefined}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0.5 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        {error && <p id={messageId} className="text-sm text-danger">{error}</p>}
        {hint && !error && <p id={messageId} className="text-sm text-gray-500 dark:text-gray-400">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
