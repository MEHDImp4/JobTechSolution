import { useState, useEffect } from 'react'
import { Upload, Search, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { LoadingState, ErrorState, EmptyState } from '@/components/feedback/States'
import { toast } from '@/components/feedback/Toast'
import { PaginationControls } from '@/components/ui/PaginationControls'
import { adminService } from '@/services/admin.service'
import { ROLES, type UserRole } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import type { User } from '@/types/auth'

export default function UsersPage() {
  const PAGE_SIZE = 10
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [importModal, setImportModal] = useState(false)

  function getDisplayName(user: User) {
    return user.get_full_name || user.email
  }

  useEffect(() => {
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterRole, page, appliedSearch])

  async function loadUsers() {
    setLoading(true)
    try {
      const params: Record<string, string> = { page: String(page), page_size: String(PAGE_SIZE) }
      if (filterRole) params.role = filterRole
      if (appliedSearch) params.search = appliedSearch
      const response = await adminService.listUsers(params)
      setUsers(response.results)
      setTotal(response.count)
      setHasNext(Boolean(response.next))
      setHasPrevious(Boolean(response.previous))
    } catch {
      setError('Impossible de charger les utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleActive(id: number) {
    try {
      await adminService.toggleActive(id)
      toast('success', 'Statut mis à jour')
      loadUsers()
    } catch {
      toast('error', 'Erreur')
    }
  }

  async function handleImport(file: File) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const result = await adminService.importUsers(formData)
      toast('success', `${result.created} utilisateur(s) importé(s)`)
      if (result.errors.length > 0) {
        toast('error', `${result.errors.length} erreur(s) lors de l'import`)
      }
      setImportModal(false)
      loadUsers()
    } catch {
      toast('error', 'Erreur lors de l\'import')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Utilisateurs</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Gestion des comptes et des rôles</p>
        </div>
        <Button onClick={() => setImportModal(true)} variant="secondary" icon={<Upload className="h-4 w-4" />}>
          Importer CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setPage(1)
            setAppliedSearch(search)
          }}
          className="flex-1 flex gap-2"
        >
          <div className="flex-1">
            <Input
              aria-label="Rechercher un utilisateur"
              placeholder="Rechercher par nom ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" icon={<Search className="h-4 w-4" />}>Rechercher</Button>
        </form>
        <select
          aria-label="Filtrer par rôle"
          value={filterRole}
          onChange={(e) => {
            setFilterRole(e.target.value)
            setPage(1)
          }}
          className="h-10 px-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-gray-200 cursor-pointer outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="">Tous les rôles</option>
          {Object.entries(ROLES).map(([key, label]) => (
            <option key={key} value={key}>{label as string}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : users.length === 0 ? (
        <EmptyState title="Aucun utilisateur" />
      ) : (
        <div className="bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-xl border border-gray-200 dark:border-white/10 shadow-card dark:shadow-glow-blue/5 overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Utilisateur</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400">E-mail</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Rôle</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Statut</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Inscription</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{getDisplayName(u)}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <StatusBadge className="bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 border-none">
                        {ROLES[u.role as UserRole] ?? u.role}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge className={u.is_active ? 'bg-success-light dark:bg-success/20 text-success dark:text-emerald-400 border-none' : 'bg-danger-light dark:bg-danger/20 text-danger dark:text-red-400 border-none'}>
                        {u.is_active ? 'Actif' : 'Inactif'}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-slate-400 text-xs">{formatDate(u.date_joined)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleToggleActive(u.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors cursor-pointer"
                        title={u.is_active ? 'Désactiver' : 'Activer'}
                        aria-label={u.is_active ? `Désactiver ${getDisplayName(u)}` : `Activer ${getDisplayName(u)}`}
                      >
                        <ToggleRight className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationControls
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Import Modal */}
      <Modal open={importModal} onClose={() => setImportModal(false)} title="Importer des utilisateurs">
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Importez un fichier CSV contenant les colonnes : email, nom, prenom, role, password
          </p>
          <label className="block">
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-white/10 rounded-xl cursor-pointer hover:border-brand-400 dark:hover:border-brand-500 transition-colors bg-gray-50 dark:bg-slate-900/50">
              <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Cliquez pour choisir un fichier CSV</p>
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleImport(f)
              }}
              className="hidden"
            />
          </label>
        </div>
      </Modal>
    </div>
  )
}
