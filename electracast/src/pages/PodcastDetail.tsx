import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import { podcastsCatalog } from '../data/catalog/podcastsCatalog'
type PublicEpisode = {
  id: string
  title: string
  description?: string | null
  published_at?: string | null
  audio_url?: string | null
  duration_seconds?: number | null
}

const PodcastDetail = () => {
  const { slug } = useParams()
  const podcast = podcastsCatalog.find((p) => p.slug === slug)
  const [episodes, setEpisodes] = useState<PublicEpisode[]>([])
  const [episodesStatus, setEpisodesStatus] = useState<'idle' | 'loading' | 'error' | 'ready'>(
    'idle'
  )
  const [currentEpisodeId, setCurrentEpisodeId] = useState<string | null>(null)

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

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setEpisodesStatus('loading')
      try {
        const response = await fetch(`/api/v1/electracast-public/podcasts/${podcast.slug}/episodes`)
        if (!response.ok) {
          throw new Error('Failed to load episodes.')
        }
        const data = (await response.json()) as PublicEpisode[]
        if (cancelled) {
          return
        }
        setEpisodes(data)
        setCurrentEpisodeId(data[0]?.id ?? null)
        setEpisodesStatus('ready')
      } catch (error) {
        if (!cancelled) {
          setEpisodesStatus('error')
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [podcast.slug])

  const currentEpisode = useMemo(() => {
    if (!currentEpisodeId) {
      return null
    }
    return episodes.find((e) => e.id === currentEpisodeId) ?? null
  }, [currentEpisodeId, episodes])

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

        <div style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>Episodes</h3>
          {episodesStatus === 'loading' ? <p>Loading playlist...</p> : null}
          {episodesStatus === 'error' ? (
            <p>Playlist unavailable right now.</p>
          ) : null}
          {episodesStatus === 'ready' && !episodes.length ? (
            <p>Playlist coming soon.</p>
          ) : null}

          {currentEpisode?.audio_url ? (
            <div style={{ marginTop: 12 }}>
              <p style={{ margin: '0 0 8px', color: 'var(--muted)' }}>{currentEpisode.title}</p>
              <audio controls preload="none" style={{ width: '100%' }}>
                <source src={currentEpisode.audio_url} />
              </audio>
            </div>
          ) : null}

          {episodesStatus === 'ready' && episodes.length ? (
            <div style={{ marginTop: 12, maxHeight: 280, overflow: 'auto', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              {episodes.map((episode) => (
                <button
                  key={episode.id}
                  type="button"
                  className="btn ghost"
                  onClick={() => setCurrentEpisodeId(episode.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    marginBottom: 10,
                    borderColor: episode.id === currentEpisodeId ? 'var(--accent)' : undefined,
                  }}
                >
                  {episode.title}
                </button>
              ))}
            </div>
          ) : null}
        </div>

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

