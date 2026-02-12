import AccountCard from '../components/AccountCard'
import ContactCard from '../components/ContactCard'
import FeatureGrid from '../components/FeatureGrid'
import HomeHero from '../components/HomeHero'
import MusicGrid from '../components/MusicGrid'
import NetworkPills from '../components/NetworkPills'
import NewsList from '../components/NewsList'
import PodcastGrid from '../components/PodcastGrid'
import SectionHeader from '../components/SectionHeader'

const Home = () => {
  return (
    <>
      <HomeHero />

      <section id="about" className="section">
        <SectionHeader
          title="Hear the Culture."
          description="Featured originals including The Last Saturday Night, TechTalk, and Nightmare Road Stories."
        />
        <FeatureGrid />
      </section>

      <section id="podcasts" className="section dark">
        <SectionHeader
          title="Featured Podcasts"
          description="Originals and network favorites from ElectraCast."
        />
        <PodcastGrid />
      </section>

      <section id="news" className="section">
        <SectionHeader
          title="Latest News From ElectraCast"
          description="Trends, releases, and community highlights."
        />
        <NewsList />
      </section>

      <section id="music" className="section dark">
        <SectionHeader title="Music" description="Featured artists and releases." />
        <MusicGrid />
      </section>

      <section id="networks" className="section">
        <SectionHeader
          title="Networks"
          description="Explore the ElectraCast network lineup."
        />
        <NetworkPills />
      </section>

      <section id="contact" className="section dark">
        <SectionHeader
          title="Contact"
          description="Let's build your next show together."
        />
        <ContactCard />
      </section>

      <section id="account" className="section">
        <SectionHeader
          title="Profile"
          description="Access your personalized dashboard and subscriptions."
        />
        <AccountCard />
      </section>
    </>
  )
}

export default Home
