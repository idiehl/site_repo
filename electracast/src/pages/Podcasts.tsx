import PodcastGrid from '../components/PodcastGrid'
import SectionHeader from '../components/SectionHeader'

const Podcasts = () => {
  return (
    <section className="section">
      <SectionHeader
        title="Podcasts"
        description="Originals and network favorites from ElectraCast."
      />
      <PodcastGrid />
    </section>
  )
}

export default Podcasts
