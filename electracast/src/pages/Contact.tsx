import { FormEvent, useState } from 'react'
import ContactCard from '../components/ContactCard'
import SectionHeader from '../components/SectionHeader'
import { submitElectraCastIntake } from '../lib/api'

const Contact = () => {
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
    const message = String(form.get('message') ?? '').trim()
    const website = String(form.get('website') ?? '').trim()

    try {
      const name = `${firstName} ${lastName}`.trim()
      const response = await submitElectraCastIntake({
        form: 'contact',
        name: name || undefined,
        email: email || undefined,
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
        title="Contact"
        description="Let's build your next show together."
      />
      <div className="account-card">
        <h3>Contact ElectraCast</h3>
        <p>
          Share your project details below and the ElectraCast team will follow up.
        </p>
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Honeypot */}
            <input name="website" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} />
            <label className="form-field" htmlFor="contact-first-name">
              First Name
              <input id="contact-first-name" name="firstName" type="text" />
            </label>
            <label className="form-field" htmlFor="contact-last-name">
              Last Name
              <input id="contact-last-name" name="lastName" type="text" />
            </label>
            <label className="form-field" htmlFor="contact-email">
              Email
              <input id="contact-email" name="email" type="email" />
            </label>
            <label className="form-field full" htmlFor="contact-message">
              Message
              <textarea id="contact-message" name="message" rows={6} />
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
      <ContactCard />
    </section>
  )
}

export default Contact
