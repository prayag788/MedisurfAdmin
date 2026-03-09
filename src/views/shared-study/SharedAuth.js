import { useState } from 'react'
import Avatar from '@components/avatar'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { useNavigate, useParams } from 'react-router-dom'
import { X, Heart } from 'react-feather'
import axios from 'axios'
import { Spinner, FormFeedback } from 'reactstrap'
import useJwt from '@src/auth/jwt/useJwt'

import lock from '../../assets/images/login/lock.png'
import bodyImg from '../../assets/images/login/Column-img.png'
import '../pages/authentication/style.css'
import themeConfig from '@configs/themeConfig'
const ToastContentForError = ({ message, type }) => (
  <>
    <div className="toastify-header">
      <div className="title-wrapper">
        <Avatar size="sm" color={'danger'} icon={<X size={12} />} />
        <h6 className="toast-title font-weight-bold">Error</h6>
      </div>
    </div>
    <div className="toastify-body">
      <span>{message}</span>
    </div>
  </>
)

const config = useJwt.jwtConfig

const SharedAuth = ({ props, toggleAuth }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { token } = useParams()
  const [creds, setCreds] = useState({ password: '' })
  const [error, setError] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = obj => {
    const isValid = []
    for (const item in obj) {
      if (obj[item] === '') {
        isValid.push(item)
      }
    }
    return isValid
  }

  const onSubmit = e => {
    e.preventDefault()
    const pass = validate(creds)
    if (!pass.length) {
      // Create a clean axios instance without Authorization header
      const cleanAxios = axios.create()
      cleanAxios
        .post(`${process.env.REACT_APP_API_URL}/studyShare/login`, {
          password: creds.password,
          token,
        })
        .then(response => {
          localStorage.setItem('sharedAuth', true)
          const data = {
            ...response.data,
            accessToken: token,
            refreshToken: token,
          }
          localStorage.setItem('sharedUserData', JSON.stringify(data))
          localStorage.setItem(
            `shared${config.storageTokenKeyName}`,
            JSON.stringify(data.accessToken)
          )
          localStorage.setItem(
            `shared${config.storageRefreshTokenKeyName}`,
            JSON.stringify(data.refreshToken)
          )

          document.cookie = `sharedAuth=true; domain=${process.env.REACT_APP_COOKIE_DOMAIN}; path=/`

          toggleAuth(prev => true)
        })
        .catch(err => {
          const responseMessage = err?.response?.data?.message
          const responseStatus = err?.response?.status

          if (responseMessage === 'expired') {
            navigate('/misc/expiredLink?query=shared')
          } else if (responseMessage === 'Unauthorized' || responseStatus === 401) {
            toast.error(
              <ToastContentForError message={'Enter correct password'} type={'error'} />,
              {
                position: 'top-center',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              }
            )
          } else {
            // Unexpected error – still show a generic toast so the user isn't left blank
            toast.error(
              <ToastContentForError message={'Something went wrong. Please try again.'} type={'error'} />,
              { position: 'top-center', autoClose: 5000 }
            )
            console.error('SharedAuth login error:', err)
          }
        })
    } else {
      setError(prev => {
        const errors = {}
        pass.map(item => {
          errors[item] = 1
        })
        return errors
      })
    }
  }

  const inputHandler = e => {
    const name = e.target.name
    const value = e.target.value

    // Remove authentication error
    setError(prev => {
      delete prev.auth
      return prev
    })

    // Remove/Set input error
    if (!value) {
      setError(prev => {
        return { ...prev, [name]: 1 }
      })
    } else {
      setError(prev => {
        delete prev[name]
        return prev
      })
    }

    // Update input value
    setCreds(prev => {
      return { ...prev, [name]: value }
    })
  }

  return (
    <div className="main-login-banner">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 left">
            <div className="inner-column-left">
              <div className="logo-image">
                <img src={themeConfig.app.appLogoImage} alt="Medisurf logo" />
              </div>
              <div className="title">
                <h3>
                  Welcome to Your Digital <br /> Healthcare Platform
                </h3>
              </div>
              <div className="form-sec">
                <form onSubmit={onSubmit}>
                  <div className="form-group-auth">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      className="form-control authentication-input-fields"
                      placeholder="Password"
                      id="password"
                      name="password"
                      tabIndex="2"
                      value={creds.password}
                      onChange={inputHandler}
                      invalid={(error && error.password && true) || (error && error.auth && true)}
                    />
                    <img
                      style={{ position: 'relative', float: 'right', top: '-31px' }}
                      src={lock}
                      alt=""
                    />
                    {error && error.password && (
                      <FormFeedback
                        style={
                          Object.keys(error).length > 0
                            ? { display: 'block', marginBottom: '1rem' }
                            : { display: 'none' }
                        }
                      >
                        Enter the password
                      </FormFeedback>
                    )}
                  </div>
                  <div className="login-btn">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {!loading ? 'LOGIN' : <Spinner color="white" size="sm" />}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="col-lg-6 right">
            <div className="inner-column-right">
              <div className="image">
                <img src={bodyImg} alt="Illustration" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="float-md-right footer">
        Powered by &nbsp;
        <Heart size={20} /> &nbsp;
        <a href={`${process.env.REACT_APP_POWER_BY_URL}`} target="_blank" rel="noopener noreferrer">
          {`${process.env.REACT_APP_POWER_BY_NAME}`}
        </a>
      </div>
    </div>
  )
}

export default SharedAuth
