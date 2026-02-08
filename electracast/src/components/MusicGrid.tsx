import { musicItems } from '../data/music'

const MusicGrid = () => {
  return (
    <div className="music-grid">
      {musicItems.map((item) => (
        <div key={item.artist} className="music-card">
          <h3>{item.artist}</h3>
          <p>{item.release}</p>
        </div>
      ))}
    </div>
  )
}

export default MusicGrid
