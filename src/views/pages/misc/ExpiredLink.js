import { Button } from 'reactstrap'
import { useNavigate } from 'react-router-dom'
import errorImg from '@src/assets/images/pages/error.svg'

// ** Config
import themeConfig from '@configs/themeConfig'

import '@styles/base/pages/page-misc.scss'

const Error = () => {
  const navigate = useNavigate()
  const queryParams = new URLSearchParams(window.location.search)
  const query = queryParams.get('query')
  return (
    <div className="misc-wrapper">
      <a className="brand-logo" href="/">
        <span className="brand-logo-span">
          <img
            id="medisurf-logo"
            src={themeConfig.app.appLogoImage}
            alt="logo"
          />
        </span>
      </a>
      <div className="misc-inner p-2 p-sm-3">
        <div className="w-100 text-center">
          <h2 className="mb-1">404: Page Not Found 🕵🏻‍♀️</h2>
          <p className="mb-2">Oops! 😖 Your link is expired OR Incorrect URL</p>
          {query === 'shared' ? (
            <Button
              onClick={() => navigate(-1)}
              color="primary"
              className="btn-sm-block mb-2"
            >
              Go to previous page
            </Button>
          ) : (
            <Button
              onClick={() => {
                navigate('/forgot-password')
              }}
              color="primary"
              className="btn-sm-block mb-2"
            >
              Retry process
            </Button>
          )}
          <img className="img-fluid" src={errorImg} alt="Not authorized page" />
        </div>
      </div>
    </div>
  )
}
export default Error
