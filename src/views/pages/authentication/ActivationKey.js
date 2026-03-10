import Avatar from '@components/avatar'
import axios from 'axios'
import { useState } from 'react'
import { Check, X, Heart } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import { Slide, toast } from 'react-toastify'
import { FormFeedback, Spinner } from 'reactstrap'

import { extractErrorMessage, getHomeRouteForLoggedInUser } from '@utils'
import bodyImg from '../../../assets/images/login/Column-img.png'
import lock from '../../../assets/images/login/lock.png'
import '../../pages/authentication/style.css'
import themeConfig from '@configs/themeConfig'
const ToastContent = ({ message, type }) => (
  <div className="d-flex">
    <Avatar
      size="sm"
      color={type === 'success' ? 'success' : 'danger'}
      icon={type === 'success' ? <Check size={12} /> : <X size={12} />}
      className="me-2 flex-shrink-0"
    />
    <div className="flex-grow-1">
      <div className="toast-title font-weight-bold">
        {type === 'success' ? 'Success' : 'Error'}
      </div>
      <div className="toast-message">{message}</div>
    </div>
  </div>
)

const ActivationKey = () => {
  const navigate = useNavigate()
  const [creds, setCreds] = useState({
    contact: '',
    email: '',
    activationKey: '',
  })
  const [error, setError] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = (obj) => {
    const isValid = []
    for (const item in obj) {
      if (obj[item] === '') {
        isValid.push(item)
      }
    }
    return isValid
  }

  window.ononline = () => {
    console.log('now online')
    toast.success(<ToastContent message={'Back online!'} type={'success'} />, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    })
  }

  window.onoffline = () => {
    toast.error(
      <ToastContent message={'No Internet Connection!'} type={'error'} />,
      {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      }
    )
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (navigator.onLine) {
      const pass = validate(creds)
      if (!pass.length) {
        setLoading(true)
        try {
          const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${process.env.REACT_APP_API_URL}/license/license-verify`,
            headers: {
              'Content-Type': 'application/json',
            },
            data: creds,
          }

          const response = await axios(config)

          if (response.status === 200) {
            if (response.data?.user) {
              // Direct user login after license verification
              localStorage.setItem(
                'userData',
                JSON.stringify(response.data.user)
              )
              localStorage.setItem(
                'accessToken',
                response.data.user.accessToken || response.data.user.token || ''
              )

              // Check if first-time user needs to change password
              if (response.data.user.pwdCng === true) {
                // First-time user - redirect to password change
                navigate('/pages/account-settings')
                toast.success(
                  <ToastContent
                    message={'License activated. Please change your password.'}
                    type={'success'}
                  />,
                  {
                    transition: Slide,
                    hideProgressBar: true,
                    autoClose: 3000,
                  }
                )
              } else {
                // User has already changed password - redirect to home
                navigate(getHomeRouteForLoggedInUser(response.data.user.role))
                toast.success(
                  <ToastContent
                    message={'Successfully activated license.'}
                    type={'success'}
                  />,
                  {
                    transition: Slide,
                    hideProgressBar: true,
                    autoClose: 2000,
                  }
                )
              }
            } else if (response.data?.studyRes || response.data?.fileName) {
              // License verified but user needs to login separately
              toast.success(
                <ToastContent
                  message={
                    'License verified successfully. Please login to continue.'
                  }
                  type={'success'}
                />,
                {
                  transition: Slide,
                  hideProgressBar: true,
                  autoClose: 3000,
                }
              )
              // Navigate to login page
              navigate('/login')
            } else {
              // Unexpected success response
              toast.success(
                <ToastContent
                  message={'License verification completed. Please login.'}
                  type={'success'}
                />,
                {
                  transition: Slide,
                  hideProgressBar: true,
                  autoClose: 2000,
                }
              )
              navigate('/login')
            }
          } else {
            const error_message = extractErrorMessage(
              response?.data?.error ?? response?.data,
              'Something went wrong'
            )
            toast.error(
              <ToastContent message={error_message} type={'error'} />,
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
          }
        } catch (err) {
          setLoading(false)
          const error_message = extractErrorMessage(
            err.response?.data?.error ?? err.response?.data ?? err,
            'Something went wrong'
          )

          toast.error(<ToastContent message={error_message} type={'error'} />, {
            position: 'top-center',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          })
        } finally {
          setLoading(false)
        }
      } else {
        setError((prev) => {
          const errors = {}
          pass.forEach((item) => {
            errors[item] = 1
          })
          return errors
        })
      }
    } else {
      toast.error(
        <ToastContent message={'No Internet Connection!'} type={'error'} />,
        {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      )
    }
  }

  const inputHandler = (e) => {
    const name = e.target.name
    const value = e.target.value

    // Remove authentication error
    setError((prev) => {
      delete prev.auth
      return prev
    })

    // Remove/Set input error
    if (!value) {
      setError((prev) => {
        return { ...prev, [name]: 1 }
      })
    } else {
      setError((prev) => {
        delete prev[name]
        return prev
      })
    }

    // Update input value
    setCreds((prev) => {
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
                <img src={themeConfig.app.appLogoImage} alt="" />
              </div>
              <div className="title">
                <h3>
                  Welcome to Your Digital <br /> Healthcare Platform
                </h3>
              </div>
              <div className="form-sec">
                <form onSubmit={onSubmit}>
                  <div className="form-group-auth">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      className="form-control authentication-input-fields"
                      placeholder="email"
                      id="email"
                      name="email"
                      tabIndex="2"
                      value={creds.email}
                      onChange={inputHandler}
                      invalid={
                        (error && error.email && true) ||
                        (error && error.auth && true)
                      }
                    />
                    <img src={lock} alt="" />
                  </div>
                  <div className="form-group-auth">
                    <label htmlFor="contact">Contact</label>
                    <input
                      type="text"
                      className="form-control authentication-input-fields"
                      placeholder="contact"
                      id="contact"
                      name="contact"
                      tabIndex="2"
                      value={creds.contact}
                      onChange={inputHandler}
                      invalid={
                        (error && error.contact && true) ||
                        (error && error.auth && true)
                      }
                    />
                    <img src={lock} alt="" />
                  </div>
                  <div className="form-group-auth">
                    <label htmlFor="activationKey">Activation key</label>
                    <input
                      type="text"
                      className="form-control authentication-input-fields"
                      placeholder="Activation key"
                      id="activationKey"
                      name="activationKey"
                      tabIndex="2"
                      value={creds.activationKey}
                      onChange={inputHandler}
                      invalid={
                        (error && error.activationKey && true) ||
                        (error && error.auth && true)
                      }
                    />
                    <img src={lock} alt="" />
                  </div>
                  {error && (
                    <FormFeedback
                      style={
                        Object.keys(error).length > 0
                          ? { display: 'block', marginBottom: '1rem' }
                          : { display: 'none' }
                      }
                    >
                      {error.email
                        ? 'Email address is required'
                        : error.contact
                          ? 'Contact number is required'
                          : error.activationKey
                            ? 'Activation key is required'
                            : ''}{' '}
                      {error.auth}
                    </FormFeedback>
                  )}
                  <div className="login-btn">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
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
                <img src={bodyImg} alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="float-md-right footer">
        Powered by &nbsp;
        <Heart size={20} /> &nbsp;
        <a
          href={`${process.env.REACT_APP_POWER_BY_URL}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {`${process.env.REACT_APP_POWER_BY_NAME}`}
        </a>
      </div>
    </div>
  )
}

export default ActivationKey
