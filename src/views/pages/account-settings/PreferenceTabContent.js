import * as yup from 'yup'
import classnames from 'classnames'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  Form,
  FormGroup,
  Row,
  Col,
  Card,
  Button,
  FormFeedback,
  Input,
  Label,
  Modal,
  Spinner,
} from 'reactstrap'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { SketchPicker } from 'react-color'
import ROLES from '@configs/roles'
import STUDYSTATUS from '@configs/studyStatus'
import {
  showErrorAlert,
  showSuccessAlert,
  getErrorMessage,
} from '../../../utils/alerts'

const PreferenceTabContent = () => {
  const navigate = useNavigate()

  const userData = JSON.parse(localStorage.getItem('userData'))
  const [logoutMinutes, setlogoutMinutes] = useState(userData?.logoutMinutes)
  const [viewerPreference, setviewerPreference] = useState(
    userData?.viewerPreference
  )
  const [expirationDate, setexpirationDate] = useState(
    userData?.expirationDate ? userData?.expirationDate : 1
  )
  const [qrCodeExpiration, setQrCodeExpiration] = useState(
    userData?.expirationDate ? userData?.expirationDate : 1
  )
  const [reportEditableHours, setReportEditableHours] = useState(
    userData?.reportEditableHours ? userData?.reportEditableHours : 0
  ) //The code added for manage the reportEditableHours value. Changed by Mehul JCasp @ 30th Sep 23
  const [viewerIconVisible, setViewerIconVisible] = useState(
    userData?.viewerIconVisible ? userData?.viewerIconVisible : false
  )
  const [openColor, setOpenColor] = useState(false)
  const [displayColor, setDisplayColor] = useState('')
  const [statusColor, setStatusColor] = useState(
    userData.role !== ROLES.ClinicAdmin ? userData.statusColor : null
  )

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    axios
      .get(`${process.env.REACT_APP_API_URL}/user/status/color`)
      .then((res) => {
        setStatusColor(res.data.message)
        setLoading(false)
      })
      .catch((err) => {
        setLoading(false)
        if (err && err.response) {
          showErrorAlert(getErrorMessage(err))
        }
      })
  }, [])

  const handleColorChange = (e, newColor) => {
    switch (newColor) {
      case 'completed':
        {
          setStatusColor({ ...statusColor, [newColor]: e.hex })
        }
        break
      case 'preliminary':
        {
          setStatusColor({ ...statusColor, [newColor]: e.hex })
        }
        break
      case 'read':
        {
          setStatusColor({ ...statusColor, [newColor]: e.hex })
        }
        break
      case 'final': {
        setStatusColor({ ...statusColor, [newColor]: e.hex })
      }
    }
  }

  const handleColorAccept = () => {
    setDisplayColor('')
    setOpenColor(false)
  }

  const SignupSchema = yup.object().shape({
    logoutMinutes: yup
      .number('Please enter minutes number format. Example 10.')
      .typeError('Please enter minutes number format. Example 10.')
      .min(1, 'The logout duration must be set to a minimum of 1 minute.')
      .required('Please enter auto logout minutes.'),
    viewerPreference: yup.string().required('Please select viewer preference.'),
    expirationDate: yup
      .number()
      .typeError('Please enter expiration hours in number format. Example 10.')
      .min(1, 'Please enter expiration hours in number format. Example 10.')
      .test('isReq', 'Please enter expiration hours', (val) => {
        if (userData.role === ROLES.ClinicAdmin) {
          return val !== null && val !== undefined && val !== ''
        } else {
          return true
        }
      }),
    reportEditableHours: yup
      .number()
      .typeError(
        'Please enter report editable hours in number format. Example 10.'
      )
      .min(0, 'Report editable hours must be at least 0.')
      // .max(168, 'Report editable hours must be at most 168.')
      .test('isReq', 'Please enter report editable hours', (val) => {
        if (userData.role === ROLES.ClinicAdmin) {
          return val !== null && val !== undefined && val !== ''
        } else {
          return true
        }
      }),
  })

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    resolver: yupResolver(SignupSchema),
    defaultValues: {
      logoutMinutes: userData?.logoutMinutes || '',
      viewerPreference: userData?.viewerPreference || '_self',
      expirationDate: userData?.expirationDate || 1,
      reportEditableHours: userData?.reportEditableHours || 0,
    },
  })

  // Reset form with current values when component mounts
  useEffect(() => {
    reset({
      logoutMinutes,
      viewerPreference,
      expirationDate,
      reportEditableHours,
    })
  }, [
    logoutMinutes,
    viewerPreference,
    expirationDate,
    reportEditableHours,
    reset,
  ])

  const onSubmit = (data, e) => {
    axios
      .patch(`${process.env.REACT_APP_API_URL}/user/preference/change`, {
        logoutMinutes: data['logoutMinutes'],
        viewerPreference: data['viewerPreference'],
        expirationDate: data['expirationDate'],
        qrCodeExpiration: data['expirationDate'],
        reportEditableHours: data['reportEditableHours'], //The code added for set the request in reportEditableHours. Changed by Mehul JCasp @ 30th Sep 23
        viewerIconVisible,
        statusColor,
      })
      .then((doc) => {
        showSuccessAlert('Preferences updated successfully!').then(() => {
          const userDetails = JSON.parse(localStorage.getItem('userData'))
          userDetails.logoutMinutes = doc.data.user.logoutMinutes
          userDetails.viewerPreference = doc.data.user.viewerPreference
          userDetails.expirationDate = doc.data.user.expirationDate
          userDetails.qrCodeExpiration = doc.data.user.expirationDate
          userDetails.viewerIconVisible = doc.data.user.viewerIconVisible
          userDetails.reportEditableHours = doc.data.user.reportEditableHours //The code added for set the reportEditableHours for local storage. Changed by Mehul JCasp @ 30th Sep 23
          localStorage.setItem('userData', JSON.stringify(userDetails))
        })
      })
      .catch((err) => {
        if (err && err.response) {
          showErrorAlert(getErrorMessage(err))
        }
      })
  }

  const CancelForm = () => {
    navigate(-1)
  }

  const inputHandler = (e) => {
    const name = e.target.name
    if (name === 'logoutMinutes') {
      setlogoutMinutes(e.target.value)
    } else if (name === 'viewerPreference') {
      setviewerPreference(e.target.value)
    } else if (name === 'qrCodeExpiration') {
      setQrCodeExpiration(e.target.value)
    } else if (name === 'reportEditableHours') {
      setReportEditableHours(e.target.value) //The code added for change the value of reportEditableHours. Changed by Mehul JCasp @ 30th Sep 23
    } else {
      setexpirationDate(e.target.value)
    }
  }

  const statusHandler = (status) => {
    setOpenColor(true)
    setDisplayColor(status)
  }

  if (loading) {
    return (
      <Card className="loading-initial">
        <Spinner color="primary" />
      </Card>
    )
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Row>
        <Col sm="6">
          <FormGroup>
            <Label for="logoutMinutes">
              Auto logout minutes (Default 10 minutes)
            </Label>
            <Input
              name="logoutMinutes"
              id="logoutMinutes"
              {...register('logoutMinutes', { required: true })}
              className={classnames('input-group-merge', {
                'is-invalid': errors['logoutMinutes'],
              })}
              type="text"
              onChange={inputHandler}
              value={logoutMinutes}
            />
            {errors && errors['logoutMinutes'] && (
              <FormFeedback>{errors['logoutMinutes'].message}</FormFeedback>
            )}
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col sm="6">
          <FormGroup>
            <Label for="viewerPreference">
              Viewer Preference (Default same tab)
            </Label>
            <Input
              type="select"
              name="viewerPreference"
              id="viewerPreference"
              {...register('viewerPreference', { required: true })}
              onChange={inputHandler}
              value={viewerPreference}
            >
              <option value="_self">Same Tab</option>
              <option value="_blank">New Tab</option>
            </Input>
            {errors && errors['viewerPreference'] && (
              <FormFeedback>{errors['viewerPreference'].message}</FormFeedback>
            )}
          </FormGroup>
        </Col>
      </Row>

      {userData.role === ROLES.ClinicAdmin && (
        <Row>
          {}
          <Col sm="12">
            <Row>
              <Col sm="6">
                <FormGroup>
                  <Label for="reportEditableHours">
                    Report is editable after its creation(In hours)
                  </Label>
                  <Input
                    type="text"
                    name="reportEditableHours"
                    id="reportEditableHours"
                    {...register('reportEditableHours', { required: true })}
                    value={reportEditableHours}
                    className={classnames('input-group-merge', {
                      'is-invalid': errors['reportEditableHours'],
                    })}
                    readOnly={
                      userData.role !== ROLES.ClinicAdmin &&
                      userData.role !== ROLES.SuperAdmin
                    }
                    onChange={inputHandler}
                  />
                  {errors && errors['reportEditableHours'] && (
                    <FormFeedback>
                      {errors['reportEditableHours'].message}
                    </FormFeedback>
                  )}
                </FormGroup>
              </Col>
            </Row>
          </Col>
          {/* END */}
          <Col sm="12">
            <Row>
              <Col sm="6">
                <FormGroup>
                  <Label for="expirationDate">
                    Expiration hours for shared study(In hours)
                  </Label>
                  <Input
                    type="text"
                    name="expirationDate"
                    id="expirationDate"
                    readOnly={
                      userData.role !== ROLES.ClinicAdmin &&
                      userData.role !== ROLES.SuperAdmin
                    }
                    {...register('expirationDate', { required: true })}
                    value={expirationDate}
                    className={classnames('input-group-merge', {
                      'is-invalid': errors['expirationDate'],
                    })}
                    onChange={inputHandler}
                  />
                  {errors && errors['expirationDate'] && (
                    <FormFeedback>
                      {errors['expirationDate'].message}
                    </FormFeedback>
                  )}
                </FormGroup>
              </Col>
            </Row>
          </Col>
          <Col sm="12">
            <FormGroup>
              <Label>Select color to represent study's status</Label>
              <Row>
                <Col>
                  <button
                    type="button"
                    className="statusBtn"
                    style={
                      statusColor
                        ? { background: statusColor.completed }
                        : { background: 'grey' }
                    }
                    onClick={() => statusHandler('completed')}
                  >
                    {STUDYSTATUS.Unread}
                  </button>
                  <button
                    type="button"
                    className="statusBtn"
                    style={
                      statusColor
                        ? { background: statusColor.preliminary }
                        : { background: 'grey' }
                    }
                    onClick={() => statusHandler('preliminary')}
                  >
                    {STUDYSTATUS.Preliminary}
                  </button>
                  <button
                    type="button"
                    className="statusBtn"
                    style={
                      statusColor
                        ? { background: statusColor.read }
                        : { background: 'grey' }
                    }
                    onClick={() => statusHandler('read')}
                  >
                    {STUDYSTATUS.Ready}
                  </button>
                  <button
                    type="button"
                    className="statusBtn"
                    style={
                      statusColor
                        ? { background: statusColor.final }
                        : { background: 'grey' }
                    }
                    onClick={() => statusHandler('final')}
                  >
                    {STUDYSTATUS.Final}
                  </button>
                </Col>
              </Row>
            </FormGroup>
          </Col>
        </Row>
      )}
      <Row>
        <Col className="mt-1" sm="12">
          <FormGroup check inline>
            <Input
              type="checkbox"
              checked={viewerIconVisible}
              id="ViewerIconVisible"
              onChange={(e) => {
                setViewerIconVisible(e.target.checked)
              }}
            />
            <Label for="ViewerIconVisible">All Viewer Icons Visible ?</Label>
          </FormGroup>
        </Col>

        <Col className="mt-1" sm="12">
          <Button.Ripple type="submit" className="mr-1 sm-mb-1" color="primary">
            Save changes
          </Button.Ripple>
          <Button.Ripple color="secondary" outline onClick={CancelForm}>
            Cancel
          </Button.Ripple>
        </Col>
      </Row>
      {statusColor && (
        <Modal
          isOpen={openColor}
          toggle={() => setOpenColor(!openColor)}
          className="statusModal"
        >
          <>
            <SketchPicker
              color={statusColor[displayColor]}
              onChange={(e) => handleColorChange(e, displayColor)}
            />
            <div className="d-flex justify-content-around">
              <Button
                className="mt-1"
                type="button"
                color="danger"
                onClick={() => {
                  setStatusColor(userData.statusColor)
                  setOpenColor(false)
                }}
              >
                Cancel
              </Button>
              <Button
                className="mt-1"
                type="button"
                color="primary"
                onClick={handleColorAccept}
              >
                OK
              </Button>
            </div>
          </>
        </Modal>
      )}
    </Form>
  )
}

export default PreferenceTabContent
