import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../dashboard/components/DashboardLayout'
import { DashboardDataProvider } from '../dashboard/DashboardDataContext'
import { dashboardDefaults, Episode, Podcaster } from '../dashboard/data/mockData'
import {
  clearStoredAuth,
  ElectraCastAccount,
  ElectraCastPodcast,
  getElectraCastAccount,
  getElectraCastPodcasts,
  getStoredAuth,
  loginUser,
  setStoredAuth,
} from '../lib/api'

type StatusMessage = {
  type: 'success' | 'error'
  message: string
}

const statusToEpisode = (status: string): Episode['status'] => {
  if (status === 'synced' || status === 'imported') {
    return 'published'
  }
  if (status === 'pending') {
    return 'scheduled'
  }
  return 'draft'
}

const MyAccount = () => {
  const navigate = useNavigate()
  const [auth, setAuth] = useState(() => getStoredAuth())
  const [account, setAccount] = useState<ElectraCastAccount | null>(null)
  const [podcasts, setPodcasts] = useState<ElectraCastPodcast[]>([])
  const [loading, setLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [loginStatus, setLoginStatus] = useState<StatusMessage | null>(null)
  const addPodcast = useCallback((podcast: ElectraCastPodcast) => {
    setPodcasts((prev) => [podcast, ...prev])
  }, [])

  useEffect(() => {
    if (!auth) {
      setAccount(null)
      setPodcasts([])
      return
    }

    const loadAccount = async () => {
      setLoading(true)
      try {
        const data = await getElectraCastAccount(auth.access_token)
        setAccount(data)
        const podcastData = await getElectraCastPodcasts(auth.access_token)
        setPodcasts(podcastData)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load account.'
        setLoginStatus({ type: 'error', message })
      } finally {
        setLoading(false)
      }
    }

    loadAccount()
  }, [auth])

  const handleLoginChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setLoginForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoginStatus(null)
    setLoading(true)
    try {
      const tokens = await loginUser(loginForm.email.trim(), loginForm.password)
      setStoredAuth(tokens)
      setAuth(tokens)
      setLoginStatus({ type: 'success', message: 'Signed in successfully.' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed.'
      setLoginStatus({ type: 'error', message })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    clearStoredAuth()
    setAuth(null)
    setAccount(null)
    setPodcasts([])
    navigate('/account')
  }

  const dashboardData = useMemo(() => {
    const podcaster: Podcaster = {
      ...dashboardDefaults.podcaster,
      name:
        account?.profile.display_name ||
        account?.user.email?.split('@')[0] ||
        dashboardDefaults.podcaster.name,
      podcastName: podcasts[0]?.title || dashboardDefaults.podcaster.podcastName,
      avatar: account?.profile.avatar_url || dashboardDefaults.podcaster.avatar,
      joinDate: account?.user.created_at || dashboardDefaults.podcaster.joinDate,
      bio: account?.profile.bio || dashboardDefaults.podcaster.bio,
      totalEpisodes: podcasts.length || dashboardDefaults.podcaster.totalEpisodes,
    }

    const mappedEpisodes =
      podcasts.length > 0
        ? podcasts.map((podcast) => ({
            id: podcast.id,
            title: podcast.title,
            description: podcast.summary,
            duration: '00:00',
            publishDate: podcast.created_at,
            listens: 0,
            status: statusToEpisode(podcast.status),
          }))
        : dashboardDefaults.episodes

    return {
      ...dashboardDefaults,
      podcaster,
      episodes: mappedEpisodes,
      account,
      podcasts,
      authToken: auth?.access_token ?? null,
      addPodcast,
    }
  }, [account, podcasts, auth, addPodcast])

  if (!auth) {
    return (
      <div className="min-h-screen bg-[#070B1A] text-[#BCC5D0] flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-[#0B1226] border-4 border-[#C89E3E] p-10 rounded-sm">
          <h1
            className="text-3xl text-[#D4A94E] tracking-wider mb-4"
            style={{ fontFamily: 'monospace' }}
          >
            ELECTRACAST DASHBOARD
          </h1>
          <p className="text-[#8A94A6] mb-8">
            Sign in to access your podcaster profile, episodes, and analytics.
          </p>
          <form className="space-y-4" onSubmit={handleLogin}>
            <label className="block">
              <span className="block text-sm text-[#8A94A6] mb-2">Email</span>
              <input
                type="email"
                name="email"
                value={loginForm.email}
                onChange={handleLoginChange}
                required
                className="w-full bg-[#070B1A] border-2 border-[#1D1B35] text-[#EEFCF1] px-4 py-3 rounded-sm focus:border-[#C89E3E] outline-none"
              />
            </label>
            <label className="block">
              <span className="block text-sm text-[#8A94A6] mb-2">Password</span>
              <input
                type="password"
                name="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                required
                className="w-full bg-[#070B1A] border-2 border-[#1D1B35] text-[#EEFCF1] px-4 py-3 rounded-sm focus:border-[#C89E3E] outline-none"
              />
            </label>
            <button
              className="w-full px-6 py-3 bg-[#C89E3E] text-[#070B1A] border-2 border-[#D4A94E] hover:bg-[#D4A94E] transition-all tracking-wider"
              style={{ fontFamily: 'monospace' }}
              disabled={loading}
              type="submit"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>
          <div className="mt-6 text-sm text-[#8A94A6]">
            New here?{' '}
            <a className="text-[#D4A94E] hover:underline" href="/register">
              Create an account
            </a>
            .
          </div>
          {loginStatus ? (
            <p className={`mt-4 text-sm ${loginStatus.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
              {loginStatus.message}
            </p>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <DashboardDataProvider value={dashboardData}>
      <DashboardLayout onLogout={handleLogout} />
    </DashboardDataProvider>
  )
}

export default MyAccount
