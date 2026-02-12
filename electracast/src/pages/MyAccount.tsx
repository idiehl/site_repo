import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../dashboard/components/DashboardLayout'
import { DashboardDataProvider } from '../dashboard/DashboardDataContext'
import {
  dashboardDefaults,
  Episode,
  Podcaster,
  Submission,
} from '../dashboard/data/mockData'
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

const normalizePodcastStatus = (status: string): Submission['status'] => {
  if (status === 'synced' || status === 'imported') {
    return 'synced'
  }
  if (status === 'pending') {
    return 'pending'
  }
  if (status === 'failed') {
    return 'failed'
  }
  return 'draft'
}

const statusToEpisode = (status: string): Episode['status'] => {
  const normalized = normalizePodcastStatus(status)
  if (normalized === 'synced') {
    return 'published'
  }
  if (normalized === 'pending') {
    return 'scheduled'
  }
  return 'draft'
}

const buildWeeklyActivity = (podcasts: ElectraCastPodcast[]) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const data = days.map((day) => ({ day, submitted: 0, synced: 0 }))

  podcasts.forEach((podcast) => {
    const date = new Date(podcast.created_at)
    if (Number.isNaN(date.getTime())) {
      return
    }
    const index = (date.getDay() + 6) % 7
    data[index].submitted += 1
    if (normalizePodcastStatus(podcast.status) === 'synced') {
      data[index].synced += 1
    }
  })

  return data
}

const buildMonthlySubmissions = (podcasts: ElectraCastPodcast[], months = 6) => {
  const now = new Date()
  const counts = new Map<string, number>()

  podcasts.forEach((podcast) => {
    const date = new Date(podcast.created_at)
    if (Number.isNaN(date.getTime())) {
      return
    }
    const key = `${date.getFullYear()}-${date.getMonth()}`
    counts.set(key, (counts.get(key) ?? 0) + 1)
  })

  return Array.from({ length: months }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (months - 1 - index), 1)
    const key = `${date.getFullYear()}-${date.getMonth()}`
    return {
      month: date.toLocaleString('en-US', { month: 'short' }),
      submissions: counts.get(key) ?? 0,
    }
  })
}

const buildStatusBreakdown = (podcasts: ElectraCastPodcast[]) => {
  const counts = podcasts.reduce(
    (acc, podcast) => {
      const normalized = normalizePodcastStatus(podcast.status)
      acc[normalized] += 1
      return acc
    },
    { synced: 0, pending: 0, failed: 0, draft: 0 }
  )

  const total = podcasts.length || 1
  return [
    {
      label: 'Synced',
      count: counts.synced,
      percentage: Math.round((counts.synced / total) * 100),
    },
    {
      label: 'Pending',
      count: counts.pending,
      percentage: Math.round((counts.pending / total) * 100),
    },
    {
      label: 'Failed',
      count: counts.failed,
      percentage: Math.round((counts.failed / total) * 100),
    },
    {
      label: 'Draft',
      count: counts.draft,
      percentage: Math.round((counts.draft / total) * 100),
    },
  ]
}

const buildTopCategories = (podcasts: ElectraCastPodcast[]) => {
  const counts = new Map<string, number>()
  podcasts.forEach((podcast) => {
    podcast.itunes_categories.forEach((category) => {
      const key = category.trim()
      if (!key) {
        return
      }
      counts.set(key, (counts.get(key) ?? 0) + 1)
    })
  })

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }))
}

const buildHourlySubmissions = (podcasts: ElectraCastPodcast[]) => {
  const buckets = Array.from({ length: 8 }, (_, index) => ({
    hour: `${String(index * 3).padStart(2, '0')}:00`,
    submissions: 0,
  }))

  podcasts.forEach((podcast) => {
    const date = new Date(podcast.created_at)
    if (Number.isNaN(date.getTime())) {
      return
    }
    const bucket = Math.floor(date.getHours() / 3)
    buckets[bucket].submissions += 1
  })

  return buckets
}

const logoUrl =
  'https://electracast.com/wp-content/uploads/2022/02/cropped-ECTEXTLOGOGWLRG%EF%B9%96format1500w-1.png'

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
    const analyticsData =
      podcasts.length > 0
        ? {
            weeklyActivity: buildWeeklyActivity(podcasts),
            monthlySubmissions: buildMonthlySubmissions(podcasts),
            statusBreakdown: buildStatusBreakdown(podcasts),
            topCategories: buildTopCategories(podcasts),
            hourlySubmissions: buildHourlySubmissions(podcasts),
          }
        : dashboardDefaults.analyticsData

    const recentSubmissions: Submission[] =
      podcasts.length > 0
        ? [...podcasts]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
            .map((podcast) => ({
              id: podcast.id,
              title: podcast.title,
              summary: podcast.summary,
              status: normalizePodcastStatus(podcast.status),
              createdAt: podcast.created_at,
            }))
        : dashboardDefaults.recentSubmissions

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
      analyticsData,
      recentSubmissions,
      account,
      podcasts,
      authToken: auth?.access_token ?? null,
      addPodcast,
    }
  }, [account, podcasts, auth, addPodcast])

  if (!auth) {
    return (
      <div className="min-h-screen bg-[#000000] text-[#ffffff] flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-[#0f0f0f] border-4 border-[#C9C16C] p-10 rounded-sm">
          <header className="flex items-center gap-3 mb-6">
            <img src={logoUrl} alt="ElectraCast" className="h-10" />
            <span className="text-xs text-[#b0b0b0] tracking-widest">ACCOUNT PORTAL</span>
          </header>
          <h1
            className="text-3xl text-[#C9C16C] tracking-wider mb-4"
            style={{ fontFamily: 'monospace' }}
          >
            ELECTRACAST DASHBOARD
          </h1>
          <p className="text-[#b0b0b0] mb-8">
            Sign in to access your podcaster profile, episodes, and analytics.
          </p>
          <form className="space-y-4" onSubmit={handleLogin}>
            <label className="block">
              <span className="block text-sm text-[#b0b0b0] mb-2">Email</span>
              <input
                type="email"
                name="email"
                value={loginForm.email}
                onChange={handleLoginChange}
                required
                className="w-full bg-[#000000] border-2 border-[#2a2a2a] text-[#ffffff] px-4 py-3 rounded-sm focus:border-[#C9C16C] outline-none"
              />
            </label>
            <label className="block">
              <span className="block text-sm text-[#b0b0b0] mb-2">Password</span>
              <input
                type="password"
                name="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                required
                className="w-full bg-[#000000] border-2 border-[#2a2a2a] text-[#ffffff] px-4 py-3 rounded-sm focus:border-[#C9C16C] outline-none"
              />
            </label>
            <button
              className="w-full px-6 py-3 bg-[#C9C16C] text-[#000000] border-2 border-[#A89D4C] hover:bg-[#A89D4C] transition-all tracking-wider"
              style={{ fontFamily: 'monospace' }}
              disabled={loading}
              type="submit"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>
          <div className="mt-6 text-sm text-[#b0b0b0]">
            New here?{' '}
            <a className="text-[#C9C16C] hover:underline" href="/register">
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
