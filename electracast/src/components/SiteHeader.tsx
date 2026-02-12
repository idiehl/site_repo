import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { navLinks } from '../data/navigation'
import { clearStoredAuth, getStoredAuth } from '../lib/api'

const logoUrl =
  'https://electracast.com/wp-content/uploads/2022/02/cropped-ECTEXTLOGOGWLRG%EF%B9%96format1500w-1.png'

const SiteHeader = () => {
  const navigate = useNavigate()
  const [hasAuth, setHasAuth] = useState(() => Boolean(getStoredAuth()))

  useEffect(() => {
    const refresh = () => setHasAuth(Boolean(getStoredAuth()))
    refresh()
    window.addEventListener('electracast-auth-change', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('electracast-auth-change', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const handleLogout = () => {
    clearStoredAuth()
    setHasAuth(false)
    navigate('/account')
  }

  return (
    <header className="site-header">
      <Link className="logo" to="/">
        <img src={logoUrl} alt="ElectraCast" />
        <span className="logo-text">ElectraCast</span>
      </Link>
      <nav className="nav" aria-label="Primary">
        {navLinks.map((link) => (
          <Link key={link.label} to={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
      {hasAuth ? (
        <button className="btn ghost" type="button" onClick={handleLogout}>
          Log out
        </button>
      ) : (
        <Link className="btn ghost" to="/account">
          Log in
        </Link>
      )}
    </header>
  )
}

export default SiteHeader
