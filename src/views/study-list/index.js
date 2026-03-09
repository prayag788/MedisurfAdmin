// ** React Imports
import { useState, Fragment, useEffect, useRef, useContext } from 'react'
import {
  isUserLoggedIn,
  selectThemeColors,
  setLockPatientIdsDm,
  checkForEditDm,
  checkForOtherOperationDm,
  getStudyLockDataAPIDm,
  getLockPatientIdsDm,
} from '@utils'
import { useSelector, useDispatch } from 'react-redux'
import { handleModalityUpdate } from '../../redux/actions/Modalities'
import { modalityOptions as fallbackModalityOptions } from '../../configs/const'

import * as yup from 'yup'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import Avatar from '@components/avatar'
import { yupResolver } from '@hookform/resolvers/yup'
import crossicon from '../../assets/images/icons/close.png'
import Select from 'react-select'
import { useForm } from 'react-hook-form'
import ReactDOM from 'react-dom'
import { Editor } from '@tinymce/tinymce-react'
import STUDYSTATUS from '@configs/studyStatus'
import parse from 'html-react-parser'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPrint } from '@fortawesome/free-solid-svg-icons'
// ** MUI Imports
import Accordion from '@mui/material/Accordion'
import Typography from '@mui/material/Typography'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'

// ** Third Party Components
import Flatpickr from 'react-flatpickr'
import {
  ChevronDown,
  Eye,
  Download,
  X,
  Check,
  Share2,
  Clock,
  Edit,
  Edit2,
  List,
  Book,
  Lock,
  Unlock,
  Search,
  Upload,
  Trash,
} from 'react-feather'
import Timeline from '@components/timeline'
import {
  Form,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  Button,
  Input,
  Label,
  FormGroup,
  Row,
  Col,
  FormFeedback,
  UncontrolledTooltip,
  Modal,
  ModalHeader,
  ModalBody,
  Spinner,
} from 'reactstrap'
import {
  showLoadingAlert,
  hideLoadingAlert,
  showErrorAlert,
  showSuccessAlert,
  showInfoAlert,
  showConfirm,
  getErrorMessage,
  MySwal,
} from '../../utils/alerts'
import {
  showToastSuccess,
  showToastError,
  ToastContent,
  ToastContentForError,
} from '../../utils/toast'
import { BackgroundProcessContext } from '../../context/BackgroundProcessContext'
import AssignToDoctorModel from './AssignToDoctorModel'
import EmailIdOfSharedStudyModel from './EmailIdOfSharedStudyModel'
import moment from 'moment'
import maleIcon from './../../assets/images/icons/male-gender.png'
import femaleIcon from './../../assets/images/icons/female.png'
import otherGenderIcon from './../../assets/images/icons/transgender.png'
import DocTable from './studyListDoc'
import UploadStudyReport from './UploadStudyReport'
import axios from 'axios'
import ROLES from '@configs/roles'
import { Badge } from '@mui/material'
import ListTable from '../../@core/components/list-table'

// ** Styles
import '@styles/react/libs/flatpickr/flatpickr.scss'
import '@styles/react/pages/print-qr-code.scss'
import '@styles/react/pages/study-list.scss'
import '@styles/react/pages/multi-select-horizontal.scss'
import reportEdit from '../../assets/images/icons/reportEdit.png'
import assingExamBlack from '../../assets/images/icons/Assing_Exam_Black.png'
import { socket } from '../../socket'
import FilterModal from '../../@core/components/filter-modal'
import CustomFilterDropdown from './customFilterDropdown'
import { AbilityContext } from '../../utility/context/Can'
import NewDynamicDropdown from './NewDynamicDropdown'
import useDragScroll from '../../hooks/useDragScroll'

const dataPriority = [
  {
    title: 'No Activity',
    metaClassName: 'mr-1',
    color: 'warning',
  },
]

const typeOptions = [
  { value: 'Doctor', label: 'Doctor' },
  { value: 'Patient', label: 'Patient' },
]

const DataTableAdvSearch = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const hasInitialParam = searchParams.get('initial')
  const editorRef = useRef(null)
  const userDataRedux = useSelector(state => state.auth.userData)
  const LicenseData = useSelector(state => state.license)
  const { showBackgroundLoader, hideBackgroundLoader } = useContext(BackgroundProcessContext)

  // ** States
  const [Picker, setPicker] = useState('')
  const [PatientDOBPicker, setPatientDOBPickerPicker] = useState('')
  
  const [isFilter, setFilter] = useState(false)
  const [isFilterLoading, setFilterLoading] = useState(false)
  const [searchData, setSearchData] = useState({
    PatientName: '',
    PatientID: '',
    StudyDate: '',
    AccessionNumber: '',
    Modality: '',
    StudyDescription: '',
    PatientBirthDate: '',
    patientDOB: '',
    patientSex: '',
  })
  const [data, setTableData] = useState([])

  const statusColors = JSON.parse(localStorage.getItem('userData'))?.statusColor
  const [userDataMain, setUserDataMain] = useState(JSON.parse(localStorage.getItem('userData')))
  const [modalities, setModalities] = useState([])
  const [refresh, setRefresh] = useState(null)
  const [openPrintStudy, setOpenPrintStudy] = useState(false)
  const [pdfBlobData, setPdfBlobData] = useState(null)
  const [assignToDocModelToggler, setAssignToDocModelToggler] = useState(false)
  const [sharedStudyToggler, setSharedStudyToggler] = useState(false)
  const [assigningStudy, setAssigningStudy] = useState({})
  const [emailIdOfSharedStudy, setEmailIdOfSharedStudy] = useState({})
  const [rowsPerPage, setRowsPerPage] = useState(
    localStorage.getItem('studylistrow') ? JSON.parse(localStorage.getItem('studylistrow')) : 7
  )
  const [currentPage, setCurrentPage] = useState(0)
  const [totalStudies, setTotalStudies] = useState(0)
  const [totalFilteredStudies, setFilteredStudies] = useState(null)
  const [userRole, setUserRole] = useState()
  const [crossPatient, setcrossPatient] = useState(false)
  const [crossPatientID, setcrossPatientID] = useState(false)
  const [crossAccession, setcrossAccession] = useState(false)
  const [crossStudyDate, setcrossStudyDate] = useState(false)
  const [crossPatientDOBDate, setcrossPatientDOBDate] = useState(false)
  const [crossModality, setcrossModality] = useState(false)
  const [crossPhysician, setcrossPhysician] = useState(false)
  const [crossClinic, setcrossClinic] = useState(false)
  const [crossStatus, setcrossStatus] = useState(false)
  const [crossDescription, setcrossDescription] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const [selectedModalities, setSelectedModalities] = useState(null)
  const [selectedClinics, setSelectedClinics] = useState(null)
  const [selectedPhysicians, setSelectedPhysicians] = useState(null)
  const [selectedStatus, setSelectedstatus] = useState(null)
  const [changeOption, setchangeOption] = useState(false)
  const [dataUpdate, setDataUpdate] = useState(false)
  const [updateState, setUpdateState] = useState(false)
  const [modal, setModal] = useState(false)
  const isInitialInput = useRef(true)
  const isInitialLoad = useRef(true)
  const [selectValue, setSelectValue] = useState({ value: 'Doctor', label: 'Doctor' })
  const [selectedRow, setSelectedRow] = useState([])
  const [btnEvent, setBtnEvent] = useState('share')
  const [refreshLoading, setRefreshLoading] = useState(false)
  const [form_data, setFormData] = useState({
    fname: '',
    lname: '',
    email: '',
    cno: '',
    access: [],
  })
  const [openStatus, setOpenStatus] = useState(false)
  const [openStudyUpload, setOpenStudyUpload] = useState(false)
  const [selectRowForUploadStudy, setSelectRowForUploadStudy] = useState(false)
  const [openActivity, setOpenActivity] = useState(false)
  const [priorityValue, setPriorityValue] = useState('')
  const [statusValue, setStatusValue] = useState('')
  const [rowId, setRowId] = useState('')
  const [activityDataLog, setActivityDataLog] = useState([])
  const [openStudyEdit, setOpenStudyEdit] = useState(false)
  const editingStudyIdRef = useRef(null)
  const [studyIdUnderModification, setStudyIdUnderModification] = useState(null)
  const studyIdUnderModificationRef = useRef(null)
  const [inputStudyEdit, setInputStudyEdit] = useState({
    newName: '',
    patientId: '',
    dob: '',
    sex: '',
    referPhysician: '',
    startTimeStamp: '',
    StudyDescription: '',
    sId: '',
  })
  const [statusColor, setStatusColor] = useState(null)
  const [openNotes, setOpenNotes] = useState(false)
  const [studyNotes, setStudyNotes] = useState(null)
  const [tooltip, setToolTip] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [updateNoteStatus, setUpdateNoteStatus] = useState({ status: false })
  const [openNotesUpdated, setOpenNotesUpdated] = useState(false)
  const [studyLockData, setStudyLockData] = useState({})
  const lastEditedStudyIdRef = useRef(null)
  const lastEditedAtRef = useRef(0)
  const updateTableRowRef = useRef(null)

  const updateTableRow = (studyId, updates) => {
    const idStr = studyId != null ? String(studyId) : ''
    if (!idStr) return
    setTableData(prev =>
      prev.map(r => {
        const match =
          (r._id != null && String(r._id) === idStr) ||
          (r.id != null && String(r.id) === idStr) ||
          (r.ID != null && String(r.ID) === idStr)
        return match ? { ...r, ...updates } : r
      })
    )
  }

  const removeTableRow = studyId => {
    if (studyId == null) return
    setTableData(prev =>
      prev.filter(
        r => r._id !== studyId && r.id !== studyId && String(r.ID) !== String(studyId)
      )
    )
  }

  const mergeStudyListIntoTable = newList => {
    if (!Array.isArray(newList) || newList.length === 0) return
    const byId = new Map()
    newList.forEach(s => {
      if (s._id != null) byId.set(String(s._id), s)
      if (s.id != null) byId.set(String(s.id), s)
      if (s.ID != null) byId.set(String(s.ID), s)
      if (s.StudyInstanceUID != null) byId.set(String(s.StudyInstanceUID), s)
    })
    const editedId = lastEditedStudyIdRef.current
    const editedAt = lastEditedAtRef.current
    const protectEditedMs = 60 * 1000
    const isProtected = editedId != null && editedAt && Date.now() - editedAt < protectEditedMs
    setTableData(prev =>
      prev.map(row => {
        const rowIdStr =
          row._id != null ? String(row._id) : row.id != null ? String(row.id) : row.ID != null ? String(row.ID) : ''
        if (isProtected && editedId && rowIdStr === String(editedId)) {
          return row
        }
        const updated =
          byId.get(String(row._id)) ||
          byId.get(String(row.id)) ||
          byId.get(String(row.ID)) ||
          (row.StudyInstanceUID ? byId.get(String(row.StudyInstanceUID)) : null)
        return updated != null ? { ...row, ...updated } : row
      })
    )
  }

  const fetchStudyListInBackgroundAndMergeRef = useRef(null)

  const fetchStudyListInBackgroundAndMerge = () => {
    const apiEndpoint = `${process.env.REACT_APP_API_URL}/orthanc/study-list`
    let params = {}
    if (userData?.role === ROLES.ReferringDoctor) {
      params = { email: userData.email }
    } else {
      const filerData = JSON.stringify(
        Object.keys(searchData)
          .map(key => {
            const value = searchData[key]
            if (
              value === '' ||
              value === null ||
              value === undefined ||
              (Array.isArray(value) && value.length === 0)
            ) {
              return {}
            }
            if (key === 'Physicians' && Array.isArray(value)) {
              return { [key]: value.map(d => d.physicianname) }
            }
            if (key === 'clinicNames' && Array.isArray(value)) {
              return { [key]: value.map(d => d.clinicName) }
            }
            return { [key]: value }
          })
          .reduce((acc, curr) => {
            if (Object.keys(curr).length) {
              const key = Object.keys(curr)[0]
              acc[key] = curr[key]
            }
            return acc
          }, {})
      )
      params = {
        limit: rowsPerPage,
        since: currentPage,
        filters: filerData,
        sort: sortField && sortOrder ? `${sortField},${sortOrder}` : '',
      }
      if (selectedDropDownFilter?._id) params.filterId = selectedDropDownFilter._id
    }
    axios
      .get(apiEndpoint, { params })
      .then(res => {
        if (res?.data?.data && Array.isArray(res.data.data)) {
          mergeStudyListIntoTable(res.data.data)
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchStudyListInBackgroundAndMergeRef.current = fetchStudyListInBackgroundAndMerge
    updateTableRowRef.current = updateTableRow
  })

  // Map studyData API response (single study) to the same flat shape as study-list rows.
  // Used to update the edited study in place so it stays on the same page with full server data (no reorder).
  const studyDataResponseToListRow = study => {
    if (!study || (study._id == null && study.id == null)) return null
    const p = study.patient || {}
    const d = study.details || {}
    const patientName = p.PatientName ?? study.patientPatientName ?? '-'
    const patientId = p.PatientID ?? study.patientPatientId ?? '-'
    const patientDob = p.PatientBirthDate ?? study.patientPatientBirthDate ?? ''
    const patientSex = p.PatientSex ?? study.patientPatientSex ?? '-'
    const desc = d.StudyDescription ?? study.detailsStudyDescription ?? '-'
    const examDesc = study.detailsExamDescription ?? desc
    const reportDesc = study.detailsReportDescription ?? d.ReportDescription ?? study.ReportDescription ?? ''
    const referPhysician = d.ReferringPhysicianName ?? study.detailsReferringPhysicianName ?? '-'
    const accessionNumber = d.AccessionNumber ?? study.detailsAccessionNumber ?? '-'
    const studyDate = d.StudyDate ?? study.detailsStudyDate
    const studyTime = d.StudyTime ?? study.detailsStudyTime
    const startTimeStamp =
      study.startTimeStamp ||
      (studyDate && studyTime ? `${studyDate} ${studyTime}`.trim() : studyDate || studyTime || '-')
    const modality = study.modality ?? study.Modality ?? '-'
    const id = study.id ?? study._id
    const _id = study._id ?? study.id
    return {
      _id,
      id,
      ID: id,
      StudyInstanceUID: d.StudyInstanceUID ?? study.StudyInstanceUID ?? '-',
      PatientName: patientName,
      PatientID: patientId,
      PatientBirthDate: patientDob,
      PatientDOB: patientDob ? (moment(patientDob).format('YYYY-MM-DD') || patientDob) : '-',
      PatientSex: patientSex,
      patientPatientName: patientName,
      patientPatientId: patientId,
      patientPatientBirthDate: patientDob,
      patientPatientSex: patientSex,
      Description: desc,
      StudyDescription: desc,
      detailsStudyDescription: desc,
      detailsExamDescription: examDesc,
      detailsReportDescription: reportDesc || 'Medical Report',
      detailsReferringPhysicianName: referPhysician,
      referPhysician,
      AccessionNumber: accessionNumber,
      detailsAccessionNumber: accessionNumber,
      startTimeStamp: startTimeStamp || '-',
      Modality: modality,
      status: study.status ?? '-',
      priority: study.priority ?? '-',
      patient: { PatientName: patientName, PatientID: patientId, PatientBirthDate: patientDob, PatientSex: patientSex },
      details: { ...d, StudyDescription: desc, ReferringPhysicianName: referPhysician, AccessionNumber: accessionNumber },
      radiologist: study.radiologist,
      createdOn: study.createdOn,
      lastUpdatedOn: study.lastUpdatedOn,
    }
  }

  const fetchSingleStudyAsListRow = async studyId => {
    if (studyId == null) return null
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/explorer/studies/studyData/${studyId}`
      )
      const study = res?.data?.data || res?.data?.study || res?.data
      if (!study) return null
      return studyDataResponseToListRow(study)
    } catch (err) {
      return null
    }
  }

  const [sortField, setSortField] = useState(null)
  const [sortOrder, setSortOrder] = useState(0)
  const [selectedProducts, setSelectedProducts] = useState(null)
  const [Flatpicker, showFlatpicker] = useState(true)
  const [isSelectingStudyDateRange, setIsSelectingStudyDateRange] = useState(false)
  const [isSelectingPatientDOBRange, setIsSelectingPatientDOBRange] = useState(true)
  const [addNewFilter, setAddNewFilter] = useState(false)
  const [tableListData, setTableListData] = useState({})
  const ability = useContext(AbilityContext)
  const dropdownData = useSelector(state => state.dropdownDataReducer)
  
  // Initialize drag scroll functionality
  useDragScroll()

  const [selectedDropDownFilter, setSelectedDropDownFilter] = useState([])
  const modalityOptionsForFilters = useSelector(state => state.ModalityReducer) || []
  const dispatch = useDispatch()
  const ClinicNamesForFilters = useSelector(state => state.dropdownDataReducer.clinicNames)
  const PhysiciansForFilters = useSelector(state => state.dropdownDataReducer.Physicians)

  // Log modality dropdown source so we can confirm Orthanc list is used
  useEffect(() => {
    const count = modalityOptionsForFilters?.length ?? 0
    const values = (modalityOptionsForFilters || []).map(o => o?.value ?? o?.label).filter(Boolean).slice(0, 12)
    console.log('[StudyList Modality] Dropdown options from Redux:', count, count ? values.join(', ') + (count > 12 ? '...' : '') : '(empty)')
  }, [modalityOptionsForFilters])

  // Refs for date pickers (must be declared before useEffect hooks that use them)
  const fp = useRef()
  const patientDOBfp = useRef()
  const patientDOBPreventClose = useRef(false)
  const studyDatePreventClose = useRef(false)
  const studyDateTempSelection = useRef(null) // Store first date temporarily to avoid re-render

  // Effect to keep calendar open when only one date is selected (Patient DOB)
  useEffect(() => {
    if (patientDOBPreventClose.current && patientDOBfp.current?.flatpickr) {
      const fpInstance = patientDOBfp.current.flatpickr
      const selectedDates = fpInstance.selectedDates || []
      
      // If only one date is selected, ensure calendar stays open
      if (selectedDates.length === 1 && !fpInstance.isOpen) {
        // Use multiple strategies to reopen
        requestAnimationFrame(() => {
          if (fpInstance && !fpInstance.isOpen && patientDOBPreventClose.current) {
            try {
              fpInstance.open()
            } catch (error) {
              // Silently handle errors
            }
          }
        })
      }
    }
  }, [PatientDOBPicker])

  // Handle URL parameters for filter initialization
  useEffect(() => {
    const filterIdFromUrl = searchParams.get('filterId')
    if (filterIdFromUrl && !selectedDropDownFilter?._id && filterIdFromUrl !== selectedDropDownFilter?._id) {
      // Load filter data from API if filterId is in URL
      const loadFilterFromUrl = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/filter-module/get/${filterIdFromUrl}`
          )
          if (response.data && response.data.filter) {
            setSelectedDropDownFilter(response.data.filter)
            console.log('🔗 Loaded filter from URL:', response.data.filter.name)
          }
        } catch (error) {
          console.warn('Failed to load filter from URL:', error)
        }
      }
      loadFilterFromUrl()
    }
  }, [searchParams.get('filterId')]) // Only depend on the actual filterId value

  const userData = JSON.parse(isUserLoggedIn())

  const blank_div = useRef(null)
  const table_data = useRef(null)
  const btnStyle = {
    height: '38px',
    width: '100%',
  }
  let controller = new AbortController()
  const flatPickerDateFormat =
    userData?.dateFormats?.dateFormat === 'MM/DD/YYYY'
      ? 'm/d/Y'
      : userData?.dateFormats?.dateFormat === 'DD/MM/YYYY'
        ? 'd/m/Y'
        : userData?.dateFormats?.dateFormat === 'YYYY/MM/DD'
          ? 'Y/m/d'
          : 'm/d/Y'

  const flatPickerDateTimeFormat = userData?.dateFormats?.dateTimeFormat
    ? userData.dateFormats.dateTimeFormat === 'MM/DD/YYYY hh:mmA'
      ? 'm/d/Y h:i K'
      : userData.dateFormats.dateTimeFormat === 'DD/MM/YYYY hh:mmA'
        ? 'd/m/Y h:i K'
        : userData.dateFormats.dateTimeFormat === 'YYYY/MM/DD hh:mmA'
          ? 'Y/m/d h:i K'
          : userData.dateFormats.dateTimeFormat === 'MM/DD/YYYY HH:mm'
            ? 'm/d/Y H:i'
            : userData.dateFormats.dateTimeFormat === 'DD/MM/YYYY HH:mm'
              ? 'd/m/Y H:i'
              : userData.dateFormats.dateTimeFormat === 'YYYY/MM/DD HH:mm'
                ? 'Y/m/d H:i'
                : 'm/d/Y H:i' // Default format
    : 'm/d/Y H:i' // Handle undefined formats gracefully

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/user/status/color`)
      .then(res => {
        setStatusColor(res.data.message)
      })
      .catch(err => {
        // Only handle response errors, let global interceptor handle network errors
        if (err && err.response) {
          showErrorAlert(getErrorMessage(err))
        }
      })
  }, [])

  useEffect(() => {
    socket.on('reloadRouteStudyNew', Data => {
      if (Data) {
        // setLockPatientIdsDm(Data)
      }
    })
  }, [])

  useEffect(() => {
    socket.on('reloadRouteStudy', Data => {
      if (Data) {
        try {
          const NewData = typeof Data === 'string' ? JSON.parse(Data) : Data
          if (NewData?.lockData != null) {
            setLockPatientIdsDm(NewData)
            setStudyLockData(NewData.lockData)
          }
          if (
            NewData?.userId != null &&
            NewData?.IsLock === false &&
            userData?._id != null &&
            String(NewData.userId) === String(userData._id)
          ) {
            setTimeout(() => {
              fetchStudyListInBackgroundAndMergeRef.current?.()
            }, 600)
          }
        } catch (e) {
          // ignore parse errors
        }
      }
    })
  }, [userData?._id])

  // When edit process completed: trigger a list refetch so updated data is shown (small re-render; entry may move page if sort changes).
  useEffect(() => {
    const userId = userData?._id
    if (!userId) return
    const eventName = `completedPatientEditProcess_${userId}`
    const handler = value => {
      try {
        const payload = typeof value === 'string' ? JSON.parse(value) : value
        if (payload?.status !== true) return
        lastEditedStudyIdRef.current = null
        lastEditedAtRef.current = 0
        studyIdUnderModificationRef.current = null
        setStudyIdUnderModification(null)
        setRefresh(prev => (prev == null ? 1 : prev + 1))
      } catch (e) {
        // ignore
      }
    }
    socket.on(eventName, handler)
    return () => socket.off(eventName, handler)
  }, [userData?._id])

  useEffect(() => {
    const loadLockData = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/explorer/studies/getStudyLockData`
        )
        const payload = typeof res?.data === 'string' ? JSON.parse(res.data) : res?.data || {}
        if (payload?.lockData != null) {
          setLockPatientIdsDm(payload)
          setStudyLockData(payload.lockData)
        }
      } catch (err) {
        const fromStorage = getLockPatientIdsDm()
        if (fromStorage && typeof fromStorage === 'object') {
          setStudyLockData(fromStorage)
        }
      }
    }
    loadLockData()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      // Prevent double loading on initial render
      if (refreshLoading && isInitialLoad.current) {
        return
      }
      
      // Handle initial parameter - remove it from URL after first load
      if (hasInitialParam && isInitialLoad.current) {
        const newParams = new URLSearchParams(searchParams)
        newParams.delete('initial')
        const newUrl = `${location.pathname}${newParams.toString() ? `?${newParams.toString()}` : ''}`
        navigate(newUrl, { replace: true })
      }
      
      setRefreshLoading(true)
      try {
        let studylist

        if (userData) {
          setUserRole(() => userData.role)
        }

        controller.abort()
        controller = new AbortController()

        // Use single unified endpoint - backend automatically chooses OpenSearch or PostgreSQL
        const apiEndpoint = `${process.env.REACT_APP_API_URL}/orthanc/study-list`

        if (userData && userData.role === ROLES.ReferringDoctor) {
          try {
            studylist = await axios.get(apiEndpoint, {
              params: {
                email: userData.email,
              },
            })
          } catch (error) {
            console.error('Study list API failed:', error)
            throw error
          }

          if (!studylist || !studylist.data) {
            setTableData(() => [])
            setTotalStudies(() => 0)
            setFilteredStudies(0)
            setRefreshLoading(false)
            return
          }
          setTableData(() => studylist.data.data)

          setTotalStudies(() => {
            return studylist.data.total
          })
          setFilteredStudies(studylist.data.totalFiltered)
        } else {
          // Build filters
          console.log('🔍 Raw searchData before building filters:', searchData)
          console.log('🔍 StudyDate value:', searchData.StudyDate, 'Type:', typeof searchData.StudyDate)
          console.log('🔍 PatientBirthDate value:', searchData.PatientBirthDate, 'Type:', typeof searchData.PatientBirthDate)
          
          const filerData = JSON.stringify(
            Object.keys(searchData)
              .map(key => {
                const value = searchData[key]
                console.log(`🔍 Processing filter key: ${key}, value:`, value, 'type:', typeof value)
                
                // Skip empty values but keep date filters even if they might be empty strings initially
                if (
                  value === '' ||
                  value === null ||
                  value === undefined ||
                  (Array.isArray(value) && value.length === 0)
                ) {
                  console.log(`⏭️ Skipping empty filter: ${key}`)
                  return {}
                }
                
                if (key === 'Physicians') {
                  console.log(
                    'Physicians',
                    value.map(data => data._id)
                  )
                  return { [key]: value.map(data => data.physicianname) }
                }
                if (key === 'clinicNames') {
                  return { [key]: value.map(data => data.clinicName) }
                }
                
                // Explicitly handle date filters
                if (key === 'StudyDate' || key === 'PatientBirthDate') {
                  console.log(`✅ Including date filter ${key}:`, value)
                  return { [key]: value }
                }
                
                return { [key]: value }
              })
              .reduce((acc, curr) => {
                if (Object.keys(curr).length) {
                  const key = Object.keys(curr)[0]
                  acc[key] = curr[key]
                  console.log(`✅ Added filter to accumulator: ${key} =`, curr[key])
                }
                return acc
              }, {})
          )
          
          // Debug: Log filter data to verify StudyDate and PatientBirthDate are included
          const parsedFilters = JSON.parse(filerData)
          console.log('🔍 Final filter data being sent:', parsedFilters)
          console.log('🔍 Filter keys:', Object.keys(parsedFilters))
          if (parsedFilters.StudyDate) {
            console.log('✅ StudyDate filter included:', parsedFilters.StudyDate)
          } else {
            console.warn('⚠️ StudyDate filter NOT included in filters!')
          }
          if (parsedFilters.PatientBirthDate) {
            console.log('✅ PatientBirthDate filter included:', parsedFilters.PatientBirthDate)
          } else {
            console.warn('⚠️ PatientBirthDate filter NOT included in filters!')
          }
          
          // Use unified endpoint - backend handles OpenSearch/PostgreSQL automatically
          const params = {
            limit: rowsPerPage,
            since: currentPage,
            filters: filerData,
            sort: sortField && sortOrder ? `${sortField},${sortOrder}` : '',
          }

          // Add filterId if a filter is selected
          if (selectedDropDownFilter && selectedDropDownFilter._id) {
            params.filterId = selectedDropDownFilter._id
            console.log(`🔍 Adding filterId to API call: ${selectedDropDownFilter._id}`)
          }

          console.log('🔍 API params being sent:', params)

          studylist = await axios.get(`${process.env.REACT_APP_API_URL}/orthanc/study-list`, {
            params,
            signal: controller.signal,
          })

          if (!studylist || !studylist.data) {
            setTableData(() => [])
            setTotalStudies(() => 0)
            setFilteredStudies(0)
            setRefreshLoading(false)
            return
          }

          setTableData(() => {
            return studylist.data.data
          })

          setTotalStudies(() => {
            return studylist.data.total
          })

          setFilteredStudies(studylist.data.totalFiltered)
        }
        setRefreshLoading(false)
        isInitialLoad.current = false
      } catch (error) {
        // Let global interceptor handle network errors
        setRefreshLoading(false)
        isInitialLoad.current = false
      }
    }

    fetchData()

    return () => {
      controller.abort('Request canceled due to component unmount')
    }
  }, [
    refresh,
    rowsPerPage,
    currentPage,
    isFilter,
    dataUpdate,
    openNotesUpdated,
    selectedDropDownFilter?._id, // Only depend on the ID to prevent object reference changes
  ])

  // Fetch notes when modal opens
  useEffect(() => {
    const fetchStudyNotes = async () => {
      // Fetch notes when modal opens and study ID is available
      // Always fetch to ensure we have the latest notes data
      if (openNotes && studyNotes?.id) {
        try {
          console.log('[Notes Modal] Fetching notes for study ID:', studyNotes.id)
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/explorer/studies/studyData/${studyNotes.id}`
          )
          
          console.log('[Notes Modal] Full API Response:', response.data)
          console.log('[Notes Modal] API Response Structure:', {
            hasData: !!response.data,
            hasDataData: !!response.data?.data,
            responseKeys: response.data ? Object.keys(response.data) : [],
            dataKeys: response.data?.data ? Object.keys(response.data.data || {}) : [],
            notesType: typeof response.data?.data?.notes,
            notesIsArray: Array.isArray(response.data?.data?.notes),
            notesLength: Array.isArray(response.data?.data?.notes) ? response.data.data.notes.length : 'N/A',
            notesData: response.data?.data?.notes
          })
          
          // API returns: { data: { ...Study, reportString: ... } }
          // Study object contains notes array
          const studyData = response.data?.data || response.data?.study || response.data
          
          if (studyData) {
            // API returns notes as an array with structure: { _id, userId, time, note, username, role }
            const notes = Array.isArray(studyData.notes) 
              ? studyData.notes 
              : []
            
            console.log('[Notes Modal] Extracted notes:', {
              count: notes.length,
              firstNote: notes.length > 0 ? notes[0] : null,
              notesStructure: notes.length > 0 ? Object.keys(notes[0]) : [],
              allNotes: notes
            })
            
            setStudyNotes(prev => ({
              ...prev,
              notes: notes
            }))
          } else {
            console.warn('[Notes Modal] No study data found in response:', response.data)
            setStudyNotes(prev => ({
              ...prev,
              notes: []
            }))
          }
        } catch (error) {
          console.error('[Notes Modal] Error fetching study notes:', error)
          console.error('[Notes Modal] Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
          })
          // Set empty array on error
          setStudyNotes(prev => ({
            ...prev,
            notes: []
          }))
        }
      }
    }

    fetchStudyNotes()
  }, [openNotes, studyNotes?.id])

  // Fetch modalities from Orthanc when study-list mounts; dispatch to Redux so dropdown has options (in case App.js fetch ran before auth)
  useEffect(() => {
    const fetchModalities = async () => {
      const url = `${process.env.REACT_APP_API_URL}/orthanc/modalities`
      console.log('[StudyList Modality] Fetching from Orthanc:', url)
      try {
        const res = await axios.get(url, {})
        if (res?.status !== 200 || res?.data == null || (typeof res.data === 'object' && res.data.success === false)) {
          console.log('[StudyList Modality] Response not OK or error body:', res?.status, res?.data)
          return
        }
        const data = res.data
        let raw = []
        if (Array.isArray(data)) {
          raw = data
        } else if (data && typeof data === 'object') {
          const names = new Set()
          Object.keys(data).forEach((key) => {
            const config = data[key]
            const aet = config && (config.AET ?? config.AeTitle ?? config.aeTitle)
            if (aet && typeof aet === 'string') names.add(String(aet).trim())
            else names.add(String(key).trim())
          })
          raw = Array.from(names).sort()
        }
        const apiOptions = raw
          .filter(Boolean)
          .map(m => (typeof m === 'string' ? m : (m?.Name ?? m?.name ?? m?.value ?? String(m))))
          .filter(Boolean)
          .map(name => ({ value: name, label: name }))
        setModalities(raw)
        const apiValues = new Set(apiOptions.map(o => o.value))
        const merged = [...apiOptions]
        ;(fallbackModalityOptions || []).forEach(f => {
          if (!apiValues.has(f.value)) merged.push(f)
        })
        merged.sort((a, b) => (a.value || '').localeCompare(b.value || ''))
        if (merged.length > 0) {
          console.log('[StudyList Modality] Fetched and dispatching to Redux:', merged.length)
          dispatch(handleModalityUpdate(merged))
        } else {
          console.log('[StudyList Modality] Fetched but empty list, not updating Redux.')
        }
      } catch (err) {
        console.log('[StudyList Modality] Fetch failed:', err?.response?.status, err?.response?.data?.message || err?.message)
      }
    }

    fetchModalities()
  }, [dispatch])

  const ChangeState = () => {
    if (!Flatpicker && fp.current && fp.current.flatpickr) {
      fp.current.flatpickr.open()
    }
  }

  const onDataScroll = e => {
    if (document.getElementById('blank_div')) {
      document.getElementById('blank_div').scrollLeft = e.target.scrollLeft
    }
  }

  const getTable = e => {
    return table_data?.current?.children[0]?.children[0]?.children[0]
  }
  const onBlankScroll = async e => {
    const table = await getTable()
    table.scrollLeft = e.target.scrollLeft
  }
  const onBlankWidthSet = async e => {
    const table = await getTable()
    if (table) {
      blank_div.current.style.width = `${table.scrollWidth}px`
      blank_div.current.scrollLeft = 100
      ReactDOM.findDOMNode(table).addEventListener('scroll', onDataScroll)
    }
  }
  const onBlankWidth = e => {
    setTimeout(onBlankWidthSet, 100)
  }
  useEffect(() => {
    onBlankWidth()
    setTimeout(onBlankWidthSet, 100)
    setTimeout(onBlankWidthSet, 200)
  }, [data])

  //     }

  //     }

  //     })

  //     }
  //   })

  // }
  const rowClassFn = data => {
    const status =
      data.status === STUDYSTATUS.Unread ||
      data.status === STUDYSTATUS.Preliminary ||
      data.status === STUDYSTATUS.Ready
    const priority = data.priority === 'Stat'
    const bg_stat = priority && status
    const ret = {
      'bg-row-stat': bg_stat,
    }
    return ret
  }

  const handlePriorityModal = () => setOpenStatus(!openStatus)

  const DoctorSchema = yup.object().shape({
    doctorName: yup
      .string('Name should be a string')
      .max(25, 'First name cannot be longer than 25 characters.')
      .required('Doctor name is required!'),
    doctorEmail: yup
      .string()
      .email('Invalid email format!')
      .required('Doctor Please provide your email address. This field is required.'),
  })

  const PatientSchema = yup.object().shape({
    patientName: yup.string().required('Patient name is required!'),
    patientEmail: yup
      .string()
      .email('Invalid email format!')
      .required('Patient Please provide your email address. This field is required.'),
  })

  const StudyEditSchema = yup.object().shape({
    newName: yup.string().required('Patient name is required!'),
    patientId: yup.string().required('Patient id is required!'),
    referPhysician: yup.string().optional().default(''),
    sex: yup.string().required('Patient sex is required!'),
    dob: yup.string().required('Patient Birth Date is required!'),
    startTimeStamp: yup.string().required('Study Date Time is required!'),
    StudyDescription: yup.string().required('Study Description is required!'),
    clinicNames: yup.array(),
    Physicians: yup.array(),
  })

  const {
    register,
    formState: { errors },
    handleSubmit,
    clearErrors,
    trigger,
    setValue,
    getValues,
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(selectValue?.value === 'Patient' ? PatientSchema : DoctorSchema),
  })

  const {
    register: registerEdit,
    formState: { errors: errorEdit },
    handleSubmit: handleSubmitEdit,
    setValue: setPatientValue,
    clearErrors: clearEditErrors,
    reset: resetEditForm,
  } = useForm({ mode: 'onSubmit', resolver: yupResolver(StudyEditSchema) })

  const handleModal = () => {
    setModal(!modal)
    if (!modal) {
      // Reset form data and clear errors when opening modal
      setFormData(prev => ({
        ...prev,
        doctorName: '',
        doctorEmail: '',
        patientName: '',
        patientEmail: '',
      }))
      clearErrors()
    }
  }

  // Clear errors when form data has valid values and sync form values
  useEffect(() => {
    if (selectValue?.value === 'Doctor') {
      // Set form values
      if (form_data.doctorName) setValue('doctorName', form_data.doctorName)
      if (form_data.doctorEmail) setValue('doctorEmail', form_data.doctorEmail)

      if (form_data.doctorName && form_data.doctorEmail) {
        clearErrors(['doctorName', 'doctorEmail'])
      }
    } else if (selectValue?.value === 'Patient') {
      // Set form values
      if (form_data.patientName) setValue('patientName', form_data.patientName)
      if (form_data.patientEmail) setValue('patientEmail', form_data.patientEmail)

      if (form_data.patientName && form_data.patientEmail) {
        clearErrors(['patientName', 'patientEmail'])
      }
    }
  }, [form_data, selectValue, clearErrors, setValue])

  const shareformSubmit = data => {
    // Validate form before submission
    const currentValues = getValues()
    const hasValidData =
      selectValue?.value === 'Doctor'
        ? currentValues.doctorName && currentValues.doctorEmail
        : currentValues.patientName && currentValues.patientEmail

    if (!hasValidData) {
      // Trigger validation to show errors
      if (selectValue?.value === 'Doctor') {
        trigger(['doctorName', 'doctorEmail'])
      } else {
        trigger(['patientName', 'patientEmail'])
      }
      return
    }

    const username = JSON.parse(localStorage.getItem('userData')).username
    const selectedRows = selectedRow

    showLoadingAlert()

    axios
      .post(`${process.env.REACT_APP_API_URL}/studyShare/createShareLink`, {
        studies: selectedRows,
        name: data.doctorName ? data.doctorName : data.patientName,
        email: data.doctorEmail ? data.doctorEmail : data.patientEmail,
        type: selectValue.value,
        username,
        urlOrigin: `${window.location.origin}/shared-study/`,
      })
      .then(response => {
        hideLoadingAlert()
        if (response.data !== null) {
          showToastSuccess('Email sent to respective email address')
          setDataUpdate(prev => !prev)
          setSelectValue({ value: 'Doctor', label: 'Doctor' })

          // Only clear form data and close modal on success
          isInitialInput.current = true
          setFormData(prev => {
            return {
              ...prev,
              doctorName: '',
              doctorEmail: '',
              patientName: '',
              patientEmail: '',
            }
          })
          handleModal()
        } else {
          hideLoadingAlert()
          showToastError('something went wrong', { position: 'top-center' })
        }
      })
      .catch(err => {
        hideLoadingAlert()
        // Don't clear form data or close modal on error
        // Let global axios interceptor handle error alerting
      })
  }

  const sharePrintformSubmit = data => {
    // Validate form before submission
    const currentValues = getValues()
    const hasValidData =
      selectValue?.value === 'Doctor'
        ? currentValues.doctorName && currentValues.doctorEmail
        : currentValues.patientName && currentValues.patientEmail

    if (!hasValidData) {
      // Trigger validation to show errors
      if (selectValue?.value === 'Doctor') {
        trigger(['doctorName', 'doctorEmail'])
      } else {
        trigger(['patientName', 'patientEmail'])
      }
      return
    }

    const username = JSON.parse(localStorage.getItem('userData')).username
    const selectedRows = selectedRow
    showLoadingAlert()

    axios
      .post(`${process.env.REACT_APP_API_URL}/studyShare/createShareLinkForPrintandEmail`, {
        studies: selectedRows,
        name: data.doctorName ? data.doctorName : data.patientName,
        email: data.doctorEmail ? data.doctorEmail : data.patientEmail,
        type: selectValue.value,
        username,
        urlOrigin: `${window.location.origin}/shared-study/`,
        btnEvent,
      })
      .then(response => {
        hideLoadingAlert()
        if (response.data !== null) {
          if (btnEvent !== 'print') {
            showToastSuccess('Email sent to respective email address')
          }
          setDataUpdate(prev => !prev)
          setSelectValue({ value: 'Doctor', label: 'Doctor' })

          // Only clear form data and close modal on success
          isInitialInput.current = true
          setFormData(prev => {
            return {
              ...prev,
              doctorName: '',
              doctorEmail: '',
              patientName: '',
              patientEmail: '',
            }
          })
          handleModal()

          if (btnEvent !== 'share') {
            navigate('/print-QR-code', { state: response.data })
          }
        } else {
          hideLoadingAlert()
          showToastError('something went wrong', { position: 'top-center' })
        }
      })
      .catch(err => {
        hideLoadingAlert()
        // Don't clear form data or close modal on error
        // Let global axios interceptor handle error alerting
      })
  }

  const printformSubmit = () => {
    setBtnEvent('print')
    const username = JSON.parse(localStorage.getItem('userData')).username
    const selectedRows = selectedRow
    axios
      .post(`${process.env.REACT_APP_API_URL}/studyShare/createShareLinkForPrint`, {
        studies: selectedRows,
        username,
        urlOrigin: `${window.location.origin}/shared-study/`,
      })
      .then(response => {
        if (response.data !== null) {
          setSelectValue({ value: 'Doctor', label: 'Doctor' })
          handleModal()
          navigate('/print-QR-code', { state: response.data })
        } else {
          showToastError('something went wrong', { position: 'top-center' })
          return null
        }
      })
  }

  const onSubmit = data => {
    data.access = form_data.access.flat()

    sharePrintformSubmit(data)
    // }
  }

  const onSubmitStudyEdit = async data => {
    const studyId = (editingStudyIdRef.current != null && String(editingStudyIdRef.current).trim() !== '')
      ? String(editingStudyIdRef.current).trim()
      : (inputStudyEdit?.sId != null && String(inputStudyEdit.sId).trim() !== '')
        ? String(inputStudyEdit.sId).trim()
        : ''
    if (!studyId) {
      showErrorAlert('Study reference is missing. Please close the dialog, refresh the list, and try editing again.')
      return
    }
    try {
      studyIdUnderModificationRef.current = studyId
      setStudyIdUnderModification(studyId)
      showBackgroundLoader('Study edit in progress...')
      // Send form data (data) so all edited fields are persisted; use studyId for URL
      const payload = {
        newName: data.newName != null ? String(data.newName).trim() : '',
        patientId: data.patientId != null ? String(data.patientId).trim() : '',
        dob: data.dob != null ? String(data.dob).trim() : '',
        sex: data.sex != null ? String(data.sex).trim() : '',
        referPhysician: data.referPhysician != null ? String(data.referPhysician).trim() : '',
        startTimeStamp: data.startTimeStamp != null ? String(data.startTimeStamp).trim() : '',
        StudyDescription: data.StudyDescription != null ? String(data.StudyDescription).trim() : '',
      }
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/explorer/studies/${studyId}/modify`,
        payload
      )

      if (res?.status === 'cancelled') {
        hideBackgroundLoader()
        studyIdUnderModificationRef.current = null
        setStudyIdUnderModification(null)
        showErrorAlert(
          'Request was cancelled or failed. The server may have been updated. Please refresh the page and try again.'
        )
        return
      }

      showSuccessAlert('The study edit process has been successfully configured in the background.')

      if (res?.data?.lockData != null && typeof res.data.lockData === 'object') {
        setLockPatientIdsDm({ lockData: res.data.lockData })
        setStudyLockData(res.data.lockData)
      }

      setInputStudyEdit({
        newName: '',
        patientId: '',
        dob: '',
        sex: '',
        referPhysician: '',
        startTimeStamp: '',
        StudyDescription: '',
        sId: '',
      })
      // Do NOT update the row during the process — keep current values so the list does not flicker or show intermediate state.
      // Protect this row from background merges until we get success; then socket handler will update it once with full server data.
      lastEditedStudyIdRef.current = studyId
      lastEditedAtRef.current = Date.now()
      editingStudyIdRef.current = null
      setOpenStudyEdit(false)
      // studyIdUnderModification already set at start of submit; cleared when socket fires completedPatientEditProcess
      const runMerge = () => fetchStudyListInBackgroundAndMergeRef.current?.()
      setTimeout(runMerge, 2000)
      setTimeout(runMerge, 5000)
      setTimeout(runMerge, 9000)
    } catch (err) {
      hideBackgroundLoader()
      studyIdUnderModificationRef.current = null
      setStudyIdUnderModification(null)
      const isNetworkOrServerRestart =
        !err?.response ||
        [502, 503, 504].includes(err?.response?.status) ||
        err?.isNetworkError ||
        err?.code === 'ECONNABORTED' ||
        err?.code === 'ECONNRESET'
      const message = isNetworkOrServerRestart
        ? `${getErrorMessage(err)} The server may have been updated. Please refresh the page and try again.`
        : getErrorMessage(err)
      showErrorAlert(message)
    }
  }
  const setInputStudyEditValue = (name, value) => {
    setInputStudyEdit(prevState => ({ ...prevState, [name]: value })) // Use bracket notation to dynamically set the key
    setPatientValue(name, value) // Pass the name and value correctly

    // Clear errors when field has value
    if (value && value.trim() !== '') {
      clearEditErrors(name)
    }
  }
  const clearField = field => setInputStudyEditValue(field, '')
  const formatAndValidateDate = (dateInput, format, field) => {
    const formattedDate = moment(dateInput).format(format)
    if (moment(formattedDate, format, true).isValid()) {
      setInputStudyEditValue(field, formattedDate)
    } else {
      console.error(`Invalid ${type} selected for ${field}:`, dateInput)
      clearField(field)
    }
  }
  const studyEditHandler = (e, type = 'none') => {
    console.log({ e, type })
    if (type === 'date') {
      e ? formatAndValidateDate(e, 'YYYY-MM-DD', 'dob') : clearField('dob')
    } else if (type === 'datetime') {
      e
        ? formatAndValidateDate(e, 'YYYY-MM-DD HH:mm:ss', 'startTimeStamp')
        : clearField('startTimeStamp')
    } else {
      // For other input types, handle as usual
      setInputStudyEditValue(e.target.name, e.target.value)
    }
  }

  const syncOrthancWithDB = async () => {
    setRefreshLoading(true)
    showBackgroundLoader('Syncing Orthanc...')
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/explorer/studies/syncOrthanc`)

      showSuccessAlert(
        'The Orthanc syncing process has been successfully configured in the background.'
      )
      setRefreshLoading(false)
      setTimeout(() => hideBackgroundLoader(), 20000)
    } catch (err) {
      hideBackgroundLoader()
      if (err && err.response) {
        showErrorAlert(getErrorMessage(err))
      }
      setRefreshLoading(false)
    }
  }

  const syncOrthancExamsWithDB = async () => {
    setRefreshLoading(true)
    showBackgroundLoader('Syncing exams...')
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/report/manually-start-exam-sync`, {
        pin: 'MANUALLY@EXAM-SYNC',
      })

      showSuccessAlert(
        'The Exam syncing process has been successfully configured in the background.'
      )
      setRefreshLoading(false)
      setTimeout(() => hideBackgroundLoader(), 20000)
    } catch (err) {
      hideBackgroundLoader()
      if (err && err.response) {
        showErrorAlert(getErrorMessage(err))
      }
      setRefreshLoading(false)
    }
  }

  const syncDBBkup = async () => {
    setRefreshLoading(true)
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/user/databaseBkup`)
      showSuccessAlert(
        res.data.success.message || 'The Database backup process is completed successfully.'
      )
      setRefreshLoading(false)
    } catch (err) {
      // Only handle response errors, let global interceptor handle network errors
      if (err && err.response) {
        showErrorAlert(getErrorMessage(err))
      }
      setRefreshLoading(false)
    }
  }

  const inputHandler = e => {
    const name = e.target.name
    const value = e.target.value

    setFormData(prev => {
      return { ...prev, [name]: value }
    })

    // Also set the form value for proper validation
    setValue(name, value)

    // Clear errors immediately when user starts typing
    if (errors[name]) {
      clearErrors(name)
    }

    // Clear all errors if both fields have values
    if (selectValue?.value === 'Doctor') {
      if (name === 'doctorName' && value && form_data.doctorEmail) {
        clearErrors(['doctorName', 'doctorEmail'])
      } else if (name === 'doctorEmail' && value && form_data.doctorName) {
        clearErrors(['doctorName', 'doctorEmail'])
      }
    } else if (selectValue?.value === 'Patient') {
      if (name === 'patientName' && value && form_data.patientEmail) {
        clearErrors(['patientName', 'patientEmail'])
      } else if (name === 'patientEmail' && value && form_data.patientName) {
        clearErrors(['patientName', 'patientEmail'])
      }
    }

    // Trigger validation for the specific field with a small delay to ensure state is updated
    setTimeout(() => {
      trigger(name)
    }, 100)
  }

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

  // ]

  // ** Function to handle date filter
  const handleDateFilter = (range, isSelect) => {
    console.log('🔍 handleDateFilter called with range:', range, 'isSelect:', isSelect)
    setPicker(range)
    
    if (!range || (Array.isArray(range) && range.length === 0)) {
      console.log('⚠️ Empty range, clearing StudyDate')
      setSearchData(prev => {
        return { ...prev, StudyDate: '' }
      })
      setcrossStudyDate(false)
      setIsSelectingStudyDateRange(false)
      return
    }
    
    // Handle both single date and date range
    const dates = Array.isArray(range) ? range : [range]
    const format = dates.map(date => {
      return moment(date).format('YYYYMMDD')
    })
    
    if (format.length >= 2) {
      // Date range - both dates selected
      const studyDateValue = `${format[0]}-${format[1]}`
      console.log('✅ Setting StudyDate range:', studyDateValue)
      setSearchData(prev => {
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
        setSearchData(prev => {
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
    console.log('🔍 handlePatientDOBDateFilter called with range:', range, 'isSelect:', isSelect)
    
    if (!range || (Array.isArray(range) && range.length === 0)) {
      console.log('⚠️ Empty range, clearing PatientBirthDate')
      setPatientDOBPickerPicker('')
      setSearchData(prev => {
        return { ...prev, PatientBirthDate: '' }
      })
      setcrossPatientDOBDate(false)
      setIsSelectingPatientDOBRange(true)
      return
    }
    
    // Handle both single date and date range
    const dates = Array.isArray(range) ? range : [range]
    const format = dates.map(date => {
      return moment(date).format('YYYYMMDD')
    })
    
    if (format.length >= 2) {
      // Date range - both dates selected
      const patientBirthDateValue = `${format[0]}-${format[1]}`
      console.log('✅ Setting PatientBirthDate range:', patientBirthDateValue)
      setPatientDOBPickerPicker(range) // Update picker only after both dates selected
      setSearchData(prev => {
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
        console.log('✅ Setting PatientBirthDate single date:', patientBirthDateValue)
        setPatientDOBPickerPicker(range)
        setSearchData(prev => {
          return { ...prev, PatientBirthDate: patientBirthDateValue }
        })
        if (!crossPatientDOBDate) {
          setcrossPatientDOBDate(true)
        }
        setIsSelectingPatientDOBRange(true) // Keep true for next selection
      }
    }
  }

  const checkSelectedOption = value => {
    if (value.value === 'customdate') {
      // Set state to show Flatpickr instead of dropdown
      setSelectedOption(value)
      setIsSelectingStudyDateRange(true)
      showFlatpicker(false)
      // The useEffect hook will handle opening the calendar after render
    } else if (value.value.length) {
      setIsSelectingStudyDateRange(false)
      handleDateFilter(value.value, true)
      setSelectedOption(value)
    } else {
      setIsSelectingStudyDateRange(false)
      handleDateFilter([value.value, value.value], true)
      setSelectedOption(value)
    }
  }

  const checkSelectedModalities = value => {
    setCurrentPage(0)
    if (value.length === 0) {
      setSearchData(prev => {
        return { ...prev, Modality: null }
      })
      setSelectedModalities(null)
      if (selectedDropDownFilter?.modality?.length !== 0) {
        setSelectedDropDownFilter(null)
      }
    } else {
      const modalityArray = value.map(modalityList => modalityList.value)
      setSearchData(prev => {
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
    setFilter(prev => !prev)
  }
  const checkSelectedStatus = value => {
    setCurrentPage(0)
    if (value.length === 0) {
      setSearchData(prev => {
        return { ...prev, status: null }
      })
      setSelectedstatus(null)
      if (selectedDropDownFilter?.studyStatus?.length !== 0) {
        setSelectedDropDownFilter(null)
      }
    } else {
      const studyStatusArray = value.map(statusList => statusList.value)
      setSearchData(prev => {
        return { ...prev, status: studyStatusArray }
      })
      setSelectedstatus(value)
      if (selectedDropDownFilter?.studyStatus?.length !== studyStatusArray?.length) {
        setSelectedDropDownFilter(null)
      }
    }
    if (value.length) {
      setcrossStatus(true)
    } else {
      setcrossStatus(false)
    }
    setFilter(prev => !prev)
  }

  const checkSelectedClinics = value => {
    setCurrentPage(0)
    if (value.length === 0) {
      setSearchData(prev => {
        return { ...prev, clinicNames: null }
      })
      setSelectedClinics([])
      if (selectedDropDownFilter?.clinicNames?.length !== 0) {
        setSelectedDropDownFilter(null)
      }
    } else {
      setSearchData(prev => {
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
    setFilter(prev => !prev)
  }
  const checkSelectedPhysicians = value => {
    setCurrentPage(0)
    console.log('first checkSelectedPhysicians', value)
    if (value.length === 0) {
      setSearchData(prev => {
        return { ...prev, Physicians: null }
      })
      setSelectedPhysicians([])
      if (selectedDropDownFilter?.Physicians?.length !== 0) {
        setSelectedDropDownFilter(null)
      }
    } else {
      setSearchData(prev => {
        return { ...prev, Physicians: value }
      })
      console.log('searchData', searchData)
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
    setFilter(prev => !prev)
  }

  const updateFilterData = value => {
    const obj = {}
    if (
      value?.filterfor === 'Physician' ||
      value?.Physicians?.length === 0 ||
      typeof value === 'undefined'
    ) {
      obj.Physicians = null
      setSelectedPhysicians(null)
      setcrossPhysician(false)
      setPatientValue('Physicians', null)
    } else if (value?.Physicians?.length > 0) {
      obj.Physicians = value.Physicians
      setcrossPhysician(true)
      setPatientValue('Physicians', value.Physicians)
      setSelectedPhysicians(value.Physicians)
    }
    if (value?.clinicNames?.length === 0 || typeof value === 'undefined') {
      obj.clinicNames = null
      setSelectedClinics(null)
      setcrossClinic(false)
      setPatientValue('clinicNames', null)
      setSelectedClinics(null)
    } else if (value?.clinicNames?.length > 0) {
      obj.clinicNames = value.clinicNames
      setcrossClinic(true)
      setPatientValue('clinicNames', value.clinicNames)
      setSelectedClinics(value.clinicNames)
    }
    setSearchData(prev => {
      return { ...prev, ...obj }
    })
  }

  const sendDicomHandler = () => {
    if (!selectedProducts || selectedProducts?.length <= 0) {
      showErrorAlert(' Please select at least one study to send!')
    } else {
      const options = {}
      modalities.forEach(mod => {
        options[mod] = mod
      })
      
      MySwal.fire({
        title: 'Select Destination Node',
        input: 'select',
        inputOptions: options,
        inputPlaceholder: 'Select a DICOM node',
        showCancelButton: true,
        confirmButtonText: 'Send',
        inputValidator: (value) => {
          return new Promise((resolve) => {
            if (value !== '') {
              resolve()
            } else {
              resolve('You need to select a node')
            }
          })
        },
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger ml-1',
        },
        buttonsStyling: false,
      }).then((result) => {
        if (result.isConfirmed) {
          const modality = result.value
          showLoadingAlert()
          axios
            .post(`${process.env.REACT_APP_API_URL}/orthanc/modalities`, {
              modality,
              resources: selectedProducts.map(obj => obj.ID),
            })
            .then(response => {
              hideLoadingAlert()
              showSuccessAlert('Queued Successfully!')
            })
            .catch(err => {
              // Only handle response errors, let global interceptor handle network errors
              if (err && err.response) {
                showErrorAlert(getErrorMessage(err))
              }
            })
        }
      })
    }
  }

  const actionDelete = row => {
    return showConfirm({
      title: 'Are you sure to delete this study?',
      text: 'This action is irreversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger ml-1',
      },
      buttonsStyling: false,
      allowOutsideClick: () => !showLoadingAlert(),
    }).then(async function (result) {
      if (result.value) {
        try {
          showLoadingAlert()

          await axios.delete(`${process.env.REACT_APP_API_URL}/explorer/studies/${row?._id}`)
          hideLoadingAlert()
          setRefreshLoading(false)
          removeTableRow(row?._id)
          showSuccessAlert('Study Deleted Successfully!.')
        } catch (err) {
          hideLoadingAlert()
          setRefreshLoading(false)
          // Only handle response errors, let global interceptor handle network errors
          if (err && err.response) {
            showErrorAlert(getErrorMessage(err))
          }
        }
      }
    })
  }

  const serializeErrForLog = err => {
    if (!err) return null
    try {
      return {
        message: err?.message,
        name: err?.name,
        code: err?.code,
        isNetworkError: err?.isNetworkError,
        responseStatus: err?.response?.status,
        responseStatusText: err?.response?.statusText,
        configUrl: err?.config?.url,
        configMethod: err?.config?.method,
        configTimeout: err?.config?.timeout,
        stack: err?.stack ? String(err.stack).split('\n').slice(0, 6).join(' | ') : undefined,
      }
    } catch (e) {
      return { message: String(err) }
    }
  }

  const studyDownloadHanlderNew = async studyId => {
    const LOG = '[StudyDownload]'
    const flowStart = Date.now()
    const userId = userData?._id
    if (!userId) {
      console.warn(LOG, 'No userId – session expired')
      showErrorAlert('Session expired. Please log in again.')
      return
    }
    const orthancStudyId = studyId != null ? String(studyId).trim() : ''
    if (!orthancStudyId) {
      console.warn(LOG, 'Missing study ID')
      showErrorAlert('Study is not available for download.')
      return
    }
    console.log(LOG, 'Start', { orthancStudyId, userId: userId?.toString?.()?.slice(-6), ts: flowStart })

    const eventName = `studyDownloadReady_${userId}`
    socket.off(eventName)

    showBackgroundLoader('Preparing study download...')

    let jobId = null
    let timeoutId = null
    let resolved = false

    const finish = () => {
      if (resolved) return
      resolved = true
      hideBackgroundLoader()
      socket.off(eventName, onReady)
      if (timeoutId) clearTimeout(timeoutId)
    }

    const showDownloadError = (errOrMessage, fallback = 'Study download failed. Please try again.') => {
      const msg = typeof errOrMessage === 'string' ? errOrMessage : getErrorMessage(errOrMessage, fallback)
      showErrorAlert(msg)
    }

    const onReady = async payloadStr => {
      const onReadyStart = Date.now()
      try {
        let payload
        try {
          payload = typeof payloadStr === 'string' ? JSON.parse(payloadStr) : payloadStr
        } catch (parseErr) {
          console.error(LOG, 'Socket payload parse error', { raw: String(payloadStr).slice(0, 200), error: parseErr?.message })
          finish()
          showDownloadError('Invalid download notification.')
          return
        }
        console.log(LOG, 'Socket event', { jobId: payload?.jobId, success: payload?.success, message: payload?.message, elapsed: Date.now() - flowStart })
        if (payload.jobId !== jobId) {
          console.log(LOG, 'Ignore socket event – jobId mismatch', { expected: jobId, got: payload?.jobId })
          return
        }
        finish()
        if (!payload.success) {
          console.warn(LOG, 'Prepare failed (socket)', { message: payload?.message, jobId: payload?.jobId })
          showDownloadError(payload.message || 'Failed to prepare study download.')
          return
        }
        if (!payload.downloadToken) {
          console.warn(LOG, 'Socket success but no downloadToken – fallback to fetch', { jobId: payload.jobId })
          showDownloadError('Download link not ready. Please try again.')
          return
        }
        const downloadUrl = `${process.env.REACT_APP_API_URL}/orthanc/study/download-by-token/${payload.jobId}?token=${encodeURIComponent(payload.downloadToken)}`
        console.log(LOG, 'Opening download URL (browser handles file)', { jobId: payload.jobId, totalElapsed: Date.now() - flowStart })
        const link = document.createElement('a')
        link.setAttribute('href', downloadUrl)
        link.setAttribute('download', payload.filename || `study_${orthancStudyId}.zip`)
        link.setAttribute('target', '_blank')
        link.setAttribute('rel', 'noopener noreferrer')
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        showToastSuccess('Study download started. If the file does not open, check your browser downloads.')
      } catch (err) {
        const errDetail = serializeErrForLog(err)
        console.error(LOG, 'Download error (in-depth)', { ...errDetail, elapsed: Date.now() - onReadyStart })
        if (err?.stack) console.error(LOG, 'Download error stack', err.stack)
        showDownloadError(err)
      }
    }

    try {
      const prepareUrl = `${process.env.REACT_APP_API_URL}/orthanc/study/${orthancStudyId}/download/prepare`
      console.log(LOG, 'POST prepare', { orthancStudyId, url: prepareUrl })
      const prepareStart = Date.now()
      const { data } = await axios.post(
        prepareUrl,
        {},
        { timeout: 30000, __skipGlobalNetworkAlert: true }
      )
      const prepareMs = Date.now() - prepareStart
      jobId = data?.jobId
      console.log(LOG, 'POST prepare response', { jobId: jobId ?? null, prepareMs, fullResponse: data })
      if (!jobId) {
        finish()
        console.warn(LOG, 'Prepare returned no jobId', { data })
        showDownloadError('Server did not start download. Please try again.')
        return
      }
      timeoutId = setTimeout(() => {
        finish()
        console.warn(LOG, 'Timeout waiting for socket', { jobId, elapsed: Date.now() - flowStart })
        showDownloadError('Study download is taking too long. Please try again.')
      }, 10 * 60 * 1000)
      socket.once(eventName, onReady)
    } catch (error) {
      finish()
      const errDetail = serializeErrForLog(error)
      const responseDataPreview = error?.response?.data != null
        ? (typeof error.response.data === 'string' ? error.response.data.slice(0, 300) : JSON.stringify(error.response.data).slice(0, 300))
        : undefined
      console.error(LOG, 'POST prepare error (in-depth)', { ...errDetail, responseDataPreview, responseHeaders: error?.response?.headers ? { 'content-type': error.response.headers['content-type'] } : undefined })
      if (error?.stack) console.error(LOG, 'POST prepare error stack', error.stack)
      showDownloadError(error)
    }
  }

  const studyDownloadHanlder = async studyId => {
    showLoadingAlert() // Show loading indicator

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

  const Inputemail = selectedRows => {
    setSelectedRow(selectedRows)
    setSelectValue({ value: 'Doctor', label: 'Doctor' })
    handleModal()
  }

  const handleStudyAssignment = study => {
    if (!study) {
      console.error('Study data is null/undefined for assignment')
      showErrorAlert('Invalid study data. Please try again.')
      return
    }
    if (!study._id) {
      console.error('Study missing _id for assignment:', study)
      showErrorAlert('Invalid study data. Please try again.')
      return
    }
    setAssigningStudy(study)
    setAssignToDocModelToggler(prev => !prev)
  }

  const handleSharedStudy = study => {
    setEmailIdOfSharedStudy(prev => study)
    setSharedStudyToggler(prev => !prev)
    // Reset form data and clear errors when opening share modal
    setFormData(prev => ({
      ...prev,
      doctorName: '',
      doctorEmail: '',
      patientName: '',
      patientEmail: '',
    }))
    clearErrors()
  }

  const selectedStudy = row => {
    if (row.ID) {
      Inputemail(row._id)
    }
    setchangeOption(prev => !prev)
  }

  const handleStudyReportUpload = row => {
    if (row.ID) {
      setSelectRowForUploadStudy(row._id)
    }
    setOpenStudyUpload(true)
  }

  const handleFilter = e => {
    setSearchData(prev => {
      return {
        ...prev,
        [e.target.id]: e.target.id === 'Modality' ? e.target.value.toUpperCase() : e.target.value,
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
    setCurrentPage(0)
  }

  const handleClearFilter = e => {
    setSearchData(prev => {
      return { ...prev, [e]: '' }
    })
  }

  const changeDateFormat = date => {
    if (date && date !== '-') {
      const addSpace = `${date.substring(0, 17)} ${date.substring(17, date.length)}`
      const tempDate = moment(addSpace, 'YYYY-MM-DD HH:mm:ss').valueOf()
      return tempDate
    } else {
      return 0
    }
  }

  const changeDateFormatinDOB = date => {
    if (date && date !== '-') {
      const addSpace = `${date.substring(0, date.length - 7)}${date.substring(
        date.length - 5,
        date.length
      )}`
      const tempDate = moment(addSpace).format('YYYY-MM-DD HH:mm:ss')
      return tempDate
    } else {
      return 0
    }
  }

  const studyDateSort = (rowA, rowB) => {
    const a = changeDateFormat(rowA['startTimeStamp'])
    const b = changeDateFormat(rowB['startTimeStamp'])
    if (a > b) {
      return 1
    }
    if (b > a) {
      return -1
    }
    return 0
  }

  const studyDateSortDOB = (rowA, rowB) => {
    const a = changeDateFormatinDOB(rowA['PatientDOB'])
    const b = changeDateFormatinDOB(rowB['PatientDOB'])
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

  const activityLogHandler = async row => {
    // Updated by JCasp developer (Mehul) at 06-02-2024 to get activity of study by unique identification.
    await axios
      .get(`${process.env.REACT_APP_API_URL}/report/activityLog/${row._id}`)
      .then(res => {
        const activityLogArray = res.data.activityData.map(log => {
          return {
            ...log,
            meta: moment(log.meta, 'YYYY-MM-DD hh:mm:ss').format(
              userData?.dateFormats?.dateTimeFormat
            ),
          }
        })
        setActivityDataLog(activityLogArray)
        setOpenActivity(true)
      })
      .catch(err => {
        // Only handle response errors, let global interceptor handle network errors
        if (err && err.response) {
          console.log('err', err)
        }
      })
  }

  const updatePriorityHandler = async () => {
    if (priorityValue) {
      await axios
        .patch(`${process.env.REACT_APP_API_URL}/explorer/studies/updateStudyPriority`, {
          id: rowId,
          priority: priorityValue,
          activity: 'priority',
        })
        .then(res => {
          if (res.status) {
            showSuccessAlert('Priority updated successfully!')
            updateTableRow(rowId, { priority: priorityValue })
            setPriorityValue('')
            setOpenStatus(false)
          }
        })
        .catch(err => {
          // Only handle response errors, let global interceptor handle network errors
          if (err && err.response) {
            showErrorAlert(getErrorMessage(err))
          }
        })
    }
    if (statusValue !== '') {
      await axios
        .patch(
          `${process.env.REACT_APP_API_URL}/explorer/studies/updateStudyStatus`,
          {
            id: rowId,
            status: statusValue,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
        .then(res => {
          if (res?.status === 200 || res?.data) {
            showSuccessAlert('Status updated successfully!')
            updateTableRow(rowId, { status: statusValue })
            setOpenStatus(false)
          }
        })
        .catch(err => {
          if (err?.response) showErrorAlert(getErrorMessage(err))
        })
    }
  }

  const createReportHandler = async id => {
    if (handleModificationLock(id)) return
    await axios
      .get(`${process.env.REACT_APP_API_URL}/report/check/${id.ID}/lock`)
      .then(res => {
        if (res.data.message) {
        return showInfoAlert(
          typeof res.data.message === 'string' ? res.data.message : 'Study is locked or not available.',
          'Information!'
        )
        } else {
          if (id.status !== STUDYSTATUS.Unread) {
            window.open(`/report/preview?mode=preview&id=${id?._id}`, '_blank')
          } else {
            window.open(`/report/create?mode=create&id=${id?._id}`, '_blank')
          }
        }
      })
      .catch(err => {
        const msg = err?.response?.data?.message || err?.response?.data?.error
        if (err?.response?.status === 423 || (msg && String(msg).toLowerCase().includes('modification'))) {
          return showInfoAlert(STUDY_MODIFICATION_RUNNING_MSG)
        }
        return showInfoAlert(
          typeof msg === 'string' ? msg : 'Something went wrong',
          'Information!'
        )
      })
  }

  const handlePrintReport = async id => {
    showLoadingAlert()
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/report/download/${id}`, {
        responseType: 'blob', // Important: Tell axios to expect binary data
        headers: {
          Accept: 'application/pdf',
        },
      })

      // Create blob URL for PDF viewer
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setPdfBlobData(url)
      hideLoadingAlert()
      setOpenPrintStudy(true)
    } catch (err) {
      console.error('PDF download error:', err)
      hideLoadingAlert()
      const status = err?.response?.status
      const msg = err?.response?.data?.message || err?.response?.data?.error
      if (status === 423 || (msg && String(msg).toLowerCase().includes('modification'))) {
        showInfoAlert(typeof msg === 'string' ? msg : STUDY_MODIFICATION_RUNNING_MSG, 'Modification in progress')
      } else {
        showErrorAlert(getErrorMessage(err) || 'Failed to load PDF report')
      }
    }
  }

  const STUDY_MODIFICATION_RUNNING_MSG =
    'Study modification is running. Please wait until the modification is complete.'

  const getRowStudyId = row => {
    if (!row) return ''
    const v = (row?.ID != null && String(row.ID).trim() !== '') ? String(row.ID).trim()
      : (row?.id != null && String(row.id).trim() !== '') ? String(row.id).trim()
      : (row?._id != null && String(row._id).trim() !== '') ? String(row._id).trim()
      : ''
    return v
  }

  const isRowUnderModification = row => {
    const currentId = studyIdUnderModificationRef.current ?? studyIdUnderModification
    if (!row || currentId == null || String(currentId).trim() === '') return false
    const id = String(currentId).trim()
    return getRowStudyId(row) === id
  }

  const handleModificationLock = row => {
    if (!row) return false
    if (isRowUnderModification(row)) {
      showInfoAlert(STUDY_MODIFICATION_RUNNING_MSG, 'Modification in progress')
      return true
    }
    if (row.orthancPatientId == null || String(row.orthancPatientId || '').trim() === '') {
      return false
    }
    try {
      const lockData = getLockPatientIdsDm()
      if (!lockData || typeof lockData !== 'object' || Array.isArray(lockData)) {
        return false
      }
      if (lockData[row.orthancPatientId]) {
        showInfoAlert(STUDY_MODIFICATION_RUNNING_MSG)
        return true
      }
    } catch (err) {
      console.warn('Error in handleModificationLock:', err)
    }
    return false
  }

  useEffect(() => {
    const fetchTableColumns = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/user/list-columns/study-list`)
        setTableListData(res?.data?.result)
      } catch (err) {
        if (err && err.response) {
          showErrorAlert(getErrorMessage(err))
        }
      }
    }

    fetchTableColumns()
  }, [])

  const previewReportHandler = id => {
    // For finalized reports, always use preview mode to show actual finalized content
    // For other statuses, use create mode for editing
    const mode = id.status === STUDYSTATUS.Final ? 'preview' : 'create'
    window.open(
      `/report/${mode === 'preview' ? 'preview' : 'create'}?mode=${mode}&id=${id?._id}`,
      '_blank'
    )
  }

  const actionUnlock = async row => {
    if (row.lock !== true) {
      return showInfoAlert('Study already unlocked!', 'Information!')
    }
    if (row.status !== STUDYSTATUS.Preliminary) {
      return showInfoAlert(
        `Study status must be ${STUDYSTATUS.Preliminary}!`,
        'Information!'
      )
    }
    const result_2 = await showConfirm({
      title: 'Are you sure to unlock this study?',
      text: 'This action is irreversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, unlock it!',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger ml-1',
      },
      buttonsStyling: false,
      allowOutsideClick: () => !showLoadingAlert(),
    })
    if (result_2.value) {
      try {
        showLoadingAlert()
        setRefreshLoading(true)
        await axios.put(`${process.env.REACT_APP_API_URL}/explorer/studies/unlockstudy/${row?._id}`)
        hideLoadingAlert()
        setRefreshLoading(false)
        if (row?.orthancPatientId != null) {
          setStudyLockData(prev => ({ ...prev, [row.orthancPatientId]: false }))
        }
        showSuccessAlert('Study Unlocked Successfully!.')
      } catch (err) {
        hideLoadingAlert()
        setRefreshLoading(false)
        if (err && err.response) {
          showErrorAlert(getErrorMessage(err))
        }
      }
    }
  }

  // ** Table Columns
  const columns = [
    {
      name: 'Lock',
      sortable: true,
      reorder: true,

      id: 'lock',
      cell: row => {
        const isLocked =
          row?.orthancPatientId != null && studyLockData[row.orthancPatientId] !== undefined
            ? studyLockData[row.orthancPatientId]
            : row['lock']
        return isLocked ? (
          <>
            <Lock
              size={20}
              id={`lockicon-${row._id}`}
              className="mr-45"
              onClick={() => {
                if (userData.role === ROLES.ClinicAdmin) {
                  actionUnlock(row)
                }
              }}
            />
            {}
          </>
        ) : (
          <Unlock size={20} className="mr-45" />
        )
      },
      minWidth: '30px',
    },
    {
      name: 'Patient Name',
      sortable: true,
      reorder: true,

      id: 'PatientName',
      reorder: true,
      cell: row => (row && row['PatientName'] ? row['PatientName'] : '-'),
      minWidth: '145px',
    },
    {
      name: 'Patient ID',
      sortable: true,
      reorder: true,

      id: 'PatientID',
      cell: row => (row && row['PatientID'] ? row['PatientID'] : '-'),
      minWidth: '130px',
    },
    {
      name: 'Accession',
      sortable: true,
      reorder: true,

      id: 'AccessionNumber',
      cell: row => (row && row['AccessionNumber'] ? row['AccessionNumber'] : '-'),
      minWidth: '130px',
    },
    {
      name: 'Study Date',
      sortable: true,
      reorder: true,

      id: 'startTimeStamp',
      cell: row =>
        row && row['startTimeStamp']
          ? moment(row['startTimeStamp']).format(
              userData?.dateFormats?.dateTimeFormat || 'MM/DD/YYYY hh:mmA'
            )
          : '-',
      sortType: 'datetime',
      minWidth: '165px',
      sortFunction: studyDateSort,
    },
    {
      name: 'Modality',
      sortable: false,
      reorder: true,

      id: 'Modality',
      cell: row => (row && row['Modality'] ? row['Modality'] : '-'),
      minWidth: '115px',
    },
    {
      name: 'Patient Birth Date',
      sortable: true,
      reorder: true,

      id: 'PatientDOB',

      cell: row =>
        row && row['PatientDOB'] && row['PatientDOB'] !== '-'
          ? moment(row['PatientDOB']).format(userData?.dateFormats?.dateFormat || 'MM/DD/YYYY')
          : '-',
      minWidth: '185px',
      sortType: 'datetime',
      sortFunction: studyDateSortDOB,
    },
    {
      name: 'Notes',
      sortable: false,
      reorder: true,
      id: 'notes',
      cell: row => {
        // Get notes count from either notesCount field or notes array length
        // Backend sends notesCount as a number, but we also check notes array for compatibility
        const notesCount = row?.notesCount !== undefined && row.notesCount !== null
          ? Number(row.notesCount)
          : (Array.isArray(row?.notes) ? row.notes.length : 0);
        
        // Material-UI Badge automatically hides when badgeContent is 0
        // So we pass the actual count, and it will show when > 0
        return (
          <Badge
            badgeContent={notesCount || 0}
            color="primary"
            style={{ 
              cursor: 'pointer', 
              zIndex: 0
            }}
            onClick={async () => {
              if (row && row.ID) {
                // Set study ID and open modal - notes will be fetched by useEffect
                setStudyNotes({
                  id: row.ID,
                  notes: [], // Will be populated by useEffect
                })
                setOpenNotes(true)
              }
            }}
          >
            <Book size={20} id="notes" className="mr-45" color={'blue'} />
          </Badge>
        );
      },
      minWidth: '70px',
    },
    {
      name: 'Status',
      sortable: true,
      reorder: true,
      id: 'status',
      cell: row =>
        row && row['status'] === STUDYSTATUS.Unread ? (
          <div
            className="worklist-status"
            style={{ background: statusColor?.completed || statusColors?.completed }}
          >
            <span>{STUDYSTATUS.Unread}</span>
          </div>
        ) : row['status'] === STUDYSTATUS.Preliminary ? (
          <div
            className="worklist-status"
            style={{ background: statusColor?.preliminary || statusColors?.preliminary }}
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
      sortFunction: genderSort,
    },
    {
      name: 'Sex',
      sortable: true,
      reorder: true,

      id: 'PatientSex',
      cell: row =>
        row && row['PatientSex'] === 'M' ? (
          <img src={maleIcon} width={25} alt="Player" />
        ) : row['PatientSex'] === 'F' ? (
          <img src={femaleIcon} width={20} alt="Player" />
        ) : row['PatientSex'] === 'O' ? (
          <img src={otherGenderIcon} width={28} alt="Player" />
        ) : (
          '-'
        ),
      minWidth: '70px',
      sortFunction: genderSort,
    },
    {
      name: 'Description',
      sortable: true,
      reorder: true,

      id: 'Description',
      cell: row => (row && row['Description'] ? row['Description'] : '-'),
      minWidth: '200px',
    },
    {
      name: 'Shared',
      sortable: true,
      reorder: true,

      id: 'sharedCount',
      selector: row => (row && row['sharedCount'] ? row['sharedCount'].length : '-'),
      minWidth: '100px',
      cell: row => {
        const uniqueId = `sharedStudy-${row._id}`
        return (
          <>
            <button
              type="button"
              id={uniqueId}
              style={{
                backgroundColor: 'none',
                background: 'none',
                color: 'inherit',
                borderColor: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={() => {
                if (row && row['sharedCount']) {
                  handleSharedStudy(row.sharedCount)
                }
              }}
            >
              {row && row['sharedCount'] ? row['sharedCount'].length : '-'}
            </button>
            <UncontrolledTooltip
              target={uniqueId}
              className="tooltip-react-strap"
              placement="right"
            >
              Click to see email Id
            </UncontrolledTooltip>
          </>
        )
      },
    },
    {
      name: '#Series',
      sortable: false,
      reorder: true,

      id: 'SeriesNumber',
      cell: row => (row && row['SeriesNumber'] ? row['SeriesNumber'] : '-'),
      minWidth: '100px',
    },
    {
      name: '#Images',
      sortable: false,
      reorder: true,

      id: 'ImagesNumber',
      cell: row => (row && row['ImagesNumber'] ? row['ImagesNumber'] : '-'),
      minWidth: '100px',
    },
    {
      name: 'Ref. Physician',
      sortable: true,
      reorder: true,

      id: 'referPhysician',
      cell: row => (row && row['referPhysician'] ? row['referPhysician'] : '-'),
      minWidth: '150px',
    },
    {
      name: 'Approved by',
      sortable: false,
      reorder: true,

      id: 'approvedBy',
      cell: row => (row && row['approvedBy'] ? row['approvedBy'] : '-'),
      minWidth: '150px',
    },

    {
      name: 'Actions',
      sortable: false,
      reorder: true,

      allowOverflow: true,
      center: true,
      id: 'Actions',
      style: {},
      minWidth: '200px',
      cell: row => {
        if (!row || !row._id || !row.StudyInstanceUID) {
          return <div>-</div>
        }
        return (
          <div className="d-flex align-items-center align-self-center">
            <a
              href={`${process.env.REACT_APP_VIEWER_URL}/viewer?StudyInstanceUIDs=${row.StudyInstanceUID}&accessToken=${localStorage.getItem('accessToken')?.replace(/"/g, '')}&dateFormat=${userData?.dateFormats?.dateFormat || 'MM/DD/YYYY'}&id=${row._id}&mode=${row.status === STUDYSTATUS.Unread ? 'create' : 'preview'}`}
              style={{ color: 'inherit' }}
              target={JSON.parse(localStorage.getItem('userData'))?.viewerPreference || '_self'}
              onClick={e => {
                if (handleModificationLock(row)) {
                  e.preventDefault()
                  return
                }
                setUpdateState(prev => !prev)
              }}
            >
              <Eye size={15} id="view" className="ml-50" style={{ cursor: 'pointer' }} />
            </a>
            <UncontrolledTooltip target="view" className="tooltip-react-strap" placement="right">
              Click to view study
            </UncontrolledTooltip>

            <span
              id={`download-${row.ID}`}
              style={{ display: 'inline-flex', alignItems: 'center' }}
            >
              <Download
                size={15}
                className="ml-50"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  if (handleModificationLock(row)) return
                  setUpdateState(prev => !prev)
                  studyDownloadHanlderNew(row.ID)
                }}
              />
            </span>

            <UncontrolledTooltip
              target={`download-${row.ID}`}
              placement="left"
              container="body"
              delay={{ show: 100, hide: 0 }}
              className="tooltip-react-strap custom-tooltip"
            >
              Download study
            </UncontrolledTooltip>

            {}
            {(userData.role === ROLES.ClinicAdmin ||
              userData.role === ROLES.RadiologistUser ||
              userData.role === ROLES.TechnicianUser ||
              (userData.role === ROLES.ClinicUser && row.allow_edit === true)) &&
              (userData.role !== ROLES.TechnicianUser ||
                (userData.role === ROLES.TechnicianUser &&
                  row.status !== STUDYSTATUS.Preliminary &&
                  row.status !== STUDYSTATUS.Final)) && (
                <>
                  <Edit2
                    size={15}
                    id="editStudy"
                    className="ml-50"
                    style={{
                      cursor: isRowUnderModification(row) ? 'not-allowed' : 'pointer',
                      opacity: isRowUnderModification(row) ? 0.5 : 1,
                    }}
                    onClick={e => {
                      const studyIdForEdit = getRowStudyId(row)
                      const currentUnderMod = studyIdUnderModificationRef.current ?? studyIdUnderModification
                      if (studyIdForEdit && String(currentUnderMod || '').trim() === studyIdForEdit) {
                        e.preventDefault()
                        e.stopPropagation()
                        showInfoAlert(STUDY_MODIFICATION_RUNNING_MSG, 'Modification in progress')
                        return
                      }
                      if (handleModificationLock(row)) return
                      if (!studyIdForEdit) {
                        showErrorAlert('Cannot edit: study identifier is missing. Please refresh the list and try again.')
                        return
                      }
                      editingStudyIdRef.current = studyIdForEdit
                      setOpenStudyEdit(true)

                      const rawDob = row?.PatientBirthDate || row?.patient?.PatientBirthDate
                      const rawStartTimeStamp = row?.startTimeStamp // Adjust based on where your data comes from

                      const formattedDob = moment(rawDob).isValid()
                        ? moment(rawDob).format(userData?.dateFormats?.dateFormat || 'MM/DD/YYYY') // Convert to JavaScript Date object
                        : null // Set to null for invalid dates

                      const formattedStartTimeStamp = moment(rawStartTimeStamp).isValid()
                        ? moment(rawStartTimeStamp).format(
                            userData?.dateFormats?.dateTimeFormat || 'MM/DD/YYYY hh:mmA'
                          ) // Convert to JavaScript Date object
                        : null // Set to null for invalid dates

                      console.log({ rawStartTimeStamp, formattedStartTimeStamp })

                      const editData = {
                        newName: row?.PatientName || row?.patient?.PatientName || '',
                        patientId: row?.PatientID || row?.patient?.PatientID || '',
                        dob: formattedDob,
                        sex: ['M', 'F', 'O'].includes(row?.PatientSex || row?.patient?.PatientSex)
                          ? row?.PatientSex || row?.patient?.PatientSex
                          : '',
                        referPhysician: row?.referPhysician || '',
                        startTimeStamp: formattedStartTimeStamp,
                        StudyDescription: row?.Description || '',
                        sId: studyIdForEdit,
                      }

                      setInputStudyEdit(editData)
                      resetEditForm(editData)
                      setUpdateState(prev => !prev)
                    }}
                  />
                  <UncontrolledTooltip
                    target="editStudy"
                    className="tooltip-react-strap"
                    placement="right"
                  >
                    {isRowUnderModification(row) ? 'Modification in progress' : 'Edit study'}
                  </UncontrolledTooltip>

                  <Clock
                    size={15}
                    id="activitylog"
                    className="ml-50"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      activityLogHandler(row)
                      setUpdateState(prev => !prev)
                    }}
                  />
                  <UncontrolledTooltip
                    target="activitylog"
                    className="tooltip-react-strap"
                    placement="right"
                  >
                    Activity log
                  </UncontrolledTooltip>
                </>
              )}

            {(userData.role === ROLES.ClinicAdmin || userData.role === ROLES.TechnicianUser) && (
              <>
                <Edit
                  size={15}
                  id="edit"
                  className="ml-50"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    if (handleModificationLock(row)) return
                    if (row.status === STUDYSTATUS.Final) {
                      showInfoAlert(
                        'Study is already finalized, cannot edit priority!',
                        'Info!'
                      )
                      setToolTip(!tooltip)
                    } else {
                      setOpenStatus(true)
                      setRowId(row.ID)
                      setPriorityValue(row.priority)
                    }
                    setUpdateState(prev => !prev)
                  }}
                />
                <UncontrolledTooltip
                  target="edit"
                  className="tooltip-react-strap"
                  placement="right"
                >
                  Edit status
                </UncontrolledTooltip>
              </>
            )}

            {(userData.role === ROLES.ClinicAdmin ||
              userData.role === ROLES.RadiologistUser ||
              userData.role === ROLES.TechnicianUser ||
              userData.role === ROLES.PowerUser) && (
              <>
                {row?.isFinlizedByUploadReport !== true &&
                  (userData.role === ROLES.ClinicAdmin ||
                    userData.role === ROLES.RadiologistUser ||
                    userData.role === ROLES.TechnicianUser ||
                    userData.role === ROLES.PowerUser) && (
                    <>
                      <img
                        src={reportEdit}
                        width="18"
                        id={`abc${row.ID}`}
                        height="18"
                        className="ml-50 reportEdit"
                        onClick={() => {
                          if (handleModificationLock(row)) return
                          userData.role === ROLES.RadiologistUser &&
                          row.status !== STUDYSTATUS.Final
                            ? createReportHandler(row)
                            : userData._id === row.finalRadioId
                              ? createReportHandler(row)
                              : previewReportHandler(row)
                        }}
                        style={{
                          cursor: 'pointer',
                        }}
                      />
                      <UncontrolledTooltip
                        target={`abc${row.ID}`}
                        className="tooltip-react-strap"
                        placement="right"
                      >
                        {userData.role === ROLES.RadiologistUser && row.status === STUDYSTATUS.Final
                          ? 'View/Adden Report'
                          : (userData.role === ROLES.RadiologistUser &&
                                row.status === STUDYSTATUS.Unread) ||
                              (userData.role === ROLES.RadiologistUser &&
                                row.radiologist &&
                                row.radiologist === userData._id &&
                                row.status === STUDYSTATUS.Preliminary) ||
                              (userData.role === ROLES.RadiologistUser &&
                                !(row.radiologist !== '-') &&
                                row.status === STUDYSTATUS.Ready) ||
                              (userData.role === ROLES.TechnicianUser &&
                                row.status === STUDYSTATUS.Unread) ||
                              (userData.role === ROLES.TechnicianUser &&
                                row.status === STUDYSTATUS.Ready &&
                                !(row.radiologist && row.radiologist !== '-'))
                            ? 'Create report'
                            : userData.role === ROLES.RadiologistUser &&
                                row.radiologist &&
                                row.radiologist === userData._id
                              ? 'Write report'
                              : 'View report'}
                      </UncontrolledTooltip>
                    </>
                  )}

                {row?.status === STUDYSTATUS.Final && (
                  <>
                    <FontAwesomeIcon
                      size="sm"
                      icon={faPrint}
                      id={`preview_pdf-${row.ID}`}
                      className="ml-50"
                      style={{
                        cursor: isRowUnderModification(row) ? 'not-allowed' : 'pointer',
                        opacity: isRowUnderModification(row) ? 0.5 : 1,
                      }}
                      onClick={e => {
                        const rowStudyId = getRowStudyId(row) || (row?.ID != null ? String(row.ID) : '')
                        const currentUnderMod = studyIdUnderModificationRef.current ?? studyIdUnderModification
                        if (rowStudyId && String(currentUnderMod || '').trim() === rowStudyId) {
                          e.preventDefault()
                          e.stopPropagation()
                          showInfoAlert(STUDY_MODIFICATION_RUNNING_MSG, 'Modification in progress')
                          return
                        }
                        if (handleModificationLock(row)) return
                        handlePrintReport(row.ID)
                        setUpdateState(prev => !prev)
                      }}
                    />

                    <UncontrolledTooltip
                      target={`preview_pdf-${row.ID}`}
                      className="tooltip-react-strap"
                      placement="right"
                    >
                      {isRowUnderModification(row) ? 'Modification in progress' : 'Print & Download Report'}
                    </UncontrolledTooltip>
                  </>
                )}
              </>
            )}

            {(userData.role === ROLES.PowerUser ||
              userData.role === ROLES.ClinicAdmin ||
              userData.role === ROLES.TechnicianUser) && (
              <>
                <img
                  src={assingExamBlack}
                  width="18"
                  id={`doctor`}
                  height="18"
                  className="ml-50 assingExamBlack"
                  onClick={() => {
                    if (!row) {
                      console.error('Row data is null/undefined for study assignment')
                      showErrorAlert('Invalid study data. Please refresh the page and try again.')
                      return
                    }
                    
                    if (handleModificationLock(row)) return
                    if (!row._id) {
                      console.error('Row missing _id for study assignment:', row)
                      showErrorAlert('Invalid study data. Please refresh the page and try again.')
                      return
                    }
                    handleStudyAssignment(row)
                  }}
                  style={{
                    cursor: 'pointer',
                  }}
                />
                <UncontrolledTooltip
                  target="doctor"
                  className="tooltip-react-strap"
                  placement="right"
                >
                  Assign study to referring doctor
                </UncontrolledTooltip>
              </>
            )}

            <Share2
              size={15}
              id="share"
              className="ml-50"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                selectedStudy(row)
                setUpdateState(prev => !prev)
              }}
            />
            <UncontrolledTooltip target="share" className="tooltip-react-strap" placement="right">
              Click to share study
            </UncontrolledTooltip>

            {userData.role === ROLES.TechnicianUser &&
              row.status === STUDYSTATUS.Unread &&
              row?.isFinlizedByUploadReport !== true && (
                <>
                  <Upload
                    size={15}
                    id="upload"
                    className="ml-50 mr-50"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      handleStudyReportUpload(row)
                    }}
                  />
                  <UncontrolledTooltip
                    target="upload"
                    className="tooltip-react-strap"
                    placement="right"
                  >
                    Click to upload study report
                  </UncontrolledTooltip>
                </>
              )}
            {/* Deletion of study removed for clinic admin per request */}
          </div>
        )
      },
    },
  ]

  const handleClick = e => {
    if (e.data?.StudyInstanceUID) {
      const viewer_url = `${process.env.REACT_APP_VIEWER_URL}/viewer?StudyInstanceUIDs=${e.data.StudyInstanceUID}&accessToken=${localStorage.getItem('accessToken')?.replace(/"/g, '')}&dateFormat=${userData?.dateFormats?.dateFormat || 'MM/DD/YYYY'}&id=${e.data._id}&mode=${e.data.status === STUDYSTATUS.Unread ? 'create' : 'preview'}`

      window.open(viewer_url, JSON.parse(localStorage.getItem('userData'))?.viewerPreference)
    }
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
    // Explicitly clear date fields in searchData
    setSearchData(prev => ({
      ...prev,
      StudyDate: '',
      PatientBirthDate: ''
    }))
    searchData.Modality = ''
    setSelectedModalities([])
    setSelectedClinics([])
    setSelectedPhysicians([])
    setcrossModality(false)
    setcrossClinic(false)
    setcrossPhysician(false)
    handleClearFilter('Modality')
    setcrossStatus(false)
    setSelectedstatus(null)
    handleClearFilter('status')
    searchData.StudyDescription = ''
    setcrossDescription(false)
    handleClearFilter('StudyDescription')
    showFlatpicker(() => true)
    setSelectedOption(null)
    setSearchData(prev => {
      return { ...prev, Physicians: null, clinicNames: null }
    })
    setSelectedDropDownFilter(undefined)

    // Clear URL filter parameter
    const currentParams = new URLSearchParams(location.search)
    currentParams.delete('filterId')
    const newUrl = `${location.pathname}${currentParams.toString() ? `?${currentParams.toString()}` : ''}`
    navigate(newUrl, { replace: true })

    handleSeach()
  }

  const onKeyPressed = e => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      setPicker('')
      setcrossStudyDate(false)
      handleClearFilter('StudyDate')
    }
  }

  const onPatientKeyPressed = e => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      setPatientDOBPickerPicker('')
      setcrossPatientDOBDate(false)
      handleClearFilter('PatientBirthDate')
    }
  }

  const CloseBtn = (
    <X
      className="cursor-pointer"
      size={15}
      onClick={() => {
        setSelectValue({ value: 'Doctor', label: 'Doctor' })
        clearErrors()
        handleModal()
      }}
    />
  )

  const ActivityLogCloseBtn = (
    <X
      className="cursor-pointer"
      size={15}
      onClick={() => {
        setOpenActivity(false)
      }}
    />
  )

  const PriorityModalCloseBtn = (
    <X
      className="cursor-pointer"
      size={15}
      onClick={() => {
        handlePriorityModal()
      }}
    />
  )

  const UploadStudyModalCloseBtn = (
    <X
      className="cursor-pointer"
      size={15}
      onClick={() => {
        setOpenStudyUpload(false)
      }}
    />
  )

  const editPatientModalCloseBtn = (
    <X
      className="cursor-pointer"
      size={15}
      onClick={() => {
        editingStudyIdRef.current = null
        setOpenStudyEdit(false)
      }}
    />
  )

  const noteHandler = async () => {
    if (!updateNoteStatus.status) {
      await axios
        .post(`${process.env.REACT_APP_API_URL}/explorer/studies/${studyNotes.id}/note`, {
          note:
            editorRef.current.getContent() !== ''
              ? editorRef.current.getContent()
              : '<p>No notes added.</p>',
        })
        .then(res => {
          showSuccessAlert(res.data.message)
          setStudyNotes(state => {
            return {
              id: state.id,
              notes: [...state.notes, res.data.note],
            }
          })
          setOpenNotesUpdated(res.data)
          editorRef.current.setContent('')
          setOpenNotes(false)
        })
        .catch(err => {
          // Only handle response errors, let global interceptor handle network errors
          if (err && err.response) {
            showErrorAlert(getErrorMessage(err))
          }
        })
    } else {
      const notesDetails = updateNoteStatus.value
      await axios
        .put(
          `${process.env.REACT_APP_API_URL}/explorer/studies/${notesDetails?.studyId}/note/${notesDetails?.note?.id}`,
          {
            note:
              editorRef.current.getContent() !== ''
                ? editorRef.current.getContent()
                : '<p>No notes added.</p>',
          }
        )
        .then(res => {
          showSuccessAlert(res.data.message)
          setStudyNotes(state => {
            return {
              id: state.id,
              notes: res.data.data,
            }
          })
          setUpdateNoteStatus({ status: false })
          setOpenNotesUpdated(res.data)
          editorRef.current.setContent('')
        })
        .catch(err => {
          // Only handle response errors, let global interceptor handle network errors
          if (err && err.response) {
            showErrorAlert(getErrorMessage(err))
          }
        })
    }
  }

  const handleEditNoteButtonClick = async (event, params) => {
    setUpdateNoteStatus({ status: true, value: params })
    editorRef.current.setContent(params?.note?.value)
    event.stopPropagation()
    setExpanded(false)
  }

  const CustomAccordion = styled(Accordion)({
    margin: '7px 0 7px 7px',
    '& .MuiAccordionSummary-root': {
      border: '0',
      position: 'relative',
      backgroundColor: '#7367f029',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: 5,
        backgroundColor: '#7367f0',
      },
    },
  })

  const onSort = async d => {
    setSortOrder(d.sortOrder)
    setSortField(d.sortField)

    // Build filters - unified endpoint handles OpenSearch/PostgreSQL automatically
    console.log('🔍 Raw searchData before building filters (onSort):', searchData)
    console.log('🔍 StudyDate value (onSort):', searchData.StudyDate, 'Type:', typeof searchData.StudyDate)
    console.log('🔍 PatientBirthDate value (onSort):', searchData.PatientBirthDate, 'Type:', typeof searchData.PatientBirthDate)
    
    const filerData = JSON.stringify(
      Object.keys(searchData)
        .map(key => {
          const value = searchData[key]
          console.log(`🔍 Processing filter key (onSort): ${key}, value:`, value, 'type:', typeof value)
          
          if (
            value === '' ||
            value === null ||
            value === undefined ||
            (Array.isArray(value) && value.length === 0)
          ) {
            console.log(`⏭️ Skipping empty filter (onSort): ${key}`)
            return {}
          }
          if (key === 'Physicians') {
            console.log('pphhyyssiian', value)
            return { [key]: value.map(data => data.physicianname || data._id) }
          }
          if (key === 'clinicNames') {
            return { [key]: value.map(data => data.clinicName || data._id) }
          }
          
          // Explicitly handle date filters
          if (key === 'StudyDate' || key === 'PatientBirthDate') {
            console.log(`✅ Including date filter (onSort) ${key}:`, value)
            return { [key]: value }
          }
          
          return { [key]: value }
        })
        .reduce((acc, curr) => {
          if (Object.keys(curr).length) {
            const key = Object.keys(curr)[0]
            acc[key] = curr[key]
            console.log(`✅ Added filter to accumulator (onSort): ${key} =`, curr[key])
          }
          return acc
        }, {})
    )
    
    // Debug: Log filter data to verify StudyDate and PatientBirthDate are included
    const parsedFilters = JSON.parse(filerData)
    console.log('🔍 Final filter data being sent (onSort):', parsedFilters)
    console.log('🔍 Filter keys (onSort):', Object.keys(parsedFilters))
    if (parsedFilters.StudyDate) {
      console.log('✅ StudyDate filter included (onSort):', parsedFilters.StudyDate)
    } else {
      console.warn('⚠️ StudyDate filter NOT included in filters (onSort)!')
    }
    if (parsedFilters.PatientBirthDate) {
      console.log('✅ PatientBirthDate filter included (onSort):', parsedFilters.PatientBirthDate)
    } else {
      console.warn('⚠️ PatientBirthDate filter NOT included in filters (onSort)!')
    }
    
    setCurrentPage(0)
    try {
      const studylist = await axios.get(`${process.env.REACT_APP_API_URL}/orthanc/study-list`, {
        params: {
          limit: rowsPerPage,
          since: 0,
          filters: filerData,
          sort: `${d.sortField},${d.sortOrder}`,
        },
        signal: controller.signal,
      })
      setTableData(() => studylist.data.data)
    } catch (error) {
      console.error('Study list API failed during sort:', error)
      // Handle error appropriately
    }
  }

  const MuiAccordionSummary = styled(props => (
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

  const handleAddFilter = () => {
    setAddNewFilter(true)
  }

  const handleFilterClose = () => {
    setAddNewFilter(false)
  }

  // Update URL when filter changes
  useEffect(() => {
    const currentParams = new URLSearchParams(location.search)

    if (selectedDropDownFilter && selectedDropDownFilter._id) {
      currentParams.set('filterId', selectedDropDownFilter._id)
    } else {
      currentParams.delete('filterId')
    }

    const newUrl = `${location.pathname}${currentParams.toString() ? `?${currentParams.toString()}` : ''}`
    if (newUrl !== location.pathname + location.search) {
      navigate(newUrl, { replace: true })
    }
  }, [selectedDropDownFilter, location, navigate])

  useEffect(() => {
    if (selectedDropDownFilter) {
      // Handle modality
      if (selectedDropDownFilter.modality && selectedDropDownFilter.modality.length > 0) {
        const modalityOptions = selectedDropDownFilter.modality.map(modality => {
          if (typeof modality === 'string') {
            return { value: modality, label: modality }
          }
          return {
            value: modality?.value || modality?.label || String(modality),
            label: modality?.label || modality?.value || String(modality)
          }
        })
        checkSelectedModalities(modalityOptions)
      }
      
      // Handle study status
      if (selectedDropDownFilter.studyStatus && selectedDropDownFilter.studyStatus.length > 0) {
        const statusOptions = selectedDropDownFilter.studyStatus.map(status => {
          if (typeof status === 'string') {
            return { value: status, label: status }
          }
          return {
            value: status?.value || status?.label || String(status),
            label: status?.label || status?.value || String(status)
          }
        })
        checkSelectedStatus(statusOptions)
      }
      
      // Handle clinics - prioritize clinicDetailsForDisplay for most accurate data
      const clinicData = selectedDropDownFilter.clinicDetailsForDisplay?.length > 0
        ? selectedDropDownFilter.clinicDetailsForDisplay
        : selectedDropDownFilter.clinic_names?.length > 0 && selectedDropDownFilter.clinicNames?.length > 0
          ? selectedDropDownFilter.clinicNames.map((name, index) => ({
              _id: selectedDropDownFilter.clinicNames?.[index] || `clinic-${index}`,
              name
            }))
          : selectedDropDownFilter.clinicNamesDisplay?.length > 0
            ? selectedDropDownFilter.clinicNamesDisplay.map((name, index) => ({
                _id: `clinic-${index}`,
                name
              }))
            : []
      
      if (clinicData.length > 0) {
        const clinicOptions = clinicData.map((clinic) => ({
          _id: clinic._id,
          clinicName: clinic.name,
        }))
        checkSelectedClinics(clinicOptions)
      }
      
      // Handle physicians - prioritize physicianDetailsForDisplay for most accurate data
      const physicianData = selectedDropDownFilter.physicianDetailsForDisplay?.length > 0
        ? selectedDropDownFilter.physicianDetailsForDisplay
        : selectedDropDownFilter.physicianNames?.length > 0 && selectedDropDownFilter.physicians?.length > 0
          ? selectedDropDownFilter.physicians.map((id, index) => ({
              _id: id,
              name: selectedDropDownFilter.physicianNames[index] || id
            }))
          : []
      
      if (physicianData.length > 0) {
        const physicianOptions = physicianData.map((physician) => ({
          _id: physician._id,
          physicianname: physician.name,
        }))
        checkSelectedPhysicians(physicianOptions)
      }
      
      // Handle clinic users - use users array (IDs) with clinicUserNames for display
      if (selectedDropDownFilter.users && selectedDropDownFilter.users.length > 0 && 
          selectedDropDownFilter.clinicUserNames && selectedDropDownFilter.clinicUserNames.length > 0) {
        const userOptions = selectedDropDownFilter.users.map((userId, index) => ({
          _id: userId,
          username: selectedDropDownFilter.clinicUserNames[index],
        }))
        // Note: This would be handled by updateFilterData since there's no checkSelectedUsers function
      }
    }
    
    updateFilterData(selectedDropDownFilter)
  }, [selectedDropDownFilter])

  return userRole !== ROLES.ReferringDoctor && userRole !== ROLES.Doctor ? (
    <div className={`studyListDiv ${userRole}`}>
      <FilterModal open={addNewFilter} toggle={handleFilterClose} />
      <Fragment>
        {refreshLoading ? (
          <Card className="loading-initial">
            <Spinner color="primary" />
          </Card>
        ) : (
          <Card>
            <Accordion defaultExpanded={true}>
              <CardHeader className="border-bottom">
                <div className="d-flex align-items-center">
                  <CardTitle tag="h4" className="w-100" onClick={clearSearch}>
                    Study List ({totalStudies})
                  </CardTitle>
                  <MuiAccordionSummary
                    id="panel-header-1"
                    aria-controls="panel-content-1"
                    expandIcon={<ChevronDown />}
                  ></MuiAccordionSummary>
                  {(ability.can('manage', 'filter-listings') ||
                    ability.can('view', 'filter-listings')) && (
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
                      <Button className="ml-2" color="primary" onClick={handleAddFilter}>
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
                  {(userData.role === ROLES.ClinicAdmin || userData.role === ROLES.SuperAdmin) &&
                    (refreshLoading ? (
                      <Button className="ml-2" color="primary" style={{ width: '100px' }}>
                        <Spinner color="white" size="sm" />
                      </Button>
                    ) : (
                      <Button
                        className="ml-2 hidden"
                        color="primary"
                        onClick={() => {
                          syncDBBkup()
                        }}
                      >
                        <span className="align-middle">Get Database backup</span>
                      </Button>
                    ))}
                  {(userData.role === ROLES.ClinicAdmin || userData.role === ROLES.SuperAdmin) &&
                    (refreshLoading ? (
                      <Button className="ml-2" color="primary" style={{ width: '100px' }}>
                        <Spinner color="white" size="sm" />
                      </Button>
                    ) : (
                      <Button
                        className="ml-2 hidden"
                        color="primary"
                        onClick={() => {
                          syncOrthancWithDB()
                        }}
                      >
                        <span className="align-middle">Sync orthanc</span>
                      </Button>
                    ))}

                  {(userData.role === ROLES.ClinicAdmin || userData.role === ROLES.SuperAdmin) &&
                    (refreshLoading ? (
                      <Button className="ml-2" color="primary" style={{ width: '100px' }}>
                        <Spinner color="white" size="sm" />
                      </Button>
                    ) : (
                      <Button
                        className="ml-2 hidden"
                        color="primary"
                        onClick={() => {
                          syncOrthancExamsWithDB()
                        }}
                      >
                        <span className="align-middle">Sync Exams</span>
                      </Button>
                    ))}

                  {refreshLoading ? (
                    <Button
                      className="ml-2"
                      color="primary"
                      style={{ width: '100px' }}
                      onClick={() => {
                        setRefresh(Math.random())
                      }}
                    >
                      <Spinner color="white" size="sm" />
                    </Button>
                  ) : (
                    <Button
                      className="ml-2"
                      color="primary"
                      onClick={() => {
                        setRefresh(Math.random())
                      }}
                    >
                      <span className="align-middle">Refresh</span>
                    </Button>
                  )}

                  <Button className="ml-2" color="primary send_dicom" onClick={sendDicomHandler}>
                    <span className="align-middle">Send Dicom</span>
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
                      </FormGroup>
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
                    </Col>
                    <Col lg="3" md="6">
                      <FormGroup>
                        <Label for="date">Study Date:</Label>
                        {Flatpicker ? (
                          <Select
                            styles={{
                              control: (provided, state) => ({
                                ...provided,
                                borderColor: '#D8D6DE',
                              }),
                            }}
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
                                const selectedCount = selectedDates ? selectedDates.length : 0
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
                                        console.warn('Error closing calendar:', error)
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
                              console.log('🔍 Flatpickr onChange - selectedDates:', selectedDates, 'dateStr:', dateStr)
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
                                        console.warn('Error closing calendar:', error)
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
                            maxDate: moment().toDate(), // Restrict future dates for birth date
                            onReady: (selectedDates, dateStr, instance) => {
                              // Set range mode as active
                              setIsSelectingPatientDOBRange(true)
                              patientDOBPreventClose.current = false
                            },
                            onClose: (selectedDates, dateStr, instance) => {
                              // Check if calendar closed with only one date selected (user clicked outside)
                              const selectedCount = selectedDates ? selectedDates.length : 0
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
                            console.log('🔍 Flatpickr PatientDOB onChange - selectedDates:', selectedDates, 'dateStr:', dateStr)
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
                                    if (fpInstance && !fpInstance.isOpen && patientDOBPreventClose.current) {
                                      try {
                                        fpInstance.open()
                                      } catch (error) {
                                        // Ignore errors
                                      }
                                    }
                                  })
                                  
                                  // Strategy 3: Use setTimeout (multiple attempts)
                                  setTimeout(() => {
                                    if (fpInstance && !fpInstance.isOpen && patientDOBPreventClose.current) {
                                      try {
                                        fpInstance.open()
                                      } catch (error) {
                                        // Ignore errors
                                      }
                                    }
                                  }, 0)
                                  
                                  setTimeout(() => {
                                    if (fpInstance && !fpInstance.isOpen && patientDOBPreventClose.current) {
                                      try {
                                        fpInstance.open()
                                      } catch (error) {
                                        // Ignore errors
                                      }
                                    }
                                  }, 5)
                                  
                                  setTimeout(() => {
                                    if (fpInstance && !fpInstance.isOpen && patientDOBPreventClose.current) {
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
                              setIsSelectingPatientDOBRange(true)
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
                      {ClinicNamesForFilters && ClinicNamesForFilters?.length > 0 ? (
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
                            getOptionValue={option => typeof option === 'string' ? option : (option?._id || String(option))}
                            getOptionLabel={option => {
                              if (typeof option === 'string') return option
                              return option?.clinicName || option?.name || String(option) || 'Unknown'
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
                      {
                        (PhysiciansForFilters && PhysiciansForFilters?.length > 0 ? (
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
                              getOptionValue={option => typeof option === 'string' ? option : (option?._id || String(option))}
                              getOptionLabel={option => {
                                if (typeof option === 'string') return option
                                return option?.physicianname || option?.name || option?.username || option?.clinicName || String(option) || 'Unknown'
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
                        ))}
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
                          getOptionValue={option => typeof option === 'string' ? option : (option?.value || option?._id || String(option))}
                          getOptionLabel={option => {
                            if (typeof option === 'string') return option
                            return option?.label || option?.value || String(option) || 'Unknown'
                          }}
                          className="react-select staticmodality"
                          classNamePrefix="select"
                          options={dropdownData?.studyStatus}
                          isMulti
                        />
                      </FormGroup>
                      {}
                    </Col>
                    <Col md="6" lg="6">
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
                    <Col md="6" lg="3">
                      <FormGroup>
                        <Label for="SearchResult">Search:</Label>
                        <Button
                          className="d-block"
                          color="primary"
                          onClick={handleSeach}
                          size="sm"
                          id="SearchResult"
                          style={btnStyle}
                        >
                          <Search />
                        </Button>
                      </FormGroup>
                    </Col>
                  </Row>
                  {totalFilteredStudies !== null && totalFilteredStudies !== totalStudies && (
                    <Row className="mt-1 mb-50">
                      <Col>
                        <div className="searchTotal">
                          {totalFilteredStudies} filtered from total {totalStudies} studies.
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
                  moduleName: 'study-list',
                  selectionMode: userData.role === ROLES.SuperAdmin ? null : 'checkbox',
                  selection: selectedProducts,
                  onSelectionChange: e => setSelectedProducts(e.value),
                  tableData: data,
                  visibleColumns: columns,
                  defaultCol: 'PatientName',
                  rows: rowsPerPage,
                  onRowDoubleClick: handleClick,
                  totalRecords: totalFilteredStudies,
                  first: currentPage,
                  onSort,
                  sortField,
                  sortOrder,
                  onPage: e => {
                    setCurrentPage(e.first++)
                    setRowsPerPage(prev => e.rows)
                    localStorage.setItem('studylistrow', e.rows)
                  },
                  onBlankWidth,
                  rowClassFn,
                  tableListData,
                }}
              />
            </div>
          </Card>
        )}
        {assignToDocModelToggler ? (
          <AssignToDoctorModel
            toggle={assignToDocModelToggler}
            setToggle={setAssignToDocModelToggler}
            study={assigningStudy}
          />
        ) : (
          ''
        )}
        {sharedStudyToggler ? (
          <EmailIdOfSharedStudyModel
            toggle={sharedStudyToggler}
            setToggle={setSharedStudyToggler}
            emailIdOfSharedStudy={emailIdOfSharedStudy}
          />
        ) : (
          ''
        )}
      </Fragment>
      <Modal
        isOpen={modal}
        toggle={() => {
          setSelectValue({ value: 'Doctor', label: 'Doctor' })
          handleModal()
        }}
        className="sidebar-sm sm-w-100"
        contentClassName="pt-0"
      >
        <ModalHeader
          className="mb-2"
          toggle={() => {
            setSelectValue({ value: 'Doctor', label: 'Doctor' })
            handleModal()
          }}
          close={CloseBtn}
          tag="div"
        >
          <h5 className="modal-title">Share study to {selectValue.value}</h5>
        </ModalHeader>
        <ModalBody className="flex-grow-1">
          <Form onSubmit={handleSubmit(onSubmit)}>
            <FormGroup className="mb-1" md="6" sm="12">
              <Label>Share to : </Label>
              <Select
                defaultValue={{ value: 'Doctor', label: 'Doctor' }}
                onChange={setSelectValue}
                theme={selectThemeColors}
                className="react-select"
                classNamePrefix="select"
                options={typeOptions}
                value={selectValue}
              />
            </FormGroup>
            {selectValue.value === 'Doctor' && (
              <>
                <FormGroup>
                  <Label for="doctorName">
                    Doctor Name <span style={{ color: '#FF0000' }}>*</span>
                  </Label>
                  <Input
                    name="doctorName"
                    id="doctorName"
                    value={form_data.doctorName || ''}
                    {...register('doctorName', { required: true })}
                    invalid={errors?.doctorName && true}
                    placeholder="Doctor Name"
                    onChange={inputHandler}
                    onFocus={() => {
                      if (errors?.doctorName) {
                        clearErrors('doctorName')
                      }
                    }}
                  />
                  {errors?.doctorName && <FormFeedback>{errors.doctorName.message}</FormFeedback>}
                </FormGroup>
                <FormGroup>
                  <Label for="doctorEmail">
                    Doctor Email <span style={{ color: '#FF0000' }}>*</span>
                  </Label>
                  <Input
                    name="doctorEmail"
                    id="doctorEmail"
                    value={form_data.doctorEmail || ''}
                    {...register('doctorEmail', { required: true })}
                    invalid={errors?.doctorEmail && true}
                    placeholder="Doctor Email"
                    onChange={inputHandler}
                    onFocus={() => {
                      if (errors?.doctorEmail) {
                        clearErrors('doctorEmail')
                      }
                    }}
                  />
                  {errors?.doctorEmail && <FormFeedback>{errors.doctorEmail.message}</FormFeedback>}
                </FormGroup>
              </>
            )}
            {selectValue.value === 'Patient' && (
              <>
                <FormGroup>
                  <Label for="patientName">
                    Patient Name <span style={{ color: '#FF0000' }}>*</span>
                  </Label>
                  <Input
                    name="patientName"
                    id="patientName"
                    value={form_data.patientName || ''}
                    {...register('patientName', { required: true })}
                    invalid={errors?.patientName && true}
                    placeholder="Patient Name"
                    onChange={inputHandler}
                    onFocus={() => {
                      if (errors?.patientName) {
                        clearErrors('patientName')
                      }
                    }}
                  />
                  {errors?.patientName && <FormFeedback>{errors.patientName.message}</FormFeedback>}
                </FormGroup>
                <FormGroup>
                  <Label for="patientEmail">
                    Patient Email <span style={{ color: '#FF0000' }}>*</span>
                  </Label>
                  <Input
                    name="patientEmail"
                    id="patientEmail"
                    value={form_data.patientEmail || ''}
                    {...register('patientEmail', { required: true })}
                    invalid={errors?.patientEmail && true}
                    placeholder="Patient Email"
                    onChange={inputHandler}
                    onFocus={() => {
                      if (errors?.patientEmail) {
                        clearErrors('patientEmail')
                      }
                    }}
                  />
                  {errors?.patientEmail && (
                    <FormFeedback>{errors.patientEmail.message}</FormFeedback>
                  )}
                </FormGroup>
              </>
            )}
            <Row className="mb-1 mr-1">
              <Button
                className="mt-1 ml-1"
                color="primary"
                type="submit"
                onClick={() => setBtnEvent('share')}
              >
                Share
              </Button>
              <Button
                className="mt-1 ml-1"
                color="success"
                type="submit"
                onClick={() => setBtnEvent('print')}
              >
                Print
              </Button>
              <Button
                className="mt-1 ml-1"
                color="outline-primary"
                type="submit"
                onClick={() => setBtnEvent('shareprint')}
              >
                Share + print
              </Button>
            </Row>
          </Form>
        </ModalBody>
      </Modal>

      {}
      <Modal isOpen={openActivity} className="activity-modal">
        <ModalHeader className="activity-log-header" close={ActivityLogCloseBtn} tag="div">
          <div className="d-flex align-items-center">
            <List className="user-timeline-title-icon" />
            <h4 className="mb-0">Activity Log</h4>
          </div>
        </ModalHeader>
        <Card className="card-user-timeline px-1 mb-0">
          <CardBody>
            {activityDataLog.length > 0 ? (
              <Timeline className="ml-50 mb-0" data={activityDataLog} />
            ) : (
              <Timeline className="ml-50 mb-0" data={dataPriority} />
            )}
          </CardBody>
        </Card>
        <Button className="m-15" color="danger" onClick={() => setOpenActivity(false)}>
          Close
        </Button>
      </Modal>
      {}

      {}
      <Modal isOpen={openStatus} size="sm" className="sidebar-sm sm-w-100" contentClassName="pt-0">
        <ModalHeader
          close={PriorityModalCloseBtn}
          toggle={() => {
            handlePriorityModal()
          }}
        >
          <h4>Priority</h4>
        </ModalHeader>
        <ModalBody className="flex-grow-1 p-0">
          <div className="d-flex flex-row mh-50 mx-2" style={{ minHeight: '100px' }}>
            <div className="p-1 w-50">
              <Label for="priority">Study status:</Label>
              <Input
                type="select"
                name="priority"
                id="priority"
                onChange={e => setPriorityValue(e.target.value)}
                value={priorityValue}
              >
                <option value="Normal">Normal</option>
                <option value="Stat">Stat</option>
              </Input>
            </div>
          </div>
          <div className="d-flex flex-row justify-content-start mb-1 border-top pt-1 px-2">
            <Button
              className="mr-2"
              color="danger"
              type="submit"
              onClick={() => {
                setOpenStatus(false)
                setPriorityValue('')
                setStatusValue('')
                setRowId('')
              }}
            >
              Cancel
            </Button>
            <Button color="primary" type="submit" onClick={updatePriorityHandler}>
              Update
            </Button>
          </div>
        </ModalBody>
      </Modal>

      {}
      <Modal isOpen={openStudyUpload} className="Upload-study-report" contentClassName="pt-0">
        <ModalHeader
          close={UploadStudyModalCloseBtn}
          toggle={() => {
            setOpenStudyUpload(false)
          }}
        >
          <h5>Upload study report</h5>
        </ModalHeader>
        <ModalBody className="flex-grow-1 p-0">
          <UploadStudyReport
            selectRowForUploadStudy={selectRowForUploadStudy}
            setOpenStudyUpload={setOpenStudyUpload}
            setRefresh={setRefresh}
          />
        </ModalBody>
      </Modal>

      {}
      <Modal isOpen={openStudyEdit} className="patient-edit-modal">
        <ModalHeader close={editPatientModalCloseBtn} toggle={() => { editingStudyIdRef.current = null; setOpenStudyEdit(false) }}>
          <h4>Edit Study Patient's Details</h4>
        </ModalHeader>
        <Form
          key={`edit-study-${editingStudyIdRef.current ?? inputStudyEdit.sId ?? 'new'}`}
          onSubmit={handleSubmitEdit(onSubmitStudyEdit, () => {
            showErrorAlert('Please fill all required fields (Patient name, Patient ID, Sex, DOB, Study date/time, Study description) and try again.')
          })}
        >
          <Card className="mb-0">
            <CardBody>
              <FormGroup>
                <Label for="newName">Patient Name:</Label>
                <Input
                  type="text"
                  name="newName"
                  id="newName"
                  defaultValue={inputStudyEdit.newName}
                  {...registerEdit('newName', { required: true })}
                  invalid={errorEdit?.newName && true}
                  placeholder="Patient name"
                  onChange={studyEditHandler}
                  onFocus={() => {
                    if (errorEdit?.newName) {
                      clearEditErrors('newName')
                    }
                  }}
                />
                {errorEdit?.newName && <FormFeedback>{errorEdit.newName.message}</FormFeedback>}
              </FormGroup>
              <FormGroup>
                <Label for="patientId">Patient Id:</Label>
                <Input
                  type="text"
                  name="patientId"
                  id="patientId"
                  defaultValue={inputStudyEdit.patientId}
                  {...registerEdit('patientId', { required: true })}
                  invalid={errorEdit?.patientId && true}
                  placeholder="Patient Id"
                  onChange={studyEditHandler}
                  onFocus={() => {
                    if (errorEdit?.patientId) {
                      clearEditErrors('patientId')
                    }
                  }}
                />
                {errorEdit?.patientId && <FormFeedback>{errorEdit.patientId.message}</FormFeedback>}
              </FormGroup>
              <FormGroup>
                <Label for="sex">Sex:</Label>
                <Input
                  type="select"
                  name="sex"
                  id="sex"
                  {...registerEdit('sex', { required: true })}
                  invalid={errorEdit?.sex && true}
                  defaultValue={inputStudyEdit.sex}
                  onFocus={() => {
                    if (errorEdit?.sex) {
                      clearEditErrors('sex')
                    }
                  }}
                  onChange={e => {
                    const val = e.target.value
                    setPatientValue('sex', val)
                    setInputStudyEdit(prev => ({ ...prev, sex: val }))
                    if (val && val.trim() !== '') clearEditErrors('sex')
                  }}
                >
                  <option value="">Select sex</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </Input>
                {errorEdit?.sex && <FormFeedback>{errorEdit.sex.message}</FormFeedback>}
              </FormGroup>
              <FormGroup>
                <Label>Date of birth:</Label>

                <Flatpickr
                  className={`form-control dateinput ${errorEdit.dob ? 'is-invalid' : ''}`}
                  id="dob"
                  defaultValue={inputStudyEdit.dob}
                  options={{
                    dateFormat: flatPickerDateFormat,
                    clickOpens: true,
                    allowInput: false,
                    closeOnSelect: true, // Close after selecting date for single date picker
                    maxDate: moment().toDate(),
                  }}
                  onChange={(selectedDates, dateStr, instance) => {
                    if (selectedDates && selectedDates.length > 0) {
                      studyEditHandler(selectedDates[0], 'date')
                    }
                  }}
                />
                <Input
                  type="hidden"
                  {...registerEdit('dob', { required: true })}
                  defaultValue={inputStudyEdit.dob}
                  invalid={errorEdit?.dob && true}
                  name="dob"
                />
                {errorEdit?.dob && <FormFeedback>{errorEdit.dob.message}</FormFeedback>}
              </FormGroup>
              <FormGroup>
                <Label for="referPhysician">Referring Physician:</Label>
                <Input
                  type="text"
                  name="referPhysician"
                  id="referPhysician"
                  defaultValue={inputStudyEdit.referPhysician}
                  {...registerEdit('referPhysician')}
                  invalid={errorEdit?.referPhysician && true}
                  placeholder="Physician name"
                  onChange={studyEditHandler}
                />
                {errorEdit?.referPhysician && (
                  <FormFeedback>{errorEdit.referPhysician.message}</FormFeedback>
                )}
              </FormGroup>
              <FormGroup>
                <Label>Study Date:</Label>
                <Flatpickr
                  className={`form-control dateinput ${errorEdit.startTimeStamp ? 'is-invalid' : ''}`}
                  id="startTimeStamp"
                  defaultValue={inputStudyEdit.startTimeStamp}
                  options={{
                    dateFormat: flatPickerDateTimeFormat,
                    enableTime: true,
                    minuteIncrement: 1,
                    clickOpens: true,
                    allowInput: false,
                    closeOnSelect: true, // Close after selecting date for single date picker
                    maxDate: moment().toDate(),
                  }}
                  onChange={(selectedDate, dateStr, instance) => {
                    if (selectedDate && selectedDate.length > 0) {
                      studyEditHandler(selectedDate[0], 'datetime')
                    }
                  }}
                />

                <Input
                  type="hidden"
                  {...registerEdit('startTimeStamp', { required: true })}
                  defaultValue={inputStudyEdit.startTimeStamp}
                  invalid={errorEdit?.startTimeStamp && true}
                  name="startTimeStamp"
                />
                {errorEdit?.startTimeStamp && (
                  <FormFeedback>{errorEdit.startTimeStamp.message}</FormFeedback>
                )}
              </FormGroup>
              <FormGroup>
                <Label for="StudyDescription">Study Description:</Label>
                <Input
                  type="text"
                  name="StudyDescription"
                  id="StudyDescription"
                  defaultValue={inputStudyEdit.StudyDescription}
                  {...registerEdit('StudyDescription', { required: true })}
                  invalid={errorEdit?.StudyDescription && true}
                  placeholder="Study Description"
                  onChange={studyEditHandler}
                />
                {errorEdit?.StudyDescription && (
                  <FormFeedback>{errorEdit.StudyDescription.message}</FormFeedback>
                )}
              </FormGroup>
            </CardBody>
            <CardFooter>
              <Button color="danger" onClick={() => { editingStudyIdRef.current = null; setOpenStudyEdit(false) }}>
                Cancel
              </Button>
              <Button type="submit" className="ml-1" color="primary">
                Update
              </Button>
            </CardFooter>
          </Card>
        </Form>
      </Modal>
      {}
      {}
      {userData.role === ROLES.TechnicianUser || userData.role === ROLES.RadiologistUser ? (
        <Modal isOpen={openNotes}>
          <ModalHeader
            className="mb-2"
            close={
              <X
                className="cursor-pointer"
                size={15}
                onClick={() => {
                  setOpenNotes(false)
                  setStudyNotes(null)
                  setUpdateNoteStatus({ status: false })
                }}
              />
            }
            tag="div"
          >
            <h5 className="noteModelHeader">Study notes</h5>
          </ModalHeader>
          {studyNotes &&
          studyNotes.notes &&
          studyNotes.notes.length > 0 &&
          studyNotes.notes !== '-' ? (
            <div className="noteDiv">
              {studyNotes.notes.map(noteDetails => {
                return (
                  <CustomAccordion>
                    <AccordionSummary
                      id="panel-header-1"
                      aria-controls="panel-content-1"
                      className="accordionSummary"
                    >
                      <Typography sx={{ width: '38%' }}>
                        {moment(noteDetails.time).format('DD-MMMM-YYYY HH:mm:ss ')}
                      </Typography>
                      <Typography sx={{ color: 'text.secondary' }}>
                        {noteDetails.username}
                        {noteDetails.role === 'RDU' ? ' (Radiologist)' : ' (Technologist)'}
                      </Typography>
                      <IconButton sx={{ width: '13%' }} className="actionButtons">
                        {noteDetails.userId === userData._id ? (
                          <>
                            <Edit2
                              size={16}
                              className="mr-45 noteAction"
                              onClick={event =>
                                handleEditNoteButtonClick(event, {
                                  note: { id: noteDetails._id, value: noteDetails.note },
                                  studyId: studyNotes?.id,
                                })
                              }
                            />
                          </>
                        ) : (
                          <></>
                        )}
                      </IconButton>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography sx={{ color: 'text.secondary' }}>
                        {noteDetails.note && typeof noteDetails.note === 'string'
                          ? parse(noteDetails.note)
                          : noteDetails.note || 'No content'}
                      </Typography>
                    </AccordionDetails>
                  </CustomAccordion>
                )
              })}
            </div>
          ) : (
            ''
          )}
          <Card className="m-2">
            <h3 className="text-center mr-1 ml-1 mb-2">Add notes:</h3>
            <Editor
              onInit={(evt, editor) => {
                editorRef.current = editor
                return editorRef.current
              }}
              initialValue={studyNotes ? studyNotes.notes : 'Enter your notes'}
              init={{
                height: 300,
                menubar: true,
                plugins: [
                  'advlist',
                  'autolink',
                  'lists',
                  'link',
                  'charmap',
                  'preview',
                  'anchor',
                  'searchreplace',
                  'visualblocks',
                  'code',
                  'insertdatetime',
                  'table',
                  'code',
                  'help',
                  'wordcount',
                ],
                toolbar:
                  'undo redo | formatselect | code' +
                  'bold italic backcolor | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'removeformat | help | image',
                content_style:
                  'body { font-family:Helvetica,Arial,sans-serif; font-size:14px } .mce-content-body p { margin: 0; padding: 0; margin-block: 0; margin-inline: 0; line-height: normal; }',
              }}
            />
          </Card>
          <div className="text-center">
            <Button
              className="m-2"
              color="danger"
              onClick={() => {
                setOpenNotes(false)
                setStudyNotes(null)
                setUpdateNoteStatus({ status: false })
              }}
            >
              Cancel
            </Button>
            <Button
              className="m-2"
              color="primary"
              onClick={() => {
                noteHandler()
              }}
            >
              {!updateNoteStatus.status ? 'Add' : 'Update'}
            </Button>
          </div>
        </Modal>
      ) : (
        <Modal isOpen={openNotes}>
          <ModalHeader
            className="mb-2"
            close={
              <X
                className="cursor-pointer"
                size={15}
                onClick={() => {
                  setOpenNotes(false)
                  // Reset notes when closing modal to ensure fresh fetch on next open
                  setStudyNotes(null)
                }}
              />
            }
            tag="div"
          >
            <h5 className="noteModelHeader">Study notes</h5>
          </ModalHeader>
          {(() => {
            // Debug logging to understand the data structure
            console.log('[Notes Modal] Rendering - Current state:', {
              hasStudyNotes: !!studyNotes,
              studyNotesId: studyNotes?.id,
              hasNotes: !!studyNotes?.notes,
              notesType: typeof studyNotes?.notes,
              notesIsArray: Array.isArray(studyNotes?.notes),
              notesLength: Array.isArray(studyNotes?.notes) ? studyNotes.notes.length : 'N/A',
              notesValue: studyNotes?.notes,
              notesSample: Array.isArray(studyNotes?.notes) && studyNotes.notes.length > 0 ? studyNotes.notes[0] : null
            })
            
            // Check if notes exist and are valid array
            const hasValidNotes = studyNotes && 
                                 studyNotes.notes && 
                                 Array.isArray(studyNotes.notes) && 
                                 studyNotes.notes.length > 0 &&
                                 studyNotes.notes !== '-'
            
            if (hasValidNotes) {
              return (
                <div className="noteDiv-other">
                  {studyNotes.notes.map((noteDetails, index) => {
                    // Validate note structure
                    if (!noteDetails || typeof noteDetails !== 'object') {
                      console.warn('[Notes Modal] Invalid note at index:', index, noteDetails)
                      return null
                    }
                    
                    return (
                      <CustomAccordion key={noteDetails._id || `note-${index}`}>
                        <AccordionSummary
                          id={`panel-header-${index}`}
                          aria-controls={`panel-content-${index}`}
                          className="accordionSummary"
                        >
                          <Typography sx={{ width: '50%', flexShrink: 0 }}>
                            {noteDetails.time 
                              ? moment(noteDetails.time).format('DD-MMMM-YYYY HH:mm:ss ')
                              : 'No date'}
                          </Typography>
                          <Typography sx={{ color: 'text.secondary' }}>
                            {noteDetails.username || 'Unknown'}
                            {noteDetails.role === 'RDU' ? ' (Radiologist)' : 
                             noteDetails.role ? ` (${noteDetails.role})` : ' (Technologist)'}
                          </Typography>
                          <IconButton className="closeButton"></IconButton>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography sx={{ color: 'text.secondary' }}>
                            {noteDetails.note && typeof noteDetails.note === 'string'
                              ? parse(noteDetails.note)
                              : noteDetails.note || 'No content'}
                          </Typography>
                        </AccordionDetails>
                      </CustomAccordion>
                    )
                  })}
                </div>
              )
            } else {
              // Show appropriate message
              // Only show "Loading" if notes is undefined (not yet fetched)
              // If notes is an empty array, fetch completed but no notes exist
              const isLoading = studyNotes?.notes === undefined
              const hasNoNotes = Array.isArray(studyNotes?.notes) && studyNotes.notes.length === 0
              
              console.log('[Notes Modal] Display state:', {
                isLoading,
                hasNoNotes,
                notesValue: studyNotes?.notes,
                notesType: typeof studyNotes?.notes
              })
              
              return (
                <div className="text-center p-4">
                  <Typography sx={{ color: 'text.secondary' }}>
                    {isLoading 
                      ? 'Loading notes...'
                      : hasNoNotes
                      ? 'No notes available for this study.'
                      : 'Unable to load notes.'}
                  </Typography>
                </div>
              )
            }
          })()}
          <div className="text-center">
            <Button className="m-2" color="primary" onClick={() => {
              setOpenNotes(false)
              // Reset notes when closing modal to ensure fresh fetch on next open
              setStudyNotes(null)
            }}>
              Done
            </Button>
          </div>
        </Modal>
      )}
      {}

      {}
      <Modal isOpen={openPrintStudy} size="lg">
        <ModalHeader
          className="mb-2"
          close={
            <X
              className="cursor-pointer"
              size={15}
              onClick={() => {
                // Clean up blob URL to prevent memory leaks
                if (pdfBlobData) {
                  URL.revokeObjectURL(pdfBlobData)
                  setPdfBlobData(null)
                }
                setOpenPrintStudy(false)
              }}
            />
          }
          tag="div"
        >
          <h5 className="noteModelHeader">Study Report</h5>
        </ModalHeader>
        <ModalBody className="flex-grow-1">
          {pdfBlobData ? (
            <iframe
              key={pdfBlobData}
              src={pdfBlobData}
              width="100%"
              style={{ height: '80vh', border: 'none' }}
              title="PDF Report Viewer"
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>Loading PDF...</div>
          )}
        </ModalBody>
      </Modal>
    </div>
  ) : (
    <Fragment>
      {refreshLoading && (
        <Card className="loading-initial">
          <Spinner color="primary" />
        </Card>
      )}
      <DocTable
        studylist={data}
        previewReportHandler={previewReportHandler}
        handlePrintReport={handlePrintReport}
        studyDownloadHandler={studyDownloadHanlderNew}
      />
      <Modal isOpen={openPrintStudy} size="lg">
        <ModalHeader
          className="mb-2"
          close={
            <X
              className="cursor-pointer"
              size={15}
              onClick={() => {
                // Clean up blob URL to prevent memory leaks
                if (pdfBlobData) {
                  URL.revokeObjectURL(pdfBlobData)
                  setPdfBlobData(null)
                }
                setOpenPrintStudy(false)
              }}
            />
          }
          tag="div"
        >
          <h5 className="noteModelHeader">Study Report</h5>
        </ModalHeader>
        <ModalBody className="flex-grow-1">
          {pdfBlobData ? (
            <iframe
              key={pdfBlobData}
              src={pdfBlobData}
              width="100%"
              style={{ height: '80vh', border: 'none' }}
              title="PDF Report Viewer"
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>Loading PDF...</div>
          )}
        </ModalBody>
      </Modal>
    </Fragment>
  )
}

export default DataTableAdvSearch
