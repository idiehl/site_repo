import { Link, useParams } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import { podcastsCatalog } from '../data/catalog/podcastsCatalog'

const PodcastDetail = () => {
  const { slug } = useParams()
  const podcast = podcastsCatalog.find((p) => p.slug === slug)

  if (!slug || !podcast) {
    return (
      <section className="section">
        <SectionHeader title="Podcast not found" description="This show isn't in the directory yet." />
        <div className="account-card">
          <Link className="btn ghost" to="/podcasts">
            Back to podcasts
          </Link>
        </div>
      </section>
    )
  }

  const legacyUrl = podcast.legacy_url ?? `https://electracast.com/podcast/${podcast.slug}/`

  return (
    <section className="section">
      <SectionHeader title={podcast.title} description="ElectraCast podcast" />
      <div className="account-card">
        {podcast.cover_image ? (
          <img
            className="podcast-image"
            src={podcast.cover_image}
            alt={`${podcast.title} cover art`}
            loading="lazy"
            style={{ maxWidth: 320, width: '100%', borderRadius: 12, marginBottom: 16 }}
          />
        ) : null}

        {podcast.summary ? <p style={{ marginBottom: 16 }}>{podcast.summary}</p> : null}

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a className="btn primary" href={legacyUrl} target="_blank" rel="noreferrer">
            Listen on ElectraCast
          </a>
          <Link className="btn ghost" to="/podcasts">
            Back to directory
          </Link>
        </div>
      </div>
    </section>
  )
}

export default PodcastDetail

