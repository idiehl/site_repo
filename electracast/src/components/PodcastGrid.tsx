import { featuredPodcasts } from '../data/podcasts'

const PodcastGrid = () => {
  return (
    <div className="podcast-grid">
      {featuredPodcasts.map((podcast) => (
        <article key={podcast.title} className="podcast-card">
          <h3>{podcast.title}</h3>
          <p>{podcast.label}</p>
          <button className="btn ghost" type="button">
            Listen
          </button>
        </article>
      ))}
    </div>
  )
}

export default PodcastGrid
