import { FormEvent, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import PodcastGrid from '../components/PodcastGrid'
import { podcastsCatalog } from '../data/catalog/podcastsCatalog'
import { networksCatalog } from '../data/catalog/networksCatalog'
import type { Podcast } from '../data/podcasts'
import { submitElectraCastIntake } from '../lib/api'

const NetworkDetail = () => {
  const { slug } = useParams()
  const network = networksCatalog.find((n) => n.slug === slug)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  )

  if (!slug || !network) {
    return (
      <section className="section">
        <SectionHeader title="Network not found" description="This network isn't in the directory yet." />
        <div className="account-card">
          <Link className="btn ghost" to="/networks">
            Back to networks
          </Link>
        </div>
      </section>
    )
  }

  const legacyUrl = network.legacy_url ?? `https://electracast.com/network/${network.slug}/`
  const podcastSlugs = network.podcast_slugs ?? []

  const podcasts: Podcast[] = podcastSlugs
    .map((podSlug) => podcastsCatalog.find((p) => p.slug === podSlug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => ({
      title: p.title,
      label: 'Podcast',
      to: `/podcast/${p.slug}`,
      href: p.legacy_url ?? `https://electracast.com/podcast/${p.slug}/`,
      image: p.cover_image ?? undefined,
      summary: p.summary ?? undefined,
    }))

  const handleContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(null)
    setIsSubmitting(true)

    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    const email = String(form.get('email') ?? '').trim()
    const subject = String(form.get('subject') ?? '').trim()
    const message = String(form.get('message') ?? '').trim()
    const website = String(form.get('website') ?? '').trim()

    try {
      const response = await submitElectraCastIntake({
        form: 'network-contact',
        name: name || undefined,
        email: email || undefined,
        subject: subject || `Network contact: ${network.title}`,
        message,
        metadata: {
          network_slug: network.slug,
          network_title: network.title,
          legacy_url: legacyUrl,
        },
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
      <SectionHeader title={network.title} description="ElectraCast network" />
      <div className="resource-grid resource-grid--two-col">
        <div className="account-card">
          {network.description ? <p>{network.description}</p> : <p>Network description coming soon.</p>}
          <div className="account-actions">
            <a className="btn primary" href={legacyUrl} target="_blank" rel="noreferrer">
              View on ElectraCast
            </a>
            <Link className="btn ghost" to="/networks">
              Back to directory
            </Link>
          </div>
        </div>
        <div className="account-card">
          {network.cover_image ? (
            <img
              className="network-image"
              src={network.cover_image}
              alt={`${network.title} artwork`}
              loading="lazy"
              style={{ aspectRatio: '2 / 1' }}
            />
          ) : null}
        </div>
      </div>

      <div className="account-card" style={{ marginTop: 20 }}>
        <h3>Podcasts in this network</h3>
        {podcasts.length ? (
          <PodcastGrid items={podcasts} />
        ) : (
          <p>Podcast list coming soon.</p>
        )}
      </div>

      <div className="account-card" style={{ marginTop: 20 }}>
        <h3>Contact {network.title}</h3>
        <p>Interested in being a guest or partnering with this network? Reach out below.</p>
        <form className="contact-form" onSubmit={handleContactSubmit}>
          <div className="form-grid">
            {/* Honeypot */}
            <input name="website" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} />
            <label className="form-field">
              <span>Name</span>
              <input name="name" type="text" />
            </label>
            <label className="form-field">
              <span>Email</span>
              <input name="email" type="email" />
            </label>
            <label className="form-field full">
              <span>Subject</span>
              <input name="subject" type="text" placeholder={`Contact ${network.title}`} />
            </label>
            <label className="form-field full">
              <span>Message</span>
              <textarea name="message" rows={6} required />
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

export default NetworkDetail

