import { Button } from 'reactstrap'
import { Link } from 'react-router-dom'
import notAuthImg from '@src/assets/images/pages/not-authorized.svg'
import { isUserLoggedIn } from '@utils'
import '@styles/base/pages/page-misc.scss'
import { useRef } from 'react'
import { useSelector } from 'react-redux'

// ** Config
import themeConfig from '@configs/themeConfig'

const NotAuthorized = () => {
  const isLoggedIn = useRef(!!isUserLoggedIn())
  const fallbackRoute = useSelector(state => state.layout.fallbackRoute)

  return (
    <div className="misc-wrapper">
      <a className="brand-logo" href="/">
        <span className="brand-logo-span">
          <img id="medisurf-logo" src={themeConfig.app.appLogoImage} alt="logo" />
        </span>
      </a>
      <div className="misc-inner p-2 p-sm-3">
        <div className="w-100 text-center">
          <h2 className="mb-1">You are not authorized! 🔐</h2>
          <p className="mb-2">
            The Webtrends Marketing Lab website in IIS uses the default IUSR account credentials to
            access the web pages it serves.
          </p>
          {!isLoggedIn.current ? (
            <Button tag={Link} to="/login" color="primary" className="btn-sm-block mb-1">
              Back to login
            </Button>
          ) : (
            <Button tag={Link} to={fallbackRoute} color="primary" className="btn-sm-block mb-1">
              Back to Admin Panel
            </Button>
          )}
          <img className="img-fluid" src={notAuthImg} alt="Not authorized page" />
        </div>
      </div>
    </div>
  )
}
export default NotAuthorized
