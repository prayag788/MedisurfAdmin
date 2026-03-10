import { useState, useContext, Fragment } from 'react'
import classnames from 'classnames'
import Avatar from '@components/avatar'
import { useSkin } from '@hooks/useSkin'
import useJwt from '@src/auth/jwt/useJwt'
import { useDispatch } from 'react-redux'
import { toast, Slide } from 'react-toastify'
import { handleLogin } from '@store/actions/auth'
import { AbilityContext } from '@src/utility/context/Can'
import { Link, useNavigate } from 'react-router-dom'
import InputPasswordToggle from '@components/input-password-toggle'
import { getHomeRouteForLoggedInUser } from '@utils'
import { Coffee, AlertCircle, Check, X } from 'react-feather'
import {
  Row,
  Col,
  CardTitle,
  CardText,
  Form,
  Input,
  FormGroup,
  Label,
  Button,
  Spinner,
  FormFeedback,
} from 'reactstrap'

import '@styles/base/pages/page-auth.scss'
import '@styles/react/libs/login/login.scss'

const ToastContent = ({ name, role }) => (
  <div className="d-flex">
    <Avatar
      size="sm"
      color="success"
      icon={<Coffee size={12} />}
      className="me-2 flex-shrink-0"
    />
    <div className="flex-grow-1">
      <div className="toast-title font-weight-bold">Welcome, {name}</div>
      <div className="toast-message">
        You have successfully logged in as an {role} user to{' '}
        {`${process.env.REACT_APP_INNER_NAME}`}. Now you can start to explore.
        Enjoy!
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
      <div className="toast-title font-weight-bold">
        {status ? 'Success' : 'Failed'}
      </div>
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

const Login = (props) => {
  const [skin, setSkin] = useSkin()
  const ability = useContext(AbilityContext)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [creds, setCreds] = useState({ username: '', password: '' })
  const [error, setError] = useState({})
  const [loading, setLoading] = useState(false)

  const illustration = skin === 'dark' ? 'login-v2-dark.svg' : 'login-v2.svg',
    source = require(`@src/assets/images/pages/${illustration}`).default

  const validate = (obj) => {
    const isValid = []
    for (const item in obj) {
      if (obj[item] === '') {
        isValid.push(item)
      }
    }
    return isValid
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const pass = validate(creds)
    if (!pass.length) {
      setLoading(() => true)
      useJwt
        .login(creds)
        .then((res) => {
          setLoading(() => false)
          if (res.data.user.status === 1) {
            const data = {
              ...res.data.user,
              accessToken: res.data.token,
              refreshToken: res.data.token,
            }
            dispatch(handleLogin(data))
            ability.update(res.data.user.access)
            console.log('cmng from here')
            setTimeout(() => {
              navigate(getHomeRouteForLoggedInUser(data.role))
            }, 1000)
            if (!res.data.error) {
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
                  message={res.data.error.message}
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
        .catch((err) => {
          setLoading(() => false)
          setError((prev) => {
            return {
              ...prev,
              auth: err.response.data ? err.response.data.error.message : '',
            }
          })
        })
    } else {
      setError((prev) => {
        const errors = {}
        pass.map((item) => {
          errors[item] = 1
        })
        return errors
      })
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
    <div className="auth-wrapper auth-v2">
      <Row className="auth-inner m-0">
        <Link className="brand-logo" to="/" onClick={(e) => e.preventDefault()}>
          <svg viewBox="0 0 139 95" version="1.1" height="28">
            <defs>
              <linearGradient
                x1="100%"
                y1="10.5120544%"
                x2="50%"
                y2="89.4879456%"
                id="linearGradient-1"
              >
                <stop stopColor="#000000" offset="0%"></stop>
                <stop stopColor="#FFFFFF" offset="100%"></stop>
              </linearGradient>
              <linearGradient
                x1="64.0437835%"
                y1="46.3276743%"
                x2="37.373316%"
                y2="100%"
                id="linearGradient-2"
              >
                <stop stopColor="#EEEEEE" stopOpacity="0" offset="0%"></stop>
                <stop stopColor="#FFFFFF" offset="100%"></stop>
              </linearGradient>
            </defs>
            <g
              id="Page-1"
              stroke="none"
              strokeWidth="1"
              fill="none"
              fillRule="evenodd"
            >
              <g id="Artboard" transform="translate(-400.000000, -178.000000)">
                <g id="Group" transform="translate(400.000000, 178.000000)">
                  <path
                    d="M-5.68434189e-14,2.84217094e-14 L39.1816085,2.84217094e-14 L69.3453773,32.2519224 L101.428699,2.84217094e-14 L138.784583,2.84217094e-14 L138.784199,29.8015838 C137.958931,37.3510206 135.784352,42.5567762 132.260463,45.4188507 C128.736573,48.2809251 112.33867,64.5239941 83.0667527,94.1480575 L56.2750821,94.1480575 L6.71554594,44.4188507 C2.46876683,39.9813776 0.345377275,35.1089553 0.345377275,29.8015838 C0.345377275,24.4942122 0.230251516,14.560351 -5.68434189e-14,2.84217094e-14 Z"
                    id="Path"
                    className="text-primary"
                    style={{ fill: 'currentColor' }}
                  ></path>
                  <path
                    d="M69.3453773,32.2519224 L101.428699,1.42108547e-14 L138.784583,1.42108547e-14 L138.784199,29.8015838 C137.958931,37.3510206 135.784352,42.5567762 132.260463,45.4188507 C128.736573,48.2809251 112.33867,64.5239941 83.0667527,94.1480575 L56.2750821,94.1480575 L32.8435758,70.5039241 L69.3453773,32.2519224 Z"
                    id="Path"
                    fill="url(#linearGradient-1)"
                    opacity="0.2"
                  ></path>
                  <polygon
                    id="Path-2"
                    fill="#000000"
                    opacity="0.049999997"
                    points="69.3922914 32.4202615 32.8435758 70.5039241 54.0490008 16.1851325"
                  ></polygon>
                  <polygon
                    id="Path-2"
                    fill="#000000"
                    opacity="0.099999994"
                    points="69.3922914 32.4202615 32.8435758 70.5039241 58.3683556 20.7402338"
                  ></polygon>
                  <polygon
                    id="Path-3"
                    fill="url(#linearGradient-2)"
                    opacity="0.099999994"
                    points="101.428699 0 83.0667527 94.1480575 130.378721 47.0740288"
                  ></polygon>
                </g>
              </g>
            </g>
          </svg>
          <h2 className="brand-text text-primary ml-1">{`${process.env.REACT_APP_INNER_NAME}`}</h2>
        </Link>
        <Col
          className="d-lg-flex align-items-center p-lg-5 p-sm-5 p-4"
          lg="8"
          sm="12"
        >
          <div className="w-100 d-lg-flex align-items-center justify-content-center px-lg-5">
            <img className="img-fluid-new px-1" src={source} alt="Login V2" />
          </div>
        </Col>
        <Col
          className="d-flex align-items-center auth-bg py-4 px-4 p-lg-5"
          lg="4"
          sm="12"
        >
          <Col className="px-xl-2 mx-auto px-1" sm="8" md="6" lg="12">
            <CardTitle tag="h2" className="font-weight-bold mb-1">
              Welcome to {`${process.env.REACT_APP_INNER_NAME}`}! 👋
            </CardTitle>
            <CardText className="mb-2">
              Please sign-in to your account and start the adventure
            </CardText>
            <Form className="auth-login-form mt-2" onSubmit={onSubmit}>
              <FormGroup>
                <Label className="form-label" for="username">
                  Username/Email
                </Label>
                <Input
                  autoFocus
                  tabIndex="1"
                  type="text"
                  id="username"
                  name="username"
                  value={creds.username}
                  placeholder="john@example.com"
                  onChange={inputHandler}
                  invalid={
                    (error && error.username && true) ||
                    (error && error.auth && true)
                  }
                  className={classnames()}
                />
              </FormGroup>
              <FormGroup>
                <div className="d-flex justify-content-between">
                  <Label className="form-label" for="password">
                    Password
                  </Label>
                  <Link to="/forgot-password">
                    <small>Forgot Password?</small>
                  </Link>
                </div>
                <InputPasswordToggle
                  id="password"
                  name="password"
                  tabIndex="2"
                  value={creds.password}
                  onChange={inputHandler}
                  invalid={
                    (error && error.password && true) ||
                    (error && error.auth && true)
                  }
                  className={classnames({
                    'is-invalid': error && error.auth && true,
                  })}
                />
                {error && error.auth && (
                  <FormFeedback>{error.auth}</FormFeedback>
                )}
              </FormGroup>
              <Button.Ripple
                type="submit"
                color="primary"
                block
                tabIndex="3"
                disabled={loading}
                className="d-flex align-items-center justify-content-center"
              >
                {!loading ? 'Sign in' : <Spinner color="white" size="sm" />}
                {!loading ? '' : <p className="ml-50 mb-0">Loading...</p>}
              </Button.Ripple>
            </Form>
            {}
          </Col>
        </Col>
      </Row>
    </div>
  )
}

export default Login
