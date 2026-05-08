import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-200">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_-20%,rgba(14,165,233,0.1),transparent_50%)] dark:block hidden" />
      <Sidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed(!collapsed)} 
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
      />
      <div
        className={cn(
          'transition-[margin-left] duration-200 ease-out min-h-screen flex flex-col',
          collapsed ? 'lg:ml-[var(--sidebar-collapsed)]' : 'lg:ml-[var(--sidebar-width)]',
          'ml-0'
        )}
      >
        <Topbar onMenuClick={() => setIsMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
