import MusicGrid from '../components/MusicGrid'
import SectionHeader from '../components/SectionHeader'

const Music = () => {
  return (
    <section className="section">
      <SectionHeader
        title="Music"
        description="Original releases and artist spotlights from ElectraCast."
      />
      <div className="account-card">
        <h3>Pod Till You Drop, Vol. 1</h3>
        <p>
          ElectraCast is proud to announce the release of the first-ever
          original podcast music compilation album, featuring original songs and
          scores from our diverse roster of podcasts.
        </p>
        <p>
          <strong>Available wherever you listen.</strong>
        </p>
      </div>
      <div className="account-card">
        <h3>Featured Releases</h3>
        <p>Explore highlights from the ElectraCast music catalog.</p>
        <MusicGrid />
      </div>
    </section>
  )
}

export default Music
