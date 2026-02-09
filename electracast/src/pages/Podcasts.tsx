import PodcastGrid from '../components/PodcastGrid'
import SectionHeader from '../components/SectionHeader'
import { featuredPodcasts, podcastDirectory } from '../data/podcasts'

const Podcasts = () => {
  return (
    <section className="section">
      <SectionHeader
        title="Podcasts"
        description="Explore the full ElectraCast podcast directory."
      />
      <div className="account-card">
        <h3>Featured Shows</h3>
        <p>Originals and network favorites from ElectraCast.</p>
        <PodcastGrid items={featuredPodcasts} />
      </div>
      <div className="account-card">
        <h3>Podcast Directory</h3>
        <p>
          Browse the complete ElectraCast catalog. Full detail pages are being
          migrated next.
        </p>
        <PodcastGrid items={podcastDirectory} />
      </div>
    </section>
  )
}

export default Podcasts
