import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { navLinks } from '../data/navigation'
import { clearStoredAuth, getStoredAuth } from '../lib/api'

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
      <div className="logo">ElectraCast</div>
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
