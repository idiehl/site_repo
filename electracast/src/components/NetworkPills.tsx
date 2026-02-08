import { networkPills } from '../data/networkPills'

const NetworkPills = () => {
  return (
    <div className="pill-grid">
      {networkPills.map((pill) => (
        <span key={pill}>{pill}</span>
      ))}
    </div>
  )
}

export default NetworkPills
