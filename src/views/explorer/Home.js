import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardBody,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Col,
  Spinner,
  Row,
} from 'reactstrap'
import moment from 'moment'
import axios from 'axios'
import { extractErrorMessage, flattenObj, openExplorer } from '../../utility/Utils'
import {
  showErrorAlert,
  showSuccessAlert,
  showConfirm,
  showInfoAlert,
  getErrorMessage,
} from '../../utils/alerts'
import maleIcon from './../../assets/images/icons/male-gender.png'
import femaleIcon from './../../assets/images/icons/female.png'
import otherGenderIcon from './../../assets/images/icons/transgender.png'
import ListTable from '../../@core/components/list-table'
import { isUserLoggedIn } from '@utils'

const Home = () => {
  const navigate = useNavigate()
  const studyDateOptions = useRef([
    { value: '*', label: 'Any date' },
    { value: '0-days', label: 'Today' },
    { value: '1-days', label: 'Yesterday' },
    { value: '7-days', label: 'Last 7 days' },
    { value: '31-days', label: 'Last 31 days' },
    { value: '3-months', label: 'Last 3 months' },
    { value: '1-years', label: 'Last year' },
  ])
  const [studyDate, setStudyDate] = useState(studyDateOptions.current[0].value)
  const [formData, setFormData] = useState({})
  const [lookupResult, setLookupResult] = useState([])
  const [lookupResultTotal, setLookupResultTotal] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(
    localStorage.getItem('lookuprow') ? JSON.parse(localStorage.getItem('lookuprow')) : 7
  )
  const [refreshLoading, setRefreshLoading] = useState(false)
  const [sortField, setSortField] = useState(null)
  const [sortOrder, setSortOrder] = useState(0)
  const [page, setPage] = useState(0)

  const [searchValue, setSearchValue] = useState('')
  const [filteredData, setFilteredData] = useState([])
  const userData = JSON.parse(isUserLoggedIn())

  const tableRef = useRef(null)

  const calculateFinalDate = value => {
    if (value !== '*') {
      const [days, op] = value.split('-')
      return (Number(days) === 0 || Number(days) === 1) && op === 'days'
        ? moment().subtract(Number(days), op).format('YYYYMMDD')
        : `${moment().subtract(Number(days), op).format('YYYYMMDD')}-`
    }
    return value
  }

  const onSubmit = async (pageVal, rowsPerPageVal) => {
    rowsPerPageVal = rowsPerPageVal || rowsPerPage
    formData.StudyDate = calculateFinalDate(studyDate)
    setRefreshLoading(true)
    try {
      const response = await axios({
        method: 'POST',
        url: `${process.env.REACT_APP_API_URL}/explorer/studies`,
        data: { filters: formData },
        params: {
          limit: rowsPerPageVal,
          since: pageVal,
        },
      })

      setLookupResultTotal(response?.data?.totalStudyData)

      const studyData = response.data.studyData || []
      setLookupResult(() => {
        return studyData.map(obj => {
          return flattenObj(obj)
        })
      })
      setPage(pageVal++)
      setRowsPerPage(prev => rowsPerPageVal)

      // Show message only if no studies found
      if (studyData.length === 0) {
        showInfoAlert(
          'No DICOM studies found matching your search criteria.<br/>' +
            'Try using broader search terms or check if studies exist in Orthanc.'
        )
      } else {
        // Scroll to results if they exist
        setTimeout(() => {
          if (tableRef.current) {
            tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
      }

      setRefreshLoading(false)
    } catch (error) {
      console.error('Lookup failed:', error)
      setRefreshLoading(false)
      const errorMsg = extractErrorMessage(
        error?.response?.data ?? error,
        'Failed to search studies. Please try again.'
      )
      showErrorAlert(errorMsg)

      // Reset results on error
      setLookupResult([])
      setLookupResultTotal(0)
    }
  }

  const onInputChange = e => {
    if (!e.target.value && formData[e.target.id]) {
      const tempObj = { ...formData }
      delete tempObj[e.target.id]
      setFormData(() => tempObj)
    } else {
      setFormData(prev => {
        return { ...prev, [e.target.id]: e.target.value }
      })
    }
  }

  const onStudyDateChangeHandler = e => {
    setStudyDate(e.target.value)
  }

  // Handle Row Clicks
  const handleRowClick = e => {
    openExplorer('studies', e.data['ID'], navigate)
  }

  function handleSort(d) {
    if (d.sortField) {
      setSortOrder(d.sortOrder)
      setSortField(d.sortField)

      if (sortOrder === -1) {
        lookupResult.sort((a, b) => String(b[d.sortField]).localeCompare(String(a[d.sortField])))
      } else {
        lookupResult.sort((a, b) => String(a[d.sortField]).localeCompare(String(b[d.sortField])))
      }

      setLookupResult(lookupResult)
    }
  }

  const columns = [
    {
      name: 'Patient Name',
      cell: row => (row['PatientName'] ? row['PatientName'] : '-'),
      sortable: true,
      reorder: true,

      id: 'PatientName',
      minWidth: '150px',
    },
    {
      name: 'Study Description',
      cell: row => (row['StudyDescription'] ? row['StudyDescription'] : '-'),
      sortable: true,
      reorder: true,

      id: 'StudyDescription',
      minWidth: '200px',
    },
    {
      name: 'Patient Birth Date',
      cell: row => (row['PatientBirthDate'] ? row['PatientBirthDate'] : '-'),
      reorder: true,

      id: 'PatientBirthDate',
      sortable: true,
      minWidth: '205px',
      cell: row => {
        return moment(row['PatientBirthDate']).format(userData?.dateFormats?.dateFormat)
      },
    },
    {
      name: 'Patient ID',
      cell: row => (row['PatientID'] ? row['PatientID'] : '-'),
      sortable: true,
      reorder: true,

      id: 'PatientID',
      minWidth: '150px',
    },
    {
      name: 'Sex',
      cell: row =>
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
      reorder: true,

      id: 'PatientSex',
      minWidth: '150px',
      maxWidth: '150px',
    },
    {
      name: 'Accession Number',
      cell: row => (row['AccessionNumber'] ? row['AccessionNumber'] : '-'),
      sortable: true,
      reorder: true,

      id: 'AccessionNumber',
      minWidth: '225px',
    },
    {
      name: 'Institution Name',
      cell: row => (row['InstitutionName'] ? row['InstitutionName'] : '-'),
      sortable: true,
      reorder: true,

      id: 'InstitutionName',
      minWidth: '175px',
    },
    {
      name: 'Referring Physician Name',
      cell: row => (row['ReferringPhysicianName'] ? row['ReferringPhysicianName'] : '-'),
      sortable: true,
      reorder: true,

      id: 'ReferringPhysicianName',
      minWidth: '200px',
    },
    {
      name: 'Study Date',
      selector: row => (row['StudyDate'] ? row['StudyDate'] : '-'),
      sortable: true,
      reorder: true,

      id: 'StudyDate',
      minWidth: '150px',
      cell: row => {
        return moment(row['StudyDate']).format(userData?.dateFormats?.dateFormat)
      },
    },
    {
      name: 'Study ID',
      cell: row => (row['StudyID'] ? row['StudyID'] : '-'),
      sortable: true,
      reorder: true,

      id: 'StudyID',
      minWidth: '150px',
    },
    {
      name: 'Study Instance UID',
      cell: row => (row['StudyInstanceUID'] ? row['StudyInstanceUID'] : '-'),
      sortable: true,
      reorder: true,

      id: 'StudyInstanceUID',
      minWidth: '150px',
    },
  ]

  useEffect(() => {
    if (searchValue !== '') {
      const updatedData = lookupResult.filter(item => {
        if (typeof item === 'string') {
          return item.includes(searchValue)
        } else if (typeof item === 'object') {
          let isContain = false
          Object.values(item).some((value, index) => {
            if (index === 4) {
              if (
                typeof value === 'string' &&
                moment(value).format('MMMM Do YYYY').includes(searchValue)
              ) {
                isContain = true
              }
            } else {
              if (typeof value === 'string' && value.includes(searchValue)) {
                isContain = true
              }
            }
          })

          return isContain
        }
        return false
      })
      setFilteredData(updatedData)
    } else {
      setFilteredData([])
    }
  }, [searchValue])

  return (
    <>
      <Card>
        <CardBody>
          <Form>
            <FormGroup row>
              <Label sm="3" for="PatientID">
                Patient ID
              </Label>
              <Col sm="6">
                <Input type="text" name="PatientID" id="PatientID" onChange={onInputChange} />
              </Col>
            </FormGroup>

            <FormGroup row>
              <Label sm="3" for="PatientName">
                Patient Name
              </Label>
              <Col sm="6">
                <Input type="text" name="PatientName" id="PatientName" onChange={onInputChange} />
              </Col>
            </FormGroup>

            <FormGroup row>
              <Label sm="3" for="AccessionNumber">
                Accession Number
              </Label>
              <Col sm="6">
                <Input
                  type="text"
                  name="AccessionNumber"
                  id="AccessionNumber"
                  onChange={onInputChange}
                />
              </Col>
            </FormGroup>

            <FormGroup row>
              <Label sm="3" for="StudyDescription">
                Study Description
              </Label>
              <Col sm="6">
                <Input
                  type="text"
                  name="StudyDescription"
                  id="StudyDescription"
                  onChange={onInputChange}
                />
              </Col>
            </FormGroup>

            <FormGroup row className="mb-2">
              <Label sm="3" for="dicom-server">
                Study date:
              </Label>
              <Col md="6" sm="12">
                <Input
                  type="select"
                  name="select"
                  id="select-basic"
                  onChange={onStudyDateChangeHandler}
                >
                  {studyDateOptions.current.map((obj, idx) => {
                    return (
                      <option value={obj.value} key={idx}>
                        {obj.label}
                      </option>
                    )
                  })}
                </Input>
              </Col>
            </FormGroup>

            <FormGroup className="mb-0" row>
              <Col className="d-flex" md={{ size: 9, offset: 3 }}>
                {refreshLoading ? (
                  <Button.Ripple
                    className="mr-1 sm-mb-1"
                    color="primary"
                    style={{ width: '116px' }}
                  >
                    <Spinner color="light" size="sm" />
                  </Button.Ripple>
                ) : (
                  <Button.Ripple
                    className="mr-1 sm-mb-1"
                    color="primary"
                    onClick={() => {
                      onSubmit(0, '')
                    }}
                  >
                    Do lookup
                  </Button.Ripple>
                )}
                {!lookupResult.length ? '' : ''}
              </Col>
            </FormGroup>
          </Form>
        </CardBody>
      </Card>
      {lookupResult.length > 0 || filteredData.length > 0 ? (
        <>
          <Row className="justify-content-end mx-0">
            <Col className="d-flex align-items-center justify-content-end mt-1" md="6" sm="12">
              <Label className="mr-1" for="search-input">
                Search
              </Label>
              <Input
                className="dataTable-filter mb-50"
                type="text"
                bsSize="sm"
                id="search-input"
                value={searchValue}
                onChange={e => {
                  setSearchValue(e.target.value)
                }}
              />
            </Col>
          </Row>
          <div ref={tableRef}>
            <Col>
              <ListTable
                {...{
                  moduleName: 'explorer-lookup',
                  tableData: searchValue !== '' ? filteredData : lookupResult,
                  visibleColumns: columns,
                  rows: rowsPerPage,
                  totalRecords: searchValue !== '' ? filteredData.length : lookupResultTotal,
                  onRowDoubleClick: handleRowClick,

                  first: page,
                  onSort: handleSort,
                  sortField,
                  sortOrder,
                  onPage: e => {
                    onSubmit(e.first, e.rows)

                    localStorage.setItem('lookuprow', e.rows)
                  },
                }}
              />
            </Col>
          </div>
        </>
      ) : null}
    </>
  )
}

export default Home
