import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, Settings, ChevronDown, Menu } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { ROLES, type UserRole } from '@/lib/constants'
import { getInitials } from '@/lib/utils'
import { ThemeToggle } from '@/components/ui'

interface TopbarProps {
  onMenuClick?: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/connexion')
  }

  if (!user) return null

  const roleLabel = ROLES[user.role as UserRole] ?? user.role

  return (
    <header className="h-[var(--topbar-height)] flex items-center justify-between px-4 md:px-6 bg-white/80 dark:bg-black/40 backdrop-blur-xl border-b border-gray-200 dark:border-white/12 transition-colors duration-200 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        {/* User Menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 text-sm font-semibold">
            {getInitials(user.get_full_name)}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.get_full_name}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">{roleLabel}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400 dark:text-slate-500" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-white/10 shadow-dropdown py-1 animate-slide-down z-50">
            <button
              onClick={() => { navigate('/profil'); setMenuOpen(false) }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
            >
              <User className="h-4 w-4" />
              Mon profil
            </button>
            <button
              onClick={() => { navigate('/profil'); setMenuOpen(false) }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
            >
              <Settings className="h-4 w-4" />
              Paramètres
            </button>
            <div className="border-t border-gray-100 dark:border-white/5 my-1" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-danger hover:bg-danger-light dark:hover:bg-danger/10 cursor-pointer transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </button>
          </div>
        )}
      </div>
    </div>
  </header>
  )
}
