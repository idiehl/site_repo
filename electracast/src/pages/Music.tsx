import MusicGrid from '../components/MusicGrid'
import SectionHeader from '../components/SectionHeader'

const Music = () => {
  return (
    <section className="section">
      <SectionHeader title="Music" description="Featured artists and releases." />
      <MusicGrid />
    </section>
  )
}

export default Music
