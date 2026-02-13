import { FormEvent, useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import { submitElectraCastIntake } from '../lib/api'

const CustomBranded = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(null)
    setIsSubmitting(true)

    const form = new FormData(event.currentTarget)
    const firstName = String(form.get('firstName') ?? '').trim()
    const lastName = String(form.get('lastName') ?? '').trim()
    const email = String(form.get('email') ?? '').trim()
    const phone = String(form.get('phone') ?? '').trim()
    const message = String(form.get('message') ?? '').trim()
    const website = String(form.get('website') ?? '').trim()

    try {
      const name = `${firstName} ${lastName}`.trim()
      const response = await submitElectraCastIntake({
        form: 'custom-branded-podcasts',
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
        message,
        website: website || undefined,
      })
      setStatus({ type: 'success', message: response.message })
      event.currentTarget.reset()
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Submission failed.'
      setStatus({ type: 'error', message: msg })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="section">
      <SectionHeader
        title="Custom Branded Podcasts"
        description="Strategy, storytelling, and production for brands ready to launch signature audio experiences."
      />
      <div className="account-card">
        <h3>Get in touch</h3>
        <p>
          <a href="#custom-branded-contact">
            Please click here to use the contact form below.
          </a>
        </p>
        <p>Listen to the ECM Production Demo Reel:</p>
        <div className="demo-reel">
          <audio controls preload="none">
            <source
              type="audio/mpeg"
              src="https://electracast.com/wp-content/uploads/2024/06/ECM-Promo-Demo-Reel-Q2-2024-1.mp3"
            />
          </audio>
          <a
            className="btn ghost"
            href="https://electracast.com/wp-content/uploads/2024/06/ECM-Promo-Demo-Reel-Q2-2024-1.mp3"
            target="_blank"
            rel="noreferrer"
          >
            Open audio
          </a>
        </div>
      </div>
      <div id="custom-branded-contact" className="account-card">
        <h3>Contact - ECM Custom Podcasts</h3>
        <p>Contact us for more information.</p>
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Honeypot */}
            <input name="website" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} />
            <label className="form-field">
              <span>First Name</span>
              <input type="text" name="firstName" placeholder="First" />
            </label>
            <label className="form-field">
              <span>Last Name</span>
              <input type="text" name="lastName" placeholder="Last" />
            </label>
            <label className="form-field full">
              <span>Email</span>
              <input type="email" name="email" placeholder="you@company.com" />
            </label>
            <label className="form-field full">
              <span>Phone</span>
              <input type="tel" name="phone" placeholder="(555) 123-4567" />
            </label>
            <label className="form-field full">
              <span>Message</span>
              <textarea
                name="message"
                rows={6}
                placeholder="Tell us about your show goals, timeline, and audience."
              />
            </label>
          </div>
          <div className="form-actions">
            <button className="btn primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
            <span className="form-note">Submissions go to jacob.diehl@electracast.com.</span>
          </div>
          {status ? (
            <p className={`status-message ${status.type}`}>{status.message}</p>
          ) : null}
        </form>
      </div>
    </section>
  )
}

export default CustomBranded
