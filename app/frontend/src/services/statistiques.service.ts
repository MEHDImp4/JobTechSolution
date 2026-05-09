import { apiGet } from './client'
import type { RHDashboardStats, KPIData } from '@/types/statistique'

export const statistiquesService = {
  rhDashboard: () => apiGet<RHDashboardStats>('statistiques/rh'),

  kpis: (periode: string = '30d') =>
    apiGet<KPIData>('kpi', { periode }),

  exportCsvUrl: (periode: string = '30d') =>
    `/api/statistiques/export-csv?periode=${periode}`,
}
