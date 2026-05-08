import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(() => window.matchMedia('(display-mode: standalone)').matches)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
    }
  }

  if (isInstalled || !deferredPrompt) {
    return null
  }

  return (
    <div className="mt-4 p-4 bg-brand-50 dark:bg-brand-500/10 rounded-xl border border-brand-100 dark:border-brand-500/20">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm">
          <Download className="h-5 w-5 text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-brand-900 dark:text-brand-300">Installer JobTech</h4>
          <p className="text-xs text-brand-700/70 dark:text-brand-400/70">Accès rapide hors-ligne</p>
        </div>
      </div>
      <Button 
        onClick={handleInstallClick}
        className="w-full h-9 text-xs"
        variant="primary"
      >
        Installer l'application
      </Button>
    </div>
  )
}
