/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
}

let addToastFn: ((type: ToastType, message: string) => void) | null = null

export function toast(type: ToastType, message: string) {
  addToastFn?.(type, message)
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

const styles = {
  success: 'bg-emerald-50/90 dark:bg-black/80 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400 shadow-glow-blue/5',
  error: 'bg-red-50/90 dark:bg-black/80 border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-400',
  info: 'bg-blue-50/90 dark:bg-black/80 border-blue-200 dark:border-blue-500/30 text-blue-800 dark:text-blue-400',
}

export function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  useEffect(() => {
    addToastFn = addToast
    return () => {
      addToastFn = null
    }
  }, [addToast])

  const remove = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col-reverse gap-3 pointer-events-none">
      {toasts.map((t) => {
        const Icon = icons[t.type]
        return (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-modal',
              'animate-slide-up min-w-[320px] max-w-[420px] transition-all duration-300',
              styles[t.type]
            )}
          >
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full shrink-0",
              t.type === 'success' ? "bg-emerald-100 dark:bg-emerald-500/20" : 
              t.type === 'error' ? "bg-red-100 dark:bg-red-500/20" : "bg-blue-100 dark:bg-blue-500/20"
            )}>
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-sm font-medium flex-1 leading-tight">{t.message}</p>
            <button
              onClick={() => remove(t.id)}
              className="shrink-0 p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer transition-colors"
            >
              <X className="h-4 w-4 opacity-60" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
