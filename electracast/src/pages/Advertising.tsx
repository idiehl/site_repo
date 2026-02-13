import { FormEvent, useState } from 'react'
import ContactCard from '../components/ContactCard'
import SectionHeader from '../components/SectionHeader'
import { advertiserLogosLeft, advertiserLogosRight } from '../data/advertisers'
import { submitElectraCastIntake } from '../lib/api'

const Advertising = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(null)
    setIsSubmitting(true)

    const form = new FormData(event.currentTarget)
    const payload = {
      company: String(form.get('company') ?? '').trim(),
      firstName: String(form.get('firstName') ?? '').trim(),
      lastName: String(form.get('lastName') ?? '').trim(),
      email: String(form.get('email') ?? '').trim(),
      phone: String(form.get('phone') ?? '').trim(),
      budget: String(form.get('budget') ?? '').trim(),
      startDate: String(form.get('startDate') ?? '').trim(),
      message: String(form.get('message') ?? '').trim(),
      website: String(form.get('website') ?? '').trim(),
    }

    try {
      const name = `${payload.firstName} ${payload.lastName}`.trim()
      const response = await submitElectraCastIntake({
        form: 'advertising',
        name: name || undefined,
        email: payload.email || undefined,
        phone: payload.phone || undefined,
        subject: payload.company ? `Advertising inquiry: ${payload.company}` : 'Advertising inquiry',
        message: payload.message || '(no message provided)',
        metadata: {
          company: payload.company || undefined,
          budget: payload.budget || undefined,
          startDate: payload.startDate || undefined,
        },
        website: payload.website || undefined,
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
        title="Advertising"
        description="Reach engaged listeners across the ElectraCast network."
      />
      <div className="account-card">
        <h3>Heard On Our Podcasts</h3>
        <div className="advertising-rails">
          <div className="advertising-rail" aria-label="Advertiser logos (left)">
            {advertiserLogosLeft.map((logo) => (
              <div key={logo.name} className="advertising-logo">
                {logo.imageSrc ? (
                  <img src={logo.imageSrc} alt={logo.name} loading="lazy" />
                ) : (
                  <span>{logo.name}</span>
                )}
              </div>
            ))}
          </div>
          <div className="advertising-rails-center">
            <p style={{ marginTop: 0 }}>
              Logos are being curated and will be replaced with official brand assets.
            </p>
            <p style={{ color: 'var(--muted)' }}>
              Interested in sponsoring? Use the inquiry form below.
            </p>
          </div>
          <div className="advertising-rail" aria-label="Advertiser logos (right)">
            {advertiserLogosRight.map((logo) => (
              <div key={logo.name} className="advertising-logo">
                {logo.imageSrc ? (
                  <img src={logo.imageSrc} alt={logo.name} loading="lazy" />
                ) : (
                  <span>{logo.name}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="account-card">
        <h3>Advertiser Inquiry</h3>
        <p>
          Tell us about your campaign and we will follow up with sponsorship and
          cross-promotional options.
        </p>
        <form className="advertising-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Honeypot */}
            <input name="website" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} />
            <label className="form-field" htmlFor="advertiser-company">
              Company Name
              <input id="advertiser-company" name="company" type="text" />
            </label>
            <label className="form-field" htmlFor="advertiser-first-name">
              Contact First Name
              <input id="advertiser-first-name" name="firstName" type="text" />
            </label>
            <label className="form-field" htmlFor="advertiser-last-name">
              Contact Last Name
              <input id="advertiser-last-name" name="lastName" type="text" />
            </label>
            <label className="form-field" htmlFor="advertiser-email">
              Email
              <input id="advertiser-email" name="email" type="email" />
            </label>
            <label className="form-field" htmlFor="advertiser-phone">
              Phone
              <input id="advertiser-phone" name="phone" type="tel" />
            </label>
            <label className="form-field" htmlFor="advertiser-budget">
              Approximate Budget
              <input id="advertiser-budget" name="budget" type="text" />
            </label>
            <label className="form-field" htmlFor="advertiser-start-date">
              Desired Start Date
              <input id="advertiser-start-date" name="startDate" type="text" placeholder="MM/DD/YYYY" />
            </label>
            <label className="form-field full" htmlFor="advertiser-message">
              Message / Instructions
              <textarea id="advertiser-message" name="message" rows={6} />
            </label>
          </div>
          <div className="form-actions">
            <button className="btn primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
            <span className="form-note">
              Submissions go to jacob.diehl@electracast.com.
            </span>
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

export default Advertising
