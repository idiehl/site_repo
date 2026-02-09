import { ChangeEvent, FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import {
  loginUser,
  registerUser,
  setStoredAuth,
  updateElectraCastProfile,
} from '../lib/api'

const Register = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  )
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(null)

    if (form.password !== form.confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' })
      return
    }

    setIsSubmitting(true)
    try {
      await registerUser(form.email.trim(), form.password)
      const tokens = await loginUser(form.email.trim(), form.password)
      setStoredAuth(tokens)

      const displayName = `${form.firstName} ${form.lastName}`.trim()
      const handle = form.username.trim()
      if (displayName || handle) {
        await updateElectraCastProfile(tokens.access_token, {
          display_name: displayName || undefined,
          handle: handle || undefined,
        })
      }

      setStatus({ type: 'success', message: 'Account created. Redirecting to your dashboard.' })
      navigate('/account')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed.'
      setStatus({ type: 'error', message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="section">
      <SectionHeader
        title="Register"
        description="Welcome to ElectraCast. Join the community and start podcasting."
      />
      <div className="account-card">
        <p>
          <strong>Welcome to ElectraCast.</strong>
        </p>
        <ul className="resource-list">
          <li>We invite you to become a valued member of our community.</li>
          <li>
            Sign up for free, gain access to your own dashboard and start
            podcasting.
          </li>
        </ul>
        <p>
          Already a member? <a href="/account">Log in</a> or{' '}
          <a href="/account#password-reset">reset your password</a>.
        </p>
      </div>
      <div className="account-card">
        <h3>Create your account</h3>
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="form-field">
              <span>First Name</span>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
              />
            </label>
            <label className="form-field">
              <span>Last Name</span>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
              />
            </label>
            <label className="form-field full">
              <span>Username</span>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
              />
            </label>
            <label className="form-field full">
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>
            <label className="form-field full">
              <span>Password</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </label>
            <label className="form-field full">
              <span>Confirm Password</span>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </label>
          </div>
          <div className="form-actions">
            <button className="btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Join ElectraCast'}
            </button>
            <span className="form-note">Passwords must be at least 8 characters.</span>
          </div>
          {status ? (
            <p className={`status-message ${status.type}`}>{status.message}</p>
          ) : null}
        </form>
      </div>
    </section>
  )
}

export default Register
