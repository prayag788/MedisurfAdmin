import { useState, useEffect, Fragment, useRef, useCallback, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  Button,
  Input,
  Row,
  Col,
  UncontrolledTooltip,
  Modal,
  Form,
  FormGroup,
  FormFeedback,
  Label,
  Spinner,
  ModalHeader,
  ModalBody,
  TabContent,
  TabPane,
} from 'reactstrap'
import { ChevronDown, Eye, Trash, X } from 'react-feather'
import { Editor } from '@tinymce/tinymce-react'
import DataTable from 'react-data-table-component'
import { Pagination } from 'swiper' // for using swiper this setting is only support with swiper@7.3.1
import { Swiper, SwiperSlide } from 'swiper/react'
import axios from 'axios'
import Flatpickr from 'react-flatpickr'
import Select from 'react-select'
import * as yup from 'yup'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import CircularProgress from '@mui/material/CircularProgress'
import moment from 'moment'
import parse from 'html-react-parser'
import {
  showErrorAlert,
  showSuccessAlert,
  showConfirm,
  showInfoAlert,
  showLoadingAlert,
  hideLoadingAlert,
} from '../../utils/alerts'

import {
  uploadWorksheet,
  getAllWorkSheet,
  deleteWorksheet,
  getAllDicomImage,
  getAllSeries,
  getDiagnosis,
  getTemplates,
} from './apis'
import pdficon from '../../assets/images/icons/pdf.png'

import '@styles/react/libs/flatpickr/flatpickr.scss'
import 'swiper/css'
import 'swiper/css/pagination'
import './styles.css'
import ROLES from '../../configs/roles'
import STUDYSTATUS from '@configs/studyStatus'
import WorkSheetPanel from './WorkSheetPanel'
import Tabs from './Tabs'
import { toast } from 'react-toastify'
import Avatar from '@components/avatar'
import {
  checkForOtherOperationDm,
  extractErrorMessage,
  getStudyLockDataAPIDm,
  setLockPatientIdsDm,
  selectThemeColors,
  handleAutoLogout,
} from '@utils'

import { socket } from '../../socket'

const ToastContentForError = ({ message, type }) => (
  <>
    <div className="toastify-header">
      <div className="title-wrapper">
        <Avatar size="sm" color={'danger'} icon={<X size={12} />} />
        <h6 className="toast-title font-weight-bold">Error</h6>
      </div>
    </div>
    <div className="toastify-body">
      <span>{message}</span>
    </div>
  </>
)

const normalizeImageId = value => {
  if (value === null || value === undefined) {
    return null
  }

  let raw = ''
  if (typeof value === 'string') {
    raw = value
  } else if (typeof value === 'object') {
    raw =
      value.imageId ||
      value.id ||
      value.image ||
      value.name ||
      ''
  } else {
    raw = String(value)
  }

  raw = raw.trim()
  if (!raw) {
    return null
  }

  raw = raw.replace(/\.[a-zA-Z0-9]+$/, '')
  return raw.replace(/[^a-zA-Z0-9._-]/g, '_')
}

const PreviewReport = props => {
  const { renderFrom } = props
  const queryParameters = new URLSearchParams(document.location.search)

  const [isFinalReportEditable, setIsFinalReportEditable] = useState(false)

  const editorRef = useRef(null)
  const editorAddendumRef = useRef(null)
  const isMountedRef = useRef(true)
  const navigate = useNavigate()
  const userData = (() => {
    try {
      if (renderFrom !== 'sharedStudy') {
        const userData = localStorage.getItem('userData')
        const sharedUserData = localStorage.getItem('sharedUserData')
        return (
          (userData ? JSON.parse(userData) : null) ||
          (sharedUserData ? JSON.parse(sharedUserData) : null)
        )
      } else {
        const sharedUserData = localStorage.getItem('sharedUserData')
        return sharedUserData ? JSON.parse(sharedUserData) : null
      }
    } catch (error) {
      console.error('Error parsing userData from localStorage:', error)
      return null
    }
  })()

  const accessToken = (() => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) return null

      // JWT tokens start with 'eyJ' and should be used as-is
      if (token.startsWith('eyJ')) {
        return token
      }

      // Only try to parse as JSON if it looks like JSON (starts with quote or brace)
      if (token.startsWith('"') || token.startsWith('{')) {
        return JSON.parse(token)
      }

      // Return token as-is for other formats
      return token
    } catch (error) {
      console.error('Error parsing accessToken from localStorage:', error)
      // If parsing fails, return the raw token
      return localStorage.getItem('accessToken')
    }
  })()

  const [studyId, setStudyId] = useState({})
  const [priorityValue, setPriorityValue] = useState(studyId?.priority || 'Normal')
  const [statusValue, setStatusValue] = useState(studyId?.status || STUDYSTATUS.Unread)
  const [templateLayout, setTemplateLayout] = useState(null)
  const [worksheetFile, setWorksheetFile] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewFinalReport, setPreviewFinalReport] = useState(false)
  const [worksheetData, setWorksheetData] = useState([])
  const [changeState, setChangeState] = useState(false)
  const [previewWorksheet, setPreviousWorksheet] = useState('')
  const [allDiagnosis, setAllDiagnosis] = useState([])
  const [allTemplate, setAllTemplate] = useState([])
  const [diagnosisModalityTemplateOptions, setDiagnosisModalityTemplateOptions] = useState([
    { value: '', label: 'Select Template' },
  ])
  const [diagnosisTemplateOptions, setDiagnosisTemplateOptions] = useState([
    { value: '', label: 'Select Template' },
  ])

  // })
  const [picker, setPicker] = useState(new Date())
  const [pickerDOB, setPickerDOB] = useState(
    moment(studyId?.patient?.PatientBirthDate).format(
      userData?.dateFormats?.dateFormat || 'YYYY-MM-DD'
    ) || null
  )

  const [selectImage, setSelectImage] = useState([])
  const [selectedImageString, setSelectedImageString] = useState([])
  const [previewLayout, setPreviewLayout] = useState(false)
  const [dicomImages, setDicomImages] = useState([])
  const [allSeries, setAllSeries] = useState([])
  const [selected_series, setSelected_series] = useState(null)
  const [createdReport, setCreatedReport] = useState(studyId?.reportString || '')

  // Debug logging for createdReport changes
  useEffect(() => {
    console.log('📝 createdReport state changed:', {
      hasContent: !!createdReport,
      contentLength: createdReport?.length || 0,
      contentPreview: createdReport ? `${createdReport.substring(0, 100)}...` : 'No content',
    })
  }, [createdReport])
  const [detectChange, setDetectChange] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [pageLoader, setPageLoader] = useState(true)
  const [saveReportLoading, setSaveReportLoading] = useState(false)
  const [saveReportandFinaliseLoading, setSaveReportandFinaliseLoading] = useState(false)
  const [createAddendumLoading, setCreateAddendumLoading] = useState(false)
  const [createAddendumstate, setCreateAddendumstate] = useState(false)
  const [worksheetModal, setWorksheetModal] = useState(false)
  const [activeTab, setActiveTab] = useState('1')
  const [id, setId] = useState(queryParameters.get('id'))
  const [mode, setMode] = useState(queryParameters.get('mode'))
  const [loadingDicomImages, setLoadingDicomImages] = useState(false)
  const [seriesPages, setSeriesPages] = useState({})
  const [seriesHasMore, setSeriesHasMore] = useState({})
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const swiperRef = useRef(null)
  const [templateTypeGet, setTemplateTypeGet] = useState('')
  const [editorsReady, setEditorsReady] = useState(false)
  const [mainEditorReady, setMainEditorReady] = useState(false)
  const [addendumEditorReady, setAddendumEditorReady] = useState(false)
  const [isStateTransitioning, setIsStateTransitioning] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isRerendering, setIsRerendering] = useState(false)

  const normalizedSelectedSet = useMemo(() => {
    const safeSelectedValues = Array.isArray(selectImage) ? selectImage : []
    return new Set(
      safeSelectedValues
        .map(value => normalizeImageId(value))
        .filter(value => value !== null && value !== undefined)
    )
  }, [selectImage])

  const imagesForRender = useMemo(() => {
    const safeDicomImages = Array.isArray(dicomImages) ? dicomImages : []
    const isFinalStudy = studyId?.status === STUDYSTATUS.Final

    let working = safeDicomImages.map(item => {
      const normalizedId = normalizeImageId(item?.imageId || item?.id || item)
      const derivedSelection = normalizedId ? normalizedSelectedSet.has(normalizedId) : false

      return {
        ...item,
        imageId: item?.imageId || item?.id || item,
        isReportSelection: Boolean(item?.isReportSelection) || derivedSelection,
        isSavedReportImage: Boolean(item?.isSavedReportImage),
      }
    })

    if (selected_series && !(isFinalStudy && !isFinalReportEditable)) {
      working = working.filter(
        item =>
          (item?.seriesId || item?.SeriesInstanceUID || item?.seriesID) === selected_series
      )
    }

    if (isFinalStudy) {
      const sorted = [...working].sort(
        (a, b) =>
          Number(Boolean(b?.isReportSelection)) - Number(Boolean(a?.isReportSelection))
      )

      return isFinalReportEditable
        ? sorted
        : sorted.filter(item => item?.isReportSelection || item?.isSavedReportImage)
    }

    return working
  }, [dicomImages, normalizedSelectedSet, selected_series, studyId?.status, isFinalReportEditable])

  const fileInput = useRef()
  const location = useLocation()

  const publicAccessBaseUrl = useMemo(() => {
    const base = (process.env.REACT_APP_PUBLIC_ACCESS_API_URL || '').trim()
    return base.replace(/\/+$/, '')
  }, [])

  const applyPublicBase = useCallback(
    path => {
      const normalised = (path || '').replace(/^\/+/, '')
      if (!normalised) return ''
      if (publicAccessBaseUrl) {
        return `${publicAccessBaseUrl}/${normalised}`
      }
      return `/${normalised}`
    },
    [publicAccessBaseUrl]
  )

  const resolveImageUrl = useCallback(
    rawPath => {
      if (!rawPath || typeof rawPath !== 'string') {
        return ''
      }

      const trimmed = rawPath.trim()
      if (!trimmed) {
        return ''
      }

      if (/^data:/i.test(trimmed) || /^https?:\/\//i.test(trimmed)) {
        return trimmed
      }

      const normalised = trimmed.replace(/^\/+/, '')
      if (
        normalised.startsWith('reports/') ||
        normalised.startsWith('static/') ||
        normalised.startsWith('api/') ||
        normalised.startsWith('tmp/')
      ) {
        return applyPublicBase(normalised)
      }

      return applyPublicBase(`public/${normalised}`)
    },
    [applyPublicBase]
  )

  const resolveImageSrc = useCallback(
    imageItem => {
      if (!imageItem) return ''

      if (typeof imageItem === 'object') {
        // Check for base64 image first
        if (imageItem.base64Image) {
          return `data:image/png;base64,${imageItem.base64Image}`
        }
        
        // Check for various path properties
        const raw =
          imageItem.imagePath ||
          imageItem.path ||
          imageItem.relativePath ||
          imageItem.url ||
          imageItem.image ||
          imageItem.src
          
        if (raw && typeof raw === 'string') {
          return resolveImageUrl(raw)
        }
        
        // If imageId exists, try to construct image URL
        if (imageItem.imageId && typeof imageItem.imageId === 'string') {
          // Check if it's already a valid URL or base64
          if (imageItem.imageId.startsWith('data:') || imageItem.imageId.startsWith('http')) {
            return imageItem.imageId
          }
          // Construct image URL from imageId
          return resolveImageUrl(`dicom/${imageItem.imageId}`)
        }
        
        return ''
      }

      if (typeof imageItem === 'string') {
        // Check if it's already a valid URL or base64
        if (imageItem.startsWith('data:') || imageItem.startsWith('http')) {
          return imageItem
        }
        // Construct image URL from string ID
        return resolveImageUrl(`dicom/${imageItem}`)
      }

      return ''
    },
    [resolveImageUrl]
  )

  //   }
  // }
  const flatPickerDateFormat =
    userData?.dateFormats?.dateFormat === 'MM/DD/YYYY'
      ? 'm/d/Y'
      : userData?.dateFormats?.dateFormat === 'DD/MM/YYYY'
        ? 'd/m/Y'
        : userData?.dateFormats?.dateFormat === 'YYYY/MM/DD'
          ? 'Y/m/d'
          : 'm/d/Y'

  const handleWorksheetModal = () => setWorksheetModal(!worksheetModal)
  useEffect(() => {
    socket.on('reloadRouteStudy', Data => {
      if (Data) {
        // setLockPatientIdsDm(Data)
      }
    })
  }, [])
  useEffect(() => {
    const fetchData = async () => {
      getStudyLockDataAPIDm()
      if (renderFrom === 'sharedStudy') {
        sessionStorage.setItem('sharedStudy', true)
      }
    }
    fetchData()
  }, [])

  // Enhanced safe editor destruction utility with comprehensive error handling
  const safelyDestroyEditor = useCallback(() => {
    try {
      if (editorRef?.current) {
        // Check if already destroyed or removed
        if (editorRef.current.destroyed || editorRef.current.removed) {
          editorRef.current = null
          return
        }

        // Additional safety checks for DOM state
        try {
          const container = editorRef.current.getContainer && editorRef.current.getContainer()
          if (container && !document.contains(container)) {
            console.warn('⚠️ Editor container already removed from DOM')
            editorRef.current = null
            return
          }
        } catch (containerError) {
          console.warn('⚠️ Editor container check failed:', containerError.message)
        }

        // Safe destruction with multiple fallbacks
        if (typeof editorRef.current.destroy === 'function') {
          try {
            editorRef.current.destroy()
          } catch (destroyError) {
            console.warn('⚠️ Editor destroy method failed:', destroyError.message)
            // Try alternative cleanup
            try {
              if (typeof editorRef.current.remove === 'function') {
                editorRef.current.remove()
              }
            } catch (removeError) {
              console.warn('⚠️ Editor remove method also failed:', removeError.message)
            }
          }
        }

        editorRef.current = null
      }
    } catch (err) {
      console.warn('⚠️ Editor safe destroy failed:', err.message)
      // Force null the reference even if destruction fails
      editorRef.current = null
    }
  }, [])

  const safelyDestroyAddendumEditor = useCallback(() => {
    try {
      if (editorAddendumRef?.current) {
        // Check if already destroyed or removed
        if (editorAddendumRef.current.destroyed || editorAddendumRef.current.removed) {
          editorAddendumRef.current = null
          return
        }

        // Additional safety checks for DOM state
        try {
          const container =
            editorAddendumRef.current.getContainer && editorAddendumRef.current.getContainer()
          if (container && !document.contains(container)) {
            console.warn('⚠️ Addendum editor container already removed from DOM')
            editorAddendumRef.current = null
            return
          }
        } catch (containerError) {
          console.warn('⚠️ Addendum editor container check failed:', containerError.message)
        }

        // Safe destruction with multiple fallbacks
        if (typeof editorAddendumRef.current.destroy === 'function') {
          try {
            editorAddendumRef.current.destroy()
          } catch (destroyError) {
            console.warn('⚠️ Addendum editor destroy method failed:', destroyError.message)
            // Try alternative cleanup
            try {
              if (typeof editorAddendumRef.current.remove === 'function') {
                editorAddendumRef.current.remove()
              }
            } catch (removeError) {
              console.warn('⚠️ Addendum editor remove method also failed:', removeError.message)
            }
          }
        }

        editorAddendumRef.current = null
      }
    } catch (err) {
      console.warn('⚠️ Addendum editor safe destroy failed:', err.message)
      // Force null the reference even if destruction fails
      editorAddendumRef.current = null
    }
  }, [])

  // Global error handler for TinyMCE DOM errors
  useEffect(() => {
    const handleTinyMCEError = event => {
      if (event.error && event.error.message) {
        const errorMessage = event.error.message.toLowerCase()
        if (
          errorMessage.includes('node cannot be null') ||
          errorMessage.includes('undefined') ||
          errorMessage.includes('tinymce') ||
          errorMessage.includes('editor')
        ) {
          console.warn('🛡️ Caught TinyMCE DOM error:', event.error.message)
          event.preventDefault()
          return false
        }
      }
    }

    window.addEventListener('error', handleTinyMCEError)
    window.addEventListener('unhandledrejection', handleTinyMCEError)

    return () => {
      window.removeEventListener('error', handleTinyMCEError)
      window.removeEventListener('unhandledrejection', handleTinyMCEError)
    }
  }, [])

  // Cleanup on unmount with enhanced safety
  useEffect(() => {
    return () => {
      isMountedRef.current = false

      // Delay cleanup to avoid race conditions
      setTimeout(() => {
        safelyDestroyEditor()
        safelyDestroyAddendumEditor()
      }, 100)
    }
  }, [safelyDestroyEditor, safelyDestroyAddendumEditor])

  const toCheckStudyStatusAllowed = async study_id => {
    return new Promise(async (resolve, reject) => {
      try {
        // CRITICAL: Comprehensive validation before proceeding
        if (!userData || !userData._id) {
          console.error(`[toCheckStudyStatusAllowed] User data is missing or invalid`)
          reject(new Error('User authentication required'))
          return
        }

        if (!accessToken || accessToken === 'undefined' || accessToken === 'null') {
          console.error(`[toCheckStudyStatusAllowed] Access token is missing or invalid`)
          reject(new Error('Authentication token missing'))
          return
        }

        if (userData?.role === ROLES.RadiologistUser) {
          // CRITICAL: Validate study_id before making API call
          if (
            !study_id ||
            study_id === 'undefined' ||
            study_id === 'null' ||
            study_id.toString().trim() === ''
          ) {
            console.error(`[toCheckStudyStatusAllowed] Invalid study_id: ${study_id}`)
            reject(new Error('Invalid study ID provided'))
            return
          }

          console.log(`[toCheckStudyStatusAllowed] Checking lock status for study: ${study_id}`)
          await axios
            .get(`${process.env.REACT_APP_API_URL}/report/check/${study_id}/lock`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              timeout: 15000, // 15 second timeout
            })
            .then(res => {
              if (res && res.data) {
                if (res.data.message && res.data.success === false) {
                  showInfoAlert(res.data.message).then(() => {
                    window.location.href = `/study-list`
                    reject(false)
                  })
                } else {
                  resolve(true)
                }
              } else {
                console.error('[toCheckStudyStatusAllowed] Invalid response from server')
                reject(new Error('Invalid response from server'))
              }
            })
            .catch(err => {
              console.error('[toCheckStudyStatusAllowed] API call failed:', err)

              // If it's a 409 conflict (study locked by another user), show specific message
              if (err?.response?.status === 409) {
                const message =
                  err.response.data?.message || 'Study is currently locked by another radiologist'
                showInfoAlert(message).then(() => {
                  window.location.href = `/study-list`
                  reject(new Error(message))
                })
                return
              }

              let errorMessage = 'Failed to check study status'

              if (err?.response?.status === 404) {
                errorMessage = 'Study not found in database'
              } else if (err?.response?.status === 401) {
                errorMessage = 'Authentication failed - please login again'
              } else if (err?.response?.status === 403) {
                errorMessage = 'Access denied - insufficient permissions'
              } else if (err?.response?.data?.message) {
                errorMessage = err.response.data.message
              } else if (err?.message) {
                errorMessage = err.message
              }

              console.error('[toCheckStudyStatusAllowed] Error details:', {
                status: err?.response?.status,
                message: errorMessage,
                studyId: study_id,
              })

              // For 404 errors, show a more specific message
              if (err?.response?.status === 404) {
                showInfoAlert(
                  'Study not found in database. Please refresh the page and try again.'
                ).then(() => {
                  window.location.href = `/study-list`
                  reject(new Error('Study not found'))
                })
              } else {
                showInfoAlert(errorMessage)
                reject(new Error(errorMessage))
              }
            })
        } else {
          resolve(true)
        }
      } catch (error) {
        console.error('[toCheckStudyStatusAllowed] Unexpected error:', error)
        reject(new Error(error?.message || 'Unexpected error occurred while checking study status'))
      }
    })
  }
  useEffect(() => {
    const fetchStudyData = async () => {
      setPageLoader(true)
      // Reset editor states when fetching new study data
      setMainEditorReady(false)
      setAddendumEditorReady(false)
      setEditorsReady(false)

      const studyData = (
        await axios.get(`${process.env.REACT_APP_API_URL}/explorer/studies/studyData/${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
      ).data
      setStudyId(() => {
        return { ...studyData.data, ID: studyData.data.id, id: studyData.data.id }
      })

      setPickerDOB(
        moment(studyData.data?.patient?.PatientBirthDate).format(
          userData?.dateFormats?.dateFormat || 'YYYY-MM-DD'
        ) || ''
      )
      // Safe initialization of image arrays with comprehensive validation
      const safeSelectedSeries = Array.isArray(studyData?.data?.selectedSeries) ? studyData.data.selectedSeries : []
      const safeReportImages = Array.isArray(studyData?.data?.reportImages) ? studyData.data.reportImages : []
      
      setSelectImage(studyData?.data?.status === STUDYSTATUS.Unread ? [] : safeSelectedSeries)
      setSelectedImageString(studyData?.data?.status === STUDYSTATUS.Unread ? [] : safeReportImages)
      setCreatedReport(studyData?.data?.reportString || '')
      setStatusValue(studyData?.data?.status || STUDYSTATUS.Unread)
      setPriorityValue(studyData?.data?.priority || 'Normal')
      setPageLoader(false)
      setTemplateTypeGet(studyData?.data?.templateType)
      // CRITICAL: Validate study ID before checking status
      if (studyData?.data?.id && studyData.data.id !== 'undefined') {
        await toCheckStudyStatusAllowed(studyData.data.id)
      } else {
        console.warn(
          `[PreviewReport] Skipping status check - invalid study ID: ${studyData?.data?.id}`
        )
      }

      //START:- The below code added for check the final report is editable or not and set the state value. State value using in every required places on set the condition. Changed by Mehul JCasp @ 30th Sep 23
      if (userData?.role === ROLES.RadiologistUser) {
        if (studyData?.data?.status === STUDYSTATUS.Final) {
          setPageLoader(true)
          const resultIsEditable = await axios.get(
            `${process.env.REACT_APP_API_URL}/report/check-is-editable-report/${id}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          )

          if (resultIsEditable && resultIsEditable.data) {
            setIsFinalReportEditable(resultIsEditable.data.isEditable)
          }

          setPageLoader(false)
        }
      }
      //END
    }
    fetchStudyData()
  }, [id, createAddendumstate, refreshTrigger])

  const NewUserSchema = yup.object().shape({
    reportDate: yup.string().required('Report Date is required!'),
    examDescription: yup.string().required('Exam description is required!'),
    ...((userData?.role === 'RDU' || userData?.role === 'TCU') && {
      templateType: yup.string().required('Report template is required!'),
    }),
  })

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    trigger,
    getValues,
    formState,
    watch,
  } = useForm({
    mode: 'onSubmit',
    resolver: yupResolver(NewUserSchema),
  })

  const watchTemplateType = watch('templateType')

  // Set form values after form is initialized and study data is loaded
  useEffect(() => {
    if (studyId?.details?.StudyDescription) {
      setValue('examDescription', studyId.details.StudyDescription)
    }
    if (picker) {
      setValue(
        'reportDate',
        moment(picker).format(userData?.dateFormats?.dateFormat || 'YYYY-MM-DD')
      )
    }

    // Set default template value
    if (allTemplate && allTemplate.length > 0) {
      const defaultTemplate =
        studyId?.templateType || allTemplate.find(t => t.default)?._id || allTemplate[0]._id
      if (defaultTemplate) {
        setValue('templateType', defaultTemplate)
        console.log('🎨 Set default template value:', defaultTemplate)
      }
    }
  }, [studyId, setValue, picker, userData?.dateFormats?.dateFormat, allTemplate])

  // Track overall editor readiness with enhanced validation
  useEffect(() => {
    const needsMainEditor =
      (userData?.role === 'RDU' || (userData?.role === 'TCU' && !studyId?.radiologist)) &&
      (studyId?.status !== STUDYSTATUS.Final || isFinalReportEditable)
    const needsAddendumEditor =
      userData?.role === 'RDU' &&
      studyId?.status === STUDYSTATUS.Final &&
      userData?._id === studyId?.radiologist &&
      !isFinalReportEditable

    console.log('📝 Editor readiness check:', {
      pageLoader,
      studyId: studyId?.ID,
      needsMainEditor,
      needsAddendumEditor,
      mainEditorReady,
      addendumEditorReady,
      userRole: userData?.role,
    })

    // Enhanced editor readiness check with additional validation
    const checkEditorsReady = () => {
      if (!pageLoader && studyId?.ID) {
        let ready = false

        // Additional validation: check if editor refs are actually functional
        let mainEditorFunctional = false
        let addendumEditorFunctional = false

        if (needsMainEditor) {
          try {
            mainEditorFunctional =
              mainEditorReady &&
              editorRef.current &&
              typeof editorRef.current.getContent === 'function'
          } catch (e) {
            mainEditorFunctional = false
          }
        } else {
          mainEditorFunctional = true // Not needed
        }

        if (needsAddendumEditor) {
          try {
            addendumEditorFunctional =
              addendumEditorReady &&
              editorAddendumRef.current &&
              typeof editorAddendumRef.current.getContent === 'function'
          } catch (e) {
            addendumEditorFunctional = false
          }
        } else {
          addendumEditorFunctional = true // Not needed
        }

        ready = mainEditorFunctional && addendumEditorFunctional

        console.log('📝 Enhanced editor readiness:', {
          needsMainEditor,
          needsAddendumEditor,
          mainEditorFunctional,
          addendumEditorFunctional,
          finalReady: ready,
        })

        setEditorsReady(ready)
      } else {
        console.log('📝 Setting editorsReady to false (page loading or no study ID)')
        setEditorsReady(false)
      }
    }

    // Delay editor readiness check to ensure DOM is ready
    const timeoutId = setTimeout(checkEditorsReady, 800)

    return () => clearTimeout(timeoutId)
  }, [
    pageLoader,
    mainEditorReady,
    addendumEditorReady,
    userData?.role,
    studyId?.status,
    studyId?.radiologist,
    userData?._id,
    isFinalReportEditable,
    studyId?.ID,
  ])

  const trashHandler = async (studyId, worksheetId, name) => {
    const result = await showConfirm(
      'Are you sure?',
      `Are you sure, you want to delete ${name}?`,
      'Yes',
      'warning'
    )
    if (result) {
      await deleteWorksheet(studyId, worksheetId)

      // Clear preview if deleted worksheet was being previewed
      const selectedFile = previewWorksheet.replace(
        `${process.env.REACT_APP_PUBLIC_ACCESS_API_URL}/worksheet/`,
        ''
      )
      if (name === selectedFile) {
        setPreviousWorksheet('')
      }

      // Refresh worksheet list from API
      const refreshedData = await getAllWorkSheet(studyId)
      if (refreshedData) {
        const notDeletedData = refreshedData.filter(item => !item.isDeleted)
        setWorksheetData(notDeletedData)
      }

      showSuccessAlert('Worksheet deleted successfully!')
    }
  }

  const previewHandler = url => {
    setPreviousWorksheet(url)
  }

  const column = [
    {
      name: 'Worksheet',
      selector: row =>
        row['name'] ? (
          <div className="d-flex align-items-center">
            <div
              className={`text-center`}
              style={{ cursor: 'pointer' }}
              onClick={() =>
                previewHandler(
                  `${process.env.REACT_APP_PUBLIC_ACCESS_API_URL}/worksheet/${row['filename']}`
                )
              }
            >
              <img className="rounded" src={pdficon} alt="Pdf worksheet" width="40%" />
            </div>
            <p className="m-0">{row['name']}</p>
          </div>
        ) : (
          '-'
        ),
      sortable: true,
      minWidth: '80%',
    },
    {
      name: 'Action',
      sortable: false,
      maxWidth: '20px',
      minWidth: '20%',
      cell: row => {
        return (
          <>
            <Eye
              size={15}
              id="preview"
              className="mr-60"
              style={{ cursor: 'pointer' }}
              onClick={() =>
                previewHandler(
                  `${process.env.REACT_APP_PUBLIC_ACCESS_API_URL}/worksheet/${row['filename']}`
                )
              }
            />
            <UncontrolledTooltip target="preview" className="tooltip-react-strap">
              Preview
            </UncontrolledTooltip>
            {userData?.role === 'TCU' && (
              <>
                <Trash
                  size={15}
                  id="trash"
                  className="ml-50 mr-60"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    trashHandler(studyId?.ID, row._id, row.name)
                  }}
                />
                <UncontrolledTooltip target="trash" className="tooltip-react-strap">
                  Remove
                </UncontrolledTooltip>
              </>
            )}
          </>
        )
      },
    },
  ]

  useEffect(() => {
    const fetchWorksheetData = async () => {
      let dataArr
      if (studyId?.ID) {
        dataArr = await getAllWorkSheet(studyId?.ID)
      }
      if (dataArr) {
        const notDeleteData = []
        dataArr.forEach(item => {
          if (!item.isDeleted) {
            notDeleteData.push(item)
          }
        })
        setWorksheetData(notDeleteData)
      }
    }
    fetchWorksheetData()
  }, [changeState, studyId?.ID])

  useEffect(() => {
    const fetchSeriesData = async () => {
      if (studyId?.ID) {
        console.log('🔄 [fetchSeriesData] Fetching series for studyId:', studyId?.ID)
        try {
          const sres = await getAllSeries(studyId?.ID)
          console.log('📊 [fetchSeriesData] API response:', sres)
          const safeSeries = Array.isArray(sres.data?.all_series) ? sres.data.all_series : []
          console.log('📋 [fetchSeriesData] Processed series:', { count: safeSeries.length, series: safeSeries })
          setAllSeries(safeSeries)
          if (Array.isArray(safeSeries) && safeSeries.length > 0) {
            console.log('✅ [fetchSeriesData] Setting first series as selected:', safeSeries[0]?.value)
            setSelected_series(safeSeries[0]?.value)
          } else {
            console.warn('⚠️ [fetchSeriesData] No series data available')
          }
        } catch (error) {
          console.error('❌ [fetchSeriesData] Error fetching series:', error)
          setAllSeries([])
        }
      }
    }
    fetchSeriesData()
  }, [studyId?.ID])

  useEffect(() => {
    const fetchDicomImages = async () => {
      if (!studyId?.ID) {
        console.warn('🖼️ [fetchDicomImages] No studyId provided:', studyId?.ID)
        return
      }

      console.log('🖼️ [fetchDicomImages] Starting fetch for studyId:', studyId.ID)
      setLoadingDicomImages(true)

      try {
        const includeAll =
          studyId?.status === STUDYSTATUS.Final ? Boolean(isFinalReportEditable) : true
        const params = selected_series
          ? { page: 1, limit: 10, seriesId: selected_series, includeAll }
          : studyId?.status === STUDYSTATUS.Final
            ? { includeAll }
            : undefined

        const imagesRes = await getAllDicomImage(studyId.ID, params)
        console.log('🖼️ [fetchDicomImages] Response payload:', imagesRes?.data)

        const fetchedImages = (() => {
          if (imagesRes?.data?.images && Array.isArray(imagesRes.data.images)) {
            return imagesRes.data.images
          }
          if (imagesRes?.data?.data && Array.isArray(imagesRes.data.data)) {
            return imagesRes.data.data
          }
          if (Array.isArray(imagesRes?.data)) {
            return imagesRes.data
          }
          console.warn('🖼️ [fetchDicomImages] Invalid images data format:', imagesRes?.data)
          return []
        })().map(img => ({
          ...img,
          imageId: img?.imageId || img?.id || img?.image || img,
        }))

        const sortedImages =
          studyId?.status === STUDYSTATUS.Final
            ? [...fetchedImages].sort(
                (a, b) =>
                  Number(Boolean(b?.isReportSelection)) -
                  Number(Boolean(a?.isReportSelection)),
              )
            : fetchedImages

        if (studyId?.status === STUDYSTATUS.Final && !isFinalReportEditable) {
          sortedImages.splice(
            0,
            sortedImages.length,
            ...sortedImages.filter(img => img.isReportSelection),
          )
        }

        if (selected_series) {
          const hasMore = Boolean(
            imagesRes?.data?.pagination?.hasMore ||
              (imagesRes?.data?.pagination?.totalCount &&
                imagesRes.data.pagination.totalCount > sortedImages.length),
          )

          setDicomImages(sortedImages)
          setSeriesPages(prev => ({ ...(prev || {}), [selected_series]: 1 }))
          setSeriesHasMore(prev => ({
            ...(prev || {}),
            [selected_series]:
              studyId?.status === STUDYSTATUS.Final && !isFinalReportEditable ? false : hasMore,
          }))
        } else {
          setDicomImages(sortedImages)
          if (studyId?.status === STUDYSTATUS.Final && !isFinalReportEditable) {
            setSeriesHasMore({})
          }
        }
      } catch (error) {
        console.error('🖼️ [fetchDicomImages] Error fetching images:', error)
        setDicomImages([])
        if (selected_series) {
          setSeriesHasMore(prev => ({ ...prev, [selected_series]: false }))
        }
      } finally {
        setLoadingDicomImages(false)
      }
    }

    fetchDicomImages()
  }, [studyId?.ID, studyId?.status, selected_series, isFinalReportEditable])
  
  useEffect(() => {
    if (swiperRef.current && swiperRef.current.swiper) {
      try {
        swiperRef.current.swiper.updateSlides()
        swiperRef.current.swiper.updateProgress()
        swiperRef.current.swiper.updateSlidesClasses()
        swiperRef.current.swiper.slideTo(0)
      } catch (swiperError) {
        console.warn('⚠️ Swiper update failed:', swiperError)
      }
    }
  }, [dicomImages, selected_series])
  
  // Load more images for current series
  const loadMoreImages = useCallback(async () => {
    const includeAll =
      studyId?.status === STUDYSTATUS.Final ? Boolean(isFinalReportEditable) : true

    console.log('🖼️ [loadMoreImages] Called with:', {
      selected_series,
      hasMore: seriesHasMore && seriesHasMore[selected_series],
      isLoadingMore,
      studyId: studyId?.ID,
      includeAll,
    })
    
    if (
      !selected_series ||
      !seriesHasMore ||
      !seriesHasMore[selected_series] ||
      isLoadingMore ||
      !studyId?.ID ||
      (studyId?.status === STUDYSTATUS.Final && !includeAll)
    ) {
      console.log('🖼️ [loadMoreImages] Skipping - conditions not met')
      return
    }
    
    setIsLoadingMore(true)
    try {
      const currentPage = (seriesPages && seriesPages[selected_series]) || 1
      const nextPage = currentPage + 1
      
      console.log('🖼️ [loadMoreImages] Loading page', nextPage, 'for series', selected_series)
      
      const imagesRes = await getAllDicomImage(studyId.ID, {
        page: nextPage,
        limit: 10,
        seriesId: selected_series,
        includeAll,
      })
      
      console.log('🖼️ [loadMoreImages] API response:', imagesRes?.data)
      
      // Handle paginated response with images array
      if (imagesRes?.data?.images && Array.isArray(imagesRes.data.images) && imagesRes.data.images.length > 0) {
        setDicomImages(prev => {
          const safePrev = Array.isArray(prev) ? prev : []
          const merged = [...safePrev]
          imagesRes.data.images.forEach(img => {
            const imageId = img?.imageId || img?.id || img
            const exists = merged.find(existing => (existing?.imageId || existing?.id || existing) === imageId)
            if (!exists) {
              merged.push({
                ...img,
                imageId
              })
            }
          })
          console.log('🖼️ [loadMoreImages] Updated images count:', merged.length)
          return merged
        })
        setSeriesPages(prev => ({ ...(prev || {}), [selected_series]: nextPage }))
        setSeriesHasMore(prev => ({
          ...(prev || {}),
          [selected_series]: includeAll
            ? imagesRes.data.pagination?.hasMore || false
            : false,
        }))
        
        console.log('🖼️ [loadMoreImages] Success - Page:', nextPage, 'HasMore:', imagesRes.data.pagination?.hasMore)
      } else if (imagesRes?.data?.data && Array.isArray(imagesRes.data.data) && imagesRes.data.data.length > 0) {
        setDicomImages(prev => {
          const safePrev = Array.isArray(prev) ? prev : []
          const merged = [...safePrev]
          imagesRes.data.data.forEach(img => {
            const imageId = img?.imageId || img?.id || img
            const exists = merged.find(existing => (existing?.imageId || existing?.id || existing) === imageId)
            if (!exists) {
              merged.push({
                ...img,
                imageId
              })
            }
          })
          console.log('🖼️ [loadMoreImages] Updated images count:', merged.length)
          return merged
        })
        setSeriesPages(prev => ({ ...(prev || {}), [selected_series]: nextPage }))
        setSeriesHasMore(prev => ({
          ...(prev || {}),
          [selected_series]: false,
        })) // No pagination info in this format
        
        console.log('🖼️ [loadMoreImages] Success - Page:', nextPage)
      } else {
        console.log('🖼️ [loadMoreImages] No more images available')
        setSeriesHasMore(prev => ({ ...(prev || {}), [selected_series]: false }))
      }
    } catch (error) {
      console.error('🖼️ [loadMoreImages] Error:', error)
      setSeriesHasMore(prev => ({ ...(prev || {}), [selected_series]: false }))
    } finally {
      setIsLoadingMore(false)
    }
  }, [selected_series, seriesHasMore, isLoadingMore, seriesPages, studyId?.ID, studyId?.status, isFinalReportEditable])
  
  // Track when to load more images
  const checkAndLoadMore = useCallback(() => {
    const includeAll =
      studyId?.status === STUDYSTATUS.Final ? Boolean(isFinalReportEditable) : true

    if (
      !swiperRef.current ||
      !selected_series ||
      !seriesHasMore ||
      !seriesHasMore[selected_series] ||
      isLoadingMore ||
      (studyId?.status === STUDYSTATUS.Final && !includeAll)
    ) {
      return
    }
    
    const swiper = swiperRef.current
    const currentSlide = swiper.activeIndex
    const totalSlides = swiper.slides ? swiper.slides.length : 0
    
    console.log('🔍 Pagination check:', { currentSlide, totalSlides, selected_series, hasMore: seriesHasMore[selected_series] })
    
    // Load more when reaching slide 7 (index 6) or when 3 slides remaining
    if (currentSlide >= 6 || (totalSlides - currentSlide) <= 3) {
      console.log('🚀 Loading more images - trigger point reached')
      loadMoreImages()
    }
  }, [selected_series, seriesHasMore, isLoadingMore, loadMoreImages, studyId?.status, isFinalReportEditable])

  const worksheetUploadHandler = async id => {
    if (!worksheetFile || worksheetFile.length === 0) {
      return
    }
    showLoadingAlert()
    try {
      let Iserror = ''
      // Validate all files first
      for (let i = 0; i < worksheetFile.length; i++) {
        const file = worksheetFile[i]
        const ext = file.name.split('.').pop().toLowerCase()
        if (ext !== 'pdf') {
          Iserror = 'Only PDF files are allowed, please check your worksheets!'
          break
        } else if (file.size > 5000000) {
          //5 MB = 5,000,000 bytes in decimal and 5 MB = 5,242,880 bytes in binary
          Iserror = `File "${file.name}" is too large. File size should not be more than 5MB!`
          break
        }
      }
      
      if (Iserror) {
        hideLoadingAlert()
        showErrorAlert(Iserror)
        return
      }

      // Upload files one by one since backend replaces instead of adding
      let successCount = 0
      let errorCount = 0
      
      for (let i = 0; i < worksheetFile.length; i++) {
        try {
          // Create a FileList-like object with single file for the API
          const singleFileList = {
            0: worksheetFile[i],
            length: 1,
            item(index) { return this[index] }
          }
          
          const data = await uploadWorksheet(singleFileList, id)
          successCount++
        } catch (uploadError) {
          console.error(`Error uploading file ${worksheetFile[i].name}:`, uploadError)
          errorCount++
        }
      }
      
      hideLoadingAlert()

      // Show appropriate success/error message
      if (successCount > 0 && errorCount === 0) {
        showSuccessAlert(`${successCount} worksheet${successCount > 1 ? 's' : ''} uploaded successfully!`)
      } else if (successCount > 0 && errorCount > 0) {
        showSuccessAlert(`${successCount} worksheet${successCount > 1 ? 's' : ''} uploaded successfully. ${errorCount} failed.`)
      } else {
        showErrorAlert('Failed to upload worksheets. Please try again.')
      }

      // Refresh worksheet list by calling API again to get all worksheets including newly uploaded ones
      // Add a small delay to ensure database has been updated
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const refreshedData = await getAllWorkSheet(studyId?.ID)
      if (refreshedData) {
        const notDeletedData = refreshedData.filter(item => !item.isDeleted)
        setWorksheetData(notDeletedData)
        console.log(`[worksheetUploadHandler] ✅ Refreshed worksheet list: ${notDeletedData.length} worksheets`)
      } else {
        console.warn(`[worksheetUploadHandler] ⚠️ No worksheet data returned from getAllWorkSheet`)
        setWorksheetData([])
      }

      // Trigger changeState to force useEffect to re-run
      setChangeState(prev => !prev)
      
      setWorksheetFile('')
    } catch (err) {
      hideLoadingAlert()
      showErrorAlert('Something went wrong, please check your worksheet or check again sometime!')
    }
    
    // Clear the file input
    const fileInput = document.getElementById('studyWorksheet')
    if (fileInput) {
      fileInput.value = null
    }
  }

  const alertDisplay = (title, text, icon) => {
    if (icon === 'error') {
      showErrorAlert(text, title)
    } else if (icon === 'success') {
      showSuccessAlert(text, title)
    } else {
      showInfoAlert(text, title)
    }
  }

  const saveAndFinalizeReport = async () => {
    console.log('🚀 saveAndFinalizeReport function called')
    try {
      console.log('📝 Starting form validation trigger')

      // CRITICAL: Comprehensive validation of studyId and required data before proceeding
      if (!studyId || typeof studyId !== 'object') {
        console.error(`[saveAndFinalizeReport] studyId is not a valid object:`, studyId)
        setSaveReportandFinaliseLoading(false)
        return alertDisplay(
          'Error',
          'Invalid study data - cannot proceed with save and finalize',
          'error'
        )
      }

      if (
        !studyId.ID ||
        studyId.ID === 'undefined' ||
        studyId.ID === 'null' ||
        studyId.ID.toString().trim() === ''
      ) {
        console.error(`[saveAndFinalizeReport] Invalid studyId: ${studyId?.ID}`)
        setSaveReportandFinaliseLoading(false)
        return alertDisplay(
          'Error',
          'Invalid study ID - cannot proceed with save and finalize',
          'error'
        )
      }

      // Validate user authentication
      if (!userData || !userData._id) {
        console.error(`[saveAndFinalizeReport] User data is missing or invalid`)
        setSaveReportandFinaliseLoading(false)
        return alertDisplay('Error', 'User authentication required - please login again', 'error')
      }

      // Validate access token
      if (!accessToken || accessToken === 'undefined' || accessToken === 'null') {
        console.error(`[saveAndFinalizeReport] Access token is missing or invalid`)
        setSaveReportandFinaliseLoading(false)
        return alertDisplay('Error', 'Authentication token missing - please login again', 'error')
      }

      // Validate form functions are available
      if (typeof trigger !== 'function' || typeof getValues !== 'function') {
        console.error(`[saveAndFinalizeReport] Form functions are not available`)
        setSaveReportandFinaliseLoading(false)
        return alertDisplay(
          'Error',
          'Form validation functions not available - please refresh the page',
          'error'
        )
      }

      // Skip templateType validation if user is not RDU or if we have a default template
      const fieldsToValidate = [
        'patientName',
        'patientID',
        'patientBirthDate',
        'patientSex',
        'hospitalName',
        'reportDate',
        'examDescription',
        'reportDescription',
        'reportDiagnosis',
      ]

      if (userData?.role === 'RDU') {
        fieldsToValidate.push('templateType')
      }

      await trigger(fieldsToValidate)
      console.log('✅ Form validation completed, errors:', Object.keys(errors))
      if (Object.keys(errors).length === 0) {
        console.log('✅ No validation errors, proceeding with save and finalize')
        setSaveReportandFinaliseLoading(true)
        console.log('🔄 Set loading state to true')
        if (studyId?.status === STUDYSTATUS.Final && !detectChange) {
          setSaveReportandFinaliseLoading(false)
          return alertDisplay('Information!', 'No changes done, nothing to update.', 'info')
        }

        // Enhanced editor validation with comprehensive null checks
        if (!editorRef || !editorRef.current) {
          console.log('❌ Editor ref is null or undefined')
          setSaveReportandFinaliseLoading(false)
          return alertDisplay(
            'Error',
            'Editor is not initialized. Please wait and try again.',
            'error'
          )
        }

        // Validate editor DOM container exists and is attached
        let editorContainer = null
        try {
          editorContainer = editorRef.current.getContainer && editorRef.current.getContainer()
          if (!editorContainer || !editorContainer.parentNode) {
            console.log('❌ Editor container is not properly attached to DOM')
            setSaveReportandFinaliseLoading(false)
            return alertDisplay(
              'Error',
              'Editor is not properly initialized. Please refresh the page and try again.',
              'error'
            )
          }
        } catch (containerError) {
          console.error('❌ Editor container validation failed:', containerError)
          setSaveReportandFinaliseLoading(false)
          return alertDisplay(
            'Error',
            'Editor container is not accessible. Please refresh the page and try again.',
            'error'
          )
        }

        // Validate editor methods with comprehensive error handling
        let editorValid = false
        try {
          if (typeof editorRef.current.getContent === 'function') {
            // Check if editor is in a valid state before getting content
            if (editorRef.current.initialized !== false && editorRef.current.removed !== true) {
              // Try to get content to test if editor is working
              const testContent = editorRef.current.getContent()
              editorValid = true
              console.log('✅ Editor validation passed')
            } else {
              console.log('❌ Editor is not in a valid state (not initialized or removed)')
              setSaveReportandFinaliseLoading(false)
              return alertDisplay(
                'Error',
                'Editor is not in a valid state. Please refresh the page and try again.',
                'error'
              )
            }
          }
        } catch (editorError) {
          console.error('❌ Editor validation failed:', editorError)
          setSaveReportandFinaliseLoading(false)
          return alertDisplay(
            'Error',
            'Editor is not ready. Please wait a moment and try again.',
            'error'
          )
        }

        if (!editorValid) {
          console.log('❌ Editor methods not available')
          setSaveReportandFinaliseLoading(false)
          return alertDisplay(
            'Error',
            'Editor methods are not ready. Please refresh and try again.',
            'error'
          )
        }

        console.log('📊 Editor is ready, getting form data')
        let data
        try {
          data = getValues()
          if (!data || typeof data !== 'object') {
            throw new Error('Form data is invalid or empty')
          }
        } catch (formError) {
          console.error('❌ Error getting form values:', formError.message)
          setSaveReportandFinaliseLoading(false)
          return alertDisplay(
            'Error',
            'Unable to retrieve form data - please check all fields',
            'error'
          )
        }
        console.log('📋 Form data retrieved:', data)

        // Handle templateType - ensure it has a value
        let templateTypeValue = userData?.role === 'RDU' ? data.templateType : studyId.templateType
        if (!templateTypeValue && allTemplate && allTemplate.length > 0) {
          templateTypeValue = allTemplate.find(t => t.default)?._id || allTemplate[0]._id
          console.log('🔧 Using default template:', templateTypeValue)
        }

        // Get editor content safely with enhanced error handling
        let reportDiagnosis = ''
        try {
          if (
            editorRef.current?.getContent &&
            editorRef.current.initialized !== false &&
            !editorRef.current.removed
          ) {
            // Verify DOM container is still valid
            const container = editorRef.current.getContainer && editorRef.current.getContainer()
            if (container && document.contains(container)) {
              reportDiagnosis = editorRef.current.getContent() || ''
            } else {
              console.warn('⚠️ Editor container not in DOM, using empty content')
              reportDiagnosis = ''
            }
          }
        } catch (e) {
          console.warn('⚠️ Error getting editor content:', e.message)
          reportDiagnosis = ''
        }

        // Don't destroy editor immediately - let it be handled by cleanup

        const toData = {
          patientName: data.patientName || studyId?.patient?.PatientName || '',
          patientID: data.patientID || studyId?.patient?.PatientID || '',
          examDescription: data.examDescription || studyId?.details?.StudyDescription || '',
          reportDescription: data.reportDescription || studyId?.ReportDescription || '',
          patientSex: data.patientSex || studyId?.patient?.PatientSex || '',
          patientBirthDate: pickerDOB
            ? moment(pickerDOB).format(userData?.dateFormats?.dateFormat || 'YYYY-MM-DD')
            : null,
          hospitalName: data.hospitalName || studyId?.details?.InstitutionName || '',
          activityState:
            studyId?.status === STUDYSTATUS.Unread || studyId?.status === STUDYSTATUS.Preliminary
              ? 'create'
              : 'update',
          reportDiagnosis,
          radiologist: userData?._id || '',
          studyId: studyId?.id || studyId?.ID || '',
          templateType: templateTypeValue || '',
          imageArray: Array.isArray(selectImage) ? selectImage : [],
          priority: priorityValue || 'Normal',
          isFinalReportEdit: isFinalReportEditable || false,
        }

        // Validate critical fields in toData
        if (!toData.studyId || !toData.radiologist) {
          console.error('❌ Critical fields missing in request data:', {
            studyId: !!toData.studyId,
            radiologist: !!toData.radiologist,
          })
          setSaveReportandFinaliseLoading(false)
          return alertDisplay(
            'Error',
            'Required data missing - cannot proceed with save and finalize',
            'error'
          )
        }

        console.log('🔍 Final templateType value:', templateTypeValue)

        const swalMessage =
          studyId.status === STUDYSTATUS.Unread || studyId.status === STUDYSTATUS.Preliminary
            ? 'Report created and finalized successfully!'
            : 'Report updated and finalized successfully!'
        console.log('🔒 Checking study status lock')

        // Check study status before proceeding with error handling
        try {
          await toCheckStudyStatusAllowed(studyId.id || studyId.ID)
        } catch (statusError) {
          console.error('❌ Study status check failed:', statusError)
          setSaveReportandFinaliseLoading(false)

          // Handle specific error cases
          if (statusError?.message?.includes('Study not found')) {
            return alertDisplay(
              'Error',
              'Study not found in database. Please refresh the page and try again.',
              'error'
            )
          } else if (statusError?.message?.includes('Authentication')) {
            return alertDisplay('Error', 'Authentication failed. Please login again.', 'error')
          } else {
            return alertDisplay(
              'Error',
              'Unable to verify study access permissions. Please try again.',
              'error'
            )
          }
        }

        console.log('🌐 Making API call to saveReportAndFinalize with data:', toData)
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/report/saveReportAndFinalize`,
          toData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000, // 30 second timeout
          }
        )

        // Check if response is valid with comprehensive validation
        if (!response || !response.data || typeof response.data !== 'object') {
          throw new Error('Invalid response from server - no data received')
        }

        if (response.data.status === false) {
          throw new Error(response.data.message || 'Server returned error status')
        }

        console.log('✅ API call successful')
        setSaveReportandFinaliseLoading(false)
        alertDisplay('Success!', swalMessage, 'success')

        // Safe cleanup and refresh component with re-render protection
        setIsRerendering(true)
        setTimeout(() => {
          if (isMountedRef.current) {
            setRefreshTrigger(prev => prev + 1)
            setTimeout(() => setIsRerendering(false), 1000)
          }
        }, 500)
      } else {
        console.log('❌ Form validation failed, errors:', errors)
        setSaveReportandFinaliseLoading(false)
      }
    } catch (error) {
      console.error('💥 Error in saveAndFinalizeReport:', error)
      setSaveReportandFinaliseLoading(false)

      let errorMessage = 'Something went wrong!'

      if (error?.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.'
      } else if (error?.response?.status === 403) {
        errorMessage = 'Access denied - insufficient permissions to finalize report'
      } else if (error?.response?.status === 404) {
        errorMessage = 'Study not found or has been deleted'
      } else if (error?.response?.status === 422) {
        errorMessage = 'Invalid data provided - please check all required fields'
      } else if (error?.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = 'Authentication failed. Please login again.'
        } else {
          errorMessage = error.response.data?.error || error.response.data?.message || errorMessage
        }
      } else if (error?.message) {
        errorMessage = error.message
      } else if (error?.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout - please try again'
      }

      alertDisplay('Error', errorMessage, 'error')
    }
  }

  const createAddendum = async () => {
    try {
      setCreateAddendumLoading(true)

      // Enhanced addendum editor validation with DOM checks
      if (!editorAddendumRef.current) {
        setCreateAddendumLoading(false)
        return alertDisplay(
          'Error',
          'Addendum editor is not ready. Please wait and try again.',
          'error'
        )
      }

      // Validate addendum editor DOM container
      let addendumContainer = null
      try {
        addendumContainer =
          editorAddendumRef.current.getContainer && editorAddendumRef.current.getContainer()
        if (!addendumContainer || !addendumContainer.parentNode) {
          console.log('❌ Addendum editor container is not properly attached to DOM')
          setCreateAddendumLoading(false)
          return alertDisplay(
            'Error',
            'Addendum editor is not properly initialized. Please refresh the page and try again.',
            'error'
          )
        }
      } catch (containerError) {
        console.error('❌ Addendum editor container validation failed:', containerError)
        setCreateAddendumLoading(false)
        return alertDisplay(
          'Error',
          'Addendum editor container is not accessible. Please refresh the page and try again.',
          'error'
        )
      }

      // Test addendum editor functionality safely with state checks
      let addendumEditorWorking = false
      try {
        if (typeof editorAddendumRef.current.getContent === 'function') {
          // Check if editor is in a valid state
          if (
            editorAddendumRef.current.initialized !== false &&
            editorAddendumRef.current.removed !== true
          ) {
            const testContent = editorAddendumRef.current.getContent()
            addendumEditorWorking = true
          } else {
            console.log('❌ Addendum editor is not in a valid state')
            setCreateAddendumLoading(false)
            return alertDisplay(
              'Error',
              'Addendum editor is not in a valid state. Please refresh the page and try again.',
              'error'
            )
          }
        }
      } catch (editorError) {
        console.error('Addendum editor test failed:', editorError)
        setCreateAddendumLoading(false)
        return alertDisplay(
          'Error',
          'Addendum editor is not functioning properly. Please refresh and try again.',
          'error'
        )
      }

      if (!addendumEditorWorking) {
        setCreateAddendumLoading(false)
        return alertDisplay(
          'Error',
          'Addendum editor methods are not available. Please refresh and try again.',
          'error'
        )
      }

      // Safely get addendum content with DOM validation
      let addendumContent = ''
      try {
        if (
          editorAddendumRef.current &&
          typeof editorAddendumRef.current.getContent === 'function'
        ) {
          // Additional safety check for editor state
          if (
            editorAddendumRef.current.initialized !== false &&
            editorAddendumRef.current.removed !== true
          ) {
            // Verify DOM container is still valid before getting content
            const container =
              editorAddendumRef.current.getContainer && editorAddendumRef.current.getContainer()
            if (container && container.parentNode) {
              addendumContent = editorAddendumRef.current.getContent() || ''
            } else {
              console.warn('⚠️ Addendum editor container is not valid')
              setCreateAddendumLoading(false)
              return alertDisplay(
                'Error',
                'Addendum editor is not properly connected. Please refresh the page and try again.',
                'error'
              )
            }
          } else {
            console.warn('⚠️ Addendum editor is not in valid state')
            setCreateAddendumLoading(false)
            return alertDisplay(
              'Error',
              'Addendum editor is not in a valid state. Please refresh the page and try again.',
              'error'
            )
          }
        }
      } catch (editorError) {
        console.error('Error getting addendum content:', editorError)
        setCreateAddendumLoading(false)
        return alertDisplay('Error', 'Failed to get addendum content. Please try again.', 'error')
      }

      if (!addendumContent || addendumContent.trim() === '') {
        setCreateAddendumLoading(false)
        return alertDisplay('Error', 'Please enter addendum text before submitting.', 'error')
      }

      const toData = {
        addendumText: addendumContent,
        radiologist: userData?._id,
        studyId: studyId?.id || studyId?.ID || '',
      }

      const swalMessage = 'Addendum added successfully!'

      await axios.post(`${process.env.REACT_APP_API_URL}/report/createAddendum`, toData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      setCreateAddendumLoading(false)
      alertDisplay('Success!', swalMessage, 'success')

      // Safe cleanup and refresh component with re-render protection
      setIsRerendering(true)
      setTimeout(() => {
        if (isMountedRef.current) {
          setRefreshTrigger(prev => prev + 1)
          setTimeout(() => setIsRerendering(false), 1000)
        }
      }, 500)
  } catch (error) {
    console.log('err', error)
    setCreateAddendumLoading(false)
    alertDisplay('Error', extractErrorMessage(error?.response?.data ?? error), 'error')
    }
  }

  const onSubmit = async data => {
    try {
      console.log('🚀 onSubmit function called with data:', data)
      console.log('Form validation errors:', errors)
      console.log('Study ID:', studyId?.ID)
      console.log('User data:', userData)
      console.log('Access token exists:', !!accessToken)
      console.log('🔍 FRONTEND DEBUG - Current URL params:', window.location.search)
      console.log(
        '🔍 FRONTEND DEBUG - ID from URL:',
        new URLSearchParams(window.location.search).get('id')
      )
      console.log('🔍 FRONTEND DEBUG - studyId object:', JSON.stringify(studyId, null, 2))
      console.log('🔍 FRONTEND DEBUG - accessToken value:', accessToken)

      // CRITICAL: Comprehensive validation of studyId and required data before proceeding
      if (!studyId || typeof studyId !== 'object') {
        console.error(`[onSubmit] studyId is not a valid object:`, studyId)
        setSaveReportLoading(false)
        return alertDisplay('Error', 'Invalid study data - cannot proceed with save', 'error')
      }

      if (
        !studyId.ID ||
        studyId.ID === 'undefined' ||
        studyId.ID === 'null' ||
        studyId.ID.toString().trim() === ''
      ) {
        console.error(`[onSubmit] Invalid studyId: ${studyId?.ID}`)
        setSaveReportLoading(false)
        return alertDisplay('Error', 'Invalid study ID - cannot proceed with save', 'error')
      }

      // Validate user authentication
      if (!userData || !userData._id) {
        console.error(`[onSubmit] User data is missing or invalid`)
        setSaveReportLoading(false)
        return alertDisplay('Error', 'User authentication required - please login again', 'error')
      }

      // Validate access token
      if (!accessToken || accessToken === 'undefined' || accessToken === 'null') {
        console.error(`[onSubmit] Access token is missing or invalid`)
        setSaveReportLoading(false)
        return alertDisplay('Error', 'Authentication token missing - please login again', 'error')
      }

      // Validate form data parameter
      if (!data || typeof data !== 'object') {
        console.error(`[onSubmit] Form data is invalid:`, data)
        setSaveReportLoading(false)
        return alertDisplay('Error', 'Invalid form data - please check all fields', 'error')
      }

      console.log('🔄 Setting saveReportLoading to true')
      setSaveReportLoading(true)

      if (studyId?.status === STUDYSTATUS.Final && !detectChange) {
        console.log('⚠️ No changes detected for Final status study')
        setSaveReportLoading(false)
        return alertDisplay('Information!', 'No changes done, nothing to update.', 'info')
      }

      // Enhanced editor validation for onSubmit with DOM checks
      if (!editorRef || !editorRef.current) {
        setSaveReportLoading(false)
        return alertDisplay('Error', 'Editor is not ready. Please wait and try again.', 'error')
      }

      // Validate editor DOM container exists and is attached
      let editorContainer = null
      try {
        editorContainer = editorRef.current.getContainer && editorRef.current.getContainer()
        if (!editorContainer || !editorContainer.parentNode) {
          console.log('❌ Editor container is not properly attached to DOM in onSubmit')
          setSaveReportLoading(false)
          return alertDisplay(
            'Error',
            'Editor is not properly initialized. Please refresh the page and try again.',
            'error'
          )
        }
      } catch (containerError) {
        console.error('❌ Editor container validation failed in onSubmit:', containerError)
        setSaveReportLoading(false)
        return alertDisplay(
          'Error',
          'Editor container is not accessible. Please refresh the page and try again.',
          'error'
        )
      }

      // Test editor functionality safely with state checks
      let editorWorking = false
      try {
        if (typeof editorRef.current.getContent === 'function') {
          // Check if editor is in a valid state
          if (editorRef.current.initialized !== false && editorRef.current.removed !== true) {
            const testContent = editorRef.current.getContent()
            editorWorking = true
          } else {
            console.log('❌ Editor is not in a valid state in onSubmit')
            setSaveReportLoading(false)
            return alertDisplay(
              'Error',
              'Editor is not in a valid state. Please refresh the page and try again.',
              'error'
            )
          }
        }
      } catch (editorError) {
        console.error('Editor test failed in onSubmit:', editorError)
        setSaveReportLoading(false)
        return alertDisplay(
          'Error',
          'Editor is not functioning properly. Please refresh and try again.',
          'error'
        )
      }

      if (!editorWorking) {
        setSaveReportLoading(false)
        return alertDisplay(
          'Error',
          'Editor methods are not available. Please refresh and try again.',
          'error'
        )
      }

      // Get editor content safely with enhanced validation
      let reportDiagnosis = ''
      try {
        if (
          editorRef.current?.getContent &&
          editorRef.current.initialized !== false &&
          !editorRef.current.removed
        ) {
          // Verify DOM container is still valid
          const container = editorRef.current.getContainer && editorRef.current.getContainer()
          if (container && document.contains(container)) {
            reportDiagnosis = editorRef.current.getContent() || ''
          } else {
            console.warn('⚠️ Editor container not in DOM, using empty content')
            reportDiagnosis = ''
          }
        }
      } catch (e) {
        console.warn('⚠️ Error getting editor content:', e.message)
        reportDiagnosis = ''
      }

      // Don't destroy editor immediately - let it be handled by cleanup

      const toData = {
        patientName: data.patientName || '',
        patientID: data.patientID || '',
        examDescription: data.examDescription || '',
        reportDescription: data.reportDescription || '',
        patientSex: data.patientSex || '',
        patientBirthDate: pickerDOB
          ? moment(pickerDOB).format(userData?.dateFormats?.dateFormat || 'YYYY-MM-DD')
          : null,
        hospitalName: data.hospitalName || '',
        activityState: 'create', // Always use 'create' for saveReport endpoint
        reportDate: picker
          ? moment(picker).format(userData?.dateFormats?.dateFormat || 'YYYY-MM-DD')
          : moment().format(userData?.dateFormats?.dateFormat || 'YYYY-MM-DD'),
        reportDiagnosis,
        radiologist:
          userData?.role === 'RDU' ? userData?._id : studyId?.radiologist || userData?._id,
        studyId: studyId?.id || studyId?.ID || '',
        templateType: userData?.role === 'RDU' ? data.templateType : studyId?.templateType,
        imageArray: Array.isArray(selectImage) ? selectImage : [],
        status: STUDYSTATUS.Preliminary, // Always set to Draft when creating/saving
        priority: priorityValue || 'Normal',
      }

      // Validate critical fields in toData
      if (!toData.studyId || !toData.radiologist) {
        console.error('❌ Critical fields missing in onSubmit request data:', {
          studyId: !!toData.studyId,
          radiologist: !!toData.radiologist,
        })
        setSaveReportLoading(false)
        return alertDisplay('Error', 'Required data missing - cannot proceed with save', 'error')
      }

      if (!Array.isArray(allTemplate) || allTemplate.length === 0) {
        setSaveReportLoading(false)
        return alertDisplay(
          'Error',
          'Report template is not available, contact clinic admin!',
          'error'
        )
      }

      if (userData?.role !== 'RDU' && !toData?.templateType && Array.isArray(allTemplate) && allTemplate.length > 0) {
        toData.templateType = allTemplate[0]._id
      }

      const swalMessage =
        studyId?.status === STUDYSTATUS.Unread || studyId?.status === STUDYSTATUS.Preliminary
          ? 'Report created successfully!'
          : 'Report updated successfully!'

      // Check study status before proceeding with error handling
      if (studyId?.ID || studyId?.id) {
        try {
          await toCheckStudyStatusAllowed(studyId.id || studyId.ID)
        } catch (statusError) {
          console.error('[onSubmit] Study status check failed:', statusError)
          setSaveReportLoading(false)

          // Handle specific error cases
          if (statusError?.message?.includes('Study not found')) {
            return alertDisplay(
              'Error',
              'Study not found in database. Please refresh the page and try again.',
              'error'
            )
          } else if (statusError?.message?.includes('Authentication')) {
            return alertDisplay('Error', 'Authentication failed. Please login again.', 'error')
          } else {
            return alertDisplay(
              'Error',
              'Unable to verify study access permissions. Please try again.',
              'error'
            )
          }
        }
      }

      console.log('🌐 Making API call to saveReport with data:', {
        studyId: toData.studyId,
        hasReportDiagnosis: !!toData.reportDiagnosis,
        templateType: toData.templateType,
        activityState: toData.activityState,
      })
      console.log('🔍 FRONTEND DEBUG - Full API request data:', JSON.stringify(toData, null, 2))
      console.log(
        '🔍 FRONTEND DEBUG - API URL:',
        `${process.env.REACT_APP_API_URL}/report/saveReport`
      )
      console.log('🔍 FRONTEND DEBUG - Auth header:', `Bearer ${accessToken}`)

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/report/saveReport`,
        toData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      )

      console.log('✅ API response received:', response?.data)

      // Check if response is valid with comprehensive validation
      if (!response || !response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response from server - no data received')
      }

      if (response.data.status === false) {
        throw new Error(response.data.message || 'Server returned error status')
      }

      setSaveReportLoading(false)
      alertDisplay('Success!', swalMessage, 'success')

      // Safe cleanup and refresh component with re-render protection
      setIsRerendering(true)
      setTimeout(() => {
        if (isMountedRef.current) {
          setRefreshTrigger(prev => prev + 1)
          setTimeout(() => setIsRerendering(false), 1000)
        }
      }, 500)
    } catch (err) {
      console.error('💥 Error in onSubmit:', err)
      setSaveReportLoading(false)

      let errorMessage = 'Something went wrong!'

      if (err?.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.'
      } else if (err?.response?.status === 403) {
        errorMessage = 'Access denied - insufficient permissions to save report'
      } else if (err?.response?.status === 404) {
        errorMessage = 'Study not found or has been deleted'
      } else if (err?.response?.status === 422) {
        errorMessage = 'Invalid data provided - please check all required fields'
      } else if (err?.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = 'Authentication failed. Please login again.'
        } else {
          errorMessage = err.response.data?.error || err.response.data?.message || errorMessage
        }
      } else if (err?.message) {
        errorMessage = err.message
      } else if (err?.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout - please try again'
      }

      alertDisplay('Error', errorMessage, 'error')
    }
  }

  const inputHandler = e => {
    setDetectChange(true)
  }

  const selectImageHandler = e => {
    const imageName = e.target.name
    const currentSelectImage = Array.isArray(selectImage) ? selectImage : []
    
    if (e.target.checked) {
      if (!currentSelectImage.includes(imageName)) {
        setSelectImage([...currentSelectImage, imageName])
      }
    } else {
      setSelectImage(currentSelectImage.filter(img => img !== imageName))
    }
    setDetectChange(true)
  }

  const finalisedPreviewReportHandler = async () => {
    try {
      setPreviewLoading(true)

      // CRITICAL: Comprehensive validation of studyId and required data
      if (!studyId || typeof studyId !== 'object') {
        console.error(`[finalisedPreviewReportHandler] studyId is not a valid object:`, studyId)
        setPreviewLoading(false)
        return alertDisplay('Error', 'Invalid study data - cannot load finalized report', 'error')
      }

      if (
        !studyId.ID ||
        studyId.ID === 'undefined' ||
        studyId.ID === 'null' ||
        studyId.ID.toString().trim() === ''
      ) {
        console.error(`[finalisedPreviewReportHandler] Invalid study ID: ${studyId.ID}`)
        setPreviewLoading(false)
        return alertDisplay('Error', 'Invalid study ID - cannot load finalized report', 'error')
      }

      // Validate user authentication
      if (!userData || !userData._id) {
        console.error(`[finalisedPreviewReportHandler] User data is missing or invalid`)
        setPreviewLoading(false)
        return alertDisplay('Error', 'User authentication required - please login again', 'error')
      }

      // Validate access token
      if (!accessToken || accessToken === 'undefined' || accessToken === 'null') {
        console.error(`[finalisedPreviewReportHandler] Access token is missing or invalid`)
        setPreviewLoading(false)
        return alertDisplay('Error', 'Authentication token missing - please login again', 'error')
      }

      console.log(
        `[finalisedPreviewReportHandler] Loading complete templated finalized report for study: ${studyId.ID}`
      )

      // Always fetch the complete templated report from API for finalized studies
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/report/getReport/${studyId.ID}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000, // 30 second timeout
          }
        )

        console.log('[finalisedPreviewReportHandler] API response received:', {
          success: res?.data?.success,
          hasResult: !!res?.data?.result,
          resultLength: res?.data?.result?.length || 0,
          resultPreview: res?.data?.result
            ? `${res.data.result.substring(0, 100)}...`
            : 'No content',
        })

        // Check API response for complete templated content with comprehensive validation
        if (
          res &&
          res.data &&
          res.data.success &&
          res.data.result &&
          typeof res.data.result === 'string' &&
          res.data.result.trim() !== ''
        ) {
          const reportContent = res.data.result

          console.log('📝 [finalisedPreviewReportHandler] Report content received:', {
            contentLength: reportContent.length,
            contentPreview: `${reportContent.substring(0, 200)}...`,
            hasHtmlTags: reportContent.includes('<'),
            hasPatientInfo: reportContent.includes('Patient'),
            hasMedicalReport: reportContent.includes('Medical Report'),
          })

          // Always show the content regardless of format - let user see what's available
          setCreatedReport(reportContent)
          setPreviewFinalReport(true)
          console.log(
            `[finalisedPreviewReportHandler] Successfully loaded report content (${reportContent.length} characters)`
          )
        } else {
          console.error(
            '[finalisedPreviewReportHandler] API returned empty or invalid result:',
            res?.data
          )
          alertDisplay(
            'Error',
            'No finalized report content available. The report may not have been properly generated with template data.',
            'error'
          )
        }
      } catch (apiError) {
        console.error('[finalisedPreviewReportHandler] API call failed:', apiError)
        let errorMessage = extractErrorMessage(
          apiError?.response?.data ?? apiError,
          'Failed to load finalized report'
        )
        if (apiError?.response?.status === 404) {
          errorMessage = 'Finalized report not found for this study'
        } else if (apiError?.response?.status === 401) {
          errorMessage = 'Authentication failed - please login again'
        } else if (apiError?.response?.status === 403) {
          errorMessage = 'Access denied - insufficient permissions'
        } else if (apiError?.code === 'ECONNABORTED') {
          errorMessage = 'Request timeout - please try again'
        }

        toast.error(<ToastContentForError message={errorMessage} type={'error'} />, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        })
      }

      setPreviewLoading(false)
    } catch (err) {
      console.error('[finalisedPreviewReportHandler] Unexpected error:', err)
      setPreviewLoading(false)

      const errorMessage =
        err?.message || 'An unexpected error occurred while loading the finalized report'
      alertDisplay('Error', errorMessage, 'error')
    }
  }

  const finalPreviewHandler = async () => {
    try {
      setPreviewLoading(true)

      // CRITICAL: Comprehensive validation of studyId and required data
      if (!studyId || typeof studyId !== 'object') {
        console.error(`[finalPreviewHandler] studyId is not a valid object:`, studyId)
        setPreviewLoading(false)
        return alertDisplay('Error', 'Invalid study data - cannot generate preview', 'error')
      }

      if (
        !studyId.ID ||
        studyId.ID === 'undefined' ||
        studyId.ID === 'null' ||
        studyId.ID.toString().trim() === ''
      ) {
        console.error(`[finalPreviewHandler] Invalid studyId: ${studyId?.ID}`)
        setPreviewLoading(false)
        return alertDisplay('Error', 'Invalid study ID - cannot generate preview', 'error')
      }

      // Validate user authentication and form functions
      if (!userData || !userData._id) {
        console.error(`[finalPreviewHandler] User data is missing or invalid`)
        setPreviewLoading(false)
        return alertDisplay('Error', 'User authentication required - please login again', 'error')
      }

      if (!accessToken || accessToken === 'undefined' || accessToken === 'null') {
        console.error(`[finalPreviewHandler] Access token is missing or invalid`)
        setPreviewLoading(false)
        return alertDisplay('Error', 'Authentication token missing - please login again', 'error')
      }

      // Validate form functions are available
      if (typeof trigger !== 'function' || typeof getValues !== 'function') {
        console.error(`[finalPreviewHandler] Form functions are not available`)
        setPreviewLoading(false)
        return alertDisplay(
          'Error',
          'Form validation functions not available - please refresh the page',
          'error'
        )
      }

      await trigger([
        'patientName',
        'patientID',
        'patientBirthDate',
        'patientSex',
        'hospitalName',
        'reportDate',
        'examDescription',
        'reportDescription',
        'reportDiagnosis',
      ])

      if (Object.keys(errors || {}).length === 0) {
        // Safely get report diagnosis text with comprehensive validation and DOM checks
        let reportDiagnosisText = ''

        try {
          // Try addendum editor first
          if (
            editorAddendumRef &&
            editorAddendumRef.current &&
            typeof editorAddendumRef.current.getContent === 'function'
          ) {
            // Check editor state and DOM container
            if (
              editorAddendumRef.current.initialized !== false &&
              editorAddendumRef.current.removed !== true
            ) {
              const container =
                editorAddendumRef.current.getContainer && editorAddendumRef.current.getContainer()
              if (container && container.parentNode) {
                reportDiagnosisText = editorAddendumRef.current.getContent() || ''
              }
            }
          } else if (
            editorRef &&
            editorRef.current &&
            typeof editorRef.current.getContent === 'function'
          ) {
            // Check main editor state and DOM container
            if (editorRef.current.initialized !== false && editorRef.current.removed !== true) {
              const container = editorRef.current.getContainer && editorRef.current.getContainer()
              if (container && container.parentNode) {
                reportDiagnosisText = editorRef.current.getContent() || ''
              }
            }
          }
        } catch (editorError) {
          console.warn('[finalPreviewHandler] Error getting editor content:', editorError.message)
          reportDiagnosisText = ''
        }

        // CRITICAL: Validate all data before creating request object with comprehensive null checks
        const patientBirthDate =
          getValues('patientBirthDate') || studyId?.patient?.PatientBirthDate || ''
        const reportDate = getValues('reportDate') || studyId?.reportDate || ''

        const data = {
          studyId: studyId?.id || studyId?.ID || '',
          patientName: getValues('patientName') || studyId?.patient?.PatientName || '',
          patientID: getValues('patientID') || studyId?.patient?.PatientID || '',
          patientBirthDate: patientBirthDate
            ? moment(patientBirthDate).format(userData?.dateFormats?.dateFormat || 'YYYY-MM-DD')
            : '',
          patientSex: getValues('patientSex') || studyId?.patient?.PatientSex || '',
          hospitalName: getValues('hospitalName') || studyId?.details?.InstitutionName || '',
          reportDate: reportDate
            ? moment(reportDate).format(userData?.dateFormats?.dateFormat || 'YYYY-MM-DD')
            : moment().format(userData?.dateFormats?.dateFormat || 'YYYY-MM-DD'),
          examDescription:
            getValues('examDescription') ||
            studyId?.details?.examDescription ||
            studyId?.details?.StudyDescription ||
            '',
          reportDescription: getValues('reportDescription') || studyId?.ReportDescription || '',
          reportDiagnosis: reportDiagnosisText || '',
          templateType: getValues('templateType') || templateTypeGet || '',
          imageArray: Array.isArray(selectImage) ? selectImage : [],
          isFinalReportEdit: isFinalReportEditable || false,
        }

        console.log('[finalPreviewHandler] Preview data prepared:', {
          studyId: data.studyId,
          hasPatientName: !!data.patientName,
          hasReportDiagnosis: !!data.reportDiagnosis,
          templateType: data.templateType,
        })

        // Check study status before proceeding with error handling
        try {
          await toCheckStudyStatusAllowed(studyId.id || studyId.ID)
        } catch (statusError) {
          console.error('[finalPreviewHandler] Study status check failed:', statusError)
          setPreviewLoading(false)

          // Handle specific error cases
          if (statusError?.message?.includes('Study not found')) {
            return alertDisplay(
              'Error',
              'Study not found in database. Please refresh the page and try again.',
              'error'
            )
          } else if (statusError?.message?.includes('Authentication')) {
            return alertDisplay('Error', 'Authentication failed. Please login again.', 'error')
          } else {
            return alertDisplay(
              'Error',
              'Unable to verify study access permissions. Please try again.',
              'error'
            )
          }
        }

        const res = await axios.post(
          `${process.env.REACT_APP_API_URL}/report/previewReport`,
          data,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000, // 30 second timeout
          }
        )

        // Check if response is valid with comprehensive validation
        if (res && res.data && typeof res.data === 'object') {
          const reportResult = res.data?.result || ''
          if (typeof reportResult === 'string') {
            setCreatedReport(reportResult)
            setPreviewFinalReport(true)
            console.log(
              '[finalPreviewHandler] Preview generated successfully, length:',
              reportResult.length
            )
          } else {
            throw new Error('Invalid report content format received from server')
          }
        } else {
          throw new Error('Invalid response format from server')
        }
      } else {
        console.log('[finalPreviewHandler] Form validation failed, errors:', errors)
        setPreviewLoading(false)
        return alertDisplay(
          'Error',
          'Please fill in all required fields before generating preview',
          'error'
        )
      }

      setPreviewLoading(false)
    } catch (err) {
      console.error('[finalPreviewHandler] Preview error:', err)
      setPreviewLoading(false)

      let errorMessage = 'Something went wrong while generating preview'

      if (err?.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.'
      } else if (err?.response?.status === 403) {
        errorMessage = 'Access denied - insufficient permissions'
      } else if (err?.response?.status === 404) {
        errorMessage = 'Study not found or has been deleted'
      } else if (err?.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = 'Authentication failed. Please login again.'
        } else {
          errorMessage =
            err.response.data?.error?.message || err.response.data?.message || errorMessage
        }
      } else if (err?.message) {
        errorMessage = err.message
      } else if (err?.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout - please try again'
      }

      toast.error(<ToastContentForError message={errorMessage} type={'error'} />, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    }
  }

  const finalizedHandler = async () => {
    console.log('ppp finalize handler ... ')

    if (detectChange) {
      const result = await showConfirm(
        'Confirmation!',
        'Current changes will be discard, Do you want to proceed?',
        'Yes',
        'warning'
      )
      if (result) {
        showLoadingAlert()
        await axios
          .put(
            `${process.env.REACT_APP_API_URL}/report/finalizeReport/${studyId.ID}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          )
          .then(res => {
            hideLoadingAlert()
            alertDisplay('Finalize', res.data.message, 'success')
            setCreateAddendumstate(prev => !prev)
          })
          .catch(err => {
            hideLoadingAlert()
            console.log('err', err)
          })
      }
    } else {
      showLoadingAlert()
      await axios
        .put(
          `${process.env.REACT_APP_API_URL}/report/finalizeReport/${studyId.ID}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        .then(res => {
          hideLoadingAlert()
          alertDisplay('Finalize', res.data.message, 'success')
          setTimeout(() => {
            if (isMountedRef.current) {
              setCreateAddendumstate(prev => !prev)
            }
          }, 100)
        })
        .catch(err => {
          hideLoadingAlert()
          console.log('err', err)
        })
    }
  }

  const changeStatus = async status => {
    await trigger([
      'patientName',
      'patientID',
      'patientBirthDate',
      'patientSex',
      'hospitalName',
      'reportDate',
      'examDescription',
      'reportDescription',
      'reportDiagnosis',
      'templateType',
    ])
    if (Object.keys(errors).length === 0) {
      const lockstatus = await toCheckStudyStatusAllowed(studyId.ID)
      const result = await showConfirm(
        'Confirmation!',
        `Are you sure, you want to ${status === STUDYSTATUS.Unread ? 'lock' : 'update'} this study report?`,
        'Yes',
        'warning'
      )
      if (result) {
        setSaveReportLoading(true)
        const data = getValues()

        const toData = {
          patientName: data.patientName,
          patientID: data.patientID,
          examDescription: data.examDescription,
          reportDescription: data.reportDescription,
          patientSex: data.patientSex,
          patientBirthDate: pickerDOB
            ? Array.isArray(pickerDOB)
              ? moment(pickerDOB[0]).format(userData?.dateFormats?.dateFormat || 'YYYY-MM-DD')
              : moment(pickerDOB).format(userData?.dateFormats?.dateFormat || 'YYYY-MM-DD')
            : null,
          hospitalName: data.hospitalName,
          activityState: STUDYSTATUS.Preliminary,
          reportDate: moment(picker).format(userData?.dateFormats?.dateFormat || 'YYYY-MM-DD'),
          reportDiagnosis: editorRef.current?.getContent() || '',
          radiologist:
            userData?.role === 'RDU' ? userData?._id : studyId.radiologist || userData?._id,
          studyId: studyId?.id || studyId?.ID || '',
          templateType: userData?.role === 'RDU' ? data.templateType : studyId.templateType,
          status: statusValue,
          priority: priorityValue,
        }

        if (!Array.isArray(allTemplate) || allTemplate.length === 0) {
          setSaveReportLoading(false)
          alertDisplay('Error', 'Report template is not available, contact clinic admin!', 'error')
        } else {
          await axios
            .post(
              `${process.env.REACT_APP_API_URL}/report/update/${studyId.ID}/status/${status}`,
              toData,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            )
            .then(res => {
              setSaveReportLoading(false)
              alertDisplay('Success', res.data.message, 'success')
              setCreateAddendumstate(prev => !prev)
            })
            .catch(err => {
              setSaveReportLoading(false)
              alertDisplay(
                'Error',
                extractErrorMessage(err?.response?.data ?? err),
                'error'
              )
            })
        }
      }
    }
  }

  const unlockStudy = async status => {
    await trigger([
      'patientName',
      'patientID',
      'patientBirthDate',
      'patientSex',
      'hospitalName',
      'reportDate',
      'examDescription',
      'reportDescription',
      'reportDiagnosis',
      'templateType',
    ])
    if (Object.keys(errors).length === 0) {
      const result = await showConfirm(
        'Confirmation!',
        'Are you sure, you want to unlock this study report?',
        'Yes',
        'warning'
      )
      if (result) {
        setSaveReportLoading(true)
        await axios
          .get(`${process.env.REACT_APP_API_URL}/report/unlock/${studyId.ID}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
          .then(res => {
            setSaveReportLoading(false)
            alertDisplay('Success', res.data.message, 'success')
            setCreateAddendumstate(prev => !prev)
          })
          .catch(err => {
            setSaveReportLoading(false)
            alertDisplay(
              'Error',
              extractErrorMessage(err?.response?.data ?? err),
              'error'
            )
          })
      }
    }
  }

  const [pdfViewerOpen, setPdfViewerOpen] = useState(false)
  const [pdfUrl, setPdfUrl] = useState('')

  const downloadHandler = async id => {
    setDownloadLoading(true)
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/report/download/${id}`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      // Create blob URL directly from response data
      const blob = new Blob([res.data], {
        type: 'application/pdf',
      })
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
      setPdfViewerOpen(true)
      setDownloadLoading(false)
    } catch (err) {
      console.log('Download error:', err)
      alertDisplay('Error', 'Failed to download PDF. Please try again.', 'error')
      setDownloadLoading(false)
    }
  }

  useEffect(() => {
    const fetchDiagnosisAndTemplates = async () => {
      try {
        if (userData?.role !== ROLES.ClinicAdmin && userData?.role !== ROLES.SharedDoctor) {
          try {
            const res = await getDiagnosis()
            if (res?.data?.list) {
              setAllDiagnosis(res.data.list)
            }
            const templateOption = res?.data?.list
              .filter(modality => {
                return modality?.templates?.length
              })
              .map(modality => {
                //   }
                // })

                return {
                  label: modality.name,
                  value: modality.name,
                }
              })
            setDiagnosisModalityTemplateOptions(prev => [...prev, ...templateOption])
          } catch (err) {
            console.log(err)
          }
        }

        const resTemplate = await getTemplates()
        if (resTemplate?.data?.list) {
          setAllTemplate(resTemplate.data.list)
        }
      } catch (err) {
        console.log(err)
      }
    }
    fetchDiagnosisAndTemplates()
  }, [])

  // const location = useLocation()

  useEffect(() => {
    let mounted = true
    const token = userData?.accessToken

    const handleRouteChange = () => {
      // CRITICAL: Only call cancel lock API if studyId.ID is properly defined
      if (mounted && studyId?.ID && studyId.ID !== 'undefined' && studyId.ID.trim() !== '') {
        console.log(`[PreviewReport] Calling cancel lock API for studyId: ${studyId.ID}`)
        axios
          .get(`${process.env.REACT_APP_API_URL}/report/cancel/${studyId.ID}/lock`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then(res => {
            console.log(`[PreviewReport] Cancel lock API successful for studyId: ${studyId.ID}`)
            mounted = false
          })
          .catch(err => {
            console.error(
              `[PreviewReport] Cancel lock API error for studyId: ${studyId.ID}:`,
              err.response?.data?.message || err.message
            )
            mounted = false
          })
      } else {
        console.warn(
          `[PreviewReport] Skipping cancel lock API call - invalid studyId.ID: ${studyId?.ID}`
        )
        mounted = false
      }
    }

    handleRouteChange()

    return () => {
      mounted = false
    }
  }, [location, studyId?.ID, userData?.accessToken])

  const setOptionsForDiagnosisTemplates = value => {
    const diagnosisTemplates = allDiagnosis.find(o => o.name === value)
    const diagnosisTemplatesOptions = diagnosisTemplates?.templates?.map(modality => {
      return {
        label: modality.name,
        value: modality.text,
      }
    })
    setDiagnosisTemplateOptions([
      { value: '', label: 'Select Template' },
      ...diagnosisTemplatesOptions,
    ])
  }

  // Added by JCasp developer (Mehul) at 06-02-2024 to check if the study image is selected or not. If it is selected and the image ID does not match the selected study image ID, then verify with the base64 content. If a match is found, then set the selected image.
  const getSelectedImage = image => {
    let res = false
    const currentSelectImage = Array.isArray(selectImage) ? selectImage : []
    const currentSelectedImageString = Array.isArray(selectedImageString) ? selectedImageString : []
    
    if (currentSelectImage.includes(image?.imageId)) {
      res = true
    } else if (currentSelectedImageString.includes(image?.base64Image)) {
      const tmp = [...currentSelectedImageString]
      const index = tmp.indexOf(image.base64Image)
      if (index !== -1) {
        setSelectImage([...currentSelectImage, image.imageId])
        tmp.splice(index, 1)
      }
      setSelectedImageString(tmp)

      res = true
    }

    return res
  }

  const findDefault = allTemplate.find(element => element.default)

  return (
    <Fragment>
      {pageLoader ? (
        <Card className="loading-initial">
          <Spinner color="primary" />
        </Card>
      ) : (
        <Card className="card-report-element">
          <Col lg="3" md="6" sm="12" xs="12">
            <Row>
              <Tabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                userData={userData}
                studyId={studyId}
                worksheetDataLength={Array.isArray(worksheetData) ? worksheetData.length : 0}
                isFinalReportEditable={isFinalReportEditable}
              />
            </Row>
          </Col>
          <TabContent activeTab={activeTab}>
            <TabPane tabId="1">
              <Card>
                <CardHeader className="border-bottom card-header-report-element">
                  <Row className="mt-1 mb-50 w-100">
                    <Col lg="3" md="6" sm="12" xs="12">
                      <CardTitle tag="h4" className="text-nowrap">
                        {mode === 'preview' ? 'Preview Report' : 'Create Report'}
                        {studyId?.status === STUDYSTATUS.Final && !isFinalReportEditable ? (
                          <h6>(The report was submitted for the Addendum)</h6>
                        ) : (
                          ''
                        )}
                      </CardTitle>
                    </Col>
                    <Col lg="9" md="6" sm="12" xs="12" className="align-self-end">
                      <Row className="justify-content-end">
                        {(userData?.role === 'RDU' || userData?.role === 'TCU') && (
                          <>
                            <Button
                              className={
                                studyId?.status === STUDYSTATUS.Unread ||
                                studyId?.status === STUDYSTATUS.Preliminary
                                  ? ' text-nowrap ml-1 mt-1  mt-ml-0'
                                  : 'cursor-pointer text-nowrap ml-1 mt-1  mt-ml-0'
                              }
                              color="primary"
                              onClick={e => {
                                if (checkForOtherOperationDm(studyId, 1)) {
                                  return e.preventDefault()
                                }

                                console.log('🔄 Preview Report button clicked:', {
                                  studyId: studyId?.ID,
                                  studyStatus: studyId?.status,
                                  studyStatusFinal: STUDYSTATUS.Final,
                                  isStatusFinal: studyId?.status === STUDYSTATUS.Final,
                                  willCallFinalisedHandler:
                                    studyId && studyId.status === STUDYSTATUS.Final,
                                })

                                // Always use finalisedPreviewReportHandler for Final status studies with validation
                                if (studyId && studyId.status === STUDYSTATUS.Final && !isFinalReportEditable) {
                                  console.log(
                                    '✅ Calling finalisedPreviewReportHandler for Final status'
                                  )
                                  finalisedPreviewReportHandler()
                                } else if (studyId && studyId.status) {
                                  console.log('✅ Calling finalPreviewHandler for non-Final status')
                                  finalPreviewHandler()
                                } else {
                                  console.log('❌ No valid status found')
                                  alertDisplay(
                                    'Error',
                                    'Study status information is missing - cannot generate preview',
                                    'error'
                                  )
                                }
                              }}
                            >
                              {previewLoading ? (
                                <Spinner color="light" size="sm" />
                              ) : (
                                'Preview Report'
                              )}
                            </Button>
                          </>
                        )}

                        {userData?.role !== ROLES.Doctor &&
                          userData?.role !== ROLES.ReferringDoctor && (
                            <Button
                              className={
                                studyId.status === STUDYSTATUS.Final
                                  ? 'cursor-pointer white-space ml-1 mt-1  mt-ml-0'
                                  : 'white-space ml-1 mt-1  mt-ml-0'
                              }
                              color="primary"
                              disabled={studyId.status !== STUDYSTATUS.Final ?? false}
                              onClick={e => {
                                if (checkForOtherOperationDm(studyId, 1)) {
                                  return e.preventDefault()
                                }
                                downloadHandler(studyId.ID)
                              }}
                            >
                              {downloadLoading ? <Spinner color="light" size="sm" /> : 'Download'}
                            </Button>
                          )}

                        {userData?.role === 'RDU' && studyId.status === STUDYSTATUS.Ready && (
                          <Button
                            className={
                              studyId.status === STUDYSTATUS.Ready
                                ? 'cursor-pointer white-space ml-1 mt-1  mt-ml-0'
                                : 'white-space ml-1 mt-1  mt-ml-0'
                            }
                            color="primary"
                            disabled={studyId.status !== STUDYSTATUS.Ready ?? false}
                            onClick={e => {
                              if (checkForOtherOperationDm(studyId, 1)) {
                                return e.preventDefault()
                              }
                              finalizedHandler()
                            }}
                          >
                            Finalize
                          </Button>
                        )}
                        {userData?.role === 'RDU' &&
                          (studyId.status === STUDYSTATUS.Unread ||
                            studyId.status === STUDYSTATUS.Preliminary) && (
                            <Button
                              className="white-space ml-1 mt-1  mt-ml-0"
                              color="primary"
                              onClick={e => {
                                changeStatus(studyId.status)
                              }}
                            >
                              {studyId.status === STUDYSTATUS.Unread
                                ? `Set as ${STUDYSTATUS.Preliminary}`
                                : `Save as ${STUDYSTATUS.Preliminary}`}
                            </Button>
                          )}
                      </Row>
                    </Col>
                  </Row>
                  {(studyId.status !== STUDYSTATUS.Final || isFinalReportEditable) && (
                    <Row className="w-100 justify-content-start">
                      <Col lg="3" md="6">
                        <Label htmlFor="priority">Priority</Label>
                        <Input
                          name="priority"
                          id="priority"
                          onChange={e => setPriorityValue(e.target.value)}
                          value={priorityValue}
                          disabled
                        >
                          <option value="Normal">Normal</option>
                          <option value="Stat">Stat</option>
                        </Input>
                      </Col>
                      <Col lg="3" md="6">
                        <Label htmlFor="status">Status</Label>
                        <Input
                          name="status"
                          id="status"
                          onChange={e => setStatusValue(e.target.value)}
                          value={statusValue}
                          disabled
                        >
                          <option value={STUDYSTATUS.Ready}>{STUDYSTATUS.Ready}</option>
                          <option value="Dictated">Dictated</option>
                          <option value={STUDYSTATUS.Preliminary}>{STUDYSTATUS.Preliminary}</option>
                          <option value={STUDYSTATUS.Final}>{STUDYSTATUS.Final}</option>
                        </Input>
                      </Col>

                      <Col lg="3" md="6">
                        <FormGroup>
                          <Label htmlFor="templateType">Report Template:</Label>
                          <Input
                            type="select"
                            name="templateType"
                            id="templateType"
                            {...register('templateType', { required: userData?.role === 'RDU' || userData?.role === 'TCU' })}
                            value={
                              watchTemplateType ||
                              studyId?.templateType ||
                              findDefault?._id ||
                              allTemplate?.find(t => t.default)?._id ||
                              allTemplate?.[0]?._id ||
                              ''
                            }
                            disabled={(userData?.role !== 'RDU' && userData?.role !== 'TCU') ?? false}
                            onChange={e => {
                              setValue('templateType', e.target.value)
                              setDetectChange(true)
                            }}
                          >
                            <option value="">Select Template</option>
                            {(() => {
                              const safeTemplates = Array.isArray(allTemplate) ? allTemplate : []
                              return safeTemplates.map((template, index) => {
                                return (
                                  <option key={template?._id || `template-${index}`} value={template?._id || ''}>
                                    {template?.name || `Template ${index + 1}`}
                                  </option>
                                )
                              })
                            })()}
                          </Input>
                          {errors && errors.templateType && (
                            <FormFeedback>{errors.templateType.message}</FormFeedback>
                          )}
                        </FormGroup>
                      </Col>
                    </Row>
                  )}
                </CardHeader>
                <CardBody className="px-4 py-1 card-body-report-element">
                  <Form onSubmit={handleSubmit(onSubmit)}>
                    {(studyId.status !== STUDYSTATUS.Final || isFinalReportEditable) && (
                      <>
                        <Row form className="mt-1 mb-50">
                          <Col lg="3" md="6" className="px-1">
                            <FormGroup>
                              <Label htmlFor="patientName">Patient Name:</Label>
                              <Input
                                id="patientName"
                                name="patientName"
                                placeholder="Enter patient name"
                                defaultValue={studyId?.patient?.PatientName || '-'}
                                {...register('patientName', { required: true })}
                                invalid={errors?.patientName && true}
                                onChange={inputHandler}
                                readOnly={true}
                              />
                              {errors && errors.patientName && (
                                <FormFeedback>{errors.patientName.message}</FormFeedback>
                              )}
                            </FormGroup>
                          </Col>
                          <Col lg="3" md="6" className="px-1">
                            <FormGroup>
                              <Label htmlFor="patientBirthDate">Date-of-Birth:</Label>
                              <Input
                                name="patientBirthDate"
                                value={pickerDOB}
                                id="patientBirthDate"
                                {...register('patientBirthDate', { required: true })}
                                invalid={errors?.patientBirthDate && true}
                                onChange={inputHandler}
                                readOnly={true}
                              />

                              {errors && errors.patientBirthDate && (
                                <FormFeedback>{errors.patientBirthDate.message}</FormFeedback>
                              )}
                            </FormGroup>
                          </Col>
                          <Col lg="3" md="6" className="px-1">
                            <FormGroup>
                              <Label htmlFor="patientSex">Sex:</Label>
                              <Input
                                type="select"
                                name="patientSex"
                                id="patientSex"
                                onChange={inputHandler}
                                placeholder="Enter patient sex"
                                invalid={errors?.sex && true}
                                {...register('sex', { required: true })}
                                value={studyId?.patient?.PatientSex || ''}
                                disabled={true}
                                readOnly={true}
                              >
                                <option value="F">Female</option>
                                <option value="M">Male</option>
                              </Input>
                              {errors && errors.patientSex && (
                                <FormFeedback>{errors.patientSex.message}</FormFeedback>
                              )}
                            </FormGroup>
                          </Col>
                          <Col lg="3" md="6" className="px-1">
                            <FormGroup>
                              <Label htmlFor="hospitalName">Hospital:</Label>
                              <Input
                                id="hospitalName"
                                name="hospitalName"
                                placeholder="Enter hospital name"
                                defaultValue={studyId?.details?.InstitutionName || '-'}
                                {...register('hospitalName', { required: true })}
                                invalid={errors?.hospitalName && true}
                                onChange={inputHandler}
                                readOnly={true}
                              />
                              {errors && errors.hospitalName && (
                                <FormFeedback>{errors.hospitalName.message}</FormFeedback>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row form className="mt-1 mb-50">
                          <Col lg="3" md="6" className="px-1">
                            <FormGroup>
                              <Label htmlFor="patientID">Patient Id:</Label>
                              <Input
                                id="patientID"
                                name="patientID"
                                placeholder="Enter patient id"
                                defaultValue={studyId?.patient?.PatientID || '-'}
                                {...register('patientID', { required: true })}
                                invalid={errors?.patientID && true}
                                onChange={inputHandler}
                                readOnly={true}
                              />
                              {errors && errors.patientID && (
                                <FormFeedback>{errors.patientID.message}</FormFeedback>
                              )}
                            </FormGroup>
                          </Col>
                          <Col lg="3" md="6" className="px-1">
                            <FormGroup>
                              <Label htmlFor="reportDate">Report Date:</Label>
                              <Input
                                name="reportDate"
                                type="hidden"
                                value={picker}
                                id="reportDate"
                                {...register('reportDate', { required: true })}
                                invalid={errors?.reportDate && true}
                                onChange={inputHandler}
                              />
                              <Flatpickr
                                className={'form-control disabled-ficker'}
                                value={picker}
                                disabled={true}
                                {...register('reportDate', { required: true })}
                                options={{
                                  dateFormat: flatPickerDateFormat,
                                }}

                                // }}
                              />
                            </FormGroup>
                          </Col>
                          <Col lg="3" md="6" className="px-1">
                            <FormGroup>
                              <Label htmlFor="examDescription">Exam Description:</Label>
                              <Input
                                id="examDescription"
                                name="examDescription"
                                placeholder="Exam Description"
                                defaultValue={
                                  studyId.status === STUDYSTATUS.Unread ||
                                  studyId.status === STUDYSTATUS.Preliminary
                                    ? (studyId?.details?.StudyDescription ?? '')
                                    : studyId?.details?.StudyDescription
                                }
                                {...register('examDescription', { required: true })}
                                invalid={errors?.examDescription && true}
                                onChange={inputHandler}
                                readOnly={
                                  (userData?.role !== 'TCU' ||
                                    studyId.status === STUDYSTATUS.Preliminary) ??
                                  false
                                }
                              />
                              {errors && errors.examDescription && (
                                <FormFeedback>{errors.examDescription.message}</FormFeedback>
                              )}
                            </FormGroup>
                          </Col>
                          <Col lg="3" md="6" className="px-1">
                            <FormGroup>
                              <Label htmlFor="reportDescription">Reason for Exam:</Label>
                              <Input
                                id="reportDescription"
                                name="reportDescription"
                                placeholder="Reason for Exam"
                                defaultValue={
                                  studyId.status === STUDYSTATUS.Unread
                                    ? ''
                                    : studyId?.ReportDescription
                                }
                                {...register('reportDescription', { required: true })}
                                invalid={errors?.reportDescription && true}
                                onChange={inputHandler}
                                readOnly={
                                  !(
                                    userData?.role === 'RDU' ||
                                    (userData?.role === 'TCU' && !studyId.radiologist)
                                  ) ?? true
                                }
                              />
                              {errors && errors.reportDescription && (
                                <FormFeedback>{errors.reportDescription.message}</FormFeedback>
                              )}
                            </FormGroup>
                          </Col>
                          {userData?.role === 'RDU' && (
                            <Col>
                              <Row>
                                <Label className="px-1 my-1">Diagnosis template:</Label>
                              </Row>
                              <Row>
                                <Col lg="3" md="6" className="px-1">
                                  <FormGroup>
                                    <Label htmlFor="layout">Modality:</Label>
                                    <Select
                                      isClearable={false}
                                      theme={selectThemeColors}
                                      defaultValue={diagnosisModalityTemplateOptions[0]}
                                      name="layout"
                                      id="layout"
                                      options={diagnosisModalityTemplateOptions}
                                      className="react-select"
                                      classNamePrefix="select"
                                      onChange={e => {
                                        if (e.value !== '') {
                                          setOptionsForDiagnosisTemplates(e.value)
                                        }
                                      }}
                                    />

                                    {errors && errors.layout && (
                                      <FormFeedback>{errors.layout.message}</FormFeedback>
                                    )}
                                  </FormGroup>
                                </Col>
                                <Col lg="3" md="6" className="px-1">
                                  <FormGroup>
                                    <Label htmlFor="layout">Templates:</Label>
                                    <Select
                                      isClearable={false}
                                      theme={selectThemeColors}
                                      defaultValue={diagnosisTemplateOptions[0]}
                                      name="layout"
                                      id="layout"
                                      options={diagnosisTemplateOptions}
                                      className="react-select"
                                      classNamePrefix="select"
                                      value={{ value: '', label: 'Select Template' }}
                                      onChange={e => {
                                        if (
                                          e.value !== '' &&
                                          !isRerendering &&
                                          editorRef.current &&
                                          editorRef.current.initialized !== false &&
                                          !editorRef.current.removed
                                        ) {
                                          try {
                                            editorRef.current.execCommand(
                                              'mceInsertContent',
                                              false,
                                              e.value
                                            )
                                          } catch (err) {
                                            console.warn('Template insert failed:', err.message)
                                          }
                                        }
                                      }}
                                    />

                                    {errors && errors.layout && (
                                      <FormFeedback>{errors.layout.message}</FormFeedback>
                                    )}
                                  </FormGroup>
                                </Col>
                              </Row>
                            </Col>
                          )}
                        </Row>
                      </>
                    )}
                    <Row className="mt-1 mb-50 w-80">
                      <Input
                        name="reportDiagnosis"
                        type="hidden"
                        defaultValue={studyId.finalisedReportDiagnosisString}
                        id="reportDiagnosis"
                        {...register('reportDiagnosis', { required: true })}
                        invalid={errors?.reportDiagnosis && true}
                        onChange={inputHandler}
                      />

                      <Col lg="12" md="12" className="mb-2">
                        {userData?.role === 'RDU' ||
                        (userData?.role === 'TCU' && !studyId.radiologist) ? (
                          studyId.status !== STUDYSTATUS.Final || isFinalReportEditable ? (
                            !pageLoader &&
                            studyId.ID &&
                            !isRerendering && (
                              <div
                                key={`main-editor-wrapper-${studyId?.ID || 'default'}-${refreshTrigger}`}
                              >
                                <Editor
                                  onInit={(evt, editor) => {
                                    // Enhanced initialization with comprehensive error handling and DOM safety
                                    const initializeEditor = () => {
                                      try {
                                        if (!editor || !isMountedRef.current) {
                                          console.warn(
                                            '📝 Main editor object is null or component unmounted'
                                          )
                                          setMainEditorReady(false)
                                          return
                                        }

                                        // Enhanced readiness check with timeout protection
                                        if (editor.initialized === false || !editor.getBody()) {
                                          let retryCount = 0
                                          const maxRetries = 10

                                          const onEditorReady = () => {
                                            retryCount++
                                            if (retryCount > maxRetries || !isMountedRef.current) {
                                              console.warn(
                                                '📝 Main editor initialization timeout or unmounted'
                                              )
                                              setMainEditorReady(false)
                                              return
                                            }

                                            setTimeout(() => {
                                              if (
                                                editor.initialized !== false &&
                                                editor.getBody() &&
                                                !editor.removed &&
                                                isMountedRef.current
                                              ) {
                                                initializeEditor()
                                              } else if (isMountedRef.current) {
                                                onEditorReady()
                                              }
                                            }, 150)
                                          }

                                          if (editor.initialized === false) {
                                            editor.on('init', onEditorReady)
                                          } else {
                                            onEditorReady()
                                          }
                                          return
                                        }

                                        // Validate essential methods with enhanced checks
                                        if (
                                          typeof editor.getContent !== 'function' ||
                                          typeof editor.getContainer !== 'function' ||
                                          typeof editor.setContent !== 'function'
                                        ) {
                                          console.warn(
                                            '📝 Main editor essential methods not available'
                                          )
                                          setMainEditorReady(false)
                                          return
                                        }

                                        // Enhanced container validation with DOM safety
                                        let container = null
                                        try {
                                          container = editor.getContainer()

                                          if (!container) {
                                            console.warn('📝 Main editor container is null')
                                            setMainEditorReady(false)
                                            return
                                          }

                                          // Multiple DOM validation checks
                                          if (!container.parentNode) {
                                            console.warn('📝 Main editor container has no parent')
                                            setMainEditorReady(false)
                                            return
                                          }

                                          if (!document.contains(container)) {
                                            console.warn('📝 Main editor container not in document')
                                            setMainEditorReady(false)
                                            return
                                          }

                                          // Check if container is properly styled and visible
                                          const computedStyle = window.getComputedStyle(container)
                                          if (computedStyle.display === 'none') {
                                            console.warn('📝 Main editor container is hidden')
                                            // Don't fail here, just warn
                                          }

                                          console.log('✅ Main editor container validation passed')
                                        } catch (e) {
                                          console.warn(
                                            '📝 Main editor container validation failed:',
                                            e.message
                                          )
                                          setMainEditorReady(false)
                                          return
                                        }

                                        // Enhanced functionality test with error recovery
                                        try {
                                          const testContent = editor.getContent()
                                          // Test setting content as well
                                          const originalContent = testContent
                                          editor.setContent(originalContent)
                                          console.log('✅ Main editor functionality test passed')
                                        } catch (contentError) {
                                          console.warn(
                                            '📝 Main editor functionality test failed:',
                                            contentError.message
                                          )
                                          setMainEditorReady(false)
                                          return
                                        }

                                        // Final safety check before marking ready
                                        if (!isMountedRef.current) {
                                          console.warn(
                                            '📝 Component unmounted during editor initialization'
                                          )
                                          return
                                        }

                                        // Success - set the editor reference with additional safety
                                        try {
                                          editorRef.current = editor
                                          setMainEditorReady(true)
                                          console.log('✅ Main editor initialized successfully')
                                        } catch (refError) {
                                          console.error(
                                            '📝 Failed to set editor reference:',
                                            refError.message
                                          )
                                          setMainEditorReady(false)
                                        }
                                      } catch (error) {
                                        console.error(
                                          '📝 Main editor initialization error:',
                                          error.message
                                        )
                                        setMainEditorReady(false)
                                        editorRef.current = null
                                      }
                                    }

                                    // Initialize with enhanced timing and safety
                                    if (isMountedRef.current) {
                                      setTimeout(initializeEditor, 300)
                                    }
                                  }}
                                  onEditorChange={text => {
                                    if (
                                      isStateTransitioning ||
                                      !isMountedRef.current ||
                                      isRerendering
                                    ) {
                                      return
                                    }
                                    try {
                                      if (
                                        editorRef.current &&
                                        editorRef.current.initialized !== false &&
                                        !editorRef.current.removed
                                      ) {
                                        handleAutoLogout()
                                        setDetectChange(true)
                                        setValue('reportDiagnosis', text)
                                      }
                                    } catch (error) {
                                      console.warn('📝 Editor change handler error:', error.message)
                                    }
                                  }}
                                  initialValue={studyId.finalisedReportDiagnosisString || ''}
                                  init={{
                                    height: 500,
                                    menubar: true,
                                    selector: undefined,
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
                                      'body { font-family:Helvetica,Arial,sans-serif; font-size:14px } .mce-content-body[data-mce-placeholder]:not(.mce-visualblocks)::before { white-space: pre-line;} .mce-content-body p { margin: 0; padding: 0; margin-block: 0; margin-inline: 0; line-height: normal; }',
                                    placeholder: `Anything entered here will be added to the report layout chosen from the diagnosis template,\n To see the exact report, click on the preview.\n Preview will only works once you created the report.\n Download will only works after finalization of the report\n Press Shift+Enter to continue below this line.`,
                                    setup: editor => {
                                      // Enhanced safety measures and error handling
                                      editor.on('PreInit', () => {
                                        console.log('📝 Main editor PreInit')
                                      })

                                      editor.on('PostRender', () => {
                                        console.log('📝 Main editor PostRender')
                                      })

                                      // Add error handling for editor operations
                                      editor.on('NodeChange', e => {
                                        try {
                                          // Safely handle node changes
                                          if (!e.element || !document.contains(e.element)) {
                                            console.warn('📝 NodeChange event with invalid element')
                                            return false
                                          }
                                        } catch (error) {
                                          console.warn('📝 NodeChange error:', error.message)
                                          return false
                                        }
                                      })

                                      // Handle editor removal safely
                                      editor.on('remove', () => {
                                        console.log('📝 Main editor remove event')
                                        if (editorRef.current === editor) {
                                          editorRef.current = null
                                          setMainEditorReady(false)
                                        }
                                      })
                                    },
                                  }}
                                />
                              </div>
                            )
                          ) : studyId?.reportString ? (
                            parse(studyId.reportString)
                          ) : (
                            ''
                          )
                        ) : studyId.status === STUDYSTATUS.Unread ||
                          studyId.status === STUDYSTATUS.Preliminary ? (
                          userData?.role === 'TCU' && studyId.status !== STUDYSTATUS.Unread ? (
                            <h3 className="text-center m-3">Report is locked by a radiologist</h3>
                          ) : (
                            <h3 className="text-center m-3">Report not created</h3>
                          )
                        ) : studyId?.reportString || studyId?.finalisedReportDiagnosisString ? (
                          parse(studyId.reportString || studyId.finalisedReportDiagnosisString)
                        ) : (
                          <div className="text-center m-3">
                            <h5>No report content available</h5>
                            <p>This finalized study does not have report content to display.</p>
                          </div>
                        )}
                      </Col>
                    </Row>
                    {(((userData?.role === 'RDU' ||
                      (userData?.role === 'TCU' && !studyId.radiologist)) &&
                      studyId.status !== STUDYSTATUS.Final) ||
                      isFinalReportEditable) && (
                      <>
                        <Row>
                          <Col lg="2" md="6" sm="12">
                            <Input
                              type="select"
                              onChange={e => {
                                setSelected_series(e.target.value)
                              }}
                              value={selected_series || ''}
                            >
                              <option value="">Select Series</option>
                              {(() => {
                              const safeSeries = Array.isArray(allSeries) ? allSeries : []
                              console.log('🔍 Series dropdown rendering:', { seriesCount: safeSeries.length, series: safeSeries })
                              return safeSeries.map((s, index) => {
                                const optionValue = s?.value || s?.seriesId || ''
                                const optionLabel = s?.name || `${s?.modality || 'Unknown'} - ${s?.instanceCount || 0} images`
                                console.log(`📋 Series option ${index}:`, { value: optionValue, label: optionLabel })
                                return (
                                  <option key={optionValue || `series-${index}`} value={optionValue}>
                                    {optionLabel}
                                  </option>
                                )
                              })
                            })()}
                            </Input>
                          </Col>
                          <Col>{loadingDicomImages && <CircularProgress color="info" />}</Col>
                        </Row>
                        <Row className="mb-2 mt-2 pb-2 px-1">
                          <Swiper
  key={
    studyId?.status === STUDYSTATUS.Final
      ? `final-${selected_series || 'all'}`
      : selected_series || 'all'
  }
  ref={swiperRef}
  slidesPerView={4}
  spaceBetween={20}
  pagination={{
    clickable: true,
  }}
  modules={[Pagination]}
  className="mySwiper"
  onSlideChange={() => {
    // Use timeout to ensure swiper state is updated
    setTimeout(() => {
      checkAndLoadMore()
    }, 100)
  }}
  onReachEnd={() => {
    console.log('🚀 Reached end - loading more')
    if (selected_series && seriesHasMore && seriesHasMore[selected_series] && !isLoadingMore) {
      loadMoreImages()
    }
  }}
>
      {(() => {
        const safeSelectedValues = Array.isArray(selectImage) ? selectImage : []
        const safeImagesToRender = Array.isArray(imagesForRender) ? imagesForRender : []

        console.log('🖼️ [Image Rendering] Debug info:', {
          studyStatus: studyId?.status,
          isFinalStatus: studyId?.status === STUDYSTATUS.Final,
          selectedSeries: selected_series,
          originalDicomImagesLength: Array.isArray(dicomImages) ? dicomImages.length : 0,
          filteredImagesLength: safeImagesToRender.length,
          selectedImageIdsLength: safeSelectedValues.length,
          imagesToRender: safeImagesToRender.slice(0, 2) // Show first 2 for debugging
        })

        return safeImagesToRender.map((item, index) => {
          const normalizedItemId = normalizeImageId(item?.imageId || item?.id || item)
          const isChecked =
            Boolean(item?.isReportSelection) ||
            (normalizedItemId ? normalizedSelectedSet.has(normalizedItemId) : false) ||
            (Array.isArray(selectImage)
              ? selectImage.includes(item?.imageId || item?.id || item)
              : false)

          return (
            <SwiperSlide
              key={item?.imageId || item?.id || index}
              className="mh-25"
              style={{
                width: "180px",
                // height: "180px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  overflow: "hidden",
                  borderRadius: "8px",
                  background: "#000", // looks better behind CT images
                }}
              >
                {!(studyId?.status === STUDYSTATUS.Final && !isFinalReportEditable) && (
                  <Input
                    type="checkbox"
                    id={`image-${index + 1}`}
                    name={item?.imageId || item?.id || `image-${index}`}
                    onChange={selectImageHandler}
                    checked={isChecked}
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      zIndex: 10,
                      width: "18px",
                      height: "18px",
                      cursor: "pointer",
                    }}
                  />
                )}
                <label
                  htmlFor={`image-${index + 1}`}
                  style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    cursor: "pointer",
                  }}
                >
                  {item?.isReportSelection || item?.isSavedReportImage ? (
                    <span
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        zIndex: 10,
                        background: 'rgba(40,167,69,0.9)',
                        color: '#fff',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                      }}
                    >
                      Saved
                    </span>
                  ) : null}
                  <img
                    src={resolveImageSrc(item)}
                    alt={
                      studyId?.status === STUDYSTATUS.Final
                        ? `finalized-${item?.imageId || index}`
                        : item?.imageId || item?.id || `image-${index}`
                    }
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      display: "block",
                      margin: studyId?.status === STUDYSTATUS.Final ? "auto" : undefined,
                    }}
                  />
                </label>
              </div>
            </SwiperSlide>
          )
        })
      })()}
</Swiper>
                          
                          {selected_series &&
                            (studyId?.status !== STUDYSTATUS.Final || isFinalReportEditable) &&
                            seriesHasMore &&
                            seriesHasMore[selected_series] && (
                            <Col xs="12" className="text-center mt-2">
                              <Button 
                                color="primary" 
                                size="sm" 
                                onClick={loadMoreImages}
                                disabled={isLoadingMore}
                              >
                                {isLoadingMore ? (
                                  <><Spinner size="sm" /> Loading...</>
                                ) : (
                                  'Load More Images'
                                )}
                              </Button>
                            </Col>
                          )}

                          {!(studyId?.status === STUDYSTATUS.Final && !isFinalReportEditable) &&
                            (() => {
                              const safeTooltipImages = Array.isArray(imagesForRender)
                                ? imagesForRender
                                : []

                              return safeTooltipImages.map((item, index) => (
                                <UncontrolledTooltip
                                  key={`tooltip-${index}`}
                                  target={`image-${index + 1}`}
                                  className="tooltip-react-strap"
                                >
                                  Check to include image in report
                                </UncontrolledTooltip>
                              ))
                            })()}
                        </Row>
                      </>
                    )}
                    {userData?.role === 'RDU' &&
                      studyId.status === STUDYSTATUS.Final &&
                      userData?._id === studyId.radiologist &&
                      !isFinalReportEditable && (
                        <Row className="mt-1 mb-50 w-80">
                          <Col lg="12" md="12" className="mb-2">
                            <Label
                              className="mb-0"
                              htmlFor="editorAddendumRef"
                              id="editorAddendumRefLabel"
                            >
                              Addendum text:
                            </Label>
                            {!pageLoader && studyId.ID && !isRerendering && (
                              <div
                                key={`addendum-editor-wrapper-${studyId?.ID || 'default'}-${refreshTrigger}`}
                              >
                                <Editor
                                  onInit={(evt, editor) => {
                                    // Enhanced addendum editor initialization with comprehensive safety
                                    const initializeAddendumEditor = () => {
                                      try {
                                        if (!editor || !isMountedRef.current) {
                                          console.warn(
                                            '📝 Addendum editor object is null or component unmounted'
                                          )
                                          setAddendumEditorReady(false)
                                          return
                                        }

                                        // Enhanced readiness check with timeout protection
                                        if (editor.initialized === false || !editor.getBody()) {
                                          let retryCount = 0
                                          const maxRetries = 10

                                          const onAddendumEditorReady = () => {
                                            retryCount++
                                            if (retryCount > maxRetries || !isMountedRef.current) {
                                              console.warn(
                                                '📝 Addendum editor initialization timeout or unmounted'
                                              )
                                              setAddendumEditorReady(false)
                                              return
                                            }

                                            setTimeout(() => {
                                              if (
                                                editor.initialized !== false &&
                                                editor.getBody() &&
                                                !editor.removed &&
                                                isMountedRef.current
                                              ) {
                                                initializeAddendumEditor()
                                              } else if (isMountedRef.current) {
                                                onAddendumEditorReady()
                                              }
                                            }, 150)
                                          }

                                          if (editor.initialized === false) {
                                            editor.on('init', onAddendumEditorReady)
                                          } else {
                                            onAddendumEditorReady()
                                          }
                                          return
                                        }

                                        // Enhanced method validation
                                        if (
                                          typeof editor.getContent !== 'function' ||
                                          typeof editor.getContainer !== 'function' ||
                                          typeof editor.setContent !== 'function'
                                        ) {
                                          console.warn(
                                            '📝 Addendum editor essential methods not available'
                                          )
                                          setAddendumEditorReady(false)
                                          return
                                        }

                                        // Enhanced container validation with comprehensive DOM checks
                                        let container = null
                                        try {
                                          container = editor.getContainer()

                                          if (!container) {
                                            console.warn('📝 Addendum editor container is null')
                                            setAddendumEditorReady(false)
                                            return
                                          }

                                          if (!container.parentNode) {
                                            console.warn(
                                              '📝 Addendum editor container has no parent'
                                            )
                                            setAddendumEditorReady(false)
                                            return
                                          }

                                          if (!document.contains(container)) {
                                            console.warn(
                                              '📝 Addendum editor container not in document'
                                            )
                                            setAddendumEditorReady(false)
                                            return
                                          }

                                          console.log(
                                            '✅ Addendum editor container validation passed'
                                          )
                                        } catch (e) {
                                          console.warn(
                                            '📝 Addendum editor container validation failed:',
                                            e.message
                                          )
                                          setAddendumEditorReady(false)
                                          return
                                        }

                                        // Enhanced functionality test
                                        try {
                                          const testContent = editor.getContent()
                                          editor.setContent('')
                                          console.log(
                                            '✅ Addendum editor functionality test passed'
                                          )
                                        } catch (contentError) {
                                          console.warn(
                                            '📝 Addendum editor functionality test failed:',
                                            contentError.message
                                          )
                                          setAddendumEditorReady(false)
                                          return
                                        }

                                        // Final safety check
                                        if (!isMountedRef.current) {
                                          console.warn(
                                            '📝 Component unmounted during addendum editor initialization'
                                          )
                                          return
                                        }

                                        // Success - set the editor reference with safety
                                        try {
                                          editorAddendumRef.current = editor
                                          setAddendumEditorReady(true)
                                          console.log('✅ Addendum editor initialized successfully')
                                        } catch (refError) {
                                          console.error(
                                            '📝 Failed to set addendum editor reference:',
                                            refError.message
                                          )
                                          setAddendumEditorReady(false)
                                        }
                                      } catch (error) {
                                        console.error(
                                          '📝 Addendum editor initialization error:',
                                          error.message
                                        )
                                        setAddendumEditorReady(false)
                                        editorAddendumRef.current = null
                                      }
                                    }

                                    // Initialize with enhanced timing and safety
                                    if (isMountedRef.current) {
                                      setTimeout(initializeAddendumEditor, 300)
                                    }
                                  }}
                                  onEditorChange={text => {
                                    if (
                                      isStateTransitioning ||
                                      !isMountedRef.current ||
                                      isRerendering
                                    ) {
                                      return
                                    }
                                    try {
                                      if (
                                        editorAddendumRef.current &&
                                        editorAddendumRef.current.initialized !== false &&
                                        !editorAddendumRef.current.removed
                                      ) {
                                        setDetectChange(true)
                                        setValue('reportDiagnosis', text)
                                      }
                                    } catch (error) {
                                      console.warn(
                                        '📝 Addendum editor change handler error:',
                                        error.message
                                      )
                                    }
                                  }}
                                  initialValue={''}
                                  init={{
                                    height: 500,
                                    menubar: true,
                                    selector: undefined,
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
                                      'body { font-family:Helvetica,Arial,sans-serif; font-size:14px } .mce-content-body[data-mce-placeholder]:not(.mce-visualblocks)::before { white-space: pre-line;} .mce-content-body p { margin: 0; padding: 0; margin-block: 0; margin-inline: 0; line-height: normal; }',
                                    placeholder: `Anything entered here will be added to the report layout chosen from the diagnosis template,\n To see the exact report, click on the preview.\n Preview will only works once you created the report.\n Download will only works after finalization of the report\n Press Shift+Enter to continue below this line.`,
                                    setup: editor => {
                                      // Enhanced safety measures for addendum editor
                                      editor.on('PreInit', () => {
                                        console.log('📝 Addendum editor PreInit')
                                      })

                                      editor.on('PostRender', () => {
                                        console.log('📝 Addendum editor PostRender')
                                      })

                                      // Add error handling for addendum editor operations
                                      editor.on('NodeChange', e => {
                                        try {
                                          if (!e.element || !document.contains(e.element)) {
                                            console.warn(
                                              '📝 Addendum NodeChange event with invalid element'
                                            )
                                            return false
                                          }
                                        } catch (error) {
                                          console.warn(
                                            '📝 Addendum NodeChange error:',
                                            error.message
                                          )
                                          return false
                                        }
                                      })

                                      // Handle addendum editor removal safely
                                      editor.on('remove', () => {
                                        console.log('📝 Addendum editor remove event')
                                        if (editorAddendumRef.current === editor) {
                                          editorAddendumRef.current = null
                                          setAddendumEditorReady(false)
                                        }
                                      })
                                    },
                                  }}
                                />
                              </div>
                            )}
                          </Col>
                        </Row>
                      )}
                    {(userData?.role === 'RDU' ||
                      (userData?.role === 'TCU' && !studyId.radiologist)) &&
                    studyId.status !== STUDYSTATUS.Final ? (
                      <Row className="border-top justify-content-end mx-0 p-2">
                        <div className="d-flex mt-md-0 mt-1">
                          <Button
                            className="ml-2 cursor-pointer"
                            color="outline-danger"
                            onClick={() => navigate(`/study-list`)}
                          >
                            <span className="align-middle">Cancel</span>
                          </Button>
                          <Button
                            className="ml-2 cursor-pointer"
                            color="primary"
                            type="button"
                            disabled={!editorsReady || saveReportLoading}
                            onClick={e => {
                              console.log('🔘 Create button clicked')
                              console.log('editorsReady:', editorsReady)
                              console.log('saveReportLoading:', saveReportLoading)
                              console.log('studyId:', studyId)

                              if (!editorsReady || checkForOtherOperationDm(studyId, 1)) {
                                console.log(
                                  '❌ Button click prevented - editors not ready or operation blocked'
                                )
                                return e.preventDefault()
                              }

                              console.log('✅ Calling handleSubmit(onSubmit)')
                              handleSubmit(onSubmit)()
                            }}
                          >
                            {saveReportLoading ? (
                              <Spinner color="light" size="sm" />
                            ) : studyId.status === STUDYSTATUS.Unread ||
                              studyId.status === STUDYSTATUS.Preliminary ? (
                              'Create'
                            ) : studyId.status === STUDYSTATUS.Final ? (
                              'Create Addendum'
                            ) : (
                              'Update'
                            )}
                          </Button>
                          {studyId.status !== STUDYSTATUS.Final && userData?.role === 'RDU' && (
                            <Button
                              className="ml-2 cursor-pointer"
                              color="success"
                              disabled={!editorsReady || saveReportandFinaliseLoading}
                              onClick={e => {
                                console.log('🔘 Create and Finalize button clicked')
                                console.log('editorsReady:', editorsReady)
                                console.log(
                                  'saveReportandFinaliseLoading:',
                                  saveReportandFinaliseLoading
                                )
                                console.log('studyId:', studyId)

                                // Enhanced validation before proceeding
                                if (!editorsReady) {
                                  console.log('❌ Button click prevented - editors not ready')
                                  alertDisplay(
                                    'Warning',
                                    'Please wait for the editor to finish loading before proceeding.',
                                    'info'
                                  )
                                  return e.preventDefault()
                                }

                                if (checkForOtherOperationDm(studyId, 1)) {
                                  console.log('❌ Button click prevented - operation blocked')
                                  return e.preventDefault()
                                }

                                // Additional comprehensive editor validation before calling function
                                try {
                                  if (
                                    !editorRef.current ||
                                    typeof editorRef.current.getContent !== 'function'
                                  ) {
                                    console.log('❌ Editor not functional at button click')
                                    alertDisplay(
                                      'Error',
                                      'Editor is not ready. Please refresh the page and try again.',
                                      'error'
                                    )
                                    return e.preventDefault()
                                  }

                                  // Check editor state and DOM container
                                  if (
                                    editorRef.current.initialized === false ||
                                    editorRef.current.removed === true
                                  ) {
                                    console.log('❌ Editor is not in valid state at button click')
                                    alertDisplay(
                                      'Error',
                                      'Editor is not in a valid state. Please refresh the page and try again.',
                                      'error'
                                    )
                                    return e.preventDefault()
                                  }

                                  // Validate DOM container
                                  const container =
                                    editorRef.current.getContainer &&
                                    editorRef.current.getContainer()
                                  if (!container || !container.parentNode) {
                                    console.log('❌ Editor container is not valid at button click')
                                    alertDisplay(
                                      'Error',
                                      'Editor container is not properly connected. Please refresh the page and try again.',
                                      'error'
                                    )
                                    return e.preventDefault()
                                  }

                                  // Test getting content to ensure editor is fully functional
                                  const testContent = editorRef.current.getContent()
                                  console.log('✅ Editor validation passed at button click')
                                } catch (editorCheckError) {
                                  console.error(
                                    '❌ Editor check failed at button click:',
                                    editorCheckError
                                  )
                                  alertDisplay(
                                    'Error',
                                    'Editor validation failed. Please refresh the page and try again.',
                                    'error'
                                  )
                                  return e.preventDefault()
                                }

                                console.log(
                                  '✅ All validations passed - calling saveAndFinalizeReport function'
                                )
                                saveAndFinalizeReport()
                              }}
                            >
                              {saveReportandFinaliseLoading ? (
                                <Spinner color="light" size="sm" />
                              ) : studyId.status === STUDYSTATUS.Unread ||
                                studyId.status === STUDYSTATUS.Preliminary ? (
                                'Create and Finalize'
                              ) : (
                                'Update and Finalize'
                              )}
                            </Button>
                          )}
                        </div>
                      </Row>
                    ) : (
                      <Row className="justify-content-end mx-0 p-2">
                        <div className="d-flex mt-md-0 mt-1">
                          <Button
                            className="ml-2 cursor-pointer"
                            color="outline-danger"
                            onClick={() => {
                              renderFrom === 'sharedStudy'
                                ? navigate(location.pathname)
                                : navigate(`/study-list`)
                            }}
                          >
                            <span className="align-middle">Back</span>
                          </Button>
                          {userData?.role === 'RDU' &&
                            userData?._id === studyId.radiologist &&
                            !isFinalReportEditable && (
                              <>
                                <Button
                                  className="ml-2 cursor-pointer"
                                  color="primary"
                                  type="button"
                                  disabled={!editorsReady || createAddendumLoading}
                                  onClick={e => {
                                    if (!editorsReady || checkForOtherOperationDm(studyId, 1)) {
                                      return e.preventDefault()
                                    }
                                    createAddendum()
                                  }}
                                >
                                  {createAddendumLoading ? (
                                    <Spinner color="light" size="sm" />
                                  ) : (
                                    'Create Addendum'
                                  )}
                                </Button>
                              </>
                            )}

                          {userData?.role === 'RDU' &&
                            userData?._id === studyId.radiologist &&
                            isFinalReportEditable && (
                              <>
                                <Button
                                  className="ml-2 cursor-pointer"
                                  color="primary"
                                  type="button"
                                  disabled={!editorsReady || saveReportandFinaliseLoading}
                                  onClick={e => {
                                    console.log('🔄 Update (Final Report Edit) button clicked')
                                    console.log('editorsReady:', editorsReady)
                                    console.log(
                                      'saveReportandFinaliseLoading:',
                                      saveReportandFinaliseLoading
                                    )

                                    if (!editorsReady || checkForOtherOperationDm(studyId, 1)) {
                                      console.log(
                                        '❌ Button click prevented - editors not ready or operation blocked'
                                      )
                                      return e.preventDefault()
                                    }

                                    console.log(
                                      '✅ Calling saveAndFinalizeReport function from Update button'
                                    )
                                    saveAndFinalizeReport()
                                  }}
                                >
                                  {saveReportandFinaliseLoading ? (
                                    <Spinner color="light" size="sm" />
                                  ) : (
                                    'Update'
                                  )}
                                </Button>
                              </>
                            )}
                        </div>
                      </Row>
                    )}
                  </Form>
                </CardBody>
              </Card>
            </TabPane>
          </TabContent>
          {(userData?.role === 'RDU' || userData?.role === 'TCU') && (
            <TabContent activeTab={activeTab}>
              <TabPane tabId="2">
                <WorkSheetPanel
                  userData={userData}
                  studyId={studyId}
                  fileInput={fileInput}
                  worksheetFile={worksheetFile}
                  worksheetData={worksheetData}
                  column={column}
                  previewWorksheet={previewWorksheet}
                  setWorksheetFile={setWorksheetFile}
                  worksheetUploadHandler={worksheetUploadHandler}
                />
              </TabPane>
            </TabContent>
          )}
        </Card>
      )}

      <Modal
        isOpen={worksheetModal}
        toggle={handleWorksheetModal}
        className="sidebar-sm sm-w-100"
        modalClassName="modal-slide-in"
        contentClassName="pt-0"
      >
        <ModalHeader
          className="mb-2"
          toggle={handleWorksheetModal}
          close={<X className="cursor-pointer" size={15} onClick={handleWorksheetModal} />}
          tag="div"
        >
          <h5 className="modal-title">Worksheet</h5>
        </ModalHeader>
        <ModalBody className="flex-grow-1">
          {(userData?.role === 'TCU' || userData?.role === 'RDU') &&
            studyId.status !== STUDYSTATUS.Final && (
              <Row className="mt-1 mb-1">
                <Col>
                  <FormGroup className="w-100">
                    <Input
                      ref={fileInput}
                      type="file"
                      accept=".pdf"
                      multiple
                      id="studyWorksheet"
                      name="studyWorksheet"
                      onChange={e => setWorksheetFile(e.target.files)}
                    />
                  </FormGroup>
                  <FormGroup className="w-100">
                    <Button
                      className="cursor-pointer text-nowrap"
                      type="button"
                      onClick={() => worksheetUploadHandler(studyId?.ID)}
                    >
                      <span className="align-middle ml-50">Upload worksheet</span>
                    </Button>
                  </FormGroup>
                </Col>

                {Array.isArray(worksheetData) && worksheetData.length > 0 && (
                  <Col>
                    <Row className="mt-1 w-100 ">
                      <DataTable
                        noHeader
                        noCheckbox
                        paginationServer
                        highlightOnHover
                        columns={column}
                        className="worksheet_table react-dataTable"
                        sortIcon={<ChevronDown size={10} />}
                        data={worksheetData}
                      />
                    </Row>
                  </Col>
                )}
              </Row>
            )}
        </ModalBody>
      </Modal>
      <Modal isOpen={previewOpen} toggle={() => setPreviewOpen(!previewOpen)}>
        <Card>
          <Row className="d-flex justify-content-end pr-4 p-1">
            <X
              size={20}
              id="preview"
              className="mr-70 text-danger cursor-pointer"
              onClick={() => setPreviewOpen(false)}
            />
          </Row>
          <Row>
            <div className="text-center w-100">
              <img src={previewWorksheet} alt="template report" width="90%" />
            </div>
          </Row>
        </Card>
      </Modal>
      <Modal
        className="editor-width"
        isOpen={previewLayout}
        toggle={() => setPreviewLayout(!previewLayout)}
      >
        <ModalHeader
          close={
            <X
              className="cursor-pointer"
              size={15}
              onClick={() => {
                setPreviewLayout(false)
              }}
            />
          }
          tag="div"
        ></ModalHeader>
        <Card className="p-2 overflowx-scroll">
          <CardBody>{templateLayout ? parse(`${templateLayout}`) : ''}</CardBody>
          <CardFooter>
            <Button
              className="cursor-pointer"
              color="danger"
              onClick={() => setPreviewLayout(false)}
            >
              Close
            </Button>
          </CardFooter>
        </Card>
      </Modal>
      <Modal
        className="editor-width"
        isOpen={previewFinalReport}
        toggle={() => setPreviewFinalReport(!previewFinalReport)}
      >
        <ModalHeader
          close={
            <X
              className="cursor-pointer"
              size={15}
              onClick={() => {
                setPreviewFinalReport(false)
              }}
            />
          }
          tag="div"
        ></ModalHeader>
        <Card className="p-2 overflowx-scroll">
          <CardBody>
            {(() => {
              console.log('🔍 Preview Modal Debug:', {
                hasCreatedReport: !!createdReport,
                createdReportLength: createdReport?.length || 0,
                studyStatus: studyId?.status,
                studyStatusFinal: STUDYSTATUS.Final,
                statusMatch: studyId?.status === STUDYSTATUS.Final,
                createdReportPreview: createdReport
                  ? `${createdReport.substring(0, 100)}...`
                  : 'No content',
              })

              if (!createdReport || createdReport.trim() === '') {
                return (
                  <div className="text-center p-3">
                    <h5>No preview content available</h5>
                    <p>Report content could not be loaded.</p>
                  </div>
                )
              }

              // For Final/Reported status, render with dangerouslySetInnerHTML and remove checkboxes
              if (studyId?.status === STUDYSTATUS.Final) {
                return (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: createdReport.replace(
                        /<input[^>]*type=["']?checkbox["']?[^>]*>/gi,
                        ''
                      ),
                    }}
                  />
                )
              }

              // For other statuses, use parse
              return parse(createdReport)
            })()}
          </CardBody>
          <CardFooter>
            <Button
              className="cursor-pointer"
              color="danger"
              onClick={() => setPreviewFinalReport(false)}
            >
              Close
            </Button>
          </CardFooter>
        </Card>
      </Modal>
      <Modal
        className="pdf-viewer-modal"
        isOpen={pdfViewerOpen}
        toggle={() => setPdfViewerOpen(!pdfViewerOpen)}
        size="xl"
      >
        <ModalHeader
          close={
            <X
              className="cursor-pointer"
              size={15}
              onClick={() => {
                setPdfViewerOpen(false)
                URL.revokeObjectURL(pdfUrl)
                setPdfUrl('')
              }}
            />
          }
          tag="div"
        >
          Report PDF
        </ModalHeader>
        <ModalBody className="p-0">
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              width="100%"
              height="600px"
              style={{ border: 'none' }}
              title="Report PDF"
            />
          )}
        </ModalBody>
      </Modal>
    </Fragment>
  )
}

export default PreviewReport
