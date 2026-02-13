import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { navLinks } from '../data/navigation'
import { clearStoredAuth, getStoredAuth } from '../lib/api'

type SiteHeaderProps = {
  showAuthActions?: boolean
}

const logoUrl =
  'https://electracast.com/wp-content/uploads/2022/02/cropped-ECTEXTLOGOGWLRG%EF%B9%96format1500w-1.png'

const SiteHeader = ({ showAuthActions = true }: SiteHeaderProps) => {
  const navigate = useNavigate()
  const [hasAuth, setHasAuth] = useState(() => Boolean(getStoredAuth()))
  const [query, setQuery] = useState('')

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

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault()
    const next = query.trim()
    if (!next) {
      return
    }
    navigate(`/search?q=${encodeURIComponent(next)}`)
  }

  return (
    <header className={`site-header ${showAuthActions ? '' : 'site-header--center-nav'}`}>
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
      <form className="site-search" role="search" onSubmit={handleSearchSubmit}>
        <input
          type="search"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search ElectraCast"
        />
      </form>
      {/* When auth actions are hidden, keep a spacer so the nav stays centered. */}
      {!showAuthActions ? <div className="site-header-spacer" aria-hidden="true" /> : null}
      {showAuthActions ? (
        hasAuth ? (
          <button className="btn ghost" type="button" onClick={handleLogout}>
            Log out
          </button>
        ) : (
          <Link className="btn ghost" to="/account">
            Log in
          </Link>
        )
      ) : null}
    </header>
  )
}

export default SiteHeader
