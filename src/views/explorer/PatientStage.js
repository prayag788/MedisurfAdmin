import Header from './components/header'
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  ListGroup,
  Row,
  Col,
  CardHeader,
  CardBody,
  CardTitle,
  ListGroupItem,
} from 'reactstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import {
  showErrorAlert,
  showSuccessAlert,
  showConfirm,
  showInfoAlert,
  getErrorMessage,
  MySwal,
} from '../../utils/alerts'
import PatientListItem from './components/PatientListItem'
import StudyListItem from './components/StudyListItem'

const PatientStage = () => {
  const navigate = useNavigate()
  const study = useSelector(state => state.dicom.study)
  const [modalities, setModalities] = useState([])
  const [DICOMwebServers, setDICOMwebServers] = useState([])
  const [isProtected, setIsProtected] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const modalityList = await axios.get(
        `${process.env.REACT_APP_API_URL}/explorer/modalities`,
        {}
      )
      setModalities(() => {
        return modalityList.data
      })

      const isProtectedRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/explorer/patients/${study.ParentPatient}/protected`,
        {}
      )
      setIsProtected(() => {
        return isProtectedRes.data.code
      })

      const dicomservers = await axios.get(
        `${process.env.REACT_APP_API_URL}/explorer/dicom-web/server`,
        {}
      )
      setDICOMwebServers(() => {
        return dicomservers.data
      })
    }
    fetchData()
  }, [])

  const deletePatientHandler = () => {
    return showConfirm({
      title: '<p>Are you sure?</p>',
      text: "You won't be able to revert this!",
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    }).then(async function (result) {
      if (result.isConfirmed) {
        try {
          await axios({
            method: 'DELETE',
            url: `${process.env.REACT_APP_API_URL}/explorer/patients/${study.ParentPatient}`,
          })

          showSuccessAlert('Patient has been deleted.')

          navigate('/explorer')
        } catch (error) {
          // Only handle response errors, let global interceptor handle network errors
          if (error?.response) {
            showErrorAlert(getErrorMessage(error))
          }
        }
      }
    })
  }

  const sendToRemoteModalityHandler = () => {
    const options = {}
    modalities.forEach(mod => {
      options[mod] = mod
    })
    MySwal.fire({
      title: '<p>Please select a modality!</p>',
      input: 'select',
      inputOptions: options,
      inputAttributes: {
        autocapitalize: 'off',
      },
      confirmButtonText: 'Send',
      showLoaderOnConfirm: true,
      preConfirm: modality => {
        return axios
          .post(`${process.env.REACT_APP_API_URL}/orthanc/modalities`, {
            modality,
            resources: [study.ID],
          })
          .then(response => {
            return response.data
          })
          .catch(error => {
            MySwal.showValidationMessage(error.response.data.message)
          })
      },
      allowOutsideClick: () => !MySwal.isLoading(),
    }).then(result => {
      if (result.isConfirmed) {
        showSuccessAlert('Study sent Successfully!')
      }
    })
  }

  const sendToDICOMwebServerHandler = () => {
    const options = {}
    DICOMwebServers.forEach(mod => {
      options[mod] = mod
    })
    MySwal.fire({
      title: '<p>Please select a modality!</p>',
      input: 'select',
      inputOptions: options,
      inputAttributes: {
        autocapitalize: 'off',
      },
      confirmButtonText: 'Send',
      showLoaderOnConfirm: true,
      preConfirm: server => {
        if (!server) {
          MySwal.showValidationMessage('Please select a server')
        }
      },
      allowOutsideClick: () => !MySwal.isLoading(),
    }).then(result => {
      if (result.isConfirmed) {
        showSuccessAlert('Study sent Successfully!')
      }
    })
  }

  const handleProtected = async () => {
    try {
      await axios({
        method: 'PUT',
        url: `${process.env.REACT_APP_API_URL}/explorer/patients/${study.ParentPatient}/protected`,
        data: { code: isProtected ? 0 : 1 },
      })

      setIsProtected(prev => !prev)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <Header>
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to="/explorer"> Home </Link>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <span> Patient </span>
          </BreadcrumbItem>
        </Breadcrumb>
      </Header>
      <Row className="mr-1 ml-1">
        <Col md={3}>
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Patient</CardTitle>
            </CardHeader>
            <PatientListItem data={study} showArrow={false} />
          </Card>
          <Card>
            <CardBody>
              <Button.Ripple block onClick={sendToDICOMwebServerHandler} color="primary">
                Send to DICOMweb server
              </Button.Ripple>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Interact</CardTitle>
            </CardHeader>
            <ListGroup flush>
              <ListGroupItem>
                <Button.Ripple block onClick={deletePatientHandler} color="primary">
                  Delete this patient
                </Button.Ripple>
              </ListGroupItem>
              <ListGroupItem>
                <Button.Ripple block onClick={sendToRemoteModalityHandler} color="primary">
                  Send to remote modality
                </Button.Ripple>
              </ListGroupItem>
              <ListGroupItem>
                <Button.Ripple
                  block
                  color={isProtected ? 'success' : 'danger'}
                  onClick={handleProtected}
                >
                  {isProtected ? 'Protected' : 'Unprotected'}
                </Button.Ripple>
              </ListGroupItem>
            </ListGroup>
          </Card>
        </Col>
        <Col md={9}>
          <Card>
            <CardBody>
              <StudyListItem data={study} />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default PatientStage
