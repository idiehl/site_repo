import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { createElectraCastPodcast } from '../../lib/api'
import { useDashboardData } from '../DashboardDataContext'

const languageOptions = [
  { value: 'en', label: 'English (en)' },
  { value: 'en-US', label: 'English (United States) - en-US' },
  { value: 'en-GB', label: 'English (United Kingdom) - en-GB' },
  { value: 'es', label: 'Spanish (es)' },
  { value: 'fr', label: 'French (fr)' },
]

type StatusMessage = {
  type: 'success' | 'error'
  message: string
}

export const CreatePodcast = () => {
  const { authToken, account, addPodcast, podcasts } = useDashboardData()
  const [podcastForm, setPodcastForm] = useState({
    title: '',
    summary: '',
    subtitle: '',
    language: 'en',
    itunesCategories: '',
    website: '',
    owner_name: '',
    owner_email: '',
    explicit: 'clean',
  })
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<StatusMessage | null>(null)

  useEffect(() => {
    setPodcastForm((prev) => ({
      ...prev,
      owner_name: account?.profile.display_name ?? prev.owner_name,
      owner_email: account?.user.email ?? prev.owner_email,
    }))
  }, [account])

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target
    setPodcastForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!authToken) {
      return
    }

    setStatus(null)
    const categories = podcastForm.itunesCategories
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)

    if (!categories.length) {
      setStatus({
        type: 'error',
        message: 'Select at least one iTunes category.',
      })
      return
    }

    setSubmitting(true)
    try {
      const created = await createElectraCastPodcast(authToken, {
        title: podcastForm.title.trim(),
        summary: podcastForm.summary.trim(),
        subtitle: podcastForm.subtitle.trim() || undefined,
        language: podcastForm.language || 'en',
        itunes_categories: categories,
        website: podcastForm.website.trim() || undefined,
        owner_name: podcastForm.owner_name.trim() || undefined,
        owner_email: podcastForm.owner_email.trim() || undefined,
        explicit: podcastForm.explicit || undefined,
      })
      addPodcast(created)
      setPodcastForm((prev) => ({
        ...prev,
        title: '',
        summary: '',
        subtitle: '',
        itunesCategories: '',
        website: '',
      }))
      setStatus({
        type: 'success',
        message: 'Podcast submitted! We will sync it to Megaphone shortly.',
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Podcast creation failed.'
      setStatus({ type: 'error', message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <h2
        className="text-3xl text-[#D4A94E] tracking-wider"
        style={{ fontFamily: 'monospace' }}
      >
        CREATE PODCAST
      </h2>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#0B1226] border-4 border-[#C89E3E] p-8 rounded-sm">
          <h3
            className="text-xl text-[#D4A94E] mb-2 tracking-wider"
            style={{ fontFamily: 'monospace' }}
          >
            PODCAST DETAILS
          </h3>
          <p className="text-[#8A94A6] mb-6">
            Submit a new show and we’ll sync it to Megaphone once approved.
          </p>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="block text-sm text-[#8A94A6] mb-2">Podcast title</span>
              <input
                type="text"
                name="title"
                value={podcastForm.title}
                onChange={handleChange}
                required
                className="w-full bg-[#070B1A] border-2 border-[#1D1B35] text-[#EEFCF1] px-4 py-3 rounded-sm focus:border-[#C89E3E] outline-none"
              />
            </label>
            <label className="block">
              <span className="block text-sm text-[#8A94A6] mb-2">Short summary</span>
              <textarea
                name="summary"
                rows={4}
                value={podcastForm.summary}
                onChange={handleChange}
                required
                className="w-full bg-[#070B1A] border-2 border-[#1D1B35] text-[#EEFCF1] px-4 py-3 rounded-sm focus:border-[#C89E3E] outline-none"
              />
            </label>
            <label className="block">
              <span className="block text-sm text-[#8A94A6] mb-2">Subtitle</span>
              <input
                type="text"
                name="subtitle"
                value={podcastForm.subtitle}
                onChange={handleChange}
                className="w-full bg-[#070B1A] border-2 border-[#1D1B35] text-[#EEFCF1] px-4 py-3 rounded-sm focus:border-[#C89E3E] outline-none"
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm text-[#8A94A6] mb-2">Language</span>
                <select
                  name="language"
                  value={podcastForm.language}
                  onChange={handleChange}
                  className="w-full bg-[#070B1A] border-2 border-[#1D1B35] text-[#EEFCF1] px-4 py-3 rounded-sm focus:border-[#C89E3E] outline-none"
                >
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="block text-sm text-[#8A94A6] mb-2">Explicit?</span>
                <select
                  name="explicit"
                  value={podcastForm.explicit}
                  onChange={handleChange}
                  className="w-full bg-[#070B1A] border-2 border-[#1D1B35] text-[#EEFCF1] px-4 py-3 rounded-sm focus:border-[#C89E3E] outline-none"
                >
                  <option value="clean">Clean</option>
                  <option value="explicit">Explicit</option>
                </select>
              </label>
            </div>
            <label className="block">
              <span className="block text-sm text-[#8A94A6] mb-2">
                iTunes categories (comma-separated)
              </span>
              <input
                type="text"
                name="itunesCategories"
                placeholder="Business, News, Society & Culture"
                value={podcastForm.itunesCategories}
                onChange={handleChange}
                required
                className="w-full bg-[#070B1A] border-2 border-[#1D1B35] text-[#EEFCF1] px-4 py-3 rounded-sm focus:border-[#C89E3E] outline-none"
              />
            </label>
            <label className="block">
              <span className="block text-sm text-[#8A94A6] mb-2">Website</span>
              <input
                type="url"
                name="website"
                value={podcastForm.website}
                onChange={handleChange}
                className="w-full bg-[#070B1A] border-2 border-[#1D1B35] text-[#EEFCF1] px-4 py-3 rounded-sm focus:border-[#C89E3E] outline-none"
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm text-[#8A94A6] mb-2">Owner name</span>
                <input
                  type="text"
                  name="owner_name"
                  value={podcastForm.owner_name}
                  onChange={handleChange}
                  className="w-full bg-[#070B1A] border-2 border-[#1D1B35] text-[#EEFCF1] px-4 py-3 rounded-sm focus:border-[#C89E3E] outline-none"
                />
              </label>
              <label className="block">
                <span className="block text-sm text-[#8A94A6] mb-2">Owner email</span>
                <input
                  type="email"
                  name="owner_email"
                  value={podcastForm.owner_email}
                  onChange={handleChange}
                  className="w-full bg-[#070B1A] border-2 border-[#1D1B35] text-[#EEFCF1] px-4 py-3 rounded-sm focus:border-[#C89E3E] outline-none"
                />
              </label>
            </div>
            <button
              className="w-full px-6 py-3 bg-[#C89E3E] text-[#070B1A] border-2 border-[#D4A94E] hover:bg-[#D4A94E] transition-all tracking-wider"
              style={{ fontFamily: 'monospace' }}
              disabled={submitting}
              type="submit"
            >
              {submitting ? 'SUBMITTING...' : 'SUBMIT PODCAST'}
            </button>
          </form>
          {status ? (
            <div
              className={`mt-4 flex items-start gap-2 text-sm ${
                status.type === 'success' ? 'text-green-300' : 'text-red-300'
              }`}
            >
              {status.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 mt-0.5" />
              )}
              <span>{status.message}</span>
            </div>
          ) : null}
        </div>

        <div className="bg-[#0B1226] border-4 border-[#C89E3E] p-8 rounded-sm">
          <h3
            className="text-xl text-[#D4A94E] mb-6 tracking-wider"
            style={{ fontFamily: 'monospace' }}
          >
            YOUR PODCASTS
          </h3>
          {podcasts.length ? (
            <div className="space-y-4">
              {podcasts.map((podcast) => (
                <div
                  key={podcast.id}
                  className="bg-[#070B1A] border border-[#1D1B35] p-4 rounded-sm"
                >
                  <h4 className="text-[#EEFCF1]">{podcast.title}</h4>
                  <p className="text-xs text-[#8A94A6] mb-2">{podcast.summary}</p>
                  <span className="text-xs text-[#D4A94E] uppercase">
                    {podcast.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#8A94A6]">
              No podcasts yet. Submit your first show to get started.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
