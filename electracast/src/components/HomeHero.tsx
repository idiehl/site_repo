import { Link } from 'react-router-dom'

const HomeHero = () => {
  return (
    <section id="custom" className="hero">
      <div className="hero-eyebrow">Custom Podcast Production</div>
      <h1>Transform your influence.</h1>
      <p>
        We produce award-winning custom podcasts for your brand. Development,
        talent, marketing, and distribution - all in one place.
      </p>
      <div className="hero-actions">
        <Link className="btn primary" to="/#about">
          Click to learn more
        </Link>
        <Link className="btn ghost" to="/#podcasts">
          Hear the culture
        </Link>
      </div>
      <div className="hero-meta">
        Development &middot; Talent &middot; Marketing &middot; Distribution
      </div>
    </section>
  )
}

export default HomeHero
