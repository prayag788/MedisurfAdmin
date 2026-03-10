import { useEffect, useState, useRef } from 'react'
import {
  Col,
  Card,
  Spinner,
  Row,
  CardHeader,
  CardTitle,
  Label,
  Input,
} from 'reactstrap'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { flattenObj } from '../../utility/Utils'
import moment from 'moment'
import maleIcon from './../../assets/images/icons/male-gender.png'
import femaleIcon from './../../assets/images/icons/female.png'
import otherGenderIcon from './../../assets/images/icons/transgender.png'
import ListTable from '../../@core/components/list-table'
import { isUserLoggedIn } from '@utils'

const fieldSet = {
  patients: [
    'ID',
    'PatientName',
    'PatientBirthDate',
    'PatientID',
    'PatientSex',
    'ParentPatient',
  ],
  studies: [
    'ID',
    'PatientName',
    'StudyDescription',
    'PatientBirthDate',
    'PatientID',
    'PatientSex',
    'AccessionNumber',
    'InstitutionName',
    'ReferringPhysicianName',
    'StudyDate',
    'StudyID',
    'StudyInstanceUID',
  ],
}

const AllDetails = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [data, setData] = useState([])
  const [extractedDataNew, setExtractedDataNew] = useState([])
  const [extractedData, setextractedData] = useState([])
  const [refreshLoading, setRefreshLoading] = useState(false)
  const [rowsPerPage, setRowsPerPage] = useState(
    localStorage.getItem('allstudiesrow')
      ? JSON.parse(localStorage.getItem('allstudiesrow'))
      : 7
  )
  const [level, setLevel] = useState(
    window.location.pathname.split('/explorer/all-')[1]
  )
  const userData = JSON.parse(isUserLoggedIn())

  const [page, setPage] = useState(0)
  const [searchValue, setSearchValue] = useState(
    sessionStorage.getItem(`${level}_searchValue`) || ''
  )
  const [sortColumn, setSortColumn] = useState('createdOn')
  const [sortDirection, setSortDirection] = useState('desc')
  const [sortField, setSortField] = useState(null)
  const [sortOrder, setSortOrder] = useState(0)
  const [filteredData, setFilteredData] = useState([])
  const [autoLoaded, setAutoLoaded] = useState(false)

  function handleSort(d) {
    if (d.sortField) {
      setSortOrder(d.sortOrder)
      setSortField(d.sortField)
      setSortColumn(d.sortField)
      setSortDirection(d.sortOrder === -1 ? 'desc' : 'asc')
      setPage(0)
    }
  }

  useEffect(() => {
    const currentLevel = location.pathname.split('/explorer/all-')[1]
    setLevel(currentLevel)
    setAutoLoaded(false) // Reset autoLoaded when route changes
  }, [location.pathname])

  useEffect(() => {
    const fetchData = async () => {
      setRefreshLoading(true)
      try {
        console.log('Current level:', level)
        console.log('Current pathname:', location.pathname)

        // Ensure we're calling the right endpoint
        const endpoint = level === 'patients' ? 'all-patients' : 'all-studies'
        console.log('API endpoint:', endpoint)

        const response = await axios({
          method: 'GET',
          url: `${process.env.REACT_APP_API_URL}/explorer/${endpoint}`,
        })

        console.log(
          'API Response data type:',
          Array.isArray(response.data) ? 'Array' : typeof response.data
        )
        console.log('First item type:', response.data[0]?.Type)

        setData(() => response.data)
        setAutoLoaded(true)
        setRefreshLoading(false)
      } catch (error) {
        console.log(error)
        setRefreshLoading(false)
      }
    }
    if (level && !autoLoaded) {
      fetchData()
    }
  }, [level, location.pathname, autoLoaded])

  useEffect(() => {
    if (!level || !data.length) return

    // Filter data based on Type to ensure correct data is shown
    const filteredByType = data.filter((obj) => {
      if (level === 'patients') {
        return obj.Type === 'Patient'
      } else if (level === 'studies') {
        return obj.Type === 'Study'
      }
      return true
    })

    console.log(
      `Filtered ${data.length} items to ${filteredByType.length} ${level}`
    )

    const returnedData = filteredByType.map((obj) => {
      const extracted = {}
      const flatData = flattenObj(obj)
      const fields = [...fieldSet[level]]

      fields.forEach((tag) => {
        if (flatData[tag] !== undefined) {
          extracted[tag] = flatData[tag]
        }
      })

      return extracted
    })
    setextractedData(returnedData)
    setFilteredData(returnedData)
  }, [data, level])

  useEffect(() => {
    setExtractedDataNew(() => {
      const data = extractedData.slice(page, page + rowsPerPage)
      return data
    })
  }, [extractedData, page, rowsPerPage])

  // Apply cached search filter when data is loaded
  useEffect(() => {
    if (extractedData.length > 0 && searchValue) {
      const filteredDataArray = extractedData.filter((obj) =>
        Object.values(obj).some(
          (val) => val && val.toString().match(new RegExp(searchValue, 'i'))
        )
      )
      setFilteredData(filteredDataArray)
    }
  }, [extractedData, searchValue])

  const changeDateFormatinDOB = (date) => {
    const tempDate = moment(date).format('YYYY-MM-DD hh:mm A')
    return tempDate
  }

  const studyDateSortDOB = (rowA, rowB) => {
    const a = changeDateFormatinDOB(rowA['PatientBirthDate'])
    const b = changeDateFormatinDOB(rowB['PatientBirthDate'])
    if (a > b) {
      return 1
    }
    if (b > a) {
      return -1
    }
    return 0
  }

  const studyDateSortDOBinStudy = (rowA, rowB) => {
    const a = changeDateFormatinDOB(rowA['PatientBirthDate'])
    const b = changeDateFormatinDOB(rowB['PatientBirthDate'])
    if (a > b) {
      return 1
    }
    if (b > a) {
      return -1
    }
    return 0
  }

  const genderSort = (rowA, rowB) => {
    const a = rowA['PatientSex'] ? rowA['PatientSex'] : 'Z'
    const b = rowB['PatientSex'] ? rowB['PatientSex'] : 'Z'
    if (a > b) {
      return 1
    }
    if (b > a) {
      return -1
    }
    return 0
  }

  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    const filteredDataArray = extractedData.filter((obj) =>
      Object.values(obj).some(
        (val) => val && val.toString().match(new RegExp(value, 'i'))
      )
    )
    setFilteredData(filteredDataArray)
    setSearchValue(value)
    sessionStorage.setItem(`${level}_searchValue`, value)
    setPage(0)
  }

  const columns = {
    patients: [
      {
        name: 'Patient ID',
        cell: (row) => (row['PatientID'] ? row['PatientID'] : '-'),
        sortable: false,
        reorder: true,
        id: 'PatientID',
        minWidth: '150px',
      },
      {
        name: 'Patient Name',
        cell: (row) => (row['PatientName'] ? row['PatientName'] : '-'),
        sortable: false,
        reorder: true,
        id: 'PatientName',
        minWidth: '150px',
      },
      {
        name: 'Patient Birth Date',
        selector: (row) =>
          row['PatientBirthDate'] ? row['PatientBirthDate'] : '-',
        sortable: false,
        reorder: true,
        id: 'PatientBirthDate',
        minWidth: '205px',
        sortFunction: studyDateSortDOB,
        cell: (row) => {
          return row['PatientBirthDate']
            ? moment(row['PatientBirthDate']).format(
                userData?.dateFormats?.dateFormat
              )
            : '-'
        },
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
        sortable: false,
        reorder: true,
        id: 'PatientSex',
        minWidth: '150px',
        maxWidth: '150px',
        sortFunction: genderSort,
      },
    ],
    studies: [
      {
        name: 'Patient Name',
        cell: (row) => (row['PatientName'] ? row['PatientName'] : '-'),
        sortable: false,
        reorder: true,
        id: 'PatientName',
        minWidth: '100px',
      },
      {
        name: 'Study Description',
        cell: (row) =>
          row['StudyDescription'] ? row['StudyDescription'] : '-',
        sortable: false,
        reorder: true,
        id: 'StudyDescription',
        minWidth: '200px',
      },
      {
        name: 'Patient Birth Date',
        selector: (row) =>
          row['PatientBirthDate'] ? row['PatientBirthDate'] : '-',
        sortable: false,
        reorder: true,
        id: 'PatientBirthDate',
        minWidth: '190px',
        sortFunction: studyDateSortDOBinStudy,
        cell: (row) => {
          return row['PatientBirthDate']
            ? moment(row['PatientBirthDate']).format(
                userData?.dateFormats?.dateFormat
              )
            : '-'
        },
      },
      {
        name: 'Patient ID',
        cell: (row) => (row['PatientID'] ? row['PatientID'] : '-'),
        sortable: false,
        reorder: true,
        id: 'PatientID',
        minWidth: '100px',
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
        sortable: false,
        reorder: true,
        id: 'PatientSex',
        minWidth: '30px',
        maxWidth: '70px',
        sortFunction: genderSort,
      },
      {
        name: 'Accession Number',
        cell: (row) => (row['AccessionNumber'] ? row['AccessionNumber'] : '-'),
        sortable: false,
        reorder: true,
        id: 'AccessionNumber',
        minWidth: '190px',
      },
      {
        name: 'Institution Name',
        cell: (row) => (row['InstitutionName'] ? row['InstitutionName'] : '-'),
        sortable: false,
        reorder: true,
        id: 'InstitutionName',
        minWidth: '175px',
      },
      {
        name: 'Referring Physician Name',
        cell: (row) =>
          row['ReferringPhysicianName'] ? row['ReferringPhysicianName'] : '-',
        sortable: false,
        reorder: true,
        id: 'ReferringPhysicianName',
        minWidth: '240px',
      },
      {
        name: 'Study Date',
        selector: (row) => (row['StudyDate'] ? row['StudyDate'] : '-'),
        sortable: false,
        reorder: true,

        id: 'StudyDate',
        minWidth: '100px',
        cell: (row) => {
          return row['StudyDate']
            ? moment(row['StudyDate']).format(userData?.dateFormats?.dateFormat)
            : '-'
        },
      },
      {
        name: 'Study ID',
        cell: (row) => (row['StudyID'] ? row['StudyID'] : '-'),
        sortable: false,
        reorder: true,
        id: 'StudyID',
        minWidth: '130px',
      },
      {
        name: 'Study Instance UID',
        cell: (row) =>
          row['StudyInstanceUID'] ? row['StudyInstanceUID'] : '-',
        sortable: false,
        reorder: true,
        id: 'StudyInstanceUID',
        minWidth: '150px',
      },
    ],
  }

  if (refreshLoading) {
    return (
      <Card className="loading-initial">
        <Spinner color="primary" />
      </Card>
    )
  }

  return (
    <>
      <Row>
        <Col sm="12">
          <Card>
            <CardHeader className="flex-md-row flex-column align-md-items-center align-items-center border-bottom">
              <CardTitle tag="h4">
                {level === 'studies'
                  ? 'All Studies'
                  : level === 'patients'
                    ? 'All Patients'
                    : level}
              </CardTitle>
            </CardHeader>
            <Row className="justify-content-end mx-0">
              <Col
                className="d-flex align-items-center justify-content-end mt-1"
                md="6"
                sm="12"
              >
                <Label className="mr-1" for="search-input">
                  Search
                </Label>
                <Input
                  className="dataTable-filter mb-50"
                  type="text"
                  bsSize="sm"
                  id="search-input"
                  value={searchValue}
                  onChange={(e) => {
                    onGlobalFilterChange(e)
                  }}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <ListTable
                  {...{
                    moduleName: `all-${level}`,
                    tableData: extractedDataNew,
                    visibleColumns: columns[level],
                    rows: rowsPerPage,
                    totalRecords: filteredData.length,
                    first: page,
                    onSort: handleSort,
                    sortField,
                    sortOrder,
                    onPage: (e) => {
                      setPage(e.first)
                      setRowsPerPage(e.rows)
                      localStorage.setItem('allstudiesrow', e.rows)
                    },
                  }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default AllDetails
