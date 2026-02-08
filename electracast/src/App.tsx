import ScrollToHash from './components/ScrollToHash'
import SiteLayout from './components/SiteLayout'
import usePageTitle from './hooks/usePageTitle'
import { routes } from './routes'
import { Route, Routes } from 'react-router-dom'

const App = () => {
  usePageTitle()

  return (
    <>
      <ScrollToHash />
      <Routes>
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
