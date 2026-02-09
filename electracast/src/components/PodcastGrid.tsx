import { Podcast, featuredPodcasts } from '../data/podcasts'

type PodcastGridProps = {
  items?: Podcast[]
}

const PodcastGrid = ({ items = featuredPodcasts }: PodcastGridProps) => {
  return (
    <div className="podcast-grid">
      {items.map((podcast) => (
        <article key={podcast.title} className="podcast-card">
          {podcast.image ? (
            <img
              className="podcast-image"
              src={podcast.image}
              alt={`${podcast.title} cover art`}
              loading="lazy"
            />
          ) : null}
          <h3>{podcast.title}</h3>
          <p>{podcast.label}</p>
          {podcast.href ? (
            <a className="btn ghost" href={podcast.href} target="_blank" rel="noreferrer">
              View show
            </a>
          ) : (
            <button className="btn ghost" type="button">
              Listen
            </button>
          )}
        </article>
      ))}
    </div>
  )
}

export default PodcastGrid
