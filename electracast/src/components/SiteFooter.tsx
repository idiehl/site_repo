import { socialLinks } from '../data/social'

const SiteFooter = () => {
  return (
    <footer className="footer">
      <div>
        ElectraCast &copy; 2025 ElectraCast Media LLC. All Rights Reserved.
      </div>
      <div className="footer-links">
        {socialLinks.map((link) => (
          <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
            {link.label}
          </a>
        ))}
      </div>
      <div>Development mirror hosted on Atlas Universalis.</div>
    </footer>
  )
}

export default SiteFooter
