import { MusicItem, musicItems } from '../data/music'

type MusicGridProps = {
  items?: MusicItem[]
}

const MusicGrid = ({ items = musicItems }: MusicGridProps) => {
  return (
    <div className="music-grid">
      {items.map((item) => (
        <div key={`${item.artist}-${item.release}`} className="music-card">
          <h3>{item.artist}</h3>
          <p>{item.release}</p>
          {item.href ? (
            <a className="btn ghost" href={item.href} target="_blank" rel="noreferrer">
              View release
            </a>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export default MusicGrid
