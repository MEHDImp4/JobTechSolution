import ky, { HTTPError } from 'ky'

function getCsrfToken(): string {
  const match = document.cookie.match(/csrftoken=([^;]+)/)
  return match?.[1] ?? ''
}

export const api = ky.create({
  prefix: '/api',
  credentials: 'include',
  timeout: 30000,
  hooks: {
    beforeRequest: [
      ({ request }) => {
        const method = request.method.toUpperCase()
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
          request.headers.set('X-CSRFToken', getCsrfToken())
        }
      },
    ],
  },
})

function ensureTrailingSlash(path: string): string {
  return path.endsWith('/') ? path : path + '/'
}

export type ApiErrorPayload = Record<string, unknown> | null

function normalizeApiErrorPayload(data: unknown): ApiErrorPayload {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    return null
  }
  return data as Record<string, unknown>
}

function getApiErrorMessage(data: ApiErrorPayload): string | undefined {
  if (!data) return undefined

  if (typeof data.message === 'string') {
    return data.message
  }

  const firstError = Object.values(data)[0]
  const firstMessage = Array.isArray(firstError) ? firstError[0] : firstError
  return typeof firstMessage === 'string' ? firstMessage : undefined
}

export class ApiError extends Error {
  status: number
  data: ApiErrorPayload

  constructor(status: number, data: unknown) {
    const payload = normalizeApiErrorPayload(data)
    super(getApiErrorMessage(payload) ?? `Erreur ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.data = payload
  }
}

async function handleError(error: unknown): Promise<never> {
  if (error instanceof HTTPError) {
    const data = await error.response.json().catch(() => null) as { message?: string } | null
    throw new ApiError(error.response.status, data)
  }
  throw error
}

export async function apiGet<T>(path: string, searchParams?: Record<string, string>): Promise<T> {
  try {
    return await api.get(ensureTrailingSlash(path), { searchParams }).json<T>()
  } catch (error) {
    return handleError(error)
  }
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  try {
    return await api.post(ensureTrailingSlash(path), { json: body }).json<T>()
  } catch (error) {
    return handleError(error)
  }
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  try {
    return await api.patch(ensureTrailingSlash(path), { json: body }).json<T>()
  } catch (error) {
    return handleError(error)
  }
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  try {
    return await api.put(ensureTrailingSlash(path), { json: body }).json<T>()
  } catch (error) {
    return handleError(error)
  }
}

export async function apiDelete<T>(path: string): Promise<T> {
  try {
    return await api.delete(ensureTrailingSlash(path)).json<T>()
  } catch (error) {
    return handleError(error)
  }
}

export async function apiPostForm<T>(path: string, formData: FormData): Promise<T> {
  try {
    return await api.post(ensureTrailingSlash(path), { body: formData }).json<T>()
  } catch (error) {
    return handleError(error)
  }
}

export async function apiDownload(path: string, searchParams?: Record<string, string>): Promise<{ blob: Blob; filename: string | null }> {
  try {
    const response = await api.get(ensureTrailingSlash(path), { searchParams })
    const blob = await response.blob()
    const disposition = response.headers.get('content-disposition')
    const filename = disposition?.match(/filename="?([^";]+)"?/)?.[1] ?? null
    return { blob, filename }
  } catch (error) {
    return handleError(error)
  }
}
