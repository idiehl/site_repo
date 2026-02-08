import FeatureGrid from '../components/FeatureGrid'
import SectionHeader from '../components/SectionHeader'

const CustomBranded = () => {
  return (
    <section className="section">
      <SectionHeader
        title="Custom Branded Podcasts"
        description="Strategy, storytelling, and production for brands ready to launch signature audio experiences."
      />
      <FeatureGrid />
    </section>
  )
}

export default CustomBranded
