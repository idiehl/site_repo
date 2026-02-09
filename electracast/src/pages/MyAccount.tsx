import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import {
  clearStoredAuth,
  ElectraCastAccount,
  getElectraCastAccount,
  getStoredAuth,
  loginUser,
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

type StatusMessage = {
  type: 'success' | 'error'
  message: string
}

const MyAccount = () => {
  const [auth, setAuth] = useState(() => getStoredAuth())
  const [account, setAccount] = useState<ElectraCastAccount | null>(null)
  const [loading, setLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [profileForm, setProfileForm] = useState({
    display_name: '',
    handle: '',
    role: '',
    company: '',
    website: '',
    location: '',
    bio: '',
  })
  const [loginStatus, setLoginStatus] = useState<StatusMessage | null>(null)
  const [profileStatus, setProfileStatus] = useState<StatusMessage | null>(null)

  useEffect(() => {
    if (!auth) {
      setAccount(null)
      return
    }

    const loadAccount = async () => {
      setLoading(true)
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

  const handleProfileChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))
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
