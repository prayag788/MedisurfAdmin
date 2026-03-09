// ** React Imports
import { Fragment, useEffect } from 'react'

// ** Third Party Components
import { Sun, Moon } from 'react-feather'
import { Card, CardHeader, CardTitle, Button, Row } from 'reactstrap'
import { Link } from 'react-router-dom'

// ** Store & Actions
import { useSkin } from '@hooks/useSkin'

// ** Config
import themeConfig from '@configs/themeConfig'
import useJwt from '@src/auth/jwt/useJwt'

// ** Styles
import '@styles/react/libs/flatpickr/flatpickr.scss'

import axios from 'axios'
import SharedStudyTable from './SharedStudyTable'
import PreviewReport from './../report/PreviewReport'

const config = useJwt.jwtConfig

const ShareStudyList = ({ toggleAuth }) => {
  // ** States
  const [skin, setSkin] = useSkin()
  const queryParameters = new URLSearchParams(document.location.search)

  useEffect(() => {
    const setSkinValue = async () => {
      const skinVal = localStorage.getItem('skin')
      if (skinVal === null) {
        setSkin('dark')
      }
    }
    setSkinValue()
  }, [])

  const ThemeToggler = () => {
    if (skin === 'dark') {
      return <Sun className="ficon cursor-pointer" onClick={() => setSkin('light')} />
    } else {
      return <Moon className="ficon cursor-pointer" onClick={() => setSkin('dark')} />
    }
  }

  const handleLogOut = async () => {
    await axios.get(`${process.env.REACT_APP_API_URL}/user/logout`).then(data => {
      localStorage.removeItem('sharedUserData', JSON.stringify(data))
      document.cookie = `sharedAuth=; domain=${process.env.REACT_APP_COOKIE_DOMAIN}; path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`
      if (localStorage.getItem('sharedUrl')) {
        localStorage.setItem('sharedAuth', false)
      } else {
        // localStorage.removeItem(`shared${config.storageTokenKeyName}`)
        // localStorage.removeItem(`shared${config.storageRefreshTokenKeyName}`)
      }

      localStorage.removeItem('lastActivity')
      toggleAuth(() => false)
    })
  }

  return (
    <div className="shared-studyListDiv">
      <Fragment>
        <Row className="px-4 py-2">
          <Link className="brand-logo d-flex" to="/" onClick={e => e.preventDefault()}>
            <img id="medisurf-logo" src={themeConfig.app.appLogoImage} alt="Medisurf logo" />
          </Link>
        </Row>
        <Card>
          <CardHeader className="border-bottom">
            <CardTitle tag="h4">
              {queryParameters.get('id') && queryParameters.get('mode')
                ? 'Study Report'
                : 'Study List'}
            </CardTitle>
            <div className="d-flex align-items-center mt-md-0 mt-1 study-button-container">
              <ThemeToggler />
              <Button className="ml-2" color="primary" onClick={handleLogOut}>
                <span className="align-middle">Logout</span>
              </Button>
            </div>
          </CardHeader>
          {queryParameters.get('id') && queryParameters.get('mode') ? (
            <PreviewReport renderFrom="sharedStudy" />
          ) : (
            <SharedStudyTable />
          )}
        </Card>
      </Fragment>
    </div>
  )
}

export default ShareStudyList
