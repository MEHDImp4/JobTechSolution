import { NavLink } from 'react-router-dom'
import {
  Briefcase, FileText, LayoutDashboard, Calendar, ClipboardCheck,
  Users, BarChart3, UserCog, Shield, ChevronLeft, ChevronRight, X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'
import { NAV_ITEMS, type UserRole, type NavItem } from '@/lib/constants'

const iconMap: Record<string, React.ElementType> = {
  Briefcase, FileText, LayoutDashboard, Calendar, ClipboardCheck,
  Users, BarChart3, UserCog, Shield,
}

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ collapsed, onToggle, isOpen, onClose }: SidebarProps) {
  const user = useAuthStore((s) => s.user)
  const role = (user?.role ?? 'candidat') as UserRole

  const visibleItems = NAV_ITEMS.filter((item: NavItem) => item.roles.includes(role))

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 z-50 flex flex-col bg-white/80 dark:bg-black/40 backdrop-blur-xl text-gray-900 dark:text-white border-r border-gray-200 dark:border-white/12',
          'transition-all duration-300 ease-in-out',
          collapsed ? 'lg:w-[var(--sidebar-collapsed)]' : 'lg:w-[var(--sidebar-width)]',
          'w-[var(--sidebar-width)]',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between lg:justify-center h-[var(--topbar-height)] px-4 border-b border-gray-200 dark:border-white/12 overflow-hidden shrink-0">
          <div className={cn(
            "flex items-center justify-center shrink-0 transition-all duration-200",
            collapsed ? "lg:w-10 lg:h-10" : "lg:w-auto lg:h-11 px-2"
          )}>
            <Logo collapsed={collapsed} />
          </div>

          {/* Close button - Mobile only */}
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
            aria-label="Fermer le menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {visibleItems.map((item: NavItem) => {
            const Icon = iconMap[item.icon]
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                    'transition-colors duration-150 cursor-pointer',
                    isActive
                      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 shadow-sm dark:shadow-glow-blue/10 border border-brand-500/20'
                      : 'text-gray-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                  )
                }
              >
                {Icon && <Icon className="h-5 w-5 shrink-0" />}
                <span className={cn(
                  "whitespace-nowrap overflow-hidden transition-all duration-200",
                  collapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"
                )}>
                  {item.label}
                </span>
              </NavLink>
            )
          })}
        </nav>

        {/* Collapse Toggle - Desktop only */}
        <div className="hidden lg:block p-3 border-t border-gray-200 dark:border-white/12">
          <button
            onClick={onToggle}
            className="flex items-center justify-center w-full h-9 rounded-lg text-gray-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label={collapsed ? 'Déplier la barre latérale' : 'Replier la barre latérale'}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
      </aside>
    </>
  )
}
