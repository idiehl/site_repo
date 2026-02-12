import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { createElectraCastPodcast } from '../../lib/api'
import { useDashboardData } from '../DashboardDataContext'

type StatusMessage = {
  type: 'success' | 'error'
  message: string
}

const languageOptions = [
  { value: 'en', label: 'English (en)' },
  { value: 'en-US', label: 'English (United States) - en-US' },
  { value: 'en-GB', label: 'English (United Kingdom) - en-GB' },
  { value: 'es', label: 'Spanish (es)' },
  { value: 'fr', label: 'French (fr)' },
]

export const CreatePodcast = () => {
  const { authToken, account, addPodcast, podcasts } = useDashboardData()
  const [form, setForm] = useState({
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
    if (!account) {
      return
    }
    setForm((prev) => ({
      ...prev,
      owner_name: account.profile.display_name || prev.owner_name,
      owner_email: account.user.email || prev.owner_email,
    }))
  }, [account])

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!authToken) {
      setStatus({ type: 'error', message: 'Sign in to submit a podcast.' })
      return
    }

    setStatus(null)
    const categories = form.itunesCategories
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)

    if (!categories.length) {
      setStatus({ type: 'error', message: 'Select at least one iTunes category.' })
      return
    }

    setSubmitting(true)
    try {
      const created = await createElectraCastPodcast(authToken, {
        title: form.title.trim(),
        summary: form.summary.trim(),
        subtitle: form.subtitle.trim() || undefined,
        language: form.language || 'en',
        itunes_categories: categories,
        website: form.website.trim() || undefined,
        owner_name: form.owner_name.trim() || undefined,
        owner_email: form.owner_email.trim() || undefined,
        explicit: form.explicit || undefined,
      })
      addPodcast(created)
      setStatus({
        type: 'success',
        message: 'Podcast submitted! We will sync it to Megaphone shortly.',
      })
      setForm((prev) => ({
        ...prev,
        title: '',
        summary: '',
        subtitle: '',
        itunesCategories: '',
      }))
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
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-3xl text-[#C9C16C] tracking-wider"
            style={{ fontFamily: 'monospace' }}
          >
            CREATE PODCAST
          </h2>
          <p className="text-[#b0b0b0] mt-2">
            Submit a new show for review. Approved podcasts will sync to Megaphone.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#0f0f0f] border-4 border-[#C9C16C] p-8 rounded-sm">
          <h3
            className="text-xl text-[#C9C16C] mb-6 tracking-wider"
            style={{ fontFamily: 'monospace' }}
          >
            SHOW DETAILS
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <label className="block col-span-2">
              <span className="block text-sm text-[#b0b0b0] mb-2 tracking-wider">
                PODCAST TITLE
              </span>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full bg-[#000000] border-2 border-[#2a2a2a] text-[#ffffff] px-4 py-3 rounded-sm focus:border-[#C9C16C] outline-none"
              />
            </label>

            <label className="block col-span-2">
              <span className="block text-sm text-[#b0b0b0] mb-2 tracking-wider">
                SHORT SUMMARY
              </span>
              <textarea
                name="summary"
                rows={4}
                value={form.summary}
                onChange={handleChange}
                required
                className="w-full bg-[#000000] border-2 border-[#2a2a2a] text-[#ffffff] px-4 py-3 rounded-sm focus:border-[#C9C16C] outline-none resize-none"
              />
            </label>

            <label className="block col-span-2">
              <span className="block text-sm text-[#b0b0b0] mb-2 tracking-wider">
                SUBTITLE (OPTIONAL)
              </span>
              <input
                type="text"
                name="subtitle"
                value={form.subtitle}
                onChange={handleChange}
                className="w-full bg-[#000000] border-2 border-[#2a2a2a] text-[#ffffff] px-4 py-3 rounded-sm focus:border-[#C9C16C] outline-none"
              />
            </label>

            <label className="block">
              <span className="block text-sm text-[#b0b0b0] mb-2 tracking-wider">
                LANGUAGE
              </span>
              <select
                name="language"
                value={form.language}
                onChange={handleChange}
                className="w-full bg-[#000000] border-2 border-[#2a2a2a] text-[#ffffff] px-4 py-3 rounded-sm focus:border-[#C9C16C] outline-none"
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="block text-sm text-[#b0b0b0] mb-2 tracking-wider">
                EXPLICIT?
              </span>
              <select
                name="explicit"
                value={form.explicit}
                onChange={handleChange}
                className="w-full bg-[#000000] border-2 border-[#2a2a2a] text-[#ffffff] px-4 py-3 rounded-sm focus:border-[#C9C16C] outline-none"
              >
                <option value="clean">Clean</option>
                <option value="explicit">Explicit</option>
              </select>
            </label>

            <label className="block col-span-2">
              <span className="block text-sm text-[#b0b0b0] mb-2 tracking-wider">
                ITUNES CATEGORIES (COMMA-SEPARATED)
              </span>
              <input
                type="text"
                name="itunesCategories"
                value={form.itunesCategories}
                onChange={handleChange}
                placeholder="Business, News, Society & Culture"
                required
                className="w-full bg-[#000000] border-2 border-[#2a2a2a] text-[#ffffff] px-4 py-3 rounded-sm focus:border-[#C9C16C] outline-none"
              />
            </label>

            <label className="block col-span-2">
              <span className="block text-sm text-[#b0b0b0] mb-2 tracking-wider">
                WEBSITE (OPTIONAL)
              </span>
              <input
                type="url"
                name="website"
                value={form.website}
                onChange={handleChange}
                className="w-full bg-[#000000] border-2 border-[#2a2a2a] text-[#ffffff] px-4 py-3 rounded-sm focus:border-[#C9C16C] outline-none"
              />
            </label>
          </div>
        </div>

        <div className="bg-[#0f0f0f] border-4 border-[#2a2a2a] p-8 rounded-sm">
          <h3
            className="text-xl text-[#C9C16C] mb-6 tracking-wider"
            style={{ fontFamily: 'monospace' }}
          >
            OWNER DETAILS
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <label className="block">
              <span className="block text-sm text-[#b0b0b0] mb-2 tracking-wider">
                OWNER NAME
              </span>
              <input
                type="text"
                name="owner_name"
                value={form.owner_name}
                onChange={handleChange}
                className="w-full bg-[#000000] border-2 border-[#2a2a2a] text-[#ffffff] px-4 py-3 rounded-sm focus:border-[#C9C16C] outline-none"
              />
            </label>

            <label className="block">
              <span className="block text-sm text-[#b0b0b0] mb-2 tracking-wider">
                OWNER EMAIL
              </span>
              <input
                type="email"
                name="owner_email"
                value={form.owner_email}
                onChange={handleChange}
                className="w-full bg-[#000000] border-2 border-[#2a2a2a] text-[#ffffff] px-4 py-3 rounded-sm focus:border-[#C9C16C] outline-none"
              />
            </label>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="px-8 py-3 bg-[#C9C16C] text-[#000000] border-2 border-[#A89D4C] hover:bg-[#A89D4C] transition-all tracking-wider"
            style={{ fontFamily: 'monospace' }}
            disabled={submitting}
          >
            {submitting ? 'SUBMITTING...' : 'SUBMIT PODCAST'}
          </button>
          <span className="text-xs text-[#b0b0b0]">
            Required: title, summary, and at least one category.
          </span>
        </div>
        {status ? (
          <p className={status.type === 'error' ? 'text-red-400' : 'text-green-400'}>
            {status.message}
          </p>
        ) : null}
      </form>

      <div className="bg-[#0f0f0f] border border-[#2a2a2a] p-6 rounded-lg">
        <h3 className="text-lg text-[#ffffff] mb-4">Your Podcasts</h3>
        {podcasts.length ? (
          <div className="space-y-3">
            {podcasts.slice(0, 5).map((podcast) => (
              <div
                key={podcast.id}
                className="bg-[#000000] border border-[#2a2a2a] p-4 rounded-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[#ffffff] text-sm">{podcast.title}</p>
                    <p className="text-xs text-[#b0b0b0] line-clamp-1">
                      {podcast.summary}
                    </p>
                  </div>
                  <span className="text-xs text-[#C9C16C] uppercase">
                    {podcast.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#b0b0b0]">
            No podcasts yet. Submit your first show to get started.
          </p>
        )}
      </div>
    </div>
  )
}
