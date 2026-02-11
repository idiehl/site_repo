import ScrollToHash from './components/ScrollToHash'
import SiteLayout from './components/SiteLayout'
import usePageTitle from './hooks/usePageTitle'
import { routes } from './routes'
import { Route, Routes } from 'react-router-dom'
import MyAccount from './pages/MyAccount'
import { Overview } from './dashboard/components/Overview'
import { Episodes } from './dashboard/components/Episodes'
import { Analytics } from './dashboard/components/Analytics'
import { Upload } from './dashboard/components/Upload'
import { Recording } from './dashboard/components/Recording'
import { Settings } from './dashboard/components/Settings'
import { CreatePodcast } from './dashboard/components/CreatePodcast'

const App = () => {
  usePageTitle()

  return (
    <>
      <ScrollToHash />
      <Routes>
        <Route path="/account" element={<MyAccount />}>
          <Route index element={<Overview />} />
          <Route path="episodes" element={<Episodes />} />
          <Route path="create" element={<CreatePodcast />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="upload" element={<Upload />} />
          <Route path="recording" element={<Recording />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route element={<SiteLayout />}>
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>
      </Routes>
    </>
  )
}

export default App
