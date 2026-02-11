import { useEffect } from 'react'
import { matchPath, useLocation } from 'react-router-dom'
import { defaultTitle, routes } from '../routes'

const usePageTitle = () => {
  const location = useLocation()

  useEffect(() => {
    if (location.pathname.startsWith('/account')) {
      document.title = 'ElectraCast Dashboard'
      return
    }

    const match = routes.find((route) =>
      matchPath({ path: route.path, end: true }, location.pathname)
    )

    document.title = match?.title ?? defaultTitle
  }, [location.pathname])
}

export default usePageTitle
