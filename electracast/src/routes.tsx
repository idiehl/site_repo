import type { ReactNode } from 'react'
import About from './pages/About'
import Advertising from './pages/Advertising'
import Contact from './pages/Contact'
import CustomBranded from './pages/CustomBranded'
import Home from './pages/Home'
import Music from './pages/Music'
import Networks from './pages/Networks'
import NetworkDetail from './pages/NetworkDetail'
import Podcasts from './pages/Podcasts'
import PodcastDetail from './pages/PodcastDetail'
import Register from './pages/Register'
import Search from './pages/Search'

export type AppRoute = {
  path: string
  element: ReactNode
  title: string
}

export const defaultTitle = 'ElectraCast | Hear The Culture'

export const routes: AppRoute[] = [
  { path: '/', element: <Home />, title: defaultTitle },
  { path: '/search', element: <Search />, title: 'Search | ElectraCast' },
  { path: '/podcasts', element: <Podcasts />, title: 'Podcasts | ElectraCast' },
  { path: '/podcast/:slug', element: <PodcastDetail />, title: 'Podcast | ElectraCast' },
  { path: '/networks', element: <Networks />, title: 'Networks | ElectraCast' },
  { path: '/network/:slug', element: <NetworkDetail />, title: 'Network | ElectraCast' },
  {
    path: '/custom-branded-podcasts',
    element: <CustomBranded />,
    title: 'Custom Branded Podcasts | ElectraCast',
  },
  { path: '/music', element: <Music />, title: 'Music | ElectraCast' },
  { path: '/about', element: <About />, title: 'About | ElectraCast' },
  { path: '/contact', element: <Contact />, title: 'Contact | ElectraCast' },
  { path: '/advertising', element: <Advertising />, title: 'Advertising | ElectraCast' },
  { path: '/advertise', element: <Advertising />, title: 'Advertise | ElectraCast' },
  { path: '/register', element: <Register />, title: 'Register | ElectraCast' },
]
