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

export class ApiError extends Error {
  status: number
  data: { message?: string } | null

  constructor(status: number, data: { message?: string } | null) {
    super(data?.message ?? `Erreur ${status}`)
    this.status = status
    this.data = data
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
