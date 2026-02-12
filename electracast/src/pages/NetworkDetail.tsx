import { Link, useParams } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import PodcastGrid from '../components/PodcastGrid'
import { podcastsCatalog } from '../data/catalog/podcastsCatalog'
import { networksCatalog } from '../data/catalog/networksCatalog'
import type { Podcast } from '../data/podcasts'

const NetworkDetail = () => {
  const { slug } = useParams()
  const network = networksCatalog.find((n) => n.slug === slug)

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
    </section>
  )
}

export default NetworkDetail

