export type AuthTokens = {
  access_token: string
  refresh_token: string
  token_type: string
}

export type PasswordResetResponse = {
  message: string
  reset_token?: string
  expires_at?: string
}

export type ElectraCastProfile = {
  id: string
  user_id: string
  display_name?: string | null
  handle?: string | null
  role?: string | null
  bio?: string | null
  company?: string | null
  website?: string | null
  location?: string | null
  avatar_url?: string | null
  social_links?: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export type ElectraCastAccount = {
  user: {
    id: string
    email: string
    subscription_tier?: string | null
    subscription_status?: string | null
    created_at?: string
  }
  profile: ElectraCastProfile
}

export type ElectraCastPodcast = {
  id: string
  user_id: string
  title: string
  summary: string
  subtitle?: string | null
  language: string
  itunes_categories: string[]
  website?: string | null
  owner_name?: string | null
  owner_email?: string | null
  explicit?: string | null
  status: string
  megaphone_podcast_id?: string | null
  sync_error?: string | null
  created_at: string
  updated_at: string
}

export type ElectraCastPodcastCreate = {
  title: string
  summary: string
  subtitle?: string
  language?: string
  itunes_categories: string[]
  website?: string
  owner_name?: string
  owner_email?: string
  explicit?: string
}

const AUTH_STORAGE_KEY = 'electracast_auth'
const defaultApiBase = import.meta.env.PROD ? 'https://apply.atlasuniversalis.com' : ''
const rawApiBase = import.meta.env.VITE_API_BASE_URL || defaultApiBase
const apiBase = rawApiBase.replace(/\/+$/, '')

const notifyAuthChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('electracast-auth-change'))
  }
}

const buildUrl = (path: string) => {
  if (!apiBase) {
    return path
  }
  return `${apiBase}${path.startsWith('/') ? '' : '/'}${path}`
}

const getErrorMessage = async (response: Response) => {
  try {
    const data = await response.json()
    if (typeof data?.detail === 'string') {
      return data.detail
    }
    if (typeof data?.message === 'string') {
      return data.message
    }
  } catch (error) {
    // Ignore parse errors and fall back to text below.
  }
  const text = await response.text()
  return text || response.statusText || 'Request failed'
}

const requestJson = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const url = buildUrl(path)
  const method = options?.method ?? 'GET'
  const origin =
    typeof window !== 'undefined' && window.location ? window.location.origin : 'unknown'

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/bcd7af8d-7ce5-40a3-9923-8f868cb97eda', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      runId: 'ec-auth-req-1',
      hypothesisId: 'H1',
      location: 'electracast/src/lib/api.ts:requestJson:beforeFetch',
      message: 'Starting API request',
      data: { path, url, method, apiBase, origin },
      timestamp: Date.now(),
    }),
  }).catch(() => {})
  // #endregion agent log

  let response: Response
  try {
    response = await fetch(url, options)
  } catch (error) {
    const online =
      typeof navigator !== 'undefined' && 'onLine' in navigator ? navigator.onLine : null
    const errorMessage = error instanceof Error ? error.message : String(error)

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/bcd7af8d-7ce5-40a3-9923-8f868cb97eda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        runId: 'ec-auth-req-1',
        hypothesisId: 'H2',
        location: 'electracast/src/lib/api.ts:requestJson:fetchError',
        message: 'API request failed before response',
        data: { path, url, method, origin, online, errorMessage },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion agent log

    throw new Error(
      'Unable to reach the ElectraCast API. Please check your connection and try again.'
    )
  }
  if (!response.ok) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/bcd7af8d-7ce5-40a3-9923-8f868cb97eda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        runId: 'ec-auth-req-1',
        hypothesisId: 'H3',
        location: 'electracast/src/lib/api.ts:requestJson:nonOk',
        message: 'API responded with non-OK status',
        data: { path, url, method, status: response.status, statusText: response.statusText },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion agent log

    throw new Error(await getErrorMessage(response))
  }
  return response.json() as Promise<T>
}

export const getStoredAuth = (): AuthTokens | null => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as AuthTokens
    if (!parsed?.access_token) {
      return null
    }
    return parsed
  } catch (error) {
    return null
  }
}

export const setStoredAuth = (tokens: AuthTokens) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tokens))
  notifyAuthChange()
}

export const clearStoredAuth = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY)
  notifyAuthChange()
}

export const registerUser = async (email: string, password: string) => {
  return requestJson('/api/v1/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })
}

export const loginUser = async (email: string, password: string): Promise<AuthTokens> => {
  const form = new URLSearchParams()
  form.set('username', email)
  form.set('password', password)

  return requestJson<AuthTokens>('/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  })
}

export const requestPasswordReset = async (
  email: string
): Promise<PasswordResetResponse> => {
  return requestJson<PasswordResetResponse>('/api/v1/auth/password-reset/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  })
}

export const confirmPasswordReset = async (
  token: string,
  newPassword: string
): Promise<PasswordResetResponse> => {
  return requestJson<PasswordResetResponse>('/api/v1/auth/password-reset/confirm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, new_password: newPassword }),
  })
}

export const getElectraCastAccount = async (token: string): Promise<ElectraCastAccount> => {
  return requestJson<ElectraCastAccount>('/api/v1/electracast/account', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export const updateElectraCastProfile = async (
  token: string,
  payload: Partial<ElectraCastProfile>
): Promise<ElectraCastProfile> => {
  return requestJson<ElectraCastProfile>('/api/v1/electracast/profile', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
}

export const getElectraCastPodcasts = async (
  token: string
): Promise<ElectraCastPodcast[]> => {
  return requestJson<ElectraCastPodcast[]>('/api/v1/electracast/podcasts', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export const createElectraCastPodcast = async (
  token: string,
  payload: ElectraCastPodcastCreate
): Promise<ElectraCastPodcast> => {
  return requestJson<ElectraCastPodcast>('/api/v1/electracast/podcasts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
}
