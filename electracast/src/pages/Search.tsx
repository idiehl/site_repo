import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import { podcastsCatalog } from '../data/catalog/podcastsCatalog'
import { networksCatalog } from '../data/catalog/networksCatalog'

const useQueryParam = (key: string) => {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search).get(key) ?? '', [search, key])
}

type SearchHit = {
  title: string
  subtitle: string
  to: string
}

const Search = () => {
  const q = useQueryParam('q').trim()
  const query = q.toLowerCase()

  const hits = useMemo<SearchHit[]>(() => {
    if (!query) {
      return []
    }

    const results: SearchHit[] = []

    podcastsCatalog.forEach((p) => {
      const haystack = `${p.title} ${p.summary ?? ''} ${p.slug}`.toLowerCase()
      if (haystack.includes(query)) {
        results.push({ title: p.title, subtitle: 'Podcast', to: `/podcast/${p.slug}` })
      }
    })

    networksCatalog.forEach((n) => {
      const haystack = `${n.title} ${n.description ?? ''} ${n.slug}`.toLowerCase()
      if (haystack.includes(query)) {
        results.push({ title: n.title, subtitle: 'Network', to: `/network/${n.slug}` })
      }
    })

    const pages: SearchHit[] = [
      { title: 'About', subtitle: 'Page', to: '/about' },
      { title: 'Contact', subtitle: 'Page', to: '/contact' },
      { title: 'Advertising', subtitle: 'Page', to: '/advertise' },
      { title: 'Register', subtitle: 'Page', to: '/register' },
      { title: 'Music', subtitle: 'Page', to: '/music' },
      { title: 'Custom Branded Podcasts', subtitle: 'Page', to: '/custom-branded-podcasts' },
    ]
    pages.forEach((page) => {
      if (page.title.toLowerCase().includes(query)) {
        results.push(page)
      }
    })

    return results.slice(0, 50)
  }, [query])

  return (
    <section className="section">
      <SectionHeader
        title="Search"
        description={q ? `Results for "${q}"` : 'Search podcasts, networks, and pages.'}
      />
      <div className="account-card">
        {!q ? <p>Type a keyword in the header search box.</p> : null}
        {q && !hits.length ? <p>No matches found.</p> : null}
        {hits.length ? (
          <div className="resource-list">
            {hits.map((hit) => (
              <p key={`${hit.to}-${hit.subtitle}`}>
                <Link to={hit.to}>{hit.title}</Link> <span style={{ color: 'var(--muted)' }}>({hit.subtitle})</span>
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default Search

