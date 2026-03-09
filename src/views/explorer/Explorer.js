import { useEffect, useState } from 'react'
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
import axios from 'axios'
import DetailsCard from './components/DetailsCard'
import {
  showErrorAlert,
  showSuccessAlert,
  showConfirm,
  showInfoAlert,
  showLoadingAlert,
  hideLoadingAlert,
  getErrorMessage,
  MySwal,
} from '../../utils/alerts'
import { OrthancLevels, keepFieldsInAnonymous } from '../../constants'
import AppCollapse from './components/app-collapse-cutom'
import { flattenObj, isObject } from '../../utility/Utils'
import CustomTable from './components/CustomTable'
import { columns } from './explorer.columns'
import { isUserLoggedIn } from '@utils'
import STUDYSTATUS from '@configs/studyStatus'

const fieldSet = {
  patients: {
    title: ['PatientName'],
    body: ['PatientBirthDate', 'PatientID', 'PatientSex'],
  },
  studies: {
    title: ['StudyDescription'],
    body: [
      'AccessionNumber',
      'InstitutionName',
      'ReferringPhysicianName',
      'StudyDate',
      'StudyID',
      'StudyInstanceUID',
    ],
  },
  series: {
    title: ['SeriesDescription'],
    body: [
      'Status',
      'BodyPartExamined',
      'Modality',
      'OperatorsName',
      'SeriesInstanceUID',
      'SeriesNumber',
    ],
  },
  instances: {
    title: ['IndexInSeries'],
    body: ['ImageComments', 'SOPInstanceUID', 'NumberOfFrames'],
  },
}

const DicomOrder = ['patients', 'studies', 'series', 'instances']

const fetchDicomData = (level, uuid, children) => {
  return new Promise((resolve, reject) => {
    axios({
      method: 'GET',
      url: `${process.env.REACT_APP_API_URL}/explorer/${level}/${uuid}/${children ? children : ''}`,
    })
      .then(response => {
        resolve(response.data)
      })
      .catch(error => {
        reject(error.response ? error.response : error)
      })
  })
}

const Explorer = () => {
  const navigate = useNavigate()
  const [data, setData] = useState({
    patients: null,
    studies: null,
    series: null,
    instances: null,
  })
  const [modalities, setModalities] = useState(null)
  const [DICOMwebServers, setDICOMwebServers] = useState(null)
  const [isProtected, setIsProtected] = useState(null)
  const [showTagsView, setShowTagsView] = useState(false)
  const [instanceLevelTags, setInstanceLevelTags] = useState([])
  const [showTagDescription, setShowTagDescription] = useState(true)
  const [breadCrumbLevel, setBreadCrumbLevel] = useState([])
  const [currentLevelData, setCurrentLevelData] = useState({
    level: sessionStorage.getItem('explore_level') || 'patients',
    uuid: sessionStorage.getItem('explore_uuid'),
  })
  const [refresh, setRefresh] = useState(true)
  const [peers, setPeers] = useState(null)
  const [tableKey, setTableKey] = useState(0)
  const userData = JSON.parse(isUserLoggedIn())

  async function fetchLevelViseData(startLevel, startLevelUUID, fetchChild) {
    if (!startLevel || !OrthancLevels[startLevel]) return
    const currentLevelObj = OrthancLevels[startLevel]
    try {
      if (
        (data[currentLevelObj['regular']] &&
          data[currentLevelObj['regular']].ID !== sessionStorage.getItem('explore_uuid')) ||
        !data[currentLevelObj['regular']] ||
        Array.isArray(data[currentLevelObj['regular']])
      ) {
        const response = await fetchDicomData(currentLevelObj['regular'], startLevelUUID)

        setData(prev => {
          return { ...prev, [currentLevelObj['regular']]: response }
        })

        if (currentLevelObj['parent']) {
          fetchLevelViseData(
            currentLevelObj['parent'],
            response[currentLevelObj['parentDicomTag']],
            false
          )
        }
      }

      if (fetchChild && currentLevelObj['child']) {
        const response = await fetchDicomData(
          currentLevelObj['regular'],
          startLevelUUID,
          currentLevelObj['child']
        )

        setData(prev => {
          return { ...prev, [currentLevelObj['child']]: response }
        })
      } else if (currentLevelObj['regular'] === 'instances') {
        const response = await fetchDicomData(currentLevelObj['regular'], startLevelUUID, 'tags')
        setInstanceLevelTags(() => response)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (currentLevelData.level) {
      setBreadCrumbLevel(() => {
        return new Array(...DicomOrder).splice(0, DicomOrder.indexOf(currentLevelData.level) + 1)
      })
    }
  }, [])

  useEffect(() => {
    const fetchLevelData = async () => {
      if (!currentLevelData.level || !currentLevelData.uuid) return
      await fetchLevelViseData(currentLevelData.level, currentLevelData.uuid, true)

      setShowTagsView(() => false)

      setData(prev => {
        const currentLevelChild = OrthancLevels[currentLevelData.level]?.['child']

        if (currentLevelChild) {
          Object.keys(prev)
            .slice(Object.keys(prev).indexOf(currentLevelChild) + 1)
            .forEach(value => {
              prev[value] = null
            })
        }

        return { ...prev }
      })
    }
    fetchLevelData()
  }, [currentLevelData, refresh])

  useEffect(() => {
    const checkProtectedStatus = async () => {
      if (data.patients) {
        const isProtectedRes = await axios({
          method: 'GET',
          url: `${process.env.REACT_APP_API_URL}/explorer/patients/${data.patients.ID}/protected`,
        })
        setIsProtected(() => {
          return isProtectedRes.data.code
        })
      }
    }
    checkProtectedStatus()
  }, [data.patients])

  // Arrange Instances in order
  useEffect(() => {
    const sortInstances = async () => {
      if (data.instances && Array.isArray(data.instances)) {
        setData(prev => {
          prev.instances = prev.instances.sort((a, b) => {
            if (a['IndexInSeries'] && b['IndexInSeries']) {
              return a['IndexInSeries'] - b['IndexInSeries']
            } else {
              return 0
            }
          })
          return { ...prev }
        })
      }
    }
    sortInstances()
  }, [data.instances])

  // Force table re-render when data changes
  useEffect(() => {
    setTableKey(prev => prev + 1)
  }, [data, currentLevelData.level])

  const changeLevel = tmpchangeTo => {
    const changeTo = tmpchangeTo?.data ? tmpchangeTo?.data : tmpchangeTo
    if (changeTo.level && changeTo.uuid) {
      sessionStorage.setItem('explore_level', changeTo.level)
      sessionStorage.setItem('explore_uuid', changeTo.uuid)
      setCurrentLevelData(() => changeTo)
      setBreadCrumbLevel(() => {
        return new Array(...DicomOrder).splice(0, DicomOrder.indexOf(changeTo.level) + 1)
      })
    } else {
      sessionStorage.setItem(
        'explore_level',
        DicomOrder[DicomOrder.indexOf(currentLevelData.level) + 1]
      )
      sessionStorage.setItem('explore_uuid', changeTo.ID)
      setCurrentLevelData(() => {
        return {
          level: DicomOrder[DicomOrder.indexOf(currentLevelData.level) + 1],
          uuid: changeTo.ID,
        }
      })
      setBreadCrumbLevel(() => {
        return new Array(...DicomOrder).splice(0, DicomOrder.indexOf(currentLevelData.level) + 2)
      })
    }
  }

  const deleteHandler = () => {
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
            url: `${process.env.REACT_APP_API_URL}/explorer/${currentLevelData.level}/${currentLevelData.uuid}`,
          })

          showSuccessAlert(
            `${OrthancLevels[currentLevelData.level]?.['capital'] || 'Item'} has been deleted.`
          )

          // Clear session storage to prevent stale data
          sessionStorage.removeItem('explore_level')
          sessionStorage.removeItem('explore_uuid')

          // Navigate to appropriate page after deletion
          if (currentLevelData.level === 'studies') {
            navigate('/explorer')
          } else if (currentLevelData.level === 'patients') {
            navigate('/explorer')
          } else {
            navigate('/explorer')
          }
        } catch (error) {
          console.log(error)
          // Only handle response errors, let global interceptor handle network errors
          if (error?.response) {
            showErrorAlert(getErrorMessage(error))
          }
        }
      }
    })
  }

  const sendToRemoteModalityHandler = async () => {
    let modalityList

    // Get Modality list
    if (!modalities) {
      modalityList = Object.keys(
        (
          await axios({
            method: 'GET',
            url: `${process.env.REACT_APP_API_URL}/explorer/modalities`,
          })
        ).data
      )
      setModalities(() => {
        return modalityList
      })
    } else {
      modalityList = modalities
    }

    const options = {}
    modalityList.forEach(mod => {
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
        if (!modality) {
          return MySwal.showValidationMessage('Please select a modality')
        }
        return axios
          .post(
            `${process.env.REACT_APP_API_URL}/explorer/modalities/${modality}/store`,
            currentLevelData.uuid
          )
          .then(response => {
            return response.data
          })
          .catch(error => {
            MySwal.showValidationMessage('Unable to Create the Job!')
          })
      },
      allowOutsideClick: () => !MySwal.isLoading(),
    }).then(result => {
      if (result.isConfirmed) {
        showSuccessAlert('Job created Successfully!')
      }
    })
  }

  const sendToDICOMwebServerHandler = async () => {
    let serverList
    if (DICOMwebServers === null) {
      // Get is DICOMweb server list
      serverList = (
        await axios({
          method: 'GET',
          url: `${process.env.REACT_APP_API_URL}/explorer/dicom-web/server`,
        })
      ).data
      setDICOMwebServers(() => {
        return serverList
      })
    } else {
      serverList = DICOMwebServers
    }

    const options = {}
    serverList.forEach(mod => {
      options[mod] = mod
    })
    MySwal.fire({
      title: '<p>Please select a server!</p>',
      input: 'select',
      inputOptions: options,
      inputAttributes: {
        autocapitalize: 'off',
      },
      confirmButtonText: 'Send',
      showLoaderOnConfirm: true,
      preConfirm: server => {
        if (!server) {
          return MySwal.showValidationMessage('Please select a server')
        }
        return axios
          .post(`${process.env.REACT_APP_API_URL}/dicom-web/servers/${server}/stow`, {
            Resources: [currentLevelData.uuid],
            Synchronous: false,
            Priority: 10,
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
        showSuccessAlert('Job created Successfully!')
      }
    })
  }

  const downloadZIPHanlder = async () => {
    showLoadingAlert('<p>Downloading...</p>')
    try {
      const dataBuffer = await axios({
        method: 'GET',
        url: `${process.env.REACT_APP_API_URL}/explorer/${
          currentLevelData.level
        }/${currentLevelData.uuid}/${currentLevelData.level === 'instances' ? 'file' : 'archive'}`,
        headers: {
          Accept: 'application/zip',
        },
        responseType: 'arraybuffer',
      })
      hideLoadingAlert()
      const blob = new Blob([dataBuffer.data])
      const fileName =
        currentLevelData.level === 'instances'
          ? `${currentLevelData.uuid}.dcm`
          : `${currentLevelData.uuid}.zip`
      const link = document.createElement('a')
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', fileName)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      hideLoadingAlert()
      // Only handle response errors, let global interceptor handle network errors
      if (error?.response) {
        showErrorAlert(getErrorMessage(error))
      }
    }
  }

  const downloadDICOMDIRHanlder = async () => {
    MySwal.showLoading()
    try {
      const dataBuffer = await axios({
        method: 'GET',
        url: `${process.env.REACT_APP_API_URL}/explorer/${currentLevelData.level}/${currentLevelData.uuid}/media`,
        headers: {
          Accept: 'application/zip',
        },
        responseType: 'arraybuffer',
      })
      hideLoadingAlert()
      const blob = new Blob([dataBuffer.data])
      const fileName = `${currentLevelData.uuid}.zip`
      const link = document.createElement('a')
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', fileName)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      hideLoadingAlert()
      // Only handle response errors, let global interceptor handle network errors
      if (error?.response) {
        showErrorAlert(getErrorMessage(error))
      }
    }
  }

  const downloadJSONHanlder = async () => {
    MySwal.showLoading()
    try {
      const dataBuffer = await axios({
        method: 'GET',
        url: `${process.env.REACT_APP_API_URL}/explorer/${currentLevelData.level}/${currentLevelData.uuid}/tags`,
        headers: {
          Accept: 'application/zip',
        },
        responseType: 'arraybuffer',
      })
      hideLoadingAlert()
      const blob = new Blob([dataBuffer.data])
      const fileName = `${currentLevelData.uuid}.json`
      const link = document.createElement('a')
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', fileName)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      hideLoadingAlert()
      // Only handle response errors, let global interceptor handle network errors
      if (error?.response) {
        showErrorAlert(getErrorMessage(error))
      }
    }
  }

  const handleProtected = async () => {
    try {
      await axios({
        method: 'PUT',
        url: `${process.env.REACT_APP_API_URL}/explorer/patients/${data.patients.ID}/protected`,
        data: { code: isProtected ? 0 : 1 },
      })

      setIsProtected(prev => !prev)
    } catch (error) {
      console.log(error)
    }
  }

  const getStudyId = async (id, instanceId) => {
    try {
      MySwal.showLoading()
      const studyData = (
        await axios({ url: `${process.env.REACT_APP_API_URL}/explorer/studies/studyId/${id}` })
      ).data
      hideLoadingAlert()
      const viewer_url = `${process.env.REACT_APP_VIEWER_URL}/viewer?StudyInstanceUIDs=${instanceId}&accessToken=${localStorage.getItem('accessToken')?.replace(/"/g, '')}&dateFormat=${userData?.dateFormats?.dateFormat || 'MM/DD/YYYY'}&id=${studyData?.status ? studyData?.Id : ''}&mode=${studyData.studyStatus === STUDYSTATUS.Unread ? 'create' : 'preview'}`
      window.open(viewer_url, JSON.parse(localStorage.getItem('userData'))?.viewerPreference)
    } catch (error) {
      console.log(error)
    }
  }

  const tagDataMapper = (data, showTagDescription) => {
    if (isObject(data)) {
      return Object.keys(data).map(value => {
        if (data[value]['Type'] === 'String' || data[value]['Type'] === 'Null') {
          return (
            <p className="mb-0 ml-1">
              {value}
              {showTagDescription ? ` (${data[value]['Name']})` : ''} :{' '}
              <strong>{data[value]['Value']}</strong>
            </p>
          )
        } else {
          return (
            <AppCollapse
              data={[
                {
                  title: `${value} ${showTagDescription ? `(${data[value]['Name']})` : ''}:`,
                  content: tagDataMapper(data[value]['Value'], showTagDescription),
                },
              ]}
            />
          )
        }
      })
    } else if (Array.isArray(data)) {
      return data.map((value, idx) => {
        return (
          <AppCollapse
            data={[
              {
                title: `Item ${idx}`,
                content:
                  value['Type'] !== 'String'
                    ? tagDataMapper(value, showTagDescription)
                    : Object.keys(value).map(val => {
                        if (value[val]['Type'] === 'String') {
                          return (
                            <p className="mb-0 ml-1">
                              {val} {showTagDescription ? `(${value[val]['Name']})` : ''} :{' '}
                              <strong>{value[val]['Value']}</strong>
                            </p>
                          )
                        } else {
                          return (
                            <p className="mb-0 ml-1">
                              {val} {showTagDescription ? `(${value[val]['Name']})` : ''} :{' '}
                              {tagDataMapper(value[val]['Value'], showTagDescription)}
                            </p>
                          )
                        }
                      }),
              },
            ]}
          />
        )
      })
    }
  }

  const anonymizeHandler = async () => {
    return showConfirm({
      title: '<p>Anonymize?</p>',
      text: 'This will anonymize the selected item.',
      confirmButtonText: 'Ok',
      cancelButtonText: 'Cancel',
    }).then(async function (result) {
      if (result.isConfirmed) {
        try {
          const response = await axios({
            method: 'POST',
            url: `${process.env.REACT_APP_API_URL}/explorer/${currentLevelData.level}/${currentLevelData.uuid}/anonymize`,
            data: keepFieldsInAnonymous,
          })
          showSuccessAlert('Anonymized!')

          changeLevel({
            level: DicomOrder[0],
            uuid: response.data.PatientID,
          })
        } catch (error) {
          // Only handle response errors, let global interceptor handle network errors
          if (error?.response) {
            showErrorAlert(getErrorMessage(error))
          }
        }
      }
    })
  }

  const transfersHandler = async () => {
    let orthancPeers
    if (peers === null) {
      // Get Orthanc peers list
      orthancPeers = (
        await axios({
          method: 'GET',
          url: `${process.env.REACT_APP_API_URL}/explorer/transfers/peers`,
        })
      ).data
      setPeers(() => {
        return orthancPeers
      })
    } else {
      orthancPeers = peers
    }

    const options = {}
    Object.keys(orthancPeers).forEach(mod => {
      options[mod] = mod
    })

    MySwal.fire({
      title: '<p>Please select a peer!</p>',
      input: 'select',
      inputOptions: options,
      inputAttributes: {
        autocapitalize: 'off',
      },
      confirmButtonText: 'Send',
      showLoaderOnConfirm: true,
      preConfirm: peer => {
        if (!peer) {
          return MySwal.showValidationMessage('Please select a peer')
        }
        return axios({
          method: 'POST',
          url: `${process.env.REACT_APP_API_URL}/explorer/transfers/send`,
          data: {
            Resources: [
              {
                Level: OrthancLevels[currentLevelData.level]?.capital || currentLevelData.level,
                ID: currentLevelData.uuid,
              },
            ],
            Compression: 'gzip',
            Peer: peer,
          },
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
        showSuccessAlert('Job created Successfully!')
      }
    })
  }

  return (
    <>
      <Header>
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to="/explorer"> Home </Link>
          </BreadcrumbItem>
          {breadCrumbLevel.map((str, idx, arr) => {
            if (arr[idx + 1]) {
              return (
                <BreadcrumbItem key={idx}>
                  <span> {OrthancLevels[str]?.['capital'] || str} </span>
                </BreadcrumbItem>
              )
            } else {
              return (
                <BreadcrumbItem key={idx}>
                  <span> {OrthancLevels[str]?.['capital'] || str} </span>
                </BreadcrumbItem>
              )
            }
          })}
        </Breadcrumb>
      </Header>
      <Row className="mr-1 ml-1">
        <Col md={3}>
          {Object.keys(data).map((value, idx) => {
            if (data[value] && !Array.isArray(data[value])) {
              return (
                <Card key={idx}>
                  <CardHeader className="pb-0 pt-1">
                    <CardTitle>{OrthancLevels[value]?.['capital'] || value}</CardTitle>
                  </CardHeader>
                  <DetailsCard
                    className={{
                      main: `mb-0 ml-1 ${value !== currentLevelData.level ? 'cursor-pointer' : ''}`,
                      head: 'pb-25 pt-50',
                    }}
                    idx={{ level: value, uuid: data[value]['ID'] }}
                    data={data[value]}
                    showArrow={false}
                    title={fieldSet[value]['title']}
                    showKeys={fieldSet[value]['body']}
                    callback={value === currentLevelData.level ? null : changeLevel}
                  />
                </Card>
              )
            }
          })}
          <Card>
            <CardBody>
              <Button.Ripple block onClick={sendToDICOMwebServerHandler} color="primary">
                Send to DICOMweb server
              </Button.Ripple>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Button.Ripple block onClick={transfersHandler} color="primary">
                Transfers Accelerator
              </Button.Ripple>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Interact</CardTitle>
            </CardHeader>
            <ListGroup flush>
              {currentLevelData.level !== 'instances' && (
                <ListGroupItem>
                  <Button.Ripple block onClick={anonymizeHandler} color="primary">
                    Anonymize
                  </Button.Ripple>
                </ListGroupItem>
              )}
              <ListGroupItem>
                <Button.Ripple block onClick={deleteHandler} color="primary">
                  Delete this {OrthancLevels[currentLevelData.level]?.['nonPlural'] || 'item'}
                </Button.Ripple>
              </ListGroupItem>
              <ListGroupItem>
                <Button.Ripple block onClick={sendToRemoteModalityHandler} color="primary">
                  Send to remote modality
                </Button.Ripple>
              </ListGroupItem>
              {OrthancLevels.patients.regular === currentLevelData.level && (
                <ListGroupItem>
                  <Button.Ripple
                    block
                    color={isProtected ? 'success' : 'danger'}
                    onClick={handleProtected}
                  >
                    {isProtected ? 'Protected' : 'Unprotected'}
                  </Button.Ripple>
                </ListGroupItem>
              )}
            </ListGroup>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Access</CardTitle>
            </CardHeader>
            <ListGroup flush>
              {currentLevelData.level !== OrthancLevels.instances.regular && (
                <>
                  <ListGroupItem>
                    <Button.Ripple block onClick={downloadZIPHanlder} color="primary">
                      Download ZIP
                    </Button.Ripple>
                  </ListGroupItem>
                  <ListGroupItem>
                    <Button.Ripple block onClick={downloadDICOMDIRHanlder} color="primary">
                      Download DICOMDIR
                    </Button.Ripple>
                  </ListGroupItem>
                </>
              )}
              {currentLevelData.level === OrthancLevels.instances.regular && (
                <>
                  <ListGroupItem>
                    <Button.Ripple block onClick={downloadZIPHanlder} color="primary">
                      Download the DICOM file
                    </Button.Ripple>
                  </ListGroupItem>
                  <ListGroupItem>
                    <Button.Ripple block onClick={downloadJSONHanlder} color="primary">
                      Download the JSON file
                    </Button.Ripple>
                  </ListGroupItem>
                </>
              )}
              {currentLevelData.level === OrthancLevels.studies.regular && (
                //   <a

                //   >
                //     Preview study
                //   </a>

                <ListGroupItem>
                  <div
                    className="me-1 btn btn-primary w-100"
                    color="primary"
                    onClick={() =>
                      getStudyId(
                        data[OrthancLevels.studies.regular]?.ID,
                        data[OrthancLevels.studies.regular]?.MainDicomTags?.StudyInstanceUID
                      )
                    }
                    rel="noopener noreferrer"
                  >
                    Preview study
                  </div>
                </ListGroupItem>
              )}
            </ListGroup>
          </Card>
        </Col>
        <Col md={9}>
          {!showTagsView ? (
            <Col>
              {currentLevelData.level === 'instances' ? (
                <CustomTable
                  key={`instances-${tableKey}-${data.instances?.ID || 'loading'}`}
                  data={
                    data.instances && typeof data.instances === 'object'
                      ? [flattenObj(data.instances)]
                      : []
                  }
                  columns={columns.instances || []}
                  tableName="explorer-instances"
                  handleRowClick={null}
                />
              ) : (
                <CustomTable
                  key={`table-${tableKey}-${currentLevelData.level}`}
                  data={
                    data[DicomOrder[DicomOrder.indexOf(currentLevelData.level) + 1]] &&
                    !isObject(data[DicomOrder[DicomOrder.indexOf(currentLevelData.level) + 1]])
                      ? data[DicomOrder[DicomOrder.indexOf(currentLevelData.level) + 1]].map(
                          flattenObj
                        )
                      : []
                  }
                  columns={
                    columns[DicomOrder[DicomOrder.indexOf(currentLevelData.level) + 1]] || []
                  }
                  tableName={`explorer-${DicomOrder[DicomOrder.indexOf(currentLevelData.level) + 1]}`}
                  handleRowClick={changeLevel}
                />
              )}
            </Col>
          ) : (
            <Card>
              <CardBody>{tagDataMapper(instanceLevelTags, showTagDescription)}</CardBody>
            </Card>
          )}
        </Col>
      </Row>
    </>
  )
}

export default Explorer
