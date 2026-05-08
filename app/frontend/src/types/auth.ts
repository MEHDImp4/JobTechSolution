export interface User {
  id: number
  email: string
  nom: string
  prenom: string
  phone: string | null
  role: 'admin' | 'rh' | 'recruteur' | 'candidat'
  get_full_name: string
  is_active: boolean
  date_joined: string
}

export interface AuthMeResponse {
  authenticated: boolean
  user: User | null
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  nom: string
  prenom: string
  password: string
  password_confirm: string
}

export interface ProfileUpdatePayload {
  nom?: string
  prenom?: string
  phone?: string
}

export interface PasswordChangePayload {
  old_password: string
  new_password: string
  new_password_confirm: string
}

export interface MessageResponse {
  message: string
}

export interface AuditLog {
  id: number
  timestamp: string
  user_email: string
  action: string
  model_name: string
  object_id: string | null
  data_before: Record<string, unknown> | null
  data_after: Record<string, unknown> | null
  ip_address: string | null
  endpoint: string | null
  diff: Array<Record<string, unknown>> | null
}

export interface ImportResult {
  success: boolean
  created: number
  errors: string[]
}
