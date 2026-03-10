import { useState } from 'react'
import { isUserLoggedIn } from '@utils'
import Avatar from '@components/avatar'
import { useSkin } from '@hooks/useSkin'
import { ChevronLeft, X, Check } from 'react-feather'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import classnames from 'classnames'
import {
  Row,
  Col,
  CardTitle,
  CardText,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Spinner,
} from 'reactstrap'
import '@styles/base/pages/page-auth.scss'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ToastContent, ToastContentForError } from '../../../utils/toast'

const ForgotPassword = () => {
  const [skin, setSkin] = useSkin()
  const [error, setError] = useState({})
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const illustration =
      skin === 'dark'
        ? 'forgot-password-v2-dark.svg'
        : 'forgot-password-v2.svg',
    source = require(`@src/assets/images/pages/${illustration}`).default

  const validate = (email) => {
    const isValid = []
    if (email === '') {
      isValid.push('email')
    }
    return isValid
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const pass = validate(email)
    if (!pass.length) {
      setLoading((prev) => true)
      try {
        await axios({
          method: 'POST',
          url: `${process.env.REACT_APP_API_URL}/user/forgotPassword`,
          data: { email },
        })
        setLoading((prev) => false)
        toast.success(
          <ToastContent
            message={
              'A password reset link has been sent to your email address. Enjoy!'
            }
          />,
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
        navigate('/login')
      } catch (err) {
        setLoading((prev) => false)
        toast.error(
          <ToastContentForError message={'Email address does not exist'} />,
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
        setError((prev) => {
          return { email: 1 }
        })
      }
    } else {
      setError((prev) => {
        return { email: 1 }
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
    setEmail((prev) => {
      return value
    })
  }

  if (!isUserLoggedIn()) {
    return (
      <div className="auth-wrapper auth-v2">
        <Row className="auth-inner m-0">
          <Link
            className="brand-logo"
            to="/"
            onClick={(e) => e.preventDefault()}
          >
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
                <g
                  id="Artboard"
                  transform="translate(-400.000000, -178.000000)"
                >
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
            className="d-none d-lg-flex align-items-center p-5"
            lg="8"
            sm="12"
          >
            <div className="w-100 d-lg-flex align-items-center justify-content-center px-5">
              <img className="img-fluid" src={source} alt="Login V2" />
            </div>
          </Col>
          <Col
            className="d-flex align-items-center auth-bg px-2 p-lg-5"
            lg="4"
            sm="12"
          >
            <Col className="px-xl-2 mx-auto" sm="8" md="6" lg="12">
              <CardTitle tag="h2" className="font-weight-bold mb-1">
                Forgot Password? 🔒
              </CardTitle>
              <CardText className="mb-2">
                Enter your email and we'll send you instructions to reset your
                password
              </CardText>
              <Form
                className="auth-forgot-password-form mt-2"
                onSubmit={onSubmit}
              >
                <FormGroup>
                  <Label className="form-label" for="login-email">
                    Email
                  </Label>
                  <Input
                    type="email"
                    id="login-email"
                    name="email"
                    value={email}
                    onChange={inputHandler}
                    placeholder="john@example.com"
                    autoFocus
                    invalid={
                      (error && error.email && true) ||
                      (error && error.auth && true)
                    }
                    className={classnames()}
                  />
                </FormGroup>
                <Button.Ripple
                  color="primary"
                  block
                  type="submit"
                  disabled={loading}
                >
                  {!loading ? (
                    'Send reset link'
                  ) : (
                    <Spinner color="white" size="sm" />
                  )}
                </Button.Ripple>
              </Form>
              <p className="text-center mt-2">
                <Link to="/login">
                  <ChevronLeft className="mr-25" size={14} />
                  <span className="align-middle">Back to login</span>
                </Link>
              </p>
            </Col>
          </Col>
        </Row>
      </div>
    )
  } else {
    return <Navigate to="/" replace />
  }
}

export default ForgotPassword
