import ContactCard from '../components/ContactCard'
import SectionHeader from '../components/SectionHeader'

const Contact = () => {
  return (
    <section className="section">
      <SectionHeader
        title="Contact"
        description="Let's build your next show together."
      />
      <ContactCard />
    </section>
  )
}

export default Contact
