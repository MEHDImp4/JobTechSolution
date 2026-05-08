import { useState, useEffect } from 'react'
import { Shield } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/Badge'
import { LoadingState, ErrorState, EmptyState } from '@/components/feedback/States'
import { adminService } from '@/services/admin.service'
import { formatDateTime } from '@/lib/utils'
import type { AuditLog } from '@/types/auth'

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-success-light text-success',
  UPDATE: 'bg-warning-light text-warning',
  DELETE: 'bg-danger-light text-danger',
  VIEW: 'bg-info-light text-info',
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      try {
        setLogs(await adminService.auditLogs())
      } catch {
        setError('Impossible de charger le journal d\'audit')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = search
    ? logs.filter(
        (l) =>
          l.user_email?.toLowerCase().includes(search.toLowerCase()) ||
          l.action.toLowerCase().includes(search.toLowerCase()) ||
          l.model_name?.toLowerCase().includes(search.toLowerCase())
      )
    : logs

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-900/30">
          <Shield className="h-5 w-5 text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Journal d'audit</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Traçabilité de toutes les actions</p>
        </div>
      </div>

      <div className="max-w-md">
        <Input
          placeholder="Filtrer par utilisateur, action, modèle..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Aucun log" description="Le journal est vide." />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-xl border border-gray-200 dark:border-white/10 shadow-card dark:shadow-glow-blue/5 overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                    <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Utilisateur</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Action</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Modèle</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Endpoint</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {filtered.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-gray-500 dark:text-slate-400 text-xs whitespace-nowrap">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white text-xs">{log.user_email}</td>
                      <td className="px-4 py-3">
                        <StatusBadge className={ACTION_COLORS[log.action] ?? 'bg-gray-100 text-gray-700'}>
                          {log.action}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-slate-300 text-xs">{log.model_name}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-slate-400 text-xs font-mono truncate max-w-[180px]">{log.endpoint}</td>
                      <td className="px-4 py-3 text-gray-400 dark:text-slate-500 text-xs font-mono">{log.ip_address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filtered.map((log) => (
              <div key={log.id} className="bg-white dark:bg-slate-900/40 p-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm space-y-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-gray-900 dark:text-white">{log.user_email}</p>
                    <p className="text-[10px] text-gray-500 dark:text-slate-400">{formatDateTime(log.timestamp)}</p>
                  </div>
                  <StatusBadge className={ACTION_COLORS[log.action] ?? 'bg-gray-100 text-gray-700'}>
                    {log.action}
                  </StatusBadge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-gray-100 dark:border-white/5">
                  <div>
                    <span className="text-gray-400 dark:text-slate-500 block">Modèle</span>
                    <span className="text-gray-600 dark:text-slate-300">{log.model_name || 'N/A'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 dark:text-slate-500 block">IP</span>
                    <span className="text-gray-600 dark:text-slate-300 font-mono">{log.ip_address}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400 dark:text-slate-500 block">Endpoint</span>
                    <span className="text-gray-600 dark:text-slate-300 font-mono truncate block">{log.endpoint}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
