import { Sun, Moon, Monitor } from 'lucide-react'
import { useUIStore, type Theme } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const { theme, setTheme } = useUIStore()

  const themes: { value: Theme; icon: typeof Sun; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Clair' },
    { value: 'dark', icon: Moon, label: 'Sombre' },
    { value: 'system', icon: Monitor, label: 'Système' },
  ]

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-lg">
      {themes.map((t) => {
        const Icon = t.icon
        const isActive = theme === t.value
        return (
          <button
            key={t.value}
            onClick={() => setTheme(t.value)}
            title={t.label}
            className={cn(
              "p-1.5 rounded-md transition-all duration-200 cursor-pointer",
              isActive
                ? "bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        )
      })}
    </div>
  )
}
