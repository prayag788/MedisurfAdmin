// ** Styles
import '@styles/react/libs/tables/react-dataTable-component.scss'
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Col,
  CardFooter,
  Spinner,
  UncontrolledTooltip,
  CardTitle,
} from 'reactstrap'
import { Download } from 'react-feather'
import { useState, useEffect, useRef } from 'react'
import Flatpickr from 'react-flatpickr'
import maleIcon from './../../assets/images/icons/male-gender.png'
import femaleIcon from './../../assets/images/icons/female.png'
import otherGenderIcon from './../../assets/images/icons/transgender.png'
import crossicon from './../../assets/images/icons/close.png'
import { extractErrorMessage, isUserLoggedIn } from '@utils'

import '@styles/react/libs/flatpickr/flatpickr.scss'
import '@styles/react/libs/react-select/_react-select.scss'

import moment from 'moment'
import axios from 'axios'

// ** Sweet Alert Setup
import {
  showLoadingAlert,
  showSuccessAlert,
  showErrorAlert,
  hideLoadingAlert,
} from '../../utils/alerts'
// ** Config
import themeConfig from '@configs/themeConfig'
import Header from './components/header'
import ListTable from '../../@core/components/list-table'

const QueryRetrieve = () => {
  const [selectedServer, setSelectedServer] = useState('')
  const [queryData, setQueryData] = useState([])
  const [recordsPerPage, setRecordsPerPage] = useState(7)
  const [page, setPage] = useState(0)
  const [tempData, setTempData] = useState(null)
  const [loading, setLoading] = useState(false)

  const answers = useRef([])
  const queryID = useRef('')
  const tableRef = useRef(null)

  const recordPerPageChangeHandler = (num) => {
    setRecordsPerPage(num)
  }

  const pageChangeHandler = (num) => {
    setPage(num)
  }

  /**
   * Perform C-ECHO on the modality
   */
  const performEcho = () => {
    return new Promise((resolve) => {
      if (!selectedServer) {
        showErrorAlert('Please select a DICOM server first')
        resolve()
        return
      }

      axios({
        method: 'POST',
        url: `${process.env.REACT_APP_API_URL}/explorer/modalities/${selectedServer}/echo`,
      })
        .then(() => {
          showSuccessAlert('C-Echo successful!')
          resolve()
        })
        .catch((error) => {
          const errorMsg = extractErrorMessage(
            error?.response?.data ?? error,
            'C-Echo has Failed!'
          )
          showErrorAlert(errorMsg)
          resolve()
        })
    })
  }

  /**
   * Perform C-FIND on the modality
   */
  const performFind = (data) => {
    setTempData(data)
    return new Promise(async (resolve) => {
      try {
        if (!selectedServer) {
          showErrorAlert('Please select a DICOM server first')
          resolve()
          return
        }

        setLoading(true)
        queryID.current = await axios({
          method: 'POST',
          url: `${process.env.REACT_APP_API_URL}/explorer/modalities/${selectedServer}/queries?page=${page}&size=${recordsPerPage}`,
          data,
        })

        if (queryID.current.data.data.length) {
          setQueryData(() => queryID.current.data.data)
          setLoading(false)
        } else {
          showSuccessAlert('No studies found!')
          setQueryData(() => [])
          setLoading(false)
        }

        resolve()
      } catch (error) {
        showErrorAlert(
          extractErrorMessage(
            error?.response?.data ?? error,
            'Error While Fetching modality list!<br>Please try Again later'
          )
        )
        resolve()
      }
    })
  }

  useEffect(() => {
    if (tempData) {
      performFind(tempData)
    }
  }, [page, recordsPerPage])

  return (
    <>
      <QueryComponent
        onSelectedServerChange={setSelectedServer}
        dicomServer={selectedServer}
        echo={performEcho}
        find={performFind}
      />

      {queryData.length ? (
        <div ref={tableRef}>
          <RetrieveComponent
            data={queryData}
            queryID={queryID.current.data.ID}
            pageSize={queryID.current.data.length}
            recordPerPageChangeHandler={recordPerPageChangeHandler}
            pageChangeHandler={pageChangeHandler}
            currentPage={page}
            isLoading={loading}
          />
        </div>
      ) : (
        ''
      )}
    </>
  )
}

const QueryComponent = ({
  onSelectedServerChange,
  dicomServer,
  echo,
  find,
}) => {
  const [picker, setPicker] = useState()
  const [showPicker, setShowPicker] = useState(false)
  const [dicomServerOptions, setDicomServerOptions] = useState([])
  const [field, setField] = useState('PatientID')
  const [fieldValue, setFieldValue] = useState('*')
  const [modalities, setModalities] = useState([])
  const studyDateOptions = useRef([
    { value: '*', label: 'Any date' },
    { value: '0-days', label: 'Today' },
    { value: '1-days', label: 'Yesterday' },
    { value: '7-days', label: 'Last 7 days' },
    { value: '31-days', label: 'Last 31 days' },
    { value: '3-months', label: 'Last 3 months' },
    { value: '1-years', label: 'Last year' },
    { value: 'specific_date', label: 'Specific Date' },
  ])
  const [studyDate, setStudyDate] = useState(studyDateOptions.current[0].value)
  const [testEchoLoading, setTestEchoLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [crossStudyDate, setcrossStudyDate] = useState(false)
  const [afterOnchange, setAfterOnchange] = useState(false)
  const userData = JSON.parse(isUserLoggedIn())
  const flatPickerDateFormat =
    userData?.dateFormats?.dateFormat === 'MM/DD/YYYY'
      ? 'm/d/Y'
      : userData?.dateFormats?.dateFormat === 'DD/MM/YYYY'
        ? 'd/m/Y'
        : userData?.dateFormats?.dateFormat === 'YYYY/MM/DD'
          ? 'Y/m/d'
          : 'm/d/Y'

  const [Flatpicker, showFlatpicker] = useState(true)
  const fp = useRef()
  const ChangeState = () => {
    if (!Flatpicker) {
      fp.current.flatpickr.open()
    }
  }

  useEffect(() => {
    ChangeState()
  }, [Flatpicker])

  const onKeyPressed = (e) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      setPicker('')
    }
  }

  useEffect(() => {
    const fetchModalities = async () => {
      try {
        console.log(
          'Fetching modalities from:',
          `${process.env.REACT_APP_API_URL}/explorer/modalities`
        )
        const response = await axios({
          method: 'GET',
          url: `${process.env.REACT_APP_API_URL}/explorer/modalities`,
        })

        console.log('Modalities response:', response.data)

        // Handle case where response contains message about no modalities
        if (response.data.message && response.data.count === 0) {
          console.warn('No DICOM servers configured:', response.data.message)
          setDicomServerOptions([])
          showErrorAlert(response.data.message)
          return
        }

        const modalityKeys = Object.keys(response.data || {})
        setDicomServerOptions(modalityKeys)
        if (modalityKeys.length > 0) {
          onSelectedServerChange(modalityKeys[0])
          console.log(
            `Found ${modalityKeys.length} DICOM servers:`,
            modalityKeys
          )
        } else {
          console.warn('No DICOM servers found in response')
          showErrorAlert(
            'No DICOM servers configured. Please configure DICOM modalities in Orthanc first.'
          )
        }
      } catch (error) {
        console.error('Error fetching modalities:', error)
        let errorMsg = extractErrorMessage(
          error?.response?.data ?? error,
          'Error While Fetching modality list!<br>Please try Again later'
        )
        if (error?.response?.data?.details) {
          errorMsg = `${errorMsg}<br>Details: ${error.response.data.details}`
        }
        showErrorAlert(errorMsg)
        setDicomServerOptions([])
      }
    }
    fetchModalities()
  }, [])

  useEffect(() => {
    if (studyDate === 'specific_date') {
      showFlatpicker(() => false)
    } else {
      setShowPicker(() => false)
      setPicker(() => undefined)
    }
  }, [studyDate])

  const onStudyDateChangeHandler = (e) => {
    setStudyDate(() => e.target.value)
  }

  const onDicomServerChangeHandler = (e) => {
    onSelectedServerChange(e.target.value)
  }

  const handleField = (e) => {
    setField(() => e.target.id)
  }

  const handleFieldValue = (e) => {
    setFieldValue(() => e.target.value)
  }

  const modalityHandler = (e) => {
    const modalityIdx = modalities.indexOf(e.target.value)
    if (modalityIdx === -1) {
      setModalities((prev) => {
        prev.push(e.target.value)
        return [...prev]
      })
    } else {
      setModalities((prev) => {
        prev.splice(modalityIdx, 1)
        return [...prev]
      })
    }
  }

  const calculateFinalDate = (value) => {
    if (value !== '*') {
      const [days, op] = value.split('-')
      return (Number(days) === 0 || Number(days) === 1) && op === 'days'
        ? moment().subtract(Number(days), op).format('YYYYMMDD')
        : `${moment().subtract(Number(days), op).format('YYYYMMDD')}-`
    }
    return value
  }

  const submitHandler = async (e) => {
    e.preventDefault()

    if (!dicomServer || dicomServer === '') {
      showErrorAlert('Please select a DICOM server first')
      return
    }

    if (dicomServerOptions.length === 0) {
      showErrorAlert(
        'No DICOM servers available. Please configure DICOM modalities in Orthanc first.'
      )
      return
    }

    console.log(
      'Performing study search on server:',
      dicomServer,
      'with filters:',
      {
        field,
        fieldValue,
        studyDate,
        modalities,
      }
    )
    setSearchLoading(true)

    const finalData = {
      AccessionNumber: '',
      PatientBirthDate: '',
      PatientID: '*',
      PatientName: '',
      PatientSex: '',
      StudyDate: '*',
      StudyDescription: '*',
    }

    if (picker) {
      finalData.StudyDate = moment(picker[0]).format('YYYYMMDD')
    } else if (studyDate) {
      finalData.StudyDate = calculateFinalDate(studyDate)
    }

    finalData[field] = fieldValue

    if (modalities.length) {
      finalData.ModalitiesInStudy = modalities.reduce((prev, curr) => {
        return `${prev}//${curr}`
      })
    }

    try {
      await find({ filters: finalData })
    } catch (error) {
      console.error('Study search failed:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  const performEcho = async (e) => {
    e.preventDefault()

    if (!dicomServer || dicomServer === '') {
      showErrorAlert('Please select a DICOM server first')
      return
    }

    if (dicomServerOptions.length === 0) {
      showErrorAlert(
        'No DICOM servers available. Please configure DICOM modalities in Orthanc first.'
      )
      return
    }

    console.log('Performing echo test on server:', dicomServer)
    setTestEchoLoading(true)

    try {
      await echo()
    } catch (error) {
      console.error('Echo test failed:', error)
    } finally {
      setTestEchoLoading(false)
    }
  }

  return (
    <>
      <Header>
        <CardTitle tag="h4" className="mb-0">
          Medisurf Explorer
        </CardTitle>
      </Header>
      <Card
        unselectable={searchLoading || testEchoLoading ? 'on' : ''}
        className={searchLoading || testEchoLoading ? 'unselectable' : ''}
      >
        <CardHeader></CardHeader>
        <CardBody>
          <Form>
            <FormGroup row className="mb-2">
              <Label sm="3" for="dicom-server">
                DICOM server:
              </Label>
              <Col md="6" sm="12">
                <Input
                  type="select"
                  name="select"
                  id="select-basic"
                  value={dicomServer}
                  onChange={onDicomServerChangeHandler}
                  placeholder="Select..."
                >
                  <option value="" disabled>
                    Select DICOM Server...
                  </option>
                  {dicomServerOptions.map((obj, index) => {
                    return (
                      <option key={index} value={obj}>
                        {obj}
                      </option>
                    )
                  })}
                </Input>
              </Col>
            </FormGroup>

            <FormGroup row className="mb-2" onChange={handleField}>
              <Label sm="3" for="Email">
                Field of interest:
              </Label>
              <Col sm="12" md="6">
                <div className="d-flex align-items-center mb-25">
                  <Input
                    type="radio"
                    id="PatientID"
                    name="field"
                    defaultChecked
                  />
                  <Label for="PatientID" className="mb-0 ml-50">
                    Patient ID
                  </Label>
                </div>
                <div className="d-flex align-items-center mb-25 mt-25">
                  <Input type="radio" id="PatientName" name="field" />
                  <Label for="PatientName" className="mb-0 ml-50">
                    Patient Name
                  </Label>
                </div>
                <div className="d-flex align-items-center mb-25 mt-25">
                  <Input type="radio" id="AccessionNumber" name="field" />
                  <Label for="AccessionNumber" className="mb-0 ml-50">
                    Accession Number
                  </Label>
                </div>
                <div className="d-flex align-items-center mb-25 mt-25">
                  <Input type="radio" id="StudyDescription" name="field" />
                  <Label for="StudyDescription" className="mb-0 ml-50">
                    Study Description
                  </Label>
                </div>
              </Col>
            </FormGroup>

            <FormGroup row className="mb-2">
              <Label sm="3" for="mobile">
                Value for this field:
              </Label>
              <Col sm="12" md="6">
                <Input
                  type="textarea"
                  name="text"
                  value={fieldValue}
                  onChange={handleFieldValue}
                  id="exampleText"
                  rows="2"
                />
              </Col>
            </FormGroup>

            <FormGroup row className="mb-2">
              <Label sm="3" for="dicom-server">
                Study date:
              </Label>
              <Col md="6" sm="12">
                {Flatpicker ? (
                  <Input
                    type="select"
                    name="select"
                    id="select-basic"
                    onChange={onStudyDateChangeHandler}
                  >
                    {studyDateOptions.current.map((obj) => {
                      return <option value={obj.value}>{obj.label}</option>
                    })}
                  </Input>
                ) : (
                  <Flatpickr
                    className="form-control"
                    placeholder={'Select Date...'}
                    value={picker}
                    ref={fp}
                    id="default-picker"
                    options={{
                      maxDate: 'today',
                      dateFormat: flatPickerDateFormat,
                      clickOpens: true,
                      onClose: () => {
                        if (afterOnchange) {
                          if (!picker) {
                            showFlatpicker(() => true)
                            setStudyDate(() => null)
                          }
                          setAfterOnchange(false)
                        }
                      },
                    }}
                    onChange={(dateVal) => {
                      setPicker(dateVal)
                      setAfterOnchange(true)
                      setcrossStudyDate(true)
                    }}
                    onKeyDown={onKeyPressed}
                  />
                )}
                {crossStudyDate ? (
                  <img
                    src={crossicon}
                    width="15"
                    height="15"
                    className="crossIcon"
                    style={{
                      position: 'absolute',
                      top: '11px',
                      right: `${Flatpicker ? '45px' : '22px'}`,
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setPicker('')
                      setcrossStudyDate(false)

                      showFlatpicker(() => true)
                      setStudyDate(studyDateOptions.current[0].value)
                    }}
                  />
                ) : (
                  ''
                )}
              </Col>
            </FormGroup>

            <FormGroup row onChange={modalityHandler}>
              <Label sm="3" for="mobile">
                Modalities:
              </Label>
              <Col sm="12" md="6">
                <FormGroup check inline>
                  <Input type="checkbox" id="basic-cb-unchecked" value="CR" />
                  <Label for="basic-cb-checked" check>
                    CR
                  </Label>
                </FormGroup>
                <FormGroup check inline>
                  <Input type="checkbox" id="basic-cb-unchecked" value="CT" />
                  <Label for="basic-cb-checked" check>
                    CT
                  </Label>
                </FormGroup>
                <FormGroup check inline>
                  <Input type="checkbox" id="basic-cb-unchecked" value="MR" />
                  <Label for="basic-cb-checked" check>
                    MR
                  </Label>
                </FormGroup>
                <FormGroup check inline>
                  <Input type="checkbox" id="basic-cb-unchecked" value="NM" />
                  <Label for="basic-cb-checked" check>
                    NM
                  </Label>
                </FormGroup>
                <FormGroup check inline>
                  <Input type="checkbox" id="basic-cb-unchecked" value="PT" />
                  <Label for="basic-cb-checked" check>
                    PT
                  </Label>
                </FormGroup>
                <FormGroup check inline>
                  <Input type="checkbox" id="basic-cb-unchecked" value="US" />
                  <Label for="basic-cb-checked" check>
                    US
                  </Label>
                </FormGroup>
                <FormGroup check inline>
                  <Input type="checkbox" id="basic-cb-unchecked" value="XA" />
                  <Label for="basic-cb-checked" check>
                    XA
                  </Label>
                </FormGroup>
                <FormGroup check inline>
                  <Input type="checkbox" id="basic-cb-unchecked" value="DR" />
                  <Label for="basic-cb-checked" check>
                    DR
                  </Label>
                </FormGroup>
                <FormGroup check inline>
                  <Input type="checkbox" id="basic-cb-unchecked" value="DX" />
                  <Label for="basic-cb-checked" check>
                    DX
                  </Label>
                </FormGroup>
                <FormGroup check inline>
                  <Input type="checkbox" id="basic-cb-unchecked" value="MG" />
                  <Label for="basic-cb-checked" check>
                    MG
                  </Label>
                </FormGroup>
              </Col>
            </FormGroup>

            <FormGroup row>
              <Label md={3} for="mobile"></Label>
              <Col className="d-flex mb-xs-1" lg={3} md={4} sm={6}>
                <Button.Ripple
                  block
                  className="mr-1 sm-mb-1"
                  color="success"
                  type="submit"
                  onClick={performEcho}
                  disabled={testEchoLoading}
                >
                  {testEchoLoading ? (
                    <Spinner color="light" size="sm" />
                  ) : (
                    'Test Echo'
                  )}
                </Button.Ripple>
              </Col>
              <Col className="d-flex" lg={3} md={4} sm={6}>
                <Button.Ripple
                  block
                  className="mr-1 sm-mb-1"
                  color="primary"
                  type="submit"
                  onClick={submitHandler}
                  disabled={searchLoading}
                >
                  {searchLoading ? (
                    <Spinner color="light" size="sm" />
                  ) : (
                    'Search study'
                  )}
                </Button.Ripple>
              </Col>
            </FormGroup>
          </Form>
        </CardBody>
        <CardFooter></CardFooter>
      </Card>
    </>
  )
}

const RetrieveComponent = ({
  data,
  queryID,
  pageSize,
  recordPerPageChangeHandler,
  pageChangeHandler,
  currentPage,
  isLoading,
}) => {
  /**
   * Perform C-MOVE on the modality
   */
  const [rowsPerPage, setRowsPerPage] = useState(7)
  const [visibleColumns, setVisibleColumns] = useState([])
  const [sortField, setSortField] = useState(null)
  const [sortOrder, setSortOrder] = useState(0)
  const userData = JSON.parse(isUserLoggedIn())

  const performRetrieve = async (index) => {
    showLoadingAlert()

    try {
      const system = (
        await axios({
          method: 'GET',
          url: `${process.env.REACT_APP_API_URL}/explorer/system`,
        })
      ).data

      await axios({
        method: 'POST',
        url: `${process.env.REACT_APP_API_URL}/explorer/queries/${queryID}/answers/${index}/retrieve`,
        data: { TargetAet: system.DicomAet, Synchronous: false },
      })

      showSuccessAlert('Job created successfully')
      hideLoadingAlert()
    } catch (error) {
      showErrorAlert('Please try again later')
      hideLoadingAlert()
    }
  }

  const columns = [
    {
      name: 'Patient ID',
      cell: (row, idx) => {
        const selector = row['PatientID']
        return selector ? selector : '-'
      },
      sortable: true,
      minWidth: '150px',
    },
    {
      name: 'Patient Name',
      cell: (row, idx) => {
        const selector = row['PatientName']
        return selector ? selector : '-'
      },
      sortable: true,
      minWidth: '200px',
    },
    {
      name: 'Accession Number',
      cell: (row, idx) => {
        const selector = row['AccessionNumber']
        return selector ? selector : '-'
      },
      sortable: true,
      minWidth: '200px',
    },
    {
      name: 'Birth Date',
      cell: (row, idx) => {
        const selector = row['PatientBirthDate']
        return selector ? selector : '-'
      },
      sortable: true,
      minWidth: '150px',
    },
    {
      name: 'Sex',
      cell: (row) =>
        row['PatientSex'] === 'M' ? (
          <img src={maleIcon} width={25} alt="Player" />
        ) : row['PatientSex'] === 'F' ? (
          <img src={femaleIcon} width={20} alt="Player" />
        ) : row['PatientSex'] === 'O' ? (
          <img src={otherGenderIcon} width={28} alt="Player" />
        ) : (
          '-'
        ),
      sortable: true,
      minWidth: '150px',
    },
    {
      name: 'Study Date',
      cell: (row, idx) => {
        const selector = row['StudyDate']
        return selector ? moment(selector).format('ddd, MMM DD, YYYY') : '-'
      },
      sortable: true,
      minWidth: '200px',
    },
    {
      name: 'Actions',
      cell: (row, idx) => {
        return (
          <>
            <div id="retrieve">
              <Download
                size={15}
                className="mr-1"
                style={{ cursor: 'pointer' }}
                onClick={() => performRetrieve(idx.rowIndex)}
              />
            </div>
            <UncontrolledTooltip
              className="tooltip-react-strap"
              target="retrieve"
            >
              Retrieve
            </UncontrolledTooltip>
          </>
        )
      },
    },
  ]

  const handleSort = (d) => {
    if (d.sortField) {
      setSortOrder(d.sortOrder)
      setSortField(d.sortField)

      if (sortOrder === -1) {
        data.sort((a, b) =>
          String(b[d.sortField]).localeCompare(String(a[d.sortField]))
        )
      } else {
        data.sort((a, b) =>
          String(a[d.sortField]).localeCompare(String(b[d.sortField]))
        )
      }
    }
  }

  return (
    <>
      <Card>
        <div style={isLoading ? { pointerEvents: 'none', opacity: 0.2 } : {}}>
          <ListTable
            {...{
              tableData: data,
              visibleColumns:
                visibleColumns.length > 0 ? visibleColumns : columns,
              className: 'react-dataTable',
              rows: rowsPerPage,
              totalRecords: data.length,
              first: currentPage,
              onSort: handleSort,
              sortField,
              sortOrder,
              onPage: (e) => {
                pageChangeHandler(e.first++)
                setRowsPerPage((prev) => e.rows)
                recordPerPageChangeHandler((prev) => e.rows)
              },
            }}
          />
        </div>
        {isLoading ? (
          <div className="text-center width-full pt-1 mb-3">
            <Spinner color="primary" />
          </div>
        ) : (
          ''
        )}
      </Card>
    </>
  )
}

export default QueryRetrieve
