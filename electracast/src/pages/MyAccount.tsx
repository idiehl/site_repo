import SectionHeader from '../components/SectionHeader'

const podcasterLinks = [
  {
    label: 'Tips for Starting a Podcast',
    href: 'https://www.businessnewsdaily.com/10327-how-to-start-a-business-podcast.html',
  },
  {
    label:
      'Submit Your Podcast Details To Begin (and get your own official ElectraCast web page)',
    href: 'https://electracast.com/private/podcast-onboarding-form/',
  },
  {
    label: 'Get Ready to Distribute Your Podcast on ElectraCast',
    href: 'https://support.megaphone.fm/en/articles/3566624-new-podcast-checklist',
  },
  {
    label: 'Transfer of Existing Podcast',
    href:
      'https://support.megaphone.fm/en/collections/126940-redirecting-to-megaphone-from-a-previous-host',
  },
  {
    label: 'Download ECM Brand Kit',
    href: 'https://www.electracastmedia.com/documents/ECM_Brand_Kit.zip',
  },
  {
    label: 'Create a New Episode',
    href: 'https://support.megaphone.fm/en/articles/70858-create-an-episode',
  },
  {
    label: 'VIDEO: Creating Episodes Adding Dynamic Ad Locator Markers',
    href: 'https://www.youtube.com/watch?v=hpq1GZNs1Ig',
  },
  {
    label: 'Get Your Own Official Podcast Page on ElectraCast.com',
    href: 'https://electracast.com/private/podcast-onboarding-form/',
  },
  {
    label: 'Get Your Podcast Promoted on ElectraCast',
    href:
      'https://www.electracastmedia.com/documents/Get_Your_Podcast_Promo_on_ElectraCast.pdf',
  },
  {
    label: 'Create Your Podcast Trailer: "Episode Zero"',
    href:
      'https://www.electracastmedia.com/documents/ElectraCast_Podcast_Trailer_Guide_Episode_00.pdf',
  },
  {
    label: 'Megaphone Hosting Support',
    href: 'http://support.megaphone.fm/en/collections/3043077-megaphone-interface-support',
  },
  {
    label: 'Podcast Distribution & Ad Sales Agreement',
    href: 'https://electracast.com/podcast-owner-agreement/',
  },
  {
    label: 'Payment Checkout for Annual Discount',
    href: 'https://electracast.com/payments',
  },
]

const productionLinks = [
  {
    label: 'Production + Post Best Practices & Guidelines.pdf',
    href:
      'https://www.electracastmedia.com/documents/ElectraCast_Master_Productions_+_Post_Guidelines_2024-06-10.pdf',
  },
  {
    label: 'IMPORTANT: Register your new podcast on all platforms',
    href:
      'https://www.electracastmedia.com/documents/ECM_Networks_Podcasts_Platform_RSS_Registrations.pdf',
  },
]

const artistLinks = [
  {
    label: 'Audio Validation Rules for Digital Distribution',
    href:
      'https://www.electracastmedia.com/documents/Audio_Validation_Rules_for_Digital_Distribution.pdf',
  },
  {
    label: 'Download Music Metadata Requirements for Distribution',
    href:
      'https://www.electracastmedia.com/documents/ElectraCast_Distribution_Spec_Requirements_Metadata_Form%20(Locked)%20Q2%202024.xlsx',
  },
]

const MyAccount = () => {
  return (
    <section className="section">
      <SectionHeader
        title="My ElectraCast Account"
        description="Account access, onboarding resources, and production guidelines."
      />

      <div className="account-card">
        <h3>Account access</h3>
        <p>
          The legacy ElectraCast login is still available while we finish the new
          portal experience. Use the legacy login for existing accounts, or register
          for updates on the rebuild.
        </p>
        <div className="account-actions">
          <a
            className="btn primary"
            href="https://electracast.com/account/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open legacy login
          </a>
          <a className="btn ghost" href="/register">
            Register for updates
          </a>
        </div>
      </div>

      <div className="resource-grid">
        <div className="account-card">
          <h3>Podcaster helpful links</h3>
          <ul className="resource-list">
            {podcasterLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="account-card">
          <h3>ElectraCast production + guidelines</h3>
          <ul className="resource-list">
            {productionLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="account-card">
          <h3>ElectraCast Records artist links</h3>
          <ul className="resource-list">
            {artistLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default MyAccount
