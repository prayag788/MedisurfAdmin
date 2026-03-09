import { Fragment, useState, useEffect } from 'react'
import {
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardHeader,
  Button,
  Form,
  Input,
  Label,
  FormFeedback,
  FormGroup,
} from 'reactstrap'
import axios from 'axios'

// ** Sweet Alert Setup
import { MySwalError, MySwalLoading, MySwalSuccess } from '../../components/MySwalAlert'

export default () => {
  const [formData, setFormData] = useState({
    ip: '',
    DicomAet: '',
    DicomPort: '',
    DicomCheckCalledAet: false,
    isOrthancCredEditable: false,
    orthancUsername: '',
    orthancPassword: '',
  })
  const [error, setError] = useState({})
  const [recallGetSystemConfigAPI, setRecallGetSystemConfigAPI] = useState(true)

  useEffect(() => {
    const fetchServerData = async () => {
      try {
        const server = (
          await axios({
            method: 'GET',
            url: `${process.env.REACT_APP_API_URL}/explorer/system`,
          })
        ).data

        setFormData(() => {
          return {
            ip: server.IP,
            DicomAet: server.DicomAet,
            DicomPort: server.DicomPort,
            DicomCheckCalledAet: server.DicomCheckCalledAet,
            isOrthancCredEditable: server?.orthnacConfig?.isOrthancCredEditable,
            orthancUsername: server?.orthnacConfig?.orthancCred?.username,
            orthancPassword: server?.orthnacConfig?.orthancCred?.password,
          }
        })
      } catch (error) {
        MySwalError('There is some error fetching server data!<br/>Please try again later!')
      }
    }
    fetchServerData()
  }, [recallGetSystemConfigAPI])

  const inputHandler = e => {
    const name = e.target.name
    const value = e.target.value
    if (value === '') {
      setError(prev => {
        prev = { ...prev, [name]: 'This field cannot be empty!' }
        return prev
      })
    } else {
      setError(prev => {
        delete prev[name]
        return prev
      })
    }
    setFormData(prev => {
      prev = { ...prev, [name]: value }
      return prev
    })
  }

  const onSubmit = async e => {
    e.preventDefault()
    let isError = false
    for (const item in formData) {
      if (formData[item] === '') {
        isError = true
        setError(prev => {
          prev = { ...prev, [item]: 'This field cannot be empty!' }
          return prev
        })
      }
    }

    if (!isError) {
      MySwalLoading('Updating Orthanc Configurations...')

      try {
        await axios({
          method: 'PUT',
          url: `${process.env.REACT_APP_API_URL}/explorer/system`,
          data: formData,
        })

        MySwalSuccess('Orthanc configurations updated successfully!')
      } catch (error) {
        MySwalError('Error occurred while updating configurations!<br/>Please try again later!')
      }
    }
  }

  const onReset = () => {
    setFormData(prev => {
      return { dicomServer: '', DicomAet: '', DicomPort: '' }
    })
  }

  const restartOrthanc = async () => {
    MySwalLoading('Restarting Orthanc...')

    try {
      await axios({
        method: 'POST',
        url: `${process.env.REACT_APP_API_URL}/explorer/tools/reset`,
      })
      setTimeout(() => {
        setRecallGetSystemConfigAPI(prev => !prev)
      }, 2000)
      MySwalSuccess('Orthanc restarted successfully!')
    } catch (error) {
      setRecallGetSystemConfigAPI(prev => !prev)
      MySwalError('There was some error restarting orthanc!')
    }
  }

  return (
    <Fragment>
      <Row>
        <Col>
          <Card>
            <CardHeader className="flex-md-row flex-column align-md-items-center align-items-center border-bottom">
              <CardTitle tag="h4">Edit Server Configurations</CardTitle>
              <Button.Ripple color="primary" type="reset" onClick={restartOrthanc}>
                Restart Server
              </Button.Ripple>
            </CardHeader>
            <CardBody className="pt-2">
              <Col md={{ size: 6, offset: 3 }} lg="6">
                <Form onSubmit={onSubmit} onReset={onReset}>
                  <FormGroup>
                    <Label for="ip">IP Address</Label>
                    <Input
                      invalid={error && error.ip && true}
                      name="ip"
                      value={formData.ip}
                      disabled
                    />
                    <FormFeedback>{error.ip}</FormFeedback>
                  </FormGroup>
                  <FormGroup>
                    <Label for="DicomAet">AET</Label>
                    <Input
                      invalid={error && error.DicomAet && true}
                      name="DicomAet"
                      value={formData.DicomAet}
                      onChange={inputHandler}
                    />
                    <FormFeedback>{error.DicomAet}</FormFeedback>
                  </FormGroup>
                  <FormGroup>
                    <Label for="DicomPort">DICOM Port</Label>
                    <Input
                      invalid={error && error.DicomPort && true}
                      name="DicomPort"
                      type="number"
                      value={formData.DicomPort}
                      onChange={inputHandler}
                    />
                    <FormFeedback>{error.DicomPort}</FormFeedback>
                  </FormGroup>
                  <FormGroup check inline>
                    <Input
                      type="checkbox"
                      checked={formData.DicomCheckCalledAet}
                      id="DicomCheckCalledAet"
                      onChange={e => {
                        setFormData(prev => {
                          prev = { ...prev, ['DicomCheckCalledAet']: e.target.checked }
                          return prev
                        })
                      }}
                    />
                    <Label for="DicomCheckCalledAet" className="dicom-check-label">
                      DICOM Check Called Aet
                    </Label>
                  </FormGroup>

                  {formData.isOrthancCredEditable && (
                    <>
                      <FormGroup className="mt-2">
                        <Label for="orthancUsername">Orthanc Username</Label>
                        <Input
                          invalid={error && error.orthancUsername && true}
                          name="orthancUsername"
                          value={formData.orthancUsername}
                          onChange={inputHandler}
                        />
                        <FormFeedback>{error.orthancUsername}</FormFeedback>
                      </FormGroup>
                      <FormGroup>
                        <Label for="orthancPassword">Orthanc Password</Label>
                        <Input
                          invalid={error && error.orthancPassword && true}
                          name="orthancPassword"
                          value={formData.orthancPassword}
                          onChange={inputHandler}
                        />
                        <FormFeedback>{error.orthancPassword}</FormFeedback>
                      </FormGroup>
                    </>
                  )}

                  <FormGroup className="d-flex mt-3">
                    <Button.Ripple className="mr-1" color="primary" type="submit">
                      Submit
                    </Button.Ripple>
                    <Button.Ripple outline color="secondary" type="reset">
                      Reset
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
