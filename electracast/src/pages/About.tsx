import FeatureGrid from '../components/FeatureGrid'
import SectionHeader from '../components/SectionHeader'

const About = () => {
  return (
    <section className="section">
      <SectionHeader
        title="About ElectraCast"
        description="We create community and amplify diverse voices through compelling entertainment and story."
      />
      <FeatureGrid />
      <div className="account-card">
        <p>
          ElectraCast is rebuilding its experience to spotlight podcasts, networks,
          and music with a fresh, modern interface.
        </p>
      </div>
    </section>
  )
}

export default About
