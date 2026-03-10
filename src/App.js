// ** Router Import
import { Ability } from '@casl/ability'
import Avatar from '@components/avatar'
import { handleModalityUpdate } from '@store/actions/Modalities'
import { isUserLoggedIn } from '@utils'
import React, {
  Fragment,
  useContext,
  useEffect,
  useState,
  Suspense,
  startTransition,
  useDeferredValue,
} from 'react'
import { Check, X } from 'react-feather'
import { useDispatch, useSelector } from 'react-redux'
import { Slide, toast } from 'react-toastify'
import { ToastContent, ToastContentForError } from './utils/toast'
import initialAbility from './configs/acl/ability'
import {
  modalityOptions as fallbackModalityOptions,
  STUDY_STATUS_OPTIONS,
} from './configs/const'
import { handleDropDowndataUpdate } from './redux/actions/dropDowndata'
import Router from './router/Router'
import { socket } from './socket'
import { AbilityContext } from './utility/context/Can'
import { BackgroundProcessProvider } from './context/BackgroundProcessContext'
import BackgroundProcessLoader from './components/BackgroundProcessLoader'
import useJwt from '@src/@core/auth/jwt/useJwt'

import ROLES from '@configs/roles'
import axios from 'axios'
import './utils/axios-global'
import { PrimeReactProvider } from 'primereact/api'

// ** Suppress ResizeObserver loop errors (harmless browser warnings)
const suppressResizeObserverErrors = () => {
  const originalError = console.error
  const originalWindowError = window.onerror

  // Suppress console.error ResizeObserver warnings
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes(
        'ResizeObserver loop completed with undelivered notifications'
      )
    ) {
      return
    }
    originalError.apply(console, args)
  }

  // Suppress window.onerror ResizeObserver warnings
  window.onerror = (message, source, lineno, colno, error) => {
    if (
      typeof message === 'string' &&
      message.includes(
        'ResizeObserver loop completed with undelivered notifications'
      )
    ) {
      return true // Prevent default error handling
    }
    if (originalWindowError) {
      return originalWindowError(message, source, lineno, colno, error)
    }
    return false
  }

  // Also suppress unhandled promise rejections for ResizeObserver
  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason &&
      event.reason
        .toString()
        .includes(
          'ResizeObserver loop completed with undelivered notifications'
        )
    ) {
      event.preventDefault()
    }
  })
}

// ** Initialize error suppression
suppressResizeObserverErrors()

// ** Suppress unhandled promise rejections for network errors
const suppressNetworkErrorRejections = () => {
  const originalUnhandledRejection = window.onunhandledrejection
  window.onunhandledrejection = (event) => {
    try {
      const reason = event?.reason
      if (
        reason &&
        (!reason.response ||
          reason.isNetworkError ||
          /Network Error/i.test(reason?.message || ''))
      ) {
        event.preventDefault()
        return true
      }
    } catch (_) {}
    if (typeof originalUnhandledRejection === 'function') {
      return originalUnhandledRejection(event)
    }
    return false
  }
}

// ** Initialize network error suppression
suppressNetworkErrorRejections()

const App = (props) => {
  // Initialize JWT service globally to set up axios interceptors
  useJwt()

  const loginState = useSelector((state) => state.auth)
  const [userData, setUserData] = useState(() => {
    try {
      const userDataString = isUserLoggedIn()
      return userDataString ? JSON.parse(userDataString) : null
    } catch {
      return null
    }
  })
  const ability = useContext(AbilityContext)
  const [mainAbility, setMainAbility] = React.useState(initialAbility)
  const userDataRedux = useSelector((state) => state.auth.userData)

  // React 18: Use deferred value for performance optimization
  const deferredUserData = useDeferredValue(userData)
  useEffect(() => {
    // React 18: Use startTransition for non-urgent state updates
    startTransition(() => {
      setUserData(userDataRedux)
    })
  }, [userDataRedux])
  useEffect(() => {
    function onCompletedPatientEditProcessEvent(value) {
      const d = JSON.parse(value)
      if (d.status) {
        toast(<ToastContent message={d.message} />, {
          transition: Slide,
          hideProgressBar: true,
          autoClose: 4000,
          icon: false,
          className: 'custom-toast-success',
        })
      } else {
        toast(<ToastContentForError message={d.message} />, {
          transition: Slide,
          hideProgressBar: true,
          autoClose: 4000,
          icon: false,
          className: 'custom-toast-error',
        })
      }
    }

    const updateAdvanceFilter = ({ advanceFilter }) => {
      const access = userData?.access
      if (advanceFilter === userData?.advanceFilter) {
        return
      }
      if (advanceFilter === 1) {
        if (
          !access.find(
            (a) => a.action === 'manage' && a.subject === 'filter-listings'
          )
        ) {
          access.push({ action: 'manage', subject: 'filter-listings' })
        }

        if (
          userData.role === ROLES.ClinicUser &&
          access.find(
            (a) => a.action === 'manage' && a.subject === 'filter-listings'
          )
        ) {
          access.splice(
            access.findIndex(
              (a) => a.action === 'manage' && a.subject === 'filter-listings'
            ),
            1
          )
        }
        userData.access = access
        userData.advanceFilter = advanceFilter
        localStorage.setItem('userData', JSON.stringify(userData))
        setMainAbility(new Ability([...userData.access]))
        setUserData(userData)
      } else {
        if (
          access.find(
            (a) => a.action === 'manage' && a.subject === 'filter-listings'
          )
        ) {
          access.splice(
            access.findIndex(
              (a) => a.action === 'manage' && a.subject === 'filter-listings'
            ),
            1
          )
        }
        userData.access = access
        userData.advanceFilter = advanceFilter
        localStorage.setItem('userData', JSON.stringify(userData))
        setMainAbility(new Ability([...userData.access]))
        setUserData(userData)
      }
    }
    socket.on(
      `updateAdvanceFilter_${userData?.parent_user ? userData?.parent_user : userData?._id}`,
      updateAdvanceFilter
    )
    socket.on(
      `completedPatientEditProcess_${userData?._id}`,
      onCompletedPatientEditProcessEvent
    )

    return () => {
      socket.off(
        `completedPatientEditProcess_${userData?._id}`,
        onCompletedPatientEditProcessEvent
      )
      socket.off(
        `updateAdvanceFilter_${userData?.parent_user ? userData?.parent_user : userData?._id}`,
        updateAdvanceFilter
      )
    }
  }, [userData?._id])
  const dispatch = useDispatch()
  const LicenseData = useSelector((state) => state.license)

  // Pages that require filter dropdown data
  const pagesNeedingFilterData = ['/study-list', '/settings/filter_listings']

  // Track previous pathname to detect route changes
  const [previousPathname, setPreviousPathname] = useState(
    window.location.pathname
  )

  // Fetch modalities from Orthanc (dropdown shows exactly what Orthanc has: e.g. CR, CT, DX, MG, MR, RTSTRUCT, US, XA)
  const fetchModalitiesFromOrthanc = async () => {
    const url = `${process.env.REACT_APP_API_URL}/orthanc/modalities`
    console.log('[Modality] Fetching from Orthanc:', url)
    try {
      const res = await axios.get(url, {})
      // Full response log for debugging (what API actually returned)
      console.log('[Modality] API full response status:', res?.status)
      console.log(
        '[Modality] API full response data type:',
        Array.isArray(res?.data) ? 'array' : typeof res?.data
      )
      console.log(
        '[Modality] API full response data (entire payload):',
        JSON.stringify(res?.data)
      )
      const isSuccess =
        res?.status === 200 && res?.data !== null && res?.data !== undefined
      const isErrorBody =
        res?.data && typeof res.data === 'object' && res.data.success === false
      let raw = []
      if (isSuccess && !isErrorBody) {
        const data = res.data
        if (Array.isArray(data)) {
          raw = data
          console.log('[Modality] Using response as array, length:', raw.length)
        } else if (data && typeof data === 'object' && !Array.isArray(data)) {
          console.log(
            '[Modality] Response was object — normalizing keys to AET. Object keys:',
            Object.keys(data)
          )
          const names = new Set()
          Object.keys(data).forEach((key) => {
            const config = data[key]
            const aet =
              config && (config.AET ?? config.AeTitle ?? config.aeTitle)
            if (aet && typeof aet === 'string') names.add(String(aet).trim())
            else names.add(String(key).trim())
          })
          raw = Array.from(names).sort()
          console.log(
            '[Modality] After object→AET normalize, raw array:',
            JSON.stringify(raw)
          )
        }
      }
      console.log(
        '[Modality] Final raw length:',
        raw?.length,
        '| full raw array:',
        JSON.stringify(raw)
      )
      const apiOptions = raw
        .filter(Boolean)
        .map((m) =>
          typeof m === 'string'
            ? m
            : (m?.Name ?? m?.name ?? m?.value ?? String(m))
        )
        .filter(Boolean)
        .map((name) => ({ value: name, label: name }))
      const apiValues = new Set(apiOptions.map((o) => o.value))
      const merged = [...apiOptions]
      fallbackModalityOptions.forEach((f) => {
        if (!apiValues.has(f.value)) merged.push(f)
      })
      merged.sort((a, b) => (a.value || '').localeCompare(b.value || ''))
      if (merged.length > 0) {
        console.log(
          '[Modality] Loaded (API + fallback merged):',
          merged.length,
          'modalities'
        )
        return merged
      }
      console.log('[Modality] Orthanc returned empty list; using fallback.')
    } catch (err) {
      console.log(
        '[Modality] API failed, using fallback. Error:',
        err?.response?.status,
        err?.response?.data?.message || err?.message
      )
    }
    console.log(
      '[Modality] Using fallback list (configs/const.js), count:',
      fallbackModalityOptions?.length ?? 0
    )
    return fallbackModalityOptions
  }

  useEffect(() => {
    const fetchFilterData = async () => {
      const isAuthenticated = !!(loginState?.accessToken || userDataRedux?._id)
      console.log(
        '[Modality] App fetchFilterData run:',
        'pathname=',
        window.location.pathname,
        'isAuthenticated=',
        isAuthenticated,
        'hasToken=',
        !!loginState?.accessToken,
        'hasUserData=',
        !!userDataRedux?._id
      )
      // Only fetch modalities when user is authenticated (so API returns Orthanc list, not 401)
      if (!isAuthenticated) {
        console.log('[Modality] Skipping fetch (not authenticated).')
        return
      }

      // Check if current page needs filter data using window.location
      const currentPath = window.location.pathname
      const needsFilterData = pagesNeedingFilterData.some((path) =>
        currentPath.startsWith(path)
      )

      // Load modalities from Orthanc so dropdown shows exactly CR, CT, DX, MG, MR, RTSTRUCT, US, XA (or your config)
      const modalityOptionsFromApi = await fetchModalitiesFromOrthanc()
      console.log(
        '[Modality] Dispatching to Redux, count:',
        modalityOptionsFromApi?.length ?? 0
      )
      dispatch(handleModalityUpdate(modalityOptionsFromApi))

      // Only fetch rest of filter data if we're on a page that needs it
      if (!needsFilterData) {
        return
      }

      if (userDataRedux?._id) {
        try {
          const filterData = await axios.get(
            `${process.env.REACT_APP_API_URL}/filter-module/get/${userDataRedux?._id}`,
            {}
          )

          dispatch(
            handleDropDowndataUpdate({
              clinicNames: Object.values(filterData.data.clinicNames),
              Physicians: Object.values(filterData.data.Physicians),
              studyStatus:
                Object.values(filterData.data.studyStatus).length > 0
                  ? Object.values(filterData.data.studyStatus)
                  : STUDY_STATUS_OPTIONS,
            })
          )
        } catch (error) {
          // Ignore network errors globally; other errors can be logged if needed
          if (error && error.response) {
            console.log(error, 'error')
          }
        }
      }
    }

    fetchFilterData()
  }, [loginState?.accessToken, userDataRedux?._id, dispatch, previousPathname])

  // Monitor route changes using popstate and pushstate events
  useEffect(() => {
    const handleRouteChange = () => {
      const currentPath = window.location.pathname
      if (currentPath !== previousPathname) {
        setPreviousPathname(currentPath)
      }
    }

    // Listen for browser navigation (back/forward buttons)
    window.addEventListener('popstate', handleRouteChange)

    // Override pushState and replaceState to detect programmatic navigation
    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState

    window.history.pushState = function (...args) {
      originalPushState.apply(window.history, args)
      handleRouteChange()
    }

    window.history.replaceState = function (...args) {
      originalReplaceState.apply(window.history, args)
      handleRouteChange()
    }

    return () => {
      window.removeEventListener('popstate', handleRouteChange)
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
    }
  }, [previousPathname])

  useEffect(() => {
    if (loginState?.accessToken || userData) {
      socket.connect()
    } else {
      socket.disconnect()
    }
  }, [loginState])

  return (
    <PrimeReactProvider value={{ hideOverlaysOnDocumentScrolling: false }}>
      <AbilityContext.Provider value={mainAbility}>
        <BackgroundProcessProvider userData={userData}>
          <Suspense
            fallback={
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: '100vh' }}
              >
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            }
          >
            <Router />
          </Suspense>
          <BackgroundProcessLoader />
        </BackgroundProcessProvider>
      </AbilityContext.Provider>
    </PrimeReactProvider>
  )
  // }
}

export default App
