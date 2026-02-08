import NetworkPills from '../components/NetworkPills'
import SectionHeader from '../components/SectionHeader'

const Networks = () => {
  return (
    <section className="section">
      <SectionHeader
        title="Networks"
        description="Explore the ElectraCast network lineup."
      />
      <NetworkPills />
    </section>
  )
}

export default Networks
