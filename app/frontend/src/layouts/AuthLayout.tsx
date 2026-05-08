import { Outlet } from 'react-router-dom'
import { Logo, ThemeToggle } from '@/components/ui'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black px-4 transition-colors duration-200">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.1),transparent_50%)] dark:block hidden" />
      
      {/* Theme Toggle (Public) */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <Logo className="h-24 w-auto" />
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-card dark:shadow-glow-blue p-8 transition-colors">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
