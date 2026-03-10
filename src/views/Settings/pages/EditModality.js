import { Fragment, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardHeader,
  Button,
  Breadcrumb,
  BreadcrumbItem,
  Form,
  Input,
  Label,
  FormFeedback,
  FormGroup,
} from 'reactstrap'
import { Link, useNavigate } from 'react-router-dom'
import {
  MySwalError,
  MySwalLoading,
  MySwalSuccess,
} from '../../components/MySwalAlert'
import { isObjEmpty } from '@utils'
import { updateEvent } from '../store/actions'
import {
  showErrorAlert,
  showSuccessAlert,
  showLoadingAlert,
  hideLoadingAlert,
  getErrorMessage,
} from '../../../utils/alerts'

import axios from 'axios'

export default (props) => {
  const locationState = props.location?.state || {}
  const propsIP = locationState.Host
    ? locationState.Host.split('.')
    : ['', '', '', '']
  const [formData, setFormData] = useState({
    dicomServer: locationState.Name || '',
    aet: locationState.AET || '',
    port: locationState.Port || '',
  })
  const [ipData, setIpData] = useState({
    ip1: propsIP[0],
    ip2: propsIP[1],
    ip3: propsIP[2],
    ip4: propsIP[3],
  })
  const [error, setError] = useState({})

  const editDetails = useSelector((state) => state.Modality.editable)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isObjEmpty(editDetails)) {
      setFormData((prev) => {
        return {
          ...prev,
          dicomServer: editDetails.Name || '',
          aet: editDetails.AET || '',
          port: editDetails.Port || '',
        }
      })

      if (editDetails.Host) {
        const ipList = editDetails.Host.split('.')
        setIpData({
          ip1: ipList[0] || '',
          ip2: ipList[1] || '',
          ip3: ipList[2] || '',
          ip4: ipList[3] || '',
        })
      }
    }
  }, [editDetails])

  const inputHandler = (e) => {
    const name = e.target.name
    const value = e.target.value
    if (value === '') {
      setError((prev) => {
        prev = { ...prev, [name]: 'This field cannot be empty!' }
        return prev
      })
    } else {
      setError((prev) => {
        delete prev[name]
        return prev
      })
    }
    setFormData((prev) => {
      prev = { ...prev, [name]: value }
      return prev
    })
  }

  const ipHandler = (e) => {
    const name = e.target.name
    const value = e.target.value
    if (value === '') {
      setError((prev) => {
        prev = { ...prev, [name]: 'This field cannot be empty!' }
        return prev
      })
    } else {
      setError((prev) => {
        delete prev[name]
        return prev
      })
    }
    if (value.length <= 3) {
      setIpData((prev) => {
        prev = { ...prev, [name]: value }
        return prev
      })
    } else {
      e.preventDefault()
    }
  }

  const onReset = () => {
    setFormData((prev) => {
      return { ...prev, aet: '', port: '' }
    })
    setIpData((prev) => {
      return { ip1: '', ip2: '', ip3: '', ip4: '' }
    })
  }

  const isValidPort = (port) => {
    const regex = new RegExp(
      '^([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$'
    )
    return regex.test(port)
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const finalIP = Object.values(ipData).reduce((acc, curr) => {
      return `${acc}.${curr}`
    })
    let doAllow = true
    for (const item in formData) {
      if (formData[item] === '') {
        setError((prev) => {
          prev = { ...prev, [item]: 'This field cannot be empty!' }
          return prev
        })
        doAllow = false
      } else if (item === 'port') {
        if (!isValidPort(formData[item])) {
          setError((prev) => {
            prev = {
              ...prev,
              port: 'Invalid port! Please enter a valid port Address',
            }
            return prev
          })
          doAllow = false
        }
      } else if (item === 'aet') {
        if (formData[item].length > 25) {
          setError((prev) => {
            prev = { ...prev, aet: 'AET cannot be longer than 25 characters.' }
            return prev
          })
          doAllow = false
        }
      }
    }
    for (const item in ipData) {
      if (ipData[item] === '') {
        setError((prev) => {
          prev = { ...prev, [item]: 'This field cannot be empty!' }
          return prev
        })
        doAllow = false
      } else if (Number(ipData[item]) > 255 || Number(ipData[item]) < 0) {
        setError((prev) => {
          prev = {
            ...prev,
            [item]: 'Invalid IP! Please enter a valid IP Address',
          }
          return prev
        })
        doAllow = false
      }
    }
    if (doAllow) {
      showLoadingAlert('<p>Loading...</p>')
      const finalData = {
        AET: formData.aet,
        Port: parseInt(formData.port, 10),
        Host: finalIP,
      }

      axios
        .put(
          `${process.env.REACT_APP_API_URL}/explorer/modalities/${formData.dicomServer}`,
          finalData
        )
        .then((doc) => {
          onReset()
          showSuccessAlert('Modality Edited Successfully!').then(function () {
            window.location.href = '/settings/modality_listing'
          })
        })
        .catch((err) => {
          // Only handle response errors, let global interceptor handle network errors
          if (err?.response) {
            showErrorAlert(getErrorMessage(err))
          }
        })
    }
  }

  const performEcho = (e) => {
    e.preventDefault()
    const finalIP = Object.values(ipData).reduce((acc, curr) => {
      return `${acc}.${curr}`
    })
    let doAllow = true
    for (const item in formData) {
      if (formData[item] === '') {
        setError((prev) => {
          prev = { ...prev, [item]: 'This field cannot be empty!' }
          return prev
        })
        doAllow = false
      } else if (item === 'port') {
        if (!isValidPort(formData[item])) {
          setError((prev) => {
            prev = {
              ...prev,
              port: 'Invalid port! Please enter a valid port Address',
            }
            return prev
          })
          doAllow = false
        }
      } else if (item === 'aet') {
        if (formData[item].length > 25) {
          setError((prev) => {
            prev = { ...prev, aet: 'AET cannot be longer than 25 characters.' }
            return prev
          })
          doAllow = false
        }
      }
    }
    for (const item in ipData) {
      if (ipData[item] === '') {
        setError((prev) => {
          prev = { ...prev, [item]: 'This field cannot be empty!' }
          return prev
        })
        doAllow = false
      } else if (Number(ipData[item]) > 255 || Number(ipData[item]) < 0) {
        setError((prev) => {
          prev = {
            ...prev,
            [item]: 'Invalid IP! Please enter a valid IP Address',
          }
          return prev
        })
        doAllow = false
      }
    }
    if (doAllow) {
      showLoadingAlert('<p>Loading...</p>')
      const finalData = {
        AET: formData.aet,
        Port: parseInt(formData.port, 10),
        Host: finalIP,
      }
      const accessToken = (Math.random() + 1).toString(36).substring(2)
      axios
        .put(
          `${process.env.REACT_APP_API_URL}/explorer/modalities/${accessToken}`,
          finalData
        )
        .then((doc) => {
          hideLoadingAlert()
          MySwalLoading('Performing C-ECHO...')
          axios({
            method: 'POST',
            url: `${process.env.REACT_APP_API_URL}/explorer/modalities/${accessToken}/echo`,
          })
            .then(() => {
              axios
                .delete(
                  `${process.env.REACT_APP_API_URL}/explorer/modalities/${accessToken}`
                )
                .then((doc) => {
                  MySwalSuccess('C-Echo successful!')
                })
            })
            .catch((err) => {
              axios
                .delete(
                  `${process.env.REACT_APP_API_URL}/explorer/modalities/${accessToken}`
                )
                .then((doc) => {
                  MySwalError('C-Echo has Failed!')
                })
            })
        })
        .catch((err) => {
          // Only handle response errors, let global interceptor handle network errors
          if (err?.response) {
            showErrorAlert(getErrorMessage(err))
          }
        })
    }
  }

  return (
    <Fragment>
      <div className="content-header-left col-md-9 col-12 mb-2">
        <div className="row breadcrumbs-top">
          <div className="col-12">
            <h2 className="content-header-title float-left mb-0">Settings</h2>
            <div className="breadcrumb-wrapper vs-breadcrumbs d-sm-block d-none col-12">
              <Breadcrumb>
                <BreadcrumbItem tag="li">
                  <Link to="/settings">Home</Link>
                </BreadcrumbItem>
                <BreadcrumbItem tag="li" active>
                  Edit Modality
                </BreadcrumbItem>
              </Breadcrumb>
            </div>
          </div>
        </div>
      </div>
      <Row>
        <Col>
          <Card>
            <CardHeader className="flex-md-row flex-column align-md-items-center align-items-center border-bottom">
              <CardTitle tag="h4">Edit Modality</CardTitle>
              <Button
                className="mr-1"
                color="primary"
                type="button"
                onClick={() => navigate('/settings/modality_listing')}
              >
                Modality List
              </Button>
            </CardHeader>
            <CardBody className="pt-2">
              <Col md={{ size: 6, offset: 3 }} lg="6">
                <Form onSubmit={onSubmit} onReset={onReset}>
                  <FormGroup>
                    <Label for="dicomServer">Dicom Server</Label>
                    <Input
                      name="dicomServer"
                      value={formData.dicomServer}
                      disabled
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="aet">AET</Label>
                    <Input
                      invalid={error && error.aet && true}
                      name="aet"
                      value={formData.aet}
                      onChange={inputHandler}
                    />
                    <FormFeedback>{error.aet}</FormFeedback>
                  </FormGroup>
                  <FormGroup>
                    <Label for="basicInput">IP Address</Label>
                    <FormGroup className="d-flex fd-col-ip">
                      <FormGroup className="mr-2 mb-0 fd-col-ip-el">
                        <Input
                          invalid={error && error.ip1 && true}
                          name="ip1"
                          type="number"
                          value={ipData.ip1}
                          onChange={ipHandler}
                        />{' '}
                        {}
                      </FormGroup>
                      <FormGroup className="mr-2 mb-0 fd-col-ip-el">
                        <Input
                          invalid={error && error.ip2 && true}
                          name="ip2"
                          type="number"
                          value={ipData.ip2}
                          onChange={ipHandler}
                        />{' '}
                        {}
                      </FormGroup>
                      <FormGroup className="mr-2 mb-0 fd-col-ip-el">
                        <Input
                          invalid={error && error.ip3 && true}
                          name="ip3"
                          type="number"
                          value={ipData.ip3}
                          onChange={ipHandler}
                        />{' '}
                        {}
                      </FormGroup>
                      <FormGroup className="mb-0 fd-col-ip-el">
                        <Input
                          invalid={error && error.ip4 && true}
                          name="ip4"
                          type="number"
                          value={ipData.ip4}
                          onChange={ipHandler}
                        />
                      </FormGroup>
                    </FormGroup>
                    <Input
                      invalid={
                        error &&
                        (error.ip1 || error.ip2 || error.ip3 || error.ip4) &&
                        true
                      }
                      name="port"
                      type="hidden"
                      value={formData.port}
                      onChange={inputHandler}
                    />
                    <FormFeedback>
                      {error.ip1 || error.ip2 || error.ip3 || error.ip4}
                    </FormFeedback>
                  </FormGroup>
                  <FormGroup>
                    <Label for="port">Port</Label>
                    <Input
                      invalid={error && error.port && true}
                      name="port"
                      type="number"
                      value={formData.port}
                      onChange={inputHandler}
                    />
                    <FormFeedback>{error.port}</FormFeedback>
                  </FormGroup>
                  <FormGroup className="d-flex mt-3">
                    <Button.Ripple
                      className="mr-1"
                      color="success"
                      type="button"
                      onClick={performEcho}
                    >
                      Test Echo
                    </Button.Ripple>
                  </FormGroup>
                  <FormGroup className="d-flex mt-3">
                    <Button.Ripple
                      className="mr-1"
                      color="primary"
                      type="submit"
                    >
                      Save
                    </Button.Ripple>
                    <Button.Ripple
                      className="mr-1"
                      outline
                      color="secondary"
                      type="reset"
                    >
                      Reset
                    </Button.Ripple>
                    <Button.Ripple
                      style={{ position: 'absolute', right: '1em' }}
                      outline
                      color="danger"
                      type="cancel"
                      onClick={() => navigate('/settings/modality_listing')}
                    >
                      Cancel
                    </Button.Ripple>
                  </FormGroup>
                </Form>
              </Col>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Fragment>
  )
}
