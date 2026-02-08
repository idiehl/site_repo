import { Link } from 'react-router-dom'
import { navLinks } from '../data/navigation'

const SiteHeader = () => {
  return (
    <header className="site-header">
      <div className="logo">ElectraCast</div>
      <nav className="nav" aria-label="Primary">
        {navLinks.map((link) => (
          <Link key={link.label} to={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
      <button className="btn ghost" type="button">
        Log out
      </button>
    </header>
  )
}

export default SiteHeader
