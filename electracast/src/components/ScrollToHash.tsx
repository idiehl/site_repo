import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToHash = () => {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const target = document.querySelector(location.hash)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }

    window.scrollTo({ top: 0, left: 0 })
  }, [location.pathname, location.hash])

  return null
}

export default ScrollToHash
