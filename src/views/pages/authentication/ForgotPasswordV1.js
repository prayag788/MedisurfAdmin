import * as yup from 'yup'
import classnames from 'classnames'
import Avatar from '@components/avatar'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, X, Check } from 'react-feather'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import InputPasswordToggle from '@components/input-password-toggle'
import {
  Card,
  CardBody,
  CardTitle,
  CardText,
  Form,
  FormGroup,
  Button,
  Spinner,
  FormFeedback,
} from 'reactstrap'
import '@styles/base/pages/page-auth.scss'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useState } from 'react'

const ToastContent = ({ message, type }) => (
  <div className="d-flex">
    <Avatar
      size="sm"
      color={type === 'success' ? 'success' : 'danger'}
      icon={type === 'success' ? <Check size={12} /> : <X size={12} />}
      className="me-2 flex-shrink-0"
    />
    <div className="flex-grow-1">
      <div className="toast-title font-weight-bold">{type === 'success' ? 'Success' : 'Error'}</div>
      <div className="toast-message">{message}</div>
    </div>
  </div>
)

const ForgotPasswordV1 = () => {
  const params = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const SignupSchema = yup.object().shape({
    'new-password': yup
      .string()
      .required('Please enter a new password.')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must contain at least 8 characters, one uppercase, one number and one special case character'
      ),
    'reenter-new-password': yup
      .string()
      .required('Please re-enter the password.')
      .oneOf([yup.ref(`new-password`), null], 'Please ensure the new passwords match'),
  })

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ mode: 'onChange', resolver: yupResolver(SignupSchema) })

  const onSubmit = async data => {
    try {
      setLoading(() => true)
      const response = await axios({
        method: 'PATCH',
        url: `${process.env.REACT_APP_API_URL}/user/forgotPassword/change`,
        data: {
          newPwd: data['new-password'],
          token: params.token,
        },
      })
      setLoading(() => false)

      toast.success(<ToastContent message={response.data.message} type={'success'} />, {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })

      navigate('/login')
    } catch (err) {
      setLoading(() => false)
      console.log(err)
      navigate('/misc/expiredLink?query=forgotpassword')
    }
  }

  return (
    <div className="auth-wrapper auth-v1 px-2">
      <div className="auth-inner py-2">
        <Card className="mb-0">
          <CardBody>
            <Link className="brand-logo" to="/" onClick={e => e.preventDefault()}>
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
                <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
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
            <CardTitle tag="h4" className="mb-1">
              Change Password 🔒
            </CardTitle>
            <CardText className="mb-2">Please enter your new password</CardText>
            <Form className="auth-forgot-password-form mt-2" onSubmit={handleSubmit(onSubmit)}>
              <FormGroup>
                <InputPasswordToggle
                  label="New Password"
                  htmlFor="new-password"
                  name="new-password"
                  {...register('new-password', { required: true })}
                  className={classnames('input-group-merge', {
                    'is-invalid': errors['new-password'],
                  })}
                />
                {errors && errors['new-password'] && (
                  <FormFeedback>{errors['new-password'].message}</FormFeedback>
                )}
              </FormGroup>
              <FormGroup>
                <InputPasswordToggle
                  label="Re-enter New Password"
                  htmlFor="reenter-new-password"
                  name="reenter-new-password"
                  {...register('reenter-new-password', { required: true })}
                  className={classnames('input-group-merge', {
                    'is-invalid': errors['reenter-new-password'],
                  })}
                />
                {errors && errors['reenter-new-password'] && (
                  <FormFeedback>{errors['reenter-new-password'].message}</FormFeedback>
                )}
              </FormGroup>
              <Button.Ripple
                color="primary"
                block
                type="submit"
                disabled={loading}
                className="d-flex align-items-center justify-content-center"
              >
                {!loading ? 'Change Password' : <Spinner color="white" size="sm" />}
                {!loading ? '' : <p className="ml-50 mb-0">Loading...</p>}
              </Button.Ripple>
            </Form>
            <p className="text-center mt-2">
              <Link to="/pages/login-v1">
                <ChevronLeft className="mr-25" size={14} />
                <span className="align-middle">Back to login</span>
              </Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default ForgotPasswordV1
