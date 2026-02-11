import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import {
  clearStoredAuth,
  confirmPasswordReset,
  ElectraCastAccount,
  ElectraCastPodcast,
  createElectraCastPodcast,
  getElectraCastAccount,
  getElectraCastPodcasts,
  getStoredAuth,
  loginUser,
  requestPasswordReset,
  setStoredAuth,
  updateElectraCastProfile,
} from '../lib/api'

const podcasterLinks = [
  {
    label: 'Tips for Starting a Podcast',
    href: 'https://www.businessnewsdaily.com/10327-how-to-start-a-business-podcast.html',
  },
  {
    label:
      'Submit Your Podcast Details To Begin (and get your own official ElectraCast web page)',
    href: 'https://electracast.com/private/podcast-onboarding-form/',
  },
  {
    label: 'Get Ready to Distribute Your Podcast on ElectraCast',
    href: 'https://support.megaphone.fm/en/articles/3566624-new-podcast-checklist',
  },
  {
    label: 'Transfer of Existing Podcast',
    href:
      'https://support.megaphone.fm/en/collections/126940-redirecting-to-megaphone-from-a-previous-host',
  },
  {
    label: 'Download ECM Brand Kit',
    href: 'https://www.electracastmedia.com/documents/ECM_Brand_Kit.zip',
  },
  {
    label: 'Create a New Episode',
    href: 'https://support.megaphone.fm/en/articles/70858-create-an-episode',
  },
  {
    label: 'VIDEO: Creating Episodes Adding Dynamic Ad Locator Markers',
    href: 'https://www.youtube.com/watch?v=hpq1GZNs1Ig',
  },
  {
    label: 'Get Your Own Official Podcast Page on ElectraCast.com',
    href: 'https://electracast.com/private/podcast-onboarding-form/',
  },
  {
    label: 'Get Your Podcast Promoted on ElectraCast',
    href:
      'https://www.electracastmedia.com/documents/Get_Your_Podcast_Promo_on_ElectraCast.pdf',
  },
  {
    label: 'Create Your Podcast Trailer: "Episode Zero"',
    href:
      'https://www.electracastmedia.com/documents/ElectraCast_Podcast_Trailer_Guide_Episode_00.pdf',
  },
  {
    label: 'Megaphone Hosting Support',
    href: 'http://support.megaphone.fm/en/collections/3043077-megaphone-interface-support',
  },
  {
    label: 'Podcast Distribution & Ad Sales Agreement',
    href: 'https://electracast.com/podcast-owner-agreement/',
  },
  {
    label: 'Payment Checkout for Annual Discount',
    href: 'https://electracast.com/payments',
  },
]

const productionLinks = [
  {
    label: 'Production + Post Best Practices & Guidelines.pdf',
    href:
      'https://www.electracastmedia.com/documents/ElectraCast_Master_Productions_+_Post_Guidelines_2024-06-10.pdf',
  },
  {
    label: 'IMPORTANT: Register your new podcast on all platforms',
    href:
      'https://www.electracastmedia.com/documents/ECM_Networks_Podcasts_Platform_RSS_Registrations.pdf',
  },
]

const artistLinks = [
  {
    label: 'Audio Validation Rules for Digital Distribution',
    href:
      'https://www.electracastmedia.com/documents/Audio_Validation_Rules_for_Digital_Distribution.pdf',
  },
  {
    label: 'Download Music Metadata Requirements for Distribution',
    href:
      'https://www.electracastmedia.com/documents/ElectraCast_Distribution_Spec_Requirements_Metadata_Form%20(Locked)%20Q2%202024.xlsx',
  },
]

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

const MyAccount = () => {
  const [auth, setAuth] = useState(() => getStoredAuth())
  const [account, setAccount] = useState<ElectraCastAccount | null>(null)
  const [loading, setLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [resetRequest, setResetRequest] = useState({ email: '' })
  const [resetConfirm, setResetConfirm] = useState({
    token: '',
    password: '',
    confirmPassword: '',
  })
  const [resetTokenHint, setResetTokenHint] = useState<string | null>(null)
  const [resetLoading, setResetLoading] = useState(false)
  const [profileForm, setProfileForm] = useState({
    display_name: '',
    handle: '',
    role: '',
    company: '',
    website: '',
    location: '',
    bio: '',
  })
  const [podcasts, setPodcasts] = useState<ElectraCastPodcast[]>([])
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
  const [podcastLoading, setPodcastLoading] = useState(false)
  const [podcastSubmitting, setPodcastSubmitting] = useState(false)
  const [podcastStatus, setPodcastStatus] = useState<StatusMessage | null>(null)
  const [loginStatus, setLoginStatus] = useState<StatusMessage | null>(null)
  const [profileStatus, setProfileStatus] = useState<StatusMessage | null>(null)
  const [resetStatus, setResetStatus] = useState<StatusMessage | null>(null)

  useEffect(() => {
    if (!auth) {
      setAccount(null)
      return
    }

    const loadAccount = async () => {
      setLoading(true)
      setPodcastLoading(true)
      try {
        const data = await getElectraCastAccount(auth.access_token)
        setAccount(data)
        setProfileForm({
          display_name: data.profile.display_name ?? '',
          handle: data.profile.handle ?? '',
          role: data.profile.role ?? '',
          company: data.profile.company ?? '',
          website: data.profile.website ?? '',
          location: data.profile.location ?? '',
          bio: data.profile.bio ?? '',
        })
        setResetRequest((prev) =>
          prev.email ? prev : { ...prev, email: data.user.email }
        )
        setPodcastForm((prev) => ({
          ...prev,
          owner_name: data.profile.display_name ?? prev.owner_name,
          owner_email: data.user.email ?? prev.owner_email,
        }))
        const podcastData = await getElectraCastPodcasts(auth.access_token)
        setPodcasts(podcastData)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load account.'
        setLoginStatus({ type: 'error', message })
      } finally {
        setLoading(false)
        setPodcastLoading(false)
      }
    }

    loadAccount()
  }, [auth])

  const handleLoginChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setLoginForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleResetRequestChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setResetRequest((prev) => ({ ...prev, [name]: value }))
  }

  const handleResetConfirmChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target
    setResetConfirm((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePodcastChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target
    setPodcastForm((prev) => ({ ...prev, [name]: value }))
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
    setProfileForm({
      display_name: '',
      handle: '',
      role: '',
      company: '',
      website: '',
      location: '',
      bio: '',
    })
    setResetRequest({ email: '' })
    setResetConfirm({ token: '', password: '', confirmPassword: '' })
    setResetTokenHint(null)
    setPodcasts([])
    setPodcastForm({
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
    setPodcastStatus(null)
    setPodcastSubmitting(false)
    setPodcastLoading(false)
  }

  const handleResetRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setResetStatus(null)
    setResetLoading(true)
    try {
      const response = await requestPasswordReset(resetRequest.email.trim())
      setResetStatus({ type: 'success', message: response.message })
      if (response.reset_token) {
        setResetTokenHint(response.reset_token)
        setResetConfirm((prev) => ({ ...prev, token: response.reset_token ?? '' }))
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Password reset request failed.'
      setResetStatus({ type: 'error', message })
    } finally {
      setResetLoading(false)
    }
  }

  const handleResetConfirm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setResetStatus(null)

    if (resetConfirm.password !== resetConfirm.confirmPassword) {
      setResetStatus({ type: 'error', message: 'Passwords do not match.' })
      return
    }

    setResetLoading(true)
    try {
      const response = await confirmPasswordReset(
        resetConfirm.token.trim(),
        resetConfirm.password
      )
      setResetStatus({ type: 'success', message: response.message })
      setResetConfirm({ token: '', password: '', confirmPassword: '' })
      setResetTokenHint(null)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Password reset failed.'
      setResetStatus({ type: 'error', message })
    } finally {
      setResetLoading(false)
    }
  }

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!auth) {
      return
    }
    setProfileStatus(null)
    setLoading(true)
    try {
      const updated = await updateElectraCastProfile(auth.access_token, profileForm)
      setAccount((prev) => (prev ? { ...prev, profile: updated } : prev))
      setProfileStatus({ type: 'success', message: 'Profile updated.' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Profile update failed.'
      setProfileStatus({ type: 'error', message })
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePodcast = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!auth) {
      return
    }
    setPodcastStatus(null)

    const categories = podcastForm.itunesCategories
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)

    if (!categories.length) {
      setPodcastStatus({
        type: 'error',
        message: 'Select at least one iTunes category.',
      })
      return
    }

    setPodcastSubmitting(true)
    try {
      const created = await createElectraCastPodcast(auth.access_token, {
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
      setPodcasts((prev) => [created, ...prev])
      setPodcastForm((prev) => ({
        ...prev,
        title: '',
        summary: '',
        subtitle: '',
        itunesCategories: '',
      }))
      setPodcastStatus({
        type: 'success',
        message: 'Podcast submitted! We will sync it to Megaphone shortly.',
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Podcast creation failed.'
      setPodcastStatus({ type: 'error', message })
    } finally {
      setPodcastSubmitting(false)
    }
  }

  const memberSince = account?.user.created_at
    ? new Date(account.user.created_at).toLocaleDateString()
    : null
  const podcastCount = podcasts.length

  return (
    <section className="section">
      <SectionHeader
        title="My ElectraCast Account"
        description="Account access, onboarding resources, and production guidelines."
      />

      <div className="account-card">
        <h3>Account access</h3>
        <p>
          The legacy ElectraCast login is still available while we finish the new
          portal experience. Use the legacy login for existing accounts, or register
          for updates on the rebuild.
        </p>
        <div className="account-actions">
          <a
            className="btn primary"
            href="https://electracast.com/account/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open legacy login
          </a>
          <a className="btn ghost" href="/register">
            Register for updates
          </a>
        </div>
      </div>

      <div className="account-card">
        <h3>New portal login</h3>
        {auth ? (
          <>
            <p>
              Signed in as <strong>{account?.user.email ?? 'loading...'}</strong>.
            </p>
            <div className="account-actions">
              <button className="btn ghost" type="button" onClick={handleLogout}>
                Sign out
              </button>
            </div>
          </>
        ) : (
          <form className="contact-form" onSubmit={handleLogin}>
            <div className="form-grid">
              <label className="form-field full">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  required
                />
              </label>
              <label className="form-field full">
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  required
                />
              </label>
            </div>
            <div className="form-actions">
              <button className="btn" type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
              <span className="form-note">Use your new ElectraCast account credentials.</span>
            </div>
          </form>
        )}
        {loginStatus ? (
          <p className={`status-message ${loginStatus.type}`}>{loginStatus.message}</p>
        ) : null}
      </div>

      <div className="account-card" id="password-reset">
        <h3>Password reset</h3>
        <p>
          Request a reset link to update your password. During development we will show
          the reset token below.
        </p>
        <form className="contact-form" onSubmit={handleResetRequest}>
          <div className="form-grid">
            <label className="form-field full">
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={resetRequest.email}
                onChange={handleResetRequestChange}
                required
              />
            </label>
          </div>
          <div className="form-actions">
            <button className="btn ghost" type="submit" disabled={resetLoading}>
              {resetLoading ? 'Requesting...' : 'Send reset link'}
            </button>
          </div>
        </form>
        {resetTokenHint ? (
          <p className="form-note">Dev reset token: {resetTokenHint}</p>
        ) : null}
        <form className="contact-form" onSubmit={handleResetConfirm}>
          <div className="form-grid">
            <label className="form-field full">
              <span>Reset Token</span>
              <input
                type="text"
                name="token"
                value={resetConfirm.token}
                onChange={handleResetConfirmChange}
                required
              />
            </label>
            <label className="form-field full">
              <span>New Password</span>
              <input
                type="password"
                name="password"
                value={resetConfirm.password}
                onChange={handleResetConfirmChange}
                required
              />
            </label>
            <label className="form-field full">
              <span>Confirm Password</span>
              <input
                type="password"
                name="confirmPassword"
                value={resetConfirm.confirmPassword}
                onChange={handleResetConfirmChange}
                required
              />
            </label>
          </div>
          <div className="form-actions">
            <button className="btn" type="submit" disabled={resetLoading}>
              {resetLoading ? 'Updating...' : 'Set new password'}
            </button>
            <span className="form-note">Passwords must be at least 8 characters.</span>
          </div>
        </form>
        {resetStatus ? (
          <p className={`status-message ${resetStatus.type}`}>{resetStatus.message}</p>
        ) : null}
      </div>

      {auth ? (
        <div className="account-card">
          <h3>ElectraCast profile</h3>
          <form className="contact-form" onSubmit={handleProfileSubmit}>
            <div className="form-grid">
              <label className="form-field">
                <span>Display Name</span>
                <input
                  type="text"
                  name="display_name"
                  value={profileForm.display_name}
                  onChange={handleProfileChange}
                />
              </label>
              <label className="form-field">
                <span>Handle</span>
                <input
                  type="text"
                  name="handle"
                  value={profileForm.handle}
                  onChange={handleProfileChange}
                />
              </label>
              <label className="form-field full">
                <span>Role</span>
                <input
                  type="text"
                  name="role"
                  value={profileForm.role}
                  onChange={handleProfileChange}
                />
              </label>
              <label className="form-field">
                <span>Company</span>
                <input
                  type="text"
                  name="company"
                  value={profileForm.company}
                  onChange={handleProfileChange}
                />
              </label>
              <label className="form-field">
                <span>Website</span>
                <input
                  type="text"
                  name="website"
                  value={profileForm.website}
                  onChange={handleProfileChange}
                />
              </label>
              <label className="form-field">
                <span>Location</span>
                <input
                  type="text"
                  name="location"
                  value={profileForm.location}
                  onChange={handleProfileChange}
                />
              </label>
              <label className="form-field full">
                <span>Bio</span>
                <textarea
                  name="bio"
                  rows={5}
                  value={profileForm.bio}
                  onChange={handleProfileChange}
                />
              </label>
            </div>
            <div className="form-actions">
              <button className="btn" type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save profile'}
              </button>
              <span className="form-note">
                This info powers your ElectraCast creator profile.
              </span>
            </div>
            {profileStatus ? (
              <p className={`status-message ${profileStatus.type}`}>
                {profileStatus.message}
              </p>
            ) : null}
          </form>
        </div>
      ) : null}

      {auth ? (
        <div className="resource-grid">
          <div className="account-card">
            <h3>Dashboard overview</h3>
            <div className="form-grid">
              <div className="form-field">
                <span>Account email</span>
                <strong>{account?.user.email ?? 'Loading...'}</strong>
              </div>
              <div className="form-field">
                <span>Member since</span>
                <strong>{memberSince ?? 'N/A'}</strong>
              </div>
              <div className="form-field">
                <span>Plan</span>
                <strong>{account?.user.subscription_tier ?? 'Free'}</strong>
              </div>
              <div className="form-field">
                <span>Podcasts</span>
                <strong>{podcastCount}</strong>
              </div>
            </div>
            <div className="form-actions">
              <a className="btn ghost" href="/register">
                Add another member
              </a>
              <a className="btn ghost" href="/contact">
                Contact support
              </a>
            </div>
          </div>

          <div className="account-card">
            <h3>Create a podcast</h3>
            <p className="form-note">
              We will review your submission and sync it to Megaphone once approved.
            </p>
            <form className="contact-form" onSubmit={handleCreatePodcast}>
              <div className="form-grid">
                <label className="form-field full">
                  <span>Podcast title</span>
                  <input
                    type="text"
                    name="title"
                    value={podcastForm.title}
                    onChange={handlePodcastChange}
                    required
                  />
                </label>
                <label className="form-field full">
                  <span>Short summary</span>
                  <textarea
                    name="summary"
                    rows={4}
                    value={podcastForm.summary}
                    onChange={handlePodcastChange}
                    required
                  />
                </label>
                <label className="form-field full">
                  <span>Subtitle (optional)</span>
                  <input
                    type="text"
                    name="subtitle"
                    value={podcastForm.subtitle}
                    onChange={handlePodcastChange}
                  />
                </label>
                <label className="form-field">
                  <span>Language</span>
                  <select
                    name="language"
                    value={podcastForm.language}
                    onChange={handlePodcastChange}
                  >
                    {languageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="form-field">
                  <span>Explicit?</span>
                  <select
                    name="explicit"
                    value={podcastForm.explicit}
                    onChange={handlePodcastChange}
                  >
                    <option value="clean">Clean</option>
                    <option value="explicit">Explicit</option>
                  </select>
                </label>
                <label className="form-field full">
                  <span>iTunes categories (comma-separated)</span>
                  <input
                    type="text"
                    name="itunesCategories"
                    placeholder="Business, News, Society & Culture"
                    value={podcastForm.itunesCategories}
                    onChange={handlePodcastChange}
                    required
                  />
                </label>
                <label className="form-field full">
                  <span>Website</span>
                  <input
                    type="url"
                    name="website"
                    value={podcastForm.website}
                    onChange={handlePodcastChange}
                  />
                </label>
                <label className="form-field">
                  <span>Owner name</span>
                  <input
                    type="text"
                    name="owner_name"
                    value={podcastForm.owner_name}
                    onChange={handlePodcastChange}
                  />
                </label>
                <label className="form-field">
                  <span>Owner email</span>
                  <input
                    type="email"
                    name="owner_email"
                    value={podcastForm.owner_email}
                    onChange={handlePodcastChange}
                  />
                </label>
              </div>
              <div className="form-actions">
                <button className="btn" type="submit" disabled={podcastSubmitting}>
                  {podcastSubmitting ? 'Submitting...' : 'Submit podcast'}
                </button>
                <span className="form-note">
                  Required: title, summary, and at least one category.
                </span>
              </div>
              {podcastStatus ? (
                <p className={`status-message ${podcastStatus.type}`}>
                  {podcastStatus.message}
                </p>
              ) : null}
            </form>
          </div>

          <div className="account-card">
            <h3>Your podcasts</h3>
            {podcastLoading ? (
              <p className="form-note">Loading podcasts...</p>
            ) : podcasts.length ? (
              <div className="podcast-grid">
                {podcasts.map((podcast) => (
                  <article className="podcast-card" key={podcast.id}>
                    <h4>{podcast.title}</h4>
                    <p className="form-note">{podcast.summary}</p>
                    <p className="form-note">
                      Status: <strong>{podcast.status}</strong>
                    </p>
                    {podcast.megaphone_podcast_id ? (
                      <p className="form-note">
                        Megaphone ID: {podcast.megaphone_podcast_id}
                      </p>
                    ) : null}
                    {podcast.sync_error ? (
                      <p className="status-message error">{podcast.sync_error}</p>
                    ) : null}
                    <p className="form-note">
                      Categories: {podcast.itunes_categories.join(', ')}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="form-note">
                No podcasts yet. Submit your first show to get started.
              </p>
            )}
          </div>
        </div>
      ) : null}

      <div className="resource-grid">
        <div className="account-card">
          <h3>Podcaster helpful links</h3>
          <ul className="resource-list">
            {podcasterLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="account-card">
          <h3>ElectraCast production + guidelines</h3>
          <ul className="resource-list">
            {productionLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="account-card">
          <h3>ElectraCast Records artist links</h3>
          <ul className="resource-list">
            {artistLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default MyAccount
