import NetworkPills from '../components/NetworkPills'
import SectionHeader from '../components/SectionHeader'
import { networkDirectory } from '../data/networks'

const Networks = () => {
  return (
    <section className="section">
      <SectionHeader
        title="Networks"
        description="Explore the ElectraCast network lineup."
      />
      <div className="account-card">
        <h3>Network Directory</h3>
        <p>
          These curated network categories mirror the legacy ElectraCast site.
          Full network pages are being migrated next.
        </p>
        <div className="network-grid">
          {networkDirectory.map((network) => (
            <article key={network.slug} className="account-card network-card">
              {network.image ? (
                <img
                  className="network-image"
                  src={network.image}
                  alt={`${network.name} artwork`}
                  loading="lazy"
                />
              ) : null}
              <h4>{network.name}</h4>
              <a
                className="btn ghost"
                href={network.href}
                target="_blank"
                rel="noreferrer"
              >
                View legacy page
              </a>
            </article>
          ))}
        </div>
      </div>
      <NetworkPills />
    </section>
  )
}

export default Networks
