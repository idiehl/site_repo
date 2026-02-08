import ContactCard from '../components/ContactCard'
import SectionHeader from '../components/SectionHeader'

const Advertising = () => {
  return (
    <section className="section">
      <SectionHeader
        title="Advertising"
        description="Reach engaged listeners across the ElectraCast network."
      />
      <ContactCard />
      <div className="account-card">
        <p>
          Advertising packages, sponsorships, and cross-promotional opportunities
          will be published here as the rebuild progresses.
        </p>
      </div>
    </section>
  )
}

export default Advertising
