import MusicGrid from '../components/MusicGrid'
import SectionHeader from '../components/SectionHeader'

const Music = () => {
  const spotifyAlbumUrl = 'https://open.spotify.com/album/73lTu9oRyGYpJ2uoqrtuHg'
  const spotifyEmbedUrl = 'https://open.spotify.com/embed/album/73lTu9oRyGYpJ2uoqrtuHg'

  return (
    <section className="section">
      <SectionHeader
        title="Music"
        description="Original releases and artist spotlights from ElectraCast."
      />
      <div className="account-card">
        <h3>Pod Till You Drop, Vol. 1</h3>
        <img
          className="music-cover"
          src="https://electracast.com/wp-content/uploads/2022/09/Pod-Till-You-Drop-Vol1-FINAL-Cover-Art-3000x3000-1-1024x1024.jpg"
          alt="Pod Till You Drop, Vol. 1 cover art"
          loading="lazy"
        />
        <p>
          ElectraCast is proud to announce the release of the first-ever
          original podcast music compilation album, featuring original songs and
          scores from our diverse roster of podcasts.
        </p>
        <p>
          <strong>Available wherever you listen.</strong>
        </p>
        <div className="demo-reel">
          <iframe
            title="Pod Till You Drop (Spotify)"
            src={spotifyEmbedUrl}
            width="100%"
            height="352"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            style={{ borderRadius: 12 }}
          />
          <a className="btn ghost" href={spotifyAlbumUrl} target="_blank" rel="noreferrer">
            Open on Spotify
          </a>
        </div>
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
