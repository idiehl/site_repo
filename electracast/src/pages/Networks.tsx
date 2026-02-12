import SectionHeader from '../components/SectionHeader'
import { networkDirectory } from '../data/networks'
import { Link } from 'react-router-dom'

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
          Browse ElectraCast networks. Each network page includes its description and
          a list of shows in that network.
        </p>
        <div className="network-grid">
          {networkDirectory.map((network) => (
            <article key={network.slug} className="account-card network-card">
              {network.image ? (
                <img
                  className="network-image"
                  src={network.image}
                  alt={`${network.title} artwork`}
                  loading="lazy"
                />
              ) : null}
              <h4>{network.title}</h4>
              <div className="account-actions">
                <Link className="btn ghost" to={network.to}>
                  View network
                </Link>
                <a className="btn ghost" href={network.legacyUrl} target="_blank" rel="noreferrer">
                  Legacy site
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Networks
