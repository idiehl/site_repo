export type MusicItem = {
  artist: string
  release: string
  href?: string
}

export const musicItems: MusicItem[] = [
  {
    artist: 'Bindi Heit',
    release: 'Sourced by Spirit',
    href: 'https://electracast.com/releases/sourced-by-spirit',
  },
  {
    artist: 'Jeralyn Glass',
    release: 'Joy Reboot',
    href: 'https://electracast.com/releases/joy-reboot',
  },
  {
    artist: 'Jeralyn Glass',
    release: 'Pentatonic Visions',
    href: 'https://electracast.com/releases/pentatonic-visions',
  },
  {
    artist: 'Jeff Symonds',
    release: '48 Lines About 12 Men for Craig Finn',
    href: 'https://electracast.com/releases/48-lines-about-12-men-for-craig-finn',
  },
  {
    artist: 'ElectraCast',
    release: 'Pod Till You Drop, Vol. 1',
  },
]
