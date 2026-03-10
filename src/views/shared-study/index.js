import { useEffect, useState } from 'react'
import SharedAuth from './SharedAuth'
import ShareStudyList from './ShareStudyList'

import '@styles/base/pages/page-auth.scss'

const SharedStudy = (props) => {
  console.log('SharedStudy component loaded', props)
  const [isAuthenticated, setIsAuthenticated] = useState(true)

  useEffect(() => {
    if (
      !JSON.parse(localStorage.getItem('sharedAuth')) ||
      window.location.pathname !== localStorage.getItem('sharedUrl')
    ) {
      localStorage.setItem('sharedAuth', false)
      document.cookie = `sharedAuth=; domain=${process.env.REACT_APP_COOKIE_DOMAIN}; path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`
      setIsAuthenticated((prev) => false)
      sessionStorage.setItem('sharedStudy', false)
    }
    localStorage.setItem('sharedUrl', window.location.pathname)
  }, [])
  return isAuthenticated ? (
    <ShareStudyList toggleAuth={setIsAuthenticated} />
  ) : (
    <SharedAuth props={props} toggleAuth={setIsAuthenticated} />
  )
}

export default SharedStudy
