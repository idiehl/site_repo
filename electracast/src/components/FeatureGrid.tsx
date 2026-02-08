import { features } from '../data/features'

const FeatureGrid = () => {
  return (
    <div className="feature-grid">
      {features.map((feature) => (
        <article key={feature.title} className="feature-card">
          <span className="tag">{feature.tag}</span>
          <h3>{feature.title}</h3>
          <p>{feature.description}</p>
        </article>
      ))}
    </div>
  )
}

export default FeatureGrid
