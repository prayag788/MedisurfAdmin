import * as yup from 'yup'
import classnames from 'classnames'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { yupResolver } from '@hookform/resolvers/yup'
import { Form, FormGroup, Row, Col, Button, FormFeedback } from 'reactstrap'
import InputPasswordToggle from '@components/input-password-toggle'
import axios from 'axios'
import {
  showErrorAlert,
  showSuccessAlert,
  getErrorMessage,
} from '../../../utils/alerts'
import { getHomeRouteForLoggedInUser } from '@utils'
import { useEffect, useState } from 'react'

const PasswordTabContent = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const userData = JSON.parse(localStorage.getItem('userData'))
  const isFirstTimeUser = userData?.pwdCng === false

  const SignupSchema = yup.object().shape({
    'old-password': yup.string().required('Please enter old password.'),
    'new-password': yup
      .string()
      .required('Please enter new password.')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~`!\-@#^()_+={[}\]|\\:;"'<,>./$!%*?&])[A-Za-z\d~`!\-@#^()_+={[}\]|\\:;"'<,>./$!%*?&]{8,16}$/,
        'Password must contain at least 8 characters and maximum 16 characters, one uppercase, one number and one special case character'
      ),
    'retype-new-password': yup
      .string()
      .required('Please enter confirm password.')
      .oneOf(
        [yup.ref(`new-password`), null],
        'Please ensure the new passwords match'
      ),
  })

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    clearErrors,
    setValue,
    getValues,
    watch,
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(SignupSchema),
    defaultValues: {
      'old-password': '',
      'new-password': '',
      'retype-new-password': '',
    },
  })

  // Watch form values for real-time validation
  const watchedValues = watch()

  // Clear errors when form fields have valid values
  useEffect(() => {
    // Clear errors for fields that have values and meet validation criteria
    if (watchedValues['old-password'] && watchedValues['old-password'].trim()) {
      clearErrors('old-password')
    }
    if (watchedValues['new-password'] && watchedValues['new-password'].trim()) {
      // Only clear if password meets regex requirements
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~`!\-@#^()_+={[}\]|\\:;"'<,>./$!%*?&])[A-Za-z\d~`!\-@#^()_+={[}\]|\\:;"'<,>./$!%*?&]{8,16}$/
      if (passwordRegex.test(watchedValues['new-password'])) {
        clearErrors('new-password')
      }
    }
    if (
      watchedValues['retype-new-password'] &&
      watchedValues['retype-new-password'].trim()
    ) {
      // Only clear if passwords match
      if (
        watchedValues['new-password'] === watchedValues['retype-new-password']
      ) {
        clearErrors('retype-new-password')
      }
    }
  }, [watchedValues, clearErrors, isFirstTimeUser])

  const onSubmit = async (data, e) => {
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      const requestData = {
        newPwd: data['new-password'],
        oldPwd: data['old-password'],
      }

      console.log('Password change request:', {
        url: `${process.env.REACT_APP_API_URL}/user/cpwd/change`,
        isFirstTimeUser,
        hasOldPassword: !!requestData.oldPwd,
        hasNewPassword: !!requestData.newPwd,
      })

      // Get the authentication token from localStorage
      const token = localStorage.getItem('accessToken')

      if (!token) {
        showErrorAlert('Authentication token not found. Please log in again.')
        navigate('/login')
        return
      }

      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/user/cpwd/change`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout
        }
      )

      console.log('Password change response:', response.status, response.data)

      if (response.status === 200) {
        reset()
        await showSuccessAlert('Password successfully updated!')

        const userDetails = JSON.parse(localStorage.getItem('userData'))
        if (userDetails.pwdCng === false) {
          userDetails.pwdCng = true
          localStorage.setItem('userData', JSON.stringify(userDetails))
          navigate('/study-list')
        }
      }
    } catch (err) {
      console.error('Password change error:', err)

      let errorMessage = 'Failed to update password. Please try again.'

      if (err.code === 'ECONNREFUSED') {
        errorMessage =
          'Cannot connect to server. Please check if the server is running.'
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.'
      } else if (err.response) {
        // Server responded with error status
        console.error(
          'Server error response:',
          err.response.status,
          err.response.data
        )
        errorMessage = getErrorMessage(err)
      } else if (err.request) {
        // Request was made but no response received
        console.error('No response received:', err.request)
        errorMessage = 'No response from server. Please check your connection.'
      } else {
        // Something else happened
        console.error('Request setup error:', err.message)
        errorMessage = err.message || errorMessage
      }

      showErrorAlert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const CancelForm = () => {
    navigate(-1)
  }

  // Handle input changes to clear errors dynamically
  const handleInputChange = (fieldName, value) => {
    setValue(fieldName, value, { shouldValidate: true })
  }

  return (
    <>
      {/* {isFirstTimeUser && (
        <div className="alert alert-info mb-2">
          <h6 className="alert-heading">Welcome! Please set your new password</h6>
          <p className="mb-0">As a first-time user, you only need to set a new password. No old password required.</p>
        </div>
      )} */}
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col sm="6">
            <FormGroup>
              <InputPasswordToggle
                label="Old Password"
                htmlFor="old-password"
                name="old-password"
                {...register('old-password')}
                onChange={(e) =>
                  handleInputChange('old-password', e.target.value)
                }
                className={classnames('input-group-merge', {
                  'is-invalid': errors['old-password'],
                })}
              />
              {errors && errors['old-password'] && (
                <FormFeedback>{errors['old-password'].message}</FormFeedback>
              )}
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col sm="6">
            <FormGroup>
              <InputPasswordToggle
                label="New Password"
                htmlFor="new-password"
                name="new-password"
                {...register('new-password')}
                onChange={(e) =>
                  handleInputChange('new-password', e.target.value)
                }
                className={classnames('input-group-merge', {
                  'is-invalid': errors['new-password'],
                })}
              />
              {errors && errors['new-password'] && (
                <FormFeedback>{errors['new-password'].message}</FormFeedback>
              )}
            </FormGroup>
          </Col>
          <Col sm="6">
            <FormGroup>
              <InputPasswordToggle
                label="Retype New Password"
                htmlFor="retype-new-password"
                name="retype-new-password"
                {...register('retype-new-password')}
                onChange={(e) =>
                  handleInputChange('retype-new-password', e.target.value)
                }
                className={classnames('input-group-merge', {
                  'is-invalid': errors['retype-new-password'],
                })}
              />
              {errors && errors['retype-new-password'] && (
                <FormFeedback>
                  {errors['retype-new-password'].message}
                </FormFeedback>
              )}
            </FormGroup>
          </Col>
          <Col className="mt-1" sm="12">
            <Button.Ripple
              type="submit"
              className="mr-1 sm-mb-1"
              color="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Save changes'}
            </Button.Ripple>
            <Button.Ripple
              color="secondary"
              outline
              onClick={CancelForm}
              disabled={isSubmitting}
            >
              Cancel
            </Button.Ripple>
          </Col>
        </Row>
      </Form>
    </>
  )
}

export default PasswordTabContent
