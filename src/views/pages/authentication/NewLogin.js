import { useState, useContext, Fragment, useEffect } from 'react'
import Avatar from '@components/avatar'
import axios from 'axios'
import useJwt from '@src/auth/jwt/useJwt'
import { useDispatch } from 'react-redux'
import { toast, Slide } from 'react-toastify'
import { handleLogin } from '@store/actions/auth'
import { AbilityContext } from '@src/utility/context/Can'
import { useNavigate } from 'react-router-dom'
import { extractErrorMessage, getHomeRouteForLoggedInUser } from '@utils'
import { Coffee, AlertCircle, Eye, EyeOff, Heart, X, Check } from 'react-feather'
import { Spinner, FormFeedback } from 'reactstrap'

import bodyImg from '@src/assets/images/login/Column-img.png'
import themeConfig from '@configs/themeConfig'
import './style.css'
import AutocompleteInput from './AutocompleteInput'
import { Checkbox, FormControlLabel } from '@mui/material'

const ToastContent = ({ name, role }) => (
  <div className="d-flex">
    <Avatar size="sm" color="success" icon={<Coffee size={12} />} className="me-2 flex-shrink-0" />
    <div className="flex-grow-1">
      <div className="toast-title font-weight-bold">Welcome, {name}</div>
      <div className="toast-message">
        You have successfully logged in as an {role} user to {`${process.env.REACT_APP_INNER_NAME}`}
        . Now you can start to explore. Enjoy!
      </div>
    </div>
  </div>
)

const ToastContentMessage = ({ message, status }) => (
  <div className="d-flex">
    <Avatar
      size="sm"
      color={status ? 'success' : 'danger'}
      icon={status ? <Check size={12} /> : <X size={12} />}
      className="me-2 flex-shrink-0"
    />
    <div className="flex-grow-1">
      <div className="toast-title font-weight-bold">{status ? 'Success' : 'Failed'}</div>
      <div className="toast-message">{message}</div>
    </div>
  </div>
)
const ToastInActiveAccount = () => (
  <div className="d-flex">
    <Avatar
      size="sm"
      color="info"
      icon={<AlertCircle size={16} />}
      className="me-2 flex-shrink-0"
    />
    <div className="flex-grow-1">
      <div className="toast-title font-weight-bold">Error</div>
      <div className="toast-message">
        Your Account has been Deactivated!
        <br />
        Please contact the Admin!
      </div>
    </div>
  </div>
)

const NewLogin = () => {
  const ability = useContext(AbilityContext)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [creds, setCreds] = useState({ username: '', password: '' })
  const [error, setError] = useState({})
  const [loading, setLoading] = useState(false)
  const [togglePassword, setTogglePassword] = useState(true)
  const [forgotPasswordStatus, setForgotPasswordStatus] = useState(false)
  const [username, setUsername] = useState('')
  const [options, setOptions] = useState([])
  const [isSaveUsername, setIsSaveUsername] = useState(false)

  const [selectedOption, setSelectedOption] = useState(null)

  //   })
  // }

  //     })

  //   }
  // }

  const validate = obj => {
    const isValid = []
    for (const item in obj) {
      if (obj[item] === '') {
        isValid.push(item)
      }
    }
    return isValid
  }
  const onSubmit = async e => {
    e.preventDefault()
    if (forgotPasswordStatus) {
      const pass = validate({ username: creds.username })
      if (!pass.length) {
        setError({})
        setLoading(() => true)
        const data = { username: creds.username }
        await axios
          .post(`${process.env.REACT_APP_API_URL}/user/forgotPassword`, data, {
            headers: { 'content-type': 'application/json' },
          })
          .then(res => {
            toast.success(
              <ToastContentMessage message={res?.data?.message || 'Email sent'} status={true} />,
              {
                position: 'top-right',
                transition: Slide,
                hideProgressBar: false,
                autoClose: 5000,
                draggable: true,
                pauseOnHover: true,
                closeOnClick: true,
                progress: undefined,
              }
            )
            setForgotPasswordStatus(false)
            setLoading(() => false)
          })
          .catch(err => {
            const message = extractErrorMessage(
              err?.response?.data ?? err,
              'Something went wrong, Please try again later!'
            )
            toast.error(
              <ToastContentMessage message={message} status={false} />,
              {
                transition: Slide,
                hideProgressBar: true,
                autoClose: 4000,
              }
            )
            setError(prev => ({ ...prev, forgotPassword: message }))
            setLoading(() => false)
          })
      } else {
        setError(prev => {
          const errors = { ...prev }
          pass.forEach(item => {
            errors[item] = 1
          })
          return errors
        })
      }
    } else {
      const pass = validate(creds)
      if (!pass.length) {
        setLoading(() => true)
        useJwt
          .login(creds)
          .then(res => {
            const user = res?.data?.user
            const token = res?.data?.token
            if (user && user.status === 1) {
              const data = {
                ...user,
                accessToken: token,
                refreshToken: token,
              }
              if (res?.data?.dateFormats) {
                data.dateFormats = res.data.dateFormats
              }

              if (isSaveUsername) {
                const usernames = localStorage.getItem('usernames')
                let etmp = []
                if (usernames) {
                  etmp = JSON.parse(usernames) || []
                }

                if (!etmp.includes(btoa(creds.username))) {
                  etmp.push(btoa(creds.username))
                }

                localStorage.setItem('usernames', JSON.stringify(etmp))
              }

              dispatch(handleLogin(data))

              //     })

              // }
              ability.update(user.access)

              setLoading(() => false)
              navigate(getHomeRouteForLoggedInUser(data))

              if (!res?.data?.error) {
                toast.success(
                  <ToastContent
                    name={data.fullName || data.username || 'John Doe'}
                    role={data.role || 'admin'}
                  />,
                  {
                    transition: Slide,
                    hideProgressBar: true,
                    autoClose: 2000,
                  }
                )
              } else {
                toast.error(
                  <ToastContentMessage
                    message={res?.data?.error?.message || 'Login failed'}
                    status={false}
                  />,
                  {
                    transition: Slide,
                    hideProgressBar: true,
                    autoClose: 4000,
                  }
                )
              }
            } else {
              setLoading(() => false)
              toast.info(<ToastInActiveAccount />, {
                position: 'top-center',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              })
            }
          })
          .catch(err => {
            console.log(err)
            setLoading(() => false)
            setError(prev => {
              return {
                ...prev,
                auth: extractErrorMessage(err?.response?.data ?? err, 'Login failed'),
              }
            })
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

  //   )
  // }

  const handleDelete = option => {
    const updatedSuggestions = options.filter(suggestion => suggestion.label !== option.label)
    setOptions(updatedSuggestions)
    const tmp = []
    const etmp = []
    options.map(op => {
      if (op.label !== option.label) {
        tmp.push(op)
        etmp.push(btoa(op.value))
      }
    })
    setOptions(tmp)
    localStorage.setItem('usernames', JSON.stringify(etmp))
  }

  //     >

  // )

  const onSuggestionSelected = suggestion => {
    setCreds(prev => {
      return { ...prev, username: suggestion.label }
    })
  }

  useEffect(() => {
    const usernames = localStorage.getItem('usernames')
    if (usernames) {
      const unminifiedData = JSON.parse(usernames) || []

      const tmp = []
      unminifiedData.map(uD => {
        const d = atob(uD)
        tmp.push({
          label: d,
        })
      })

      setOptions(tmp)
    }
  }, [])

  return (
    <div className="main-login-banner">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 left">
            <div className="logo-image">
              <img src={themeConfig.app.appLogoImage} alt="" />
            </div>
            <div className="title">
              {forgotPasswordStatus ? (
                <h3>
                  Password Reset:
                  <br /> Regain Access to Your Account
                </h3>
              ) : (
                <h3>
                  Welcome to Your Digital <br /> Healthcare Platform
                </h3>
              )}
            </div>
            <div className="form-sec">
              <form onSubmit={onSubmit} autoComplete="off">
                <div className="form-group-auth">
                  <label htmlFor="username">Username | Email</label>

                  <AutocompleteInput
                    suggestions={options}
                    onSuggestionSelected={onSuggestionSelected}
                    handleDelete={handleDelete}
                  />
                  {!forgotPasswordStatus && (
                    <FormControlLabel
                      label="Save username?"
                      control={
                        <Checkbox
                          checked={isSaveUsername}
                          onChange={e => setIsSaveUsername(!isSaveUsername)}
                          id="default"
                          name="default"
                          color="primary"
                        />
                      }
                    />
                  )}
                  {}

                  {}

                  {}
                </div>
                {!forgotPasswordStatus && (
                  <div className="form-group-auth">
                    <label htmlFor="password">Password</label>
                    <div className="passwordClass">
                      <input
                        type={togglePassword ? 'password' : 'text'}
                        className="form-control authentication-input-fields"
                        id="password"
                        name="password"
                        tabIndex="2"
                        autoComplete="new-password"
                        value={creds.password}
                        onChange={inputHandler}
                        invalid={(error && error.password && true) || (error && error.auth && true)}
                      />
                      {togglePassword ? (
                        <Eye size={20} onClick={() => setTogglePassword(prev => !prev)} />
                      ) : (
                        <EyeOff size={20} onClick={() => setTogglePassword(prev => !prev)} />
                      )}
                    </div>
                  </div>
                )}
                {error && error.auth && !forgotPasswordStatus && (
                  <FormFeedback
                    style={
                      Object.keys(error).length > 0
                        ? { display: 'block', marginBottom: '1rem' }
                        : { display: 'none' }
                    }
                  >
                    {error.auth}
                  </FormFeedback>
                )}
                {error && error.forgotPassword && forgotPasswordStatus && (
                  <FormFeedback
                    style={{ display: 'block', marginBottom: '1rem' }}
                  >
                    {error.forgotPassword}
                  </FormFeedback>
                )}
                {error && (error.username || error.usernane) && forgotPasswordStatus && (
                  <FormFeedback
                    style={{ display: 'block', marginBottom: '1rem' }}
                  >
                    Please enter your username or email.
                  </FormFeedback>
                )}
                <div className="login-btn">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {!loading ? (
                      forgotPasswordStatus ? (
                        'RESET PASSWORD'
                      ) : (
                        'LOGIN'
                      )
                    ) : (
                      <Spinner color="white" size="sm" />
                    )}
                  </button>
                </div>
              </form>
              {!forgotPasswordStatus && (
                <p
                  className="forgot-password-text"
                  onClick={() => {
                    setError({})
                    setForgotPasswordStatus(true)
                  }}
                >
                  {' '}
                  Forgot password?{' '}
                </p>
              )}
            </div>
          </div>
          <div className="col-lg-6 right">
            <img src={bodyImg} alt="" />
          </div>
        </div>
      </div>
      <div className="float-md-right footer">
        <p>
          Powered by &nbsp;
          <Heart size={20} /> &nbsp;
          <a
            href={`${process.env.REACT_APP_POWER_BY_URL}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {`${process.env.REACT_APP_POWER_BY_NAME}`}
          </a>
        </p>
      </div>
    </div>
  )
}

export default NewLogin
