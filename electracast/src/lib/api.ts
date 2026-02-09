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
  }
  profile: ElectraCastProfile
}

const AUTH_STORAGE_KEY = 'electracast_auth'
const defaultApiBase = import.meta.env.PROD ? 'https://apply.atlasuniversalis.com' : ''
const rawApiBase = import.meta.env.VITE_API_BASE_URL || defaultApiBase
const apiBase = rawApiBase.replace(/\/+$/, '')

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
  const response = await fetch(buildUrl(path), options)
  if (!response.ok) {
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
}

export const clearStoredAuth = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY)
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
