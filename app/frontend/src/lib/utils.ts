import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function formatDate(value?: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('fr-FR').format(date)
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function formatSalary(min?: number | null, max?: number | null): string {
  const format = (amount: number) => new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 0 }).format(amount)
  if (min != null && max != null) return min === max ? `${format(min)} MAD` : `${format(min)} – ${format(max)} MAD`
  if (min != null) return `À partir de ${format(min)} MAD`
  if (max != null) return `Jusqu’à ${format(max)} MAD`
  return 'Non spécifié'
}

export function formatScore(score?: number | null): string {
  return score == null || Number.isNaN(score) ? '—' : `${Math.round(score)}%`
}

export function getScoreColor(score?: number | null): string {
  if (score == null || Number.isNaN(score)) return 'text-gray-500'
  if (score >= 75) return 'text-emerald-600'
  if (score >= 50) return 'text-amber-600'
  return 'text-red-600'
}

export function getInitials(name?: string | null): string {
  return (name ?? '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('')
}

export function normalizeBackendFileUrl(url?: string | null): string {
  if (!url) return ''
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) return url
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
  return `${base.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
}
