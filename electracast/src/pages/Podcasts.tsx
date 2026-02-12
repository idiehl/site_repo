import PodcastGrid from '../components/PodcastGrid'
import SectionHeader from '../components/SectionHeader'
import { podcastDirectory } from '../data/podcasts'

const Podcasts = () => {
  return (
    <section className="section">
      <SectionHeader
        title="Podcasts"
        description="Explore the full ElectraCast podcast directory."
      />
      <div className="account-card">
        <h3>Podcast Directory</h3>
        <p>
          Browse the complete ElectraCast catalog. Each show now has an internal
          detail page with its cover art and summary (episodes playlist coming
          next).
        </p>
        <PodcastGrid items={podcastDirectory} />
      </div>
    </section>
  )
}

export default Podcasts
