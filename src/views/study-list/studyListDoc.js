// ** React Imports
import {
  useState,
  Fragment,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
  useContext,
} from 'react'
// ** Third Party Components
import Flatpickr from 'react-flatpickr'
import { ChevronDown, Eye, Download, Search } from 'react-feather'
import Select from 'react-select'
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Button,
  Input,
  Label,
  FormGroup,
  Row,
  Col,
  UncontrolledTooltip,
} from 'reactstrap'
import ListTable from '../../@core/components/list-table'
import {
  isUserLoggedIn,
  selectThemeColors,
  checkForOtherOperationDm,
} from '@utils'
import moment from 'moment'
import crossicon from '../../assets/images/icons/close.png'
import ReactDOM from 'react-dom'
import Accordion from '@mui/material/Accordion'
import STUDYSTATUS from '@configs/studyStatus'
import { showLoadingAlert, hideLoadingAlert } from '../../utils/alerts'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import { styled } from '@mui/material/styles'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ROLES from '@configs/roles'

// ** Styles
import '@styles/react/libs/flatpickr/flatpickr.scss'
import axios from 'axios'
import reportEdit from '../../assets/images/icons/reportEdit.png'
import CustomFilterDropdown from './customFilterDropdown'
import { useSelector } from 'react-redux'
import FilterModal from '../../@core/components/filter-modal'
import { AbilityContext } from '../../utility/context/Can'
import NewDynamicDropdown from './NewDynamicDropdown'

const DataTableAdvSearch = ({
  studylist,
  previewReportHandler,
  handlePrintReport,
  studyDownloadHandler,
}) => {
  // ** States
  const statusColors = JSON.parse(localStorage.getItem('userData'))?.statusColor
  const [statusColor, setStatusColor] = useState(null)
  const [Picker, setPicker] = useState('')
  const [PatientDOBPicker, setPatientDOBPickerPicker] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [data, setTableData] = useState([])
  const [dataUpdate, setDataUpdate] = useState(false)
  const [modalities, setModalities] = useState([])
  const [refresh, setRefresh] = useState(true)
  const [sortField, setSortField] = useState(null)
  const [sortOrder, setSortOrder] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [selectedModalities, setSelectedModalities] = useState(null)
  const [rowsPerPage, setRowsPerPage] = useState(
    localStorage.getItem('studylistrow')
      ? JSON.parse(localStorage.getItem('studylistrow'))
      : 7
  )
  const [crossPatient, setcrossPatient] = useState(false)
  const [crossPatientID, setcrossPatientID] = useState(false)
  const [crossAccession, setcrossAccession] = useState(false)
  const [crossStudyDate, setcrossStudyDate] = useState(false)
  const [crossPatientDOBDate, setcrossPatientDOBDate] = useState(false)
  const [crossModality, setcrossModality] = useState(false)
  const [crossDescription, setcrossDescription] = useState(false)
  const [Flatpicker, showFlatpicker] = useState(true)
  const [isSelectingStudyDateRange, setIsSelectingStudyDateRange] =
    useState(false)
  const [isSelectingPatientDOBRange, setIsSelectingPatientDOBRange] =
    useState(true)
  const [totalFilteredStudies, setFilteredStudies] = useState(null)
  const [openStudyUpdated, setOpenStudyUpdated] = useState(false)
  const [openNotesUpdated, setOpenNotesUpdated] = useState(false)
  const [refreshLoading, setRefreshLoading] = useState(false)
  const [isFilter, setFilter] = useState(false)

  const [crossPhysician, setcrossPhysician] = useState(false)
  const [crossClinic, setcrossClinic] = useState(false)
  const [crossStatus, setcrossStatus] = useState(false)
  const [selectedClinics, setSelectedClinics] = useState(null)
  const [selectedPhysicians, setSelectedPhysicians] = useState(null)
  const [selectedStatus, setSelectedstatus] = useState(null)

  const [addNewFilter, setAddNewFilter] = useState(false)
  const [searchData, setSearchData] = useState({
    PatientName: '',
    PatientID: '',
    StudyDate: '',
    AccessionNumber: '',
    Modality: '',
    StudyDescription: '',
    patientDOB: '',
    patientSex: '',
  })
  const userData = JSON.parse(isUserLoggedIn())
  const [userRole, setUserRole] = useState()
  const fp = useRef()
  let countDate = 0
  const controller = new AbortController()
  const patientDOBfp = useRef()
  const patientDOBPreventClose = useRef(false)
  const studyDatePreventClose = useRef(false)
  const studyDateTempSelection = useRef(null) // Store first date temporarily to avoid re-render
  const [totalStudies, setTotalStudies] = useState(0)
  const table_data = useRef(null)
  const btnStyle = {
    height: '38px',
    width: '100%',
  }
  const [selectedDropDownFilter, setSelectedDropDownFilter] = useState([])
  const dropdownData = useSelector((state) => state.dropdownDataReducer)
  const modalityOptionsForFilters =
    useSelector((state) => state.ModalityReducer) || []
  const ClinicNamesForFilters = useSelector(
    (state) => state.dropdownDataReducer.clinicNames
  )
  const PhysiciansForFilters = useSelector(
    (state) => state.dropdownDataReducer.Physicians
  )
  const userDataRedux = useSelector((state) => state.auth.userData)
  const ability = useContext(AbilityContext)

  const flatPickerDateFormat =
    userData?.dateFormats?.dateFormat === 'MM/DD/YYYY'
      ? 'm/d/Y'
      : userData?.dateFormats?.dateFormat === 'DD/MM/YYYY'
        ? 'd/m/Y'
        : userData?.dateFormats?.dateFormat === 'YYYY/MM/DD'
          ? 'Y/m/d'
          : 'm/d/Y'

  const ChangeState = () => {
    if (!Flatpicker) {
      fp.current.flatpickr.open()
    }
  }

  useEffect(() => {
    ChangeState()
  }, [Flatpicker])

  // Effect to auto-open Study Date calendar when entering custom range mode
  useEffect(() => {
    if (!Flatpicker && isSelectingStudyDateRange && fp.current?.flatpickr) {
      // Calendar should open automatically when switching to custom range mode
      studyDatePreventClose.current = true
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          try {
            const fpInstance = fp.current?.flatpickr
            if (fpInstance && !fpInstance.isOpen) {
              fpInstance.open()
            }
          } catch (error) {
            console.warn('Error opening calendar:', error)
          }
        })
      })
      // Also try with setTimeout as fallback
      setTimeout(() => {
        try {
          const fpInstance = fp.current?.flatpickr
          if (fpInstance && !fpInstance.isOpen && isSelectingStudyDateRange) {
            fpInstance.open()
          }
        } catch (error) {
          console.warn('Error opening calendar:', error)
        }
      }, 0)
      setTimeout(() => {
        try {
          const fpInstance = fp.current?.flatpickr
          if (fpInstance && !fpInstance.isOpen && isSelectingStudyDateRange) {
            fpInstance.open()
          }
        } catch (error) {
          console.warn('Error opening calendar:', error)
        }
      }, 10)
      setTimeout(() => {
        try {
          const fpInstance = fp.current?.flatpickr
          if (fpInstance && !fpInstance.isOpen && isSelectingStudyDateRange) {
            fpInstance.open()
          }
        } catch (error) {
          console.warn('Error opening calendar:', error)
        }
      }, 50)
      setTimeout(() => {
        try {
          const fpInstance = fp.current?.flatpickr
          if (fpInstance && !fpInstance.isOpen && isSelectingStudyDateRange) {
            fpInstance.open()
          }
        } catch (error) {
          console.warn('Error opening calendar:', error)
        }
      }, 100)
      setTimeout(() => {
        try {
          const fpInstance = fp.current?.flatpickr
          if (fpInstance && !fpInstance.isOpen && isSelectingStudyDateRange) {
            fpInstance.open()
          }
        } catch (error) {
          console.warn('Error opening calendar:', error)
        }
      }, 150)
      setTimeout(() => {
        try {
          const fpInstance = fp.current?.flatpickr
          if (fpInstance && !fpInstance.isOpen && isSelectingStudyDateRange) {
            fpInstance.open()
          }
        } catch (error) {
          console.warn('Error opening calendar:', error)
        }
      }, 200)
      setTimeout(() => {
        try {
          const fpInstance = fp.current?.flatpickr
          if (fpInstance && !fpInstance.isOpen && isSelectingStudyDateRange) {
            fpInstance.open()
          }
        } catch (error) {
          console.warn('Error opening calendar:', error)
        }
      }, 250)
    }
  }, [Flatpicker, isSelectingStudyDateRange])

  // Effect to keep calendar open when only one date is selected (Patient DOB)
  useEffect(() => {
    if (patientDOBPreventClose.current && patientDOBfp.current?.flatpickr) {
      const fpInstance = patientDOBfp.current.flatpickr
      if (fpInstance && !fpInstance.isOpen && patientDOBPreventClose.current) {
        try {
          fpInstance.open()
        } catch (error) {
          // Ignore errors
        }
      }
    }
  }, [PatientDOBPicker])

  useEffect(() => {
    const fetchModalities = async () => {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/orthanc/modalities`,
        {}
      )
      const data = res?.data
      let list = []
      if (Array.isArray(data)) list = data
      else if (data && typeof data === 'object') {
        const names = new Set()
        Object.keys(data).forEach((key) => {
          const config = data[key]
          const aet = config && (config.AET ?? config.AeTitle ?? config.aeTitle)
          if (aet && typeof aet === 'string') names.add(String(aet).trim())
          else names.add(String(key).trim())
        })
        list = Array.from(names).sort()
      }
      setModalities(list)
    }
    fetchModalities()
  }, [])

  async function handleSort(d) {
    if (d.sortField) {
      setSortOrder(d.sortOrder)
      setSortField(d.sortField)
      const filerData = JSON.stringify(
        Object.keys(searchData)
          .map((key) => {
            if (
              searchData[key] === '' ||
              searchData[key] === null ||
              searchData[key] === undefined
            ) {
              return {}
            }
            if (key === 'Physicians') {
              return { [key]: searchData[key].map((data) => data.username) }
            }
            if (key === 'clinicNames') {
              return { [key]: searchData[key].map((data) => data.clinicName) }
            }
            return { [key]: searchData[key] }
          })
          .reduce((acc, curr) => {
            if (Object.keys(curr).length) {
              const key = Object.keys(curr)[0]
              acc[key] = curr[key]
            }
            return acc
          }, {})
      )
      setCurrentPage(0)

      const params = {
        limit: rowsPerPage,
        since: currentPage,
        filters: filerData,
        sort: `${d.sortField},${d.sortOrder}`,
      }

      if (userData && userData.role === ROLES.ReferringDoctor) {
        params['email'] = userData.email
      }

      const studylist = await axios.get(
        `${process.env.REACT_APP_API_URL}/orthanc/study-list`,
        {
          params,
          signal: controller.signal,
        }
      )

      setTableData(() => studylist.data.data)

      setTotalStudies(() => studylist.data.total)

      setFilteredStudies(studylist.data.totalFiltered)
    }
  }

  const handleClick = (e) => {
    if (e.data?.StudyInstanceUID) {
      const viewer_url = `${process.env.REACT_APP_VIEWER_URL}/viewer?StudyInstanceUIDs=${e.data.StudyInstanceUID}&accessToken=${localStorage.getItem('accessToken')?.replace(/"/g, '')}&dateFormat=${userData?.dateFormats?.dateFormat || 'MM/DD/YYYY'}&id=${e.data._id}&mode=${e.data.status === STUDYSTATUS.Unread ? 'create' : 'preview'}`
      window.open(
        viewer_url,
        JSON.parse(localStorage.getItem('userData'))?.viewerPreference
      )
    }
  }

  const studyDownloadHanlderNew = async (studyId) => {
    showLoadingAlert('<p>Downloading...</p>') // Show loading indicator

    try {
      // Build the download URL
      const downloadUrl = `${process.env.REACT_APP_API_URL}/orthanc/study/${studyId}/download`

      // Open the download URL in a new window/tab
      window.open(downloadUrl, '_blank')

      hideLoadingAlert() // Close loading indicator
    } catch (error) {
      hideLoadingAlert() // Close loading indicator on error
      console.error('Error initiating download:', error)
      // Show an error message to the user here if needed
    }
  }

  const studyDownloadHanlder = async (studyId) => {
    MySwal.showLoading() // Show loading indicator

    try {
      // Make the request to download the study archive
      const response = await axios({
        method: 'get',
        url: `${process.env.REACT_APP_API_URL}/orthanc/study/${studyId}/download`,
        headers: {
          Accept: 'application/zip',
        },
        responseType: 'blob', // Expecting a Blob response
      })

      hideLoadingAlert() // Close loading indicator

      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'application/zip' })
      const fileName = `study.zip` // Set the file name based on the study ID

      // Create a download link and trigger the download
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', fileName)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click() // Trigger the download
      document.body.removeChild(link) // Clean up
      URL.revokeObjectURL(url) // Free up memory
    } catch (error) {
      hideLoadingAlert() // Close loading indicator on error
      console.error('Error downloading study:', error)
      // Show an error message to the user here if needed
    }
  }

  // ** Function to handle date filter
  const handleDateFilter = (range, isSelect) => {
    console.log(
      '🔍 handleDateFilter called with range:',
      range,
      'isSelect:',
      isSelect
    )
    setCurrentPage(0)
    countDate++

    if (!range || (Array.isArray(range) && range.length === 0)) {
      console.log('⚠️ Empty range, clearing StudyDate')
      setPicker('')
      setSearchData((prev) => {
        return { ...prev, StudyDate: '' }
      })
      setcrossStudyDate(false)
      setIsSelectingStudyDateRange(false)
      return
    }

    // Handle both single date and date range
    const dates = Array.isArray(range) ? range : [range]
    const format = dates.map((date) => {
      return moment(date).format('YYYYMMDD')
    })

    if (format.length >= 2) {
      // Date range - both dates selected
      const studyDateValue = `${format[0]}-${format[1]}`
      console.log('✅ Setting StudyDate range:', studyDateValue)
      setPicker(range) // Update picker only after both dates selected
      setSearchData((prev) => {
        return { ...prev, StudyDate: studyDateValue }
      })
      if (!crossStudyDate) {
        setcrossStudyDate(true)
      }
      setIsSelectingStudyDateRange(false)
    } else if (format.length === 1) {
      // Single date - if we're in range mode, keep calendar open
      if (isSelectingStudyDateRange && !isSelect) {
        // First date selected in range mode, keep calendar open
        setIsSelectingStudyDateRange(true)
        // Don't update search data yet, wait for second date
        return
      } else {
        // Single date selection (not range mode)
        const studyDateValue = `${format[0]}-${format[0]}`
        console.log('✅ Setting StudyDate single date:', studyDateValue)
        setPicker(range)
        setSearchData((prev) => {
          return { ...prev, StudyDate: studyDateValue }
        })
        if (!crossStudyDate) {
          setcrossStudyDate(true)
        }
        setIsSelectingStudyDateRange(false)
      }
    }
  }

  const handlePatientDOBDateFilter = (range, isSelect) => {
    console.log(
      '🔍 handlePatientDOBDateFilter called with range:',
      range,
      'isSelect:',
      isSelect
    )

    if (!range || (Array.isArray(range) && range.length === 0)) {
      console.log('⚠️ Empty range, clearing PatientBirthDate')
      setPatientDOBPickerPicker('')
      setSearchData((prev) => {
        return { ...prev, PatientBirthDate: '' }
      })
      setcrossPatientDOBDate(false)
      setIsSelectingPatientDOBRange(true)
      return
    }

    // Handle both single date and date range
    const dates = Array.isArray(range) ? range : [range]
    const format = dates.map((date) => {
      return moment(date).format('YYYYMMDD')
    })

    if (format.length >= 2) {
      // Date range - both dates selected
      const patientBirthDateValue = `${format[0]}-${format[1]}`
      console.log('✅ Setting PatientBirthDate range:', patientBirthDateValue)
      setPatientDOBPickerPicker(range) // Update picker only after both dates selected
      setSearchData((prev) => {
        return { ...prev, PatientBirthDate: patientBirthDateValue }
      })
      if (!crossPatientDOBDate) {
        setcrossPatientDOBDate(true)
      }
      setIsSelectingPatientDOBRange(true) // Keep true for next selection
    } else if (format.length === 1) {
      // Single date - if we're in range mode, keep calendar open and don't update picker yet
      if (isSelectingPatientDOBRange && !isSelect) {
        // First date selected in range mode, keep calendar open
        // Don't update PatientDOBPicker state yet to avoid re-render that might close calendar
        setIsSelectingPatientDOBRange(true)
        // Don't update search data yet, wait for second date
        return
      } else {
        // Single date selection (not range mode)
        const patientBirthDateValue = `${format[0]}-${format[0]}`
        console.log(
          '✅ Setting PatientBirthDate single date:',
          patientBirthDateValue
        )
        setPatientDOBPickerPicker(range)
        setSearchData((prev) => {
          return { ...prev, PatientBirthDate: patientBirthDateValue }
        })
        if (!crossPatientDOBDate) {
          setcrossPatientDOBDate(true)
        }
        setIsSelectingPatientDOBRange(true) // Keep true for next selection
      }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (userData) {
          setUserRole(() => userData.role)
        }

        if (
          !crossPatient &&
          !crossPatientID &&
          !crossAccession &&
          !crossModality &&
          !crossDescription
        ) {
          setRefreshLoading(true)
        }
        const filerData = JSON.stringify(
          Object.keys(searchData)
            .map((key) => {
              if (
                searchData[key] === '' ||
                searchData[key] === null ||
                searchData[key] === undefined
              ) {
                return {}
              }
              if (key === 'Physicians') {
                return { [key]: searchData[key].map((data) => data.username) }
              }
              if (key === 'clinicNames') {
                return { [key]: searchData[key].map((data) => data.clinicName) }
              }
              return { [key]: searchData[key] }
            })
            .reduce((acc, curr) => {
              if (Object.keys(curr).length) {
                const key = Object.keys(curr)[0]
                acc[key] = curr[key]
              }
              return acc
            }, {})
        )
        console.log('filterData', filerData)

        const params = {
          limit: rowsPerPage,
          since: currentPage,
          filters: filerData,
        }

        if (userData && userData.role === ROLES.ReferringDoctor) {
          params['email'] = userData.email
        }
        const studylist = await axios.get(
          `${process.env.REACT_APP_API_URL}/orthanc/study-list`,
          {
            params,
          }
        )

        setTableData(() => studylist.data.data)

        setTotalStudies(() => studylist.data.total)

        setFilteredStudies(studylist.data.totalFiltered)
        setRefreshLoading(false)
      } catch (error) {
        setRefreshLoading(false)
      }
    }
    fetchData()
  }, [
    refresh,
    rowsPerPage,
    currentPage,
    isFilter,
    dataUpdate,
    openStudyUpdated,
    openNotesUpdated,
  ])

  const checkSelectedOption = (value) => {
    setCurrentPage(0)
    if (value.value === 'customdate') {
      showFlatpicker(() => false)
      setIsSelectingStudyDateRange(true)
      studyDatePreventClose.current = true
    } else if (value.value.length) {
      handleDateFilter(value.value, true)
    } else {
      handleDateFilter([value.value, value.value], true)
    }
    setSelectedOption(value)
  }

  const onDataScroll = (e) => {
    if (document.getElementById('blank_div')) {
      document.getElementById('blank_div').scrollLeft = e.target.scrollLeft
    }
  }

  const getTable = (e) => {
    return table_data?.current?.children[0]?.children[0]?.children[0]
  }
  const onBlankScroll = async (e) => {
    const table = await getTable()
    table.scrollLeft = e.target.scrollLeft
  }

  const onBlankWidth = (e) => {
    setTimeout(async () => {
      const table = await getTable()
      if (table) {
        blank_div.current.style.width = `${table.scrollWidth}px`
        blank_div.current.scrollLeft = 100
        ReactDOM.findDOMNode(table).addEventListener('scroll', onDataScroll)
      }
    }, 50)
  }

  useEffect(() => {
    onBlankWidth()
  }, [data])

  const onResize = useCallback((target) => {
    onBlankWidth()
  }, [])

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/user/status/color`)
      .then((res) => {
        setStatusColor(res.data.message)
      })
      .catch((err) => {
        console.log(err.response.data.message, 'error')
      })
  }, [])

  const rowClassFn = (data) => {
    const status =
      data.status === STUDYSTATUS.Unread ||
      data.status === STUDYSTATUS.Ready ||
      data.status === STUDYSTATUS.Preliminary
    const priority = data.priority === 'Stat'
    const bg_stat = priority && status
    const ret = {
      'bg-row-stat': bg_stat,
    }
    return ret
  }

  function useResizeObserver(callback) {
    const ref = useRef(null)
    useLayoutEffect(() => {
      let element
      if (table_data.current) {
        element = table_data.current.children[0].children[0].children[0]
      }
      if (!element) {
        return
      }

      const observer = new ResizeObserver((entries) => {
        callback(element, entries[0])
      })

      observer.observe(element)
      return () => {
        observer.disconnect()
      }
    })
    return ref
  }

  const checkSelectedModalities = (value) => {
    setCurrentPage(0)

    console.log('first', value)
    if (value.length === 0) {
      setSearchData((prev) => {
        return { ...prev, Modality: null }
      })
      setSelectedModalities(null)
      if (selectedDropDownFilter?.modality?.length !== 0) {
        setSelectedDropDownFilter(null)
      }
    } else {
      const modalityArray = value.map((modalityList) => modalityList.value)
      setSearchData((prev) => {
        return { ...prev, Modality: modalityArray }
      })
      setSelectedModalities(value)
      if (selectedDropDownFilter?.modality?.length !== modalityArray?.length) {
        setSelectedDropDownFilter(null)
      }
    }
    if (value.length) {
      setcrossModality(true)
    } else {
      setcrossModality(false)
    }
    // Refresh worklist when modality selection changes (no need to click Search)
    setFilter((prev) => !prev)
  }
  const checkSelectedStatus = (value) => {
    setCurrentPage(0)
    if (value.length === 0) {
      setSearchData((prev) => {
        return { ...prev, status: null }
      })
      setSelectedstatus(null)
      if (selectedDropDownFilter?.studyStatus?.length !== 0) {
        setSelectedDropDownFilter(null)
      }
    } else {
      const studyStatusArray = value.map((statusList) => statusList.value)
      setSearchData((prev) => {
        return { ...prev, status: studyStatusArray }
      })
      setSelectedstatus(value)
      if (
        selectedDropDownFilter?.studyStatus?.length !== studyStatusArray?.length
      ) {
        setSelectedDropDownFilter(null)
      }
    }
    if (value.length) {
      setcrossStatus(true)
    } else {
      setcrossStatus(false)
    }
    setFilter((prev) => !prev)
  }

  const checkSelectedClinics = (value) => {
    setCurrentPage(0)
    if (value.length === 0) {
      setSearchData((prev) => {
        return { ...prev, clinicNames: null }
      })
      setSelectedClinics([])
      if (selectedDropDownFilter?.clinicNames?.length !== 0) {
        setSelectedDropDownFilter(null)
      }
    } else {
      setSearchData((prev) => {
        return { ...prev, clinicNames: value }
      })
      setSelectedClinics(value)
      if (selectedDropDownFilter?.clinicNames?.length !== value?.length) {
        setSelectedDropDownFilter(null)
      }
    }
    if (value.length) {
      setcrossClinic(true)
    } else {
      setcrossClinic(false)
    }
    setFilter((prev) => !prev)
  }
  const checkSelectedPhysicians = (value) => {
    setCurrentPage(0)
    console.log('first', value.length)
    if (value.length === 0) {
      setSearchData((prev) => {
        return { ...prev, Physicians: null }
      })
      setSelectedPhysicians([])
      if (selectedDropDownFilter?.Physicians?.length !== 0) {
        setSelectedDropDownFilter(null)
      }
    } else {
      setSearchData((prev) => {
        return { ...prev, Physicians: value }
      })
      setSelectedPhysicians(value)
      if (selectedDropDownFilter?.Physicians?.length !== value?.length) {
        setSelectedDropDownFilter(null)
      }
    }
    if (value.length) {
      setcrossPhysician(true)
    } else {
      setcrossPhysician(false)
    }
    setFilter((prev) => !prev)
  }

  const updateFilterData = (value) => {
    const obj = {}
    if (
      value?.Physicians?.length === 0 ||
      typeof value === 'undefined' ||
      value === 'undefined'
    ) {
      obj.Physicians = null
      setSelectedPhysicians(null)
      setcrossPhysician(false)
    } else if (value?.Physicians?.length > 0) {
      obj.Physicians = value.Physicians
      setcrossPhysician(true)
      setSelectedPhysicians(value.Physicians)
    }
    if (
      value?.clinicNames?.length === 0 ||
      typeof value === 'undefined' ||
      value === 'undefined'
    ) {
      obj.clinicNames = null
      setSelectedClinics(null)
      setcrossClinic(false)
      setSelectedClinics(null)
    } else if (value?.clinicNames?.length > 0) {
      obj.clinicNames = value.clinicNames
      setcrossClinic(true)
      setSelectedClinics(value.clinicNames)
    }
    setSearchData((prev) => {
      return { ...prev, ...obj }
    })
  }
  useEffect(() => {
    if (selectedDropDownFilter && selectedDropDownFilter.modality) {
      checkSelectedModalities(Object.values(selectedDropDownFilter.modality))
    }
    if (selectedDropDownFilter && selectedDropDownFilter.studyStatus) {
      checkSelectedStatus(Object.values(selectedDropDownFilter.studyStatus))
    }
    updateFilterData(selectedDropDownFilter)
  }, [selectedDropDownFilter])

  const StudyDateOptions = [
    { value: [moment('01/01/1900')._d, moment()._d], label: 'All' },
    { value: moment()._d, label: 'Today' },
    { value: moment().add(-1, 'days')._d, label: 'Yesterday' },
    { value: [moment().add(-6, 'days')._d, moment()._d], label: 'Last 7 days' },
    { value: [moment().day(0)._d, moment()._d], label: 'Current Week' },
    {
      value: [moment().add(-29, 'days')._d, moment()._d],
      label: 'Last 30 days',
    },
    { value: 'customdate', label: 'Custom date range' },
  ]

  // Modality options: dynamic from Orthanc via Redux (ModalityReducer), populated in App.js

  // ** Table Columns
  const columns = [
    {
      name: 'Patient Name',
      id: 'PatientName',
      cell: (row) => (row['PatientName'] ? row['PatientName'] : '-'),
      sortable: true,
      minWidth: '200px',
    },
    {
      name: 'Patient ID',
      id: 'PatientID',
      cell: (row) => (row['PatientID'] ? row['PatientID'] : '-'),
      sortable: true,
      minWidth: '150px',
    },
    {
      name: 'Accession',
      id: 'AccessionNumber',
      cell: (row) => (row['AccessionNumber'] ? row['AccessionNumber'] : '-'),
      sortable: true,
      minWidth: '150px',
    },
    {
      name: 'Study Date',
      id: 'startTimeStamp',
      cell: (row) =>
        row['startTimeStamp']
          ? moment(row['startTimeStamp']).format(
              userData?.dateFormats?.dateTimeFormat || 'MM/DD/YYYY hh:mmA'
            )
          : '-',
      sortable: true,
      minWidth: '200px',
    },
    {
      name: 'Modality',
      id: 'Modality',
      cell: (row) => (row['Modality'] ? row['Modality'] : '-'),
      sortable: false,
      minWidth: '150px',
    },
    {
      name: 'Status',
      sortable: true,
      reorder: true,
      id: 'status',
      cell: (row) =>
        row['status'] === STUDYSTATUS.Unread ? (
          <div
            className="worklist-status"
            style={{
              background: statusColor?.completed || statusColors?.completed,
            }}
          >
            <span>{STUDYSTATUS.Unread}</span>
          </div>
        ) : row['status'] === STUDYSTATUS.Preliminary ? (
          <div
            className="worklist-status"
            style={{
              background: statusColor?.preliminary || statusColors?.preliminary,
            }}
          >
            <span>{STUDYSTATUS.Preliminary}</span>
          </div>
        ) : row['status'] === STUDYSTATUS.Ready ? (
          <div
            className="worklist-status"
            style={{ background: statusColor?.read || statusColors?.read }}
          >
            <span>{STUDYSTATUS.Ready}</span>
          </div>
        ) : row['status'] === STUDYSTATUS.Final ? (
          <div
            className="worklist-status"
            style={{ background: statusColor?.final || statusColors?.final }}
          >
            <span>{STUDYSTATUS.Final}</span>
          </div>
        ) : (
          '-'
        ),
      minWidth: '120px',
    },
    {
      name: 'Description',
      id: 'Description',
      cell: (row) => (row['Description'] ? row['Description'] : '-'),
      sortable: true,
      minWidth: '200px',
    },
    {
      name: '#Series',
      id: 'SeriesNumber',
      cell: (row) => (row['SeriesNumber'] ? row['SeriesNumber'] : '-'),
      sortable: false,
      minWidth: '100px',
    },
    {
      name: '#Images',
      id: 'ImagesNumber',
      cell: (row) => (row['ImagesNumber'] ? row['ImagesNumber'] : '-'),
      sortable: false,
      minWidth: '100px',
    },
    {
      name: 'Actions',
      id: 'Actions',
      allowOverflow: true,
      minWidth: '150px',
      cell: (row) => {
        return (
          <div className="d-flex align-items-center">
            <a
              href={`${process.env.REACT_APP_VIEWER_URL}/viewer?StudyInstanceUIDs=${row.StudyInstanceUID}&accessToken=${localStorage.getItem('accessToken')?.replace(/"/g, '')}&dateFormat=${userData?.dateFormats?.dateFormat || 'MM/DD/YYYY'}&id=${row._id}&mode=${row.status === STUDYSTATUS.Unread ? 'create' : 'preview'}`}
              style={{ color: 'inherit' }}
              target={
                JSON.parse(localStorage.getItem('userData'))?.viewerPreference
              }
            >
              <Eye
                size={15}
                id="view"
                className="ml-50"
                style={{ cursor: 'pointer' }}
              />
            </a>

            {userData && userData.role === ROLES.ReferringDoctor && (
              <>
                <Download
                  size={15}
                  id="download"
                  className="ml-50"
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    (studyDownloadHandler || studyDownloadHanlder)(row.ID)
                  }
                />
                <UncontrolledTooltip
                  className="tooltip-react-strap"
                  target="download"
                >
                  Click to download study
                </UncontrolledTooltip>
              </>
            )}

            {row?.isFinlizedByUploadReport !== true && (
              <>
                <img
                  src={reportEdit}
                  width="18"
                  id={`abc${row.ID}`}
                  height="18"
                  className="ml-50 reportEdit"
                  onClick={() => {
                    if (checkForOtherOperationDm(row, 1)) {
                      return false
                    }
                    previewReportHandler(row)
                  }}
                  style={{
                    cursor: 'pointer',
                  }}
                />
                <UncontrolledTooltip
                  target={`abc${row.ID}`}
                  className="tooltip-react-strap"
                >
                  View report
                </UncontrolledTooltip>
              </>
            )}

            {(row?.status === STUDYSTATUS.Final || row?.isPrintable) && (
              <>
                <FontAwesomeIcon
                  size="sm"
                  icon="fa fa-print"
                  id={`preview_pdf-${row.ID}`}
                  className="ml-50"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    if (checkForOtherOperationDm(row, 1)) {
                      return false
                    }
                    handlePrintReport(row.ID)
                  }}
                />

                <UncontrolledTooltip
                  target={`preview_pdf-${row.ID}`}
                  className="tooltip-react-strap"
                >
                  Print & Download Report
                </UncontrolledTooltip>
              </>
            )}
            <UncontrolledTooltip className="tooltip-react-strap" target="view">
              Click to view study
            </UncontrolledTooltip>
          </div>
        )
      },
    },
  ]

  const handleFilter = (e) => {
    setCurrentPage(0)
    setSearchData((prev) => {
      return {
        ...prev,
        [e.target.id]:
          e.target.id === 'Modality'
            ? e.target.value.toUpperCase()
            : e.target.value,
      }
    })
    if (e.target.value) {
      if (e.target.id === 'PatientName' && !crossPatient) {
        setcrossPatient(true)
      } else if (e.target.id === 'PatientID' && !crossPatientID) {
        setcrossPatientID(true)
      } else if (e.target.id === 'AccessionNumber' && !crossAccession) {
        setcrossAccession(true)
      } else if (e.target.id === 'Modality' && !crossModality) {
        setcrossModality(true)
      } else if (e.target.id === 'Clinics' && !crossClinic) {
        setcrossClinic(true)
      } else if (e.target.id === 'Physicians' && !crossPhysician) {
        setcrossPhysician(true)
      } else if (e.target.id === 'StudyDescription' && !crossDescription) {
        setcrossDescription(true)
      } else if (e.target.id === 'status' && !crossStatus) {
        setcrossStatus(true)
      }
    } else {
      if (e.target.id === 'PatientName' && crossPatient) {
        setcrossPatient(false)
      } else if (e.target.id === 'PatientID' && crossPatientID) {
        setcrossPatientID(false)
      } else if (e.target.id === 'AccessionNumber' && crossAccession) {
        setcrossAccession(false)
      } else if (e.target.id === 'Modality' && crossModality) {
        setcrossModality(false)
      } else if (e.target.id === 'Physicians' && crossPhysician) {
        setcrossPhysician(false)
      } else if (e.target.id === 'Clinics' && crossClinic) {
        setcrossClinic(false)
      } else if (e.target.id === 'StudyDescription' && crossDescription) {
        setcrossDescription(false)
      } else if (e.target.id === 'status' && crossStatus) {
        setcrossStatus(false)
      }
    }
  }

  const handleSeach = () => {
    setFilter(!isFilter)
  }
  const handleAddFilter = () => {
    setAddNewFilter(true)
  }

  const handleClearFilter = (e) => {
    setSearchData((prev) => {
      return { ...prev, [e]: '' }
    })
  }

  const clearSearch = () => {
    searchData.PatientID = ''
    setcrossPatientID(false)
    handleClearFilter('PatientID')
    searchData.PatientName = ''
    setcrossPatient(false)
    handleClearFilter('PatientName')
    searchData.AccessionNumber = ''
    setcrossAccession(false)
    handleClearFilter('AccessionNumber')
    setPicker('')
    setPatientDOBPickerPicker('')
    setcrossStudyDate(false)
    setcrossPatientDOBDate(false)
    handleClearFilter('StudyDate')
    handleClearFilter('PatientBirthDate')
    searchData.Modality = ''
    setSelectedModalities([])
    setSelectedClinics([])
    setSelectedPhysicians([])
    setcrossModality(false)
    setcrossClinic(false)
    setcrossPhysician(false)
    setcrossStatus(false)
    setSelectedstatus(null)
    handleClearFilter('Modality')
    searchData.StudyDescription = ''
    setcrossDescription(false)
    handleClearFilter('StudyDescription')
    showFlatpicker(() => true)
    setSelectedOption(null)
    setSearchData((prev) => {
      return { ...prev, Physicians: null, clinicNames: null, status: null }
    })
    setSelectedDropDownFilter(undefined)
    handleSeach()
  }

  const onKeyPressed = (e) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      setPicker('')
      setcrossStudyDate(false)
      handleClearFilter('StudyDate')
    }
  }

  const onPatientKeyPressed = (e) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      setPatientDOBPickerPicker('')
      setcrossPatientDOBDate(false)
      handleClearFilter('PatientBirthDate')
    }
  }

  const MuiAccordionSummary = styled((props) => (
    <AccordionSummary
      id="panel-header-1"
      aria-controls="panel-content-1"
      expandIcon={<ChevronDown />}
      {...props}
    />
  ))(({ theme }) => ({
    '& .Mui-expanded': {
      maxHeight: '50px !important',
    },
  }))
  const handleFilterClose = () => {
    setAddNewFilter(false)
  }
  return (
    <Fragment>
      <FilterModal open={addNewFilter} toggle={handleFilterClose} />

      <Card>
        <Accordion defaultExpanded={true}>
          <CardHeader className="border-bottom">
            <div className="d-flex align-items-center">
              <CardTitle tag="h4">Study List ({totalStudies})</CardTitle>
              <MuiAccordionSummary
                id="panel-header-1"
                aria-controls="panel-content-1"
                expandIcon={<ChevronDown />}
              ></MuiAccordionSummary>
              {ability.can('manage', 'filter-listings') && (
                <CustomFilterDropdown
                  addNewFilter={addNewFilter}
                  selectedDropDownFilter={selectedDropDownFilter}
                  setSelectedDropDownFilter={setSelectedDropDownFilter}
                />
              )}
            </div>
            <div className="d-flex mt-md-0 mt-1 study-button-container">
              {ability.can('manage', 'filter-listings') &&
                userData.role !== ROLES.ClinicUser && (
                  <Button
                    className="ml-2"
                    color="primary"
                    onClick={handleAddFilter}
                  >
                    <span className="align-middle">Add New Filter</span>
                  </Button>
                )}
              {crossPatient ||
              crossPatientID ||
              crossAccession ||
              crossStudyDate ||
              crossPatientDOBDate ||
              crossModality ||
              crossPhysician ||
              crossClinic ||
              crossStatus ||
              crossDescription ? (
                <Button className="ml-2" color="primary" onClick={clearSearch}>
                  <span className="align-middle">Clear filter(s)</span>
                </Button>
              ) : (
                ''
              )}
              <Button
                className="ml-2"
                color="primary"
                onClick={() => {
                  setRefresh((prev) => !prev)
                }}
              >
                <span className="align-middle ml-50">Refresh</span>
              </Button>
            </div>
          </CardHeader>
          <AccordionDetails>
            <CardBody>
              <Row form className="mt-1 mb-50 justify-content-between">
                <Col lg="3" md="6">
                  <FormGroup>
                    <Label for="PatientName">Patient Name:</Label>
                    <Input
                      id="PatientName"
                      placeholder=""
                      value={searchData.PatientName}
                      onChange={handleFilter}
                    />
                    {crossPatient ? (
                      <img
                        src={crossicon}
                        width="15"
                        height="15"
                        className="crossIcon"
                        style={{
                          position: 'absolute',
                          top: '35px',
                          right: '10px',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          searchData.PatientName = ''
                          setcrossPatient(false)
                          handleClearFilter('PatientName')
                        }}
                      />
                    ) : (
                      ''
                    )}
                  </FormGroup>
                </Col>
                <Col lg="3" md="6">
                  <FormGroup>
                    <Label for="PatientID">Patient ID:</Label>
                    <Input
                      type="PatientID"
                      id="PatientID"
                      placeholder=""
                      value={searchData.PatientID}
                      onChange={handleFilter}
                    />
                    {crossPatientID ? (
                      <img
                        src={crossicon}
                        width="15"
                        height="15"
                        className="crossIcon"
                        style={{
                          position: 'absolute',
                          top: '35px',
                          right: '10px',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          searchData.PatientID = ''
                          setcrossPatientID(false)
                          handleClearFilter('PatientID')
                        }}
                      />
                    ) : (
                      ''
                    )}
                  </FormGroup>
                </Col>
                <Col md="6" lg="3">
                  <FormGroup>
                    <Label for="AccessionNumber">Accession:</Label>
                    <Input
                      id="AccessionNumber"
                      placeholder=""
                      value={searchData.AccessionNumber}
                      onChange={handleFilter}
                    />
                    {crossAccession ? (
                      <img
                        src={crossicon}
                        width="15"
                        height="15"
                        className="crossIcon"
                        style={{
                          position: 'absolute',
                          top: '35px',
                          right: '10px',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          searchData.AccessionNumber = ''
                          setcrossAccession(false)
                          handleClearFilter('AccessionNumber')
                        }}
                      />
                    ) : (
                      ''
                    )}
                  </FormGroup>
                </Col>
                <Col lg="3" md="6">
                  <FormGroup>
                    <Label for="date">Study Date:</Label>
                    {Flatpicker ? (
                      <Select
                        value={selectedOption}
                        onChange={checkSelectedOption}
                        theme={selectThemeColors}
                        className="react-select"
                        classNamePrefix="select"
                        options={StudyDateOptions}
                      />
                    ) : (
                      <Flatpickr
                        className="form-control"
                        id="date"
                        ref={fp}
                        value={Picker}
                        options={{
                          mode: 'range',
                          dateFormat: flatPickerDateFormat,
                          clickOpens: true,
                          allowInput: false,
                          closeOnSelect: false, // Don't close after selecting first date in range mode
                          onReady: (selectedDates, dateStr, instance) => {
                            if (isSelectingStudyDateRange) {
                              // Automatically open the calendar when entering custom range mode
                              studyDatePreventClose.current = true
                              requestAnimationFrame(() => {
                                try {
                                  if (!instance.isOpen) {
                                    instance.open()
                                  }
                                } catch (error) {
                                  console.warn('Error opening calendar:', error)
                                }
                              })
                            } else {
                              studyDatePreventClose.current = false
                            }
                          },
                          onClose: (selectedDates, dateStr, instance) => {
                            // Only allow closing if both dates are selected or no dates selected
                            const selectedCount = selectedDates
                              ? selectedDates.length
                              : 0
                            const fpInstance = fp.current?.flatpickr

                            if (selectedCount === 0) {
                              // No dates selected - reset to dropdown
                              showFlatpicker(true)
                              setSelectedOption(null)
                              setPicker('')
                              setIsSelectingStudyDateRange(false)
                              studyDatePreventClose.current = false
                            } else if (selectedCount === 1) {
                              // Only one date selected - calendar closed (user clicked outside)
                              // Set end date = start date to ensure date range works properly
                              const startDate = selectedDates[0]
                              const dateRange = [startDate, startDate]

                              // Update the picker and search data with the date range
                              setPicker(dateRange)
                              handleDateFilter(dateRange, false)
                              setIsSelectingStudyDateRange(false)
                              studyDatePreventClose.current = false

                              // Ensure calendar stays closed
                              setTimeout(() => {
                                if (fpInstance && fpInstance.isOpen) {
                                  try {
                                    fpInstance.close()
                                  } catch (error) {
                                    console.warn(
                                      'Error closing calendar:',
                                      error
                                    )
                                  }
                                }
                              }, 50)
                            } else if (selectedCount === 2) {
                              // Both dates selected - allow closing naturally
                              setIsSelectingStudyDateRange(false)
                              studyDatePreventClose.current = false
                            }
                          },
                        }}
                        onChange={(selectedDates, dateStr, instance) => {
                          console.log(
                            '🔍 Flatpickr onChange - selectedDates:',
                            selectedDates,
                            'dateStr:',
                            dateStr
                          )
                          // Flatpickr passes selectedDates array, dateStr string, and instance
                          if (selectedDates && selectedDates.length > 0) {
                            if (selectedDates.length === 1) {
                              // First date selected - prevent closing and keep calendar open
                              studyDatePreventClose.current = true
                              studyDateTempSelection.current = selectedDates[0]
                              // Don't update state here to avoid re-render flicker
                              // Flatpickr handles visual selection internally
                              // We'll update state only when both dates are selected
                            } else if (selectedDates.length === 2) {
                              // Both dates selected - update state and allow closing
                              studyDatePreventClose.current = false
                              studyDateTempSelection.current = null
                              // Now update Picker state with both dates
                              setPicker(selectedDates)
                              handleDateFilter(selectedDates, false)
                              // Close the calendar automatically after a brief delay
                              setTimeout(() => {
                                const fpInstance = fp.current?.flatpickr
                                if (fpInstance && fpInstance.isOpen) {
                                  try {
                                    fpInstance.close()
                                  } catch (error) {
                                    console.warn(
                                      'Error closing calendar:',
                                      error
                                    )
                                  }
                                }
                              }, 50)
                            }
                          } else {
                            studyDatePreventClose.current = false
                            studyDateTempSelection.current = null
                            handleDateFilter([])
                          }
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
                          top: '35px',
                          right: `${Flatpicker ? '45px' : '10px'}`,
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setPicker('')
                          setcrossStudyDate(false)
                          setSelectedOption(null)
                          showFlatpicker(() => true)
                          handleClearFilter('StudyDate')
                        }}
                      />
                    ) : (
                      ''
                    )}
                  </FormGroup>
                </Col>
                <Col lg="3" md="6">
                  <FormGroup>
                    <Label for="date">Patient Birth date:</Label>
                    <Flatpickr
                      className="form-control"
                      id="patientDobDate"
                      ref={patientDOBfp}
                      value={PatientDOBPicker}
                      options={{
                        mode: 'range',
                        dateFormat: flatPickerDateFormat,
                        clickOpens: true,
                        allowInput: false,
                        closeOnSelect: false, // Don't close after selecting first date in range mode
                        maxDate: moment().toDate(), // Restrict future dates for birth date
                        onReady: (selectedDates, dateStr, instance) => {
                          // Set range mode as active
                          setIsSelectingPatientDOBRange(true)
                          patientDOBPreventClose.current = false
                        },
                        onClose: (selectedDates, dateStr, instance) => {
                          // Check if calendar closed with only one date selected (user clicked outside)
                          const selectedCount = selectedDates
                            ? selectedDates.length
                            : 0
                          const fpInstance = patientDOBfp.current?.flatpickr

                          if (selectedCount === 1) {
                            // Only one date selected - calendar closed (user clicked outside)
                            // Set end date = start date to ensure date range works properly
                            const startDate = selectedDates[0]
                            const dateRange = [startDate, startDate] // Set end date = start date

                            // Update the picker and search data with the date range
                            setPatientDOBPickerPicker(dateRange)
                            handlePatientDOBDateFilter(dateRange, false)
                            setIsSelectingPatientDOBRange(true)
                            patientDOBPreventClose.current = false

                            // Ensure calendar stays closed
                            setTimeout(() => {
                              if (fpInstance && fpInstance.isOpen) {
                                try {
                                  fpInstance.close()
                                } catch (error) {
                                  console.warn('Error closing calendar:', error)
                                }
                              }
                            }, 50)
                          } else if (selectedCount === 0) {
                            // No dates selected - reset
                            setPatientDOBPickerPicker('')
                            setIsSelectingPatientDOBRange(true)
                            patientDOBPreventClose.current = false
                          } else if (selectedCount === 2) {
                            // Both dates selected - allow closing naturally
                            setIsSelectingPatientDOBRange(true)
                            patientDOBPreventClose.current = false
                          }
                        },
                      }}
                      onChange={(selectedDates, dateStr, instance) => {
                        console.log(
                          '🔍 Flatpickr PatientDOB onChange - selectedDates:',
                          selectedDates,
                          'dateStr:',
                          dateStr
                        )
                        // Flatpickr passes selectedDates array, dateStr string, and instance
                        if (selectedDates && selectedDates.length > 0) {
                          if (selectedDates.length === 1) {
                            // First date selected - prevent closing and keep calendar open
                            patientDOBPreventClose.current = true
                            handlePatientDOBDateFilter(selectedDates, false)

                            // Immediately try to keep calendar open - use multiple strategies
                            const fpInstance = patientDOBfp.current?.flatpickr

                            if (fpInstance) {
                              // Strategy 1: Check immediately and reopen if needed
                              if (!fpInstance.isOpen) {
                                try {
                                  fpInstance.open()
                                } catch (error) {
                                  // Ignore errors
                                }
                              }

                              // Strategy 2: Use requestAnimationFrame
                              requestAnimationFrame(() => {
                                if (
                                  fpInstance &&
                                  !fpInstance.isOpen &&
                                  patientDOBPreventClose.current
                                ) {
                                  try {
                                    fpInstance.open()
                                  } catch (error) {
                                    // Ignore errors
                                  }
                                }
                              })

                              // Strategy 3: Use setTimeout (multiple attempts)
                              setTimeout(() => {
                                if (
                                  fpInstance &&
                                  !fpInstance.isOpen &&
                                  patientDOBPreventClose.current
                                ) {
                                  try {
                                    fpInstance.open()
                                  } catch (error) {
                                    // Ignore errors
                                  }
                                }
                              }, 0)

                              setTimeout(() => {
                                if (
                                  fpInstance &&
                                  !fpInstance.isOpen &&
                                  patientDOBPreventClose.current
                                ) {
                                  try {
                                    fpInstance.open()
                                  } catch (error) {
                                    // Ignore errors
                                  }
                                }
                              }, 5)

                              setTimeout(() => {
                                if (
                                  fpInstance &&
                                  !fpInstance.isOpen &&
                                  patientDOBPreventClose.current
                                ) {
                                  try {
                                    fpInstance.open()
                                  } catch (error) {
                                    // Ignore errors
                                  }
                                }
                              }, 10)
                            }
                          } else if (selectedDates.length === 2) {
                            // Both dates selected - allow closing
                            patientDOBPreventClose.current = false
                            handlePatientDOBDateFilter(selectedDates, false)
                            // Close the calendar automatically after a brief delay
                            setTimeout(() => {
                              const fpInstance = patientDOBfp.current?.flatpickr
                              if (fpInstance && fpInstance.isOpen) {
                                try {
                                  fpInstance.close()
                                } catch (error) {
                                  console.warn('Error closing calendar:', error)
                                }
                              }
                            }, 50)
                          }
                        } else {
                          patientDOBPreventClose.current = false
                          handlePatientDOBDateFilter([])
                        }
                      }}
                      onKeyDown={onPatientKeyPressed}
                    />
                    {crossPatientDOBDate ? (
                      <img
                        src={crossicon}
                        width="15"
                        height="15"
                        className="crossIcon"
                        style={{
                          position: 'absolute',
                          top: '35px',
                          right: '10px',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setPatientDOBPickerPicker('')
                          setcrossPatientDOBDate(false)
                          handleClearFilter('PatientBirthDate')
                        }}
                      />
                    ) : (
                      ''
                    )}
                  </FormGroup>
                </Col>
                <Col lg="3" md="6">
                  <FormGroup>
                    <Label for="Modality">Modality:</Label>
                    <Select
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          borderColor: '#D8D6DE',
                        }),
                      }}
                      value={selectedModalities}
                      onChange={checkSelectedModalities}
                      theme={selectThemeColors}
                      className="react-select staticmodality"
                      classNamePrefix="select"
                      options={modalityOptionsForFilters}
                      isMulti
                    />
                  </FormGroup>
                </Col>
                <Col lg="3" md="6">
                  {ClinicNamesForFilters &&
                  ClinicNamesForFilters?.length > 0 ? (
                    <FormGroup>
                      <Label for="Modality">Clinics:</Label>
                      <Select
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            borderColor: '#D8D6DE',
                          }),
                        }}
                        value={selectedClinics}
                        onChange={checkSelectedClinics}
                        theme={selectThemeColors}
                        getOptionValue={(option) => `${option['_id']}`}
                        getOptionLabel={(option) => {
                          return `${option['clinicName']}`
                        }}
                        className="react-select staticmodality"
                        classNamePrefix="select"
                        options={ClinicNamesForFilters}
                        isMulti
                      />
                    </FormGroup>
                  ) : (
                    <NewDynamicDropdown
                      fileName={'clinicName'}
                      labelName={'Clinics:'}
                      roleName={'clinicName'}
                      className={'w-100'}
                      alreadyValue={selectedClinics}
                      onChange={checkSelectedClinics}
                    />
                  )}
                  {}
                </Col>
                <Col lg="3" md="6">
                  {PhysiciansForFilters && PhysiciansForFilters?.length > 0 ? (
                    <FormGroup>
                      <Label for="Physicians">Physicians:</Label>
                      <Select
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            borderColor: '#D8D6DE',
                          }),
                        }}
                        value={selectedPhysicians}
                        onChange={checkSelectedPhysicians}
                        theme={selectThemeColors}
                        getOptionValue={(option) => `${option['_id']}`}
                        getOptionLabel={(option) => {
                          return `${option['username'] ?? option['clinicName']}`
                        }}
                        className="react-select staticmodality"
                        classNamePrefix="select"
                        options={PhysiciansForFilters}
                        isMulti
                      />
                    </FormGroup>
                  ) : (
                    <NewDynamicDropdown
                      fileName={'Physicians'}
                      labelName={'Physicians:'}
                      roleName={'Physician'}
                      className={'w-100'}
                      alreadyValue={selectedPhysicians}
                      onChange={checkSelectedPhysicians}
                    />
                  )}
                </Col>
                <Col lg="3" md="6">
                  <FormGroup>
                    <Label for="Modality">Study Status:</Label>
                    <Select
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          borderColor: '#D8D6DE',
                        }),
                      }}
                      value={selectedStatus}
                      onChange={checkSelectedStatus}
                      theme={selectThemeColors}
                      getOptionValue={(option) => `${option['value']}`}
                      getOptionLabel={(option) => {
                        return `${option['label']}`
                      }}
                      className="react-select staticmodality"
                      classNamePrefix="select"
                      options={dropdownData?.studyStatus}
                      isMulti
                    />
                  </FormGroup>
                  {}
                </Col>
                <Col md="9" lg="6">
                  <FormGroup>
                    <Label for="StudyDescription">Description</Label>
                    <Input
                      id="StudyDescription"
                      placeholder=""
                      value={searchData.StudyDescription}
                      onChange={handleFilter}
                    />
                    {crossDescription ? (
                      <img
                        src={crossicon}
                        width="15"
                        height="15"
                        className="crossIcon"
                        style={{
                          position: 'absolute',
                          top: '35px',
                          right: '10px',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          searchData.StudyDescription = ''
                          setcrossDescription(false)
                          handleClearFilter('StudyDescription')
                        }}
                      />
                    ) : (
                      ''
                    )}
                  </FormGroup>
                </Col>

                <Col className="seach_button">
                  <FormGroup>
                    <Label for="SearchResult">Search:</Label>
                    <div>
                      <Button
                        className=""
                        color="primary"
                        onClick={handleSeach}
                        size="sm"
                        id="SearchResult"
                        style={btnStyle}
                      >
                        <Search />
                      </Button>
                    </div>
                  </FormGroup>
                </Col>
              </Row>
              {totalFilteredStudies !== null &&
                totalFilteredStudies !== totalStudies && (
                  <Row className="mt-1 mb-50">
                    <Col>
                      <div className="searchTotal">
                        {totalFilteredStudies} filtered from total{' '}
                        {totalStudies} studies.
                      </div>
                    </Col>
                  </Row>
                )}
            </CardBody>
          </AccordionDetails>
        </Accordion>
        <div
          style={{ width: '100%', overflowY: 'hidden', overflowX: 'auto' }}
          id={'blank_div'}
          onScroll={onBlankScroll}
        >
          <div ref={blank_div}>&nbsp;</div>
        </div>
        <div ref={table_data}>
          <ListTable
            {...{
              moduleName: 'study-list-doc',
              tableData: data,
              visibleColumns: columns,
              rows: rowsPerPage,
              onRowDoubleClick: handleClick,
              totalRecords: totalFilteredStudies,
              first: currentPage,
              onSort: handleSort,
              sortField,
              sortOrder,
              onPage: (e) => {
                setCurrentPage(e.first++)
                ;(setRowsPerPage((prev) => e.rows),
                  localStorage.setItem('studylistrow', e.rows))
              },
              onBlankWidth,
              rowClassFn,
            }}
          />
        </div>
      </Card>
    </Fragment>
  )
}

export default DataTableAdvSearch
