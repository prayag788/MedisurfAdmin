import axios from 'axios'
import { showInfoAlert } from '../utils/alerts'
const moment = require('moment')
import useJwt from '@src/auth/jwt/useJwt'

const config = useJwt.jwtConfig

// ** Checks if an object is empty (returns boolean)
export const isObjEmpty = obj => Object.keys(obj).length === 0

// ** Returns K format from a number
export const kFormatter = num => (num > 999 ? `${(num / 1000).toFixed(1)}k` : num)

// ** Converts HTML to string
export const htmlToString = html => html.replace(/<\/?[^>]+(>|$)/g, '')

// ** Checks if the passed date is today
const isToday = date => {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

/**
 ** Format and return date in Humanize format
 ** Intl docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/format
 ** Intl Constructor: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
 * @param {String} value date to format
 * @param {Object} formatting Intl object to format with
 */
export const formatDate = (
  value,
  formatting = { month: 'short', day: 'numeric', year: 'numeric' }
) => {
  if (!value) return value
  return new Intl.DateTimeFormat('en-US', formatting).format(new Date(value))
}

// ** Returns short month of passed date
export const formatDateToMonthShort = (value, toTimeForCurrentDay = true) => {
  const date = new Date(value)
  let formatting = { month: 'short', day: 'numeric' }

  if (toTimeForCurrentDay && isToday(date)) {
    formatting = { hour: 'numeric', minute: 'numeric' }
  }

  return new Intl.DateTimeFormat('en-US', formatting).format(new Date(value))
}

/**
 ** Return if user is logged in
 ** This is completely up to you and how you want to store the token in your frontend application
 *  ? e.g. If you are using cookies to store the application please update this function
 */
export const isUserLoggedIn = () => localStorage.getItem('userData')

export const isActivatioKeyValid = () => localStorage.getItem('activationKey')

export const getUserData = () => {
  try {
    return JSON.parse(localStorage.getItem('userData')) || {}
  } catch {
    return {}
  }
}

/**
 ** This function is used for demo purpose route navigation
 ** In real app you won't need this function because your app will navigate to same route for each users regardless of ability
 ** Please note role field is just for showing purpose it's not used by anything in frontend
 ** We are checking role just for ease
 * ? NOTE: If you have different pages to navigate based on user ability then this function can be useful. However, you need to update it.
 * @param {String} userRole Role of user
 */
export const getHomeRouteForLoggedInUser = user => {
  const userRole = user?.role

  if (userRole === 'SuperAdmin') return '/'

  if (userRole === 'ClinicAdmin') {
    if (!user?.hasLicense) {
      return '/activation-key'
    } else {
      return '/'
    }
  } else {
    return '/'
  }

  if (userRole === 'client') return '/access-control'

  return '/login'
}

// ** React Select Theme Colors
export const selectThemeColors = theme => ({
  ...theme,
  colors: {
    ...theme.colors,
    primary25: '#7367f01a', // for option hover bg-color
    primary: '#7367f0', // for selected option bg-color
    neutral10: '#7367f0', // for tags bg-color
    neutral20: '#ededed', // for input border-color
    neutral30: '#ededed', // for input hover border-color
  },
})

// Is Object
export const isObject = obj => {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

// Fatten Object
export const flattenObj = ob => {
  const result = {}

  for (const i in ob) {
    if (isObject(ob[i])) {
      const temp = flattenObj(ob[i])
      for (const j in temp) {
        result[j] = temp[j]
      }
    } else {
      result[i] = ob[i]
    }
  }
  return result
}

// Transform Date
export const isDateTransform = (value, key) => {
  const Regex = new RegExp('date', 'i')

  if (key) {
    return Regex.test(key) ? moment(value).format('MMMM Do YYYY') : value
  }

  return moment(value).format('MMMM Do YYYY')
}

// Extract Fields from Object
export const extractFields = (data, fields) => {
  const extractedData = {}
  data = flattenObj({ ...data })
  fields.forEach(value => {
    if (data[value] !== undefined) {
      extractedData[value] = data[value]
    }
  })
  return extractedData
}

export const openExplorer = (level, uuid, navigate) => {
  sessionStorage.setItem('explore_uuid', uuid)
  sessionStorage.setItem('explore_level', level)
  navigate('/explorer/explore')
}

export const setLockPatientIdsDm = Data => {
  try {
    let data = {}

    if (isObject(Data)) {
      data = Data
    } else {
      data = JSON.parse(Data)
    }
    data = data && data.lockData ? data.lockData : {}
    data = JSON.stringify(data)
    localStorage.setItem('LockPatientIdsDm', data)
  } catch (error) {}
}

export const getLockPatientIdsDm = () => {
  let LockPatientIdsDmData = {}
  try {
    LockPatientIdsDmData = JSON.parse(localStorage.getItem('LockPatientIdsDm'))
  } catch (error) {}
  return LockPatientIdsDmData
}

export const checkForEditDm = (data, msg) => {
  let flag = 0
  try {
    const LockPatientIdsDmData = getLockPatientIdsDm()

    if (LockPatientIdsDmData) {
      flag = Object.keys(LockPatientIdsDmData).length
    }
  } catch (error) {}
  if (flag >= 1 && msg) {
    showInfoAlert(
      "Patient information is currently being edited in the background. Once it's done, you'll be able to edit it again."
    )
  }
  return flag >= 1
}

export const extractErrorMessage = (payload, fallback = 'Something went wrong') => {
  if (payload === null || payload === undefined || payload === '') {
    return fallback
  }

  if (typeof payload === 'string') {
    return payload
  }

  if (payload instanceof Error) {
    return payload.message || fallback
  }

  if (typeof payload === 'object') {
    if (payload.message) {
      return extractErrorMessage(payload.message, fallback)
    }
    if (payload.error) {
      return extractErrorMessage(payload.error, fallback)
    }
    if (payload.details && payload.details.error) {
      return extractErrorMessage(payload.details.error, fallback)
    }
  }

  return fallback
}

export const checkForOtherOperationDm = (data, msg) => {
  let flag = 0
  try {
    const LockPatientIdsDmData = getLockPatientIdsDm()
    if (LockPatientIdsDmData) {
      if (LockPatientIdsDmData && LockPatientIdsDmData[data.orthancPatientId]) {
        flag = 1
      }
    }
  } catch (error) {}
  if (flag >= 1 && msg) {
    showInfoAlert(
      "Patient information is currently being edited in the background. Once it's done, you'll be able to allow this action."
    )
  }
  return flag >= 1
}

export const getStudyLockDataAPIDm = async () => {
  await axios
    .get(`${process.env.REACT_APP_API_URL}/explorer/studies/getStudyLockData`)
    .then(res => {
      setLockPatientIdsDm(res.data)
    })
    .catch(err => console.log('err', err))
}

const getUserDetails = () => {
  try {
    return JSON.parse(localStorage.getItem('userData')) || {}
  } catch {
    return {}
  }
}

const getMilliseconds = () => {
  const userDetails = getUserDetails()
  return isNaN(parseInt(userDetails?.logoutMinutes))
    ? 100000
    : parseInt(userDetails.logoutMinutes) * 60 * 1000
}


let myTimeout = null
export const handleSetTimeOut = (myTimeoutSec, miliseconds) => {
  if (!isNaN(myTimeoutSec)) {
    if (myTimeout !== null) {
      clearTimeout(myTimeout)
    }
    myTimeout = setTimeout(async () => {
      const lastActivity = localStorage.getItem('lastActivity')
      const currentTime = moment().unix()
      const diff = lastActivity && !isNaN(lastActivity) ? parseInt(lastActivity) - currentTime : 0
      if (diff < 0) {
        document.body.removeEventListener('click', handleAutoLogout)
        document.body.removeEventListener('mouseover', handleAutoLogout)
        document.body.removeEventListener('mouseout', handleAutoLogout)
        document.body.removeEventListener('keydown', handleAutoLogout)

        await axios
          .get(`${process.env.REACT_APP_API_URL}/user/logout`)
          .then(() => {
            localStorage.removeItem('lastActivity')
            localStorage.removeItem('userData')
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            document.cookie = `loginAuth=; domain=${process.env.REACT_APP_COOKIE_DOMAIN}; path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`

            localStorage.removeItem('sharedUserData')
            document.cookie = `sharedAuth=; domain=${process.env.REACT_APP_COOKIE_DOMAIN}; path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`
            if (localStorage.getItem('sharedUrl')) {
              localStorage.setItem('sharedAuth', false)
            }
            window.location.reload()
          })
          .catch(() => {
            localStorage.removeItem('lastActivity')
            localStorage.removeItem('userData')
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            window.location.reload()
          })
      } else {
        handleSetTimeOut(miliseconds, miliseconds)
      }
    }, myTimeoutSec)
  }
}
export function handleAutoLogout() {
  const userDetails = getUserDetails()
  const miliseconds = getMilliseconds()

  if (isUserLoggedIn() !== null) {
    const lastActivity = localStorage.getItem('lastActivity')
    const currentTime = moment().unix()
    const diff = lastActivity && !isNaN(lastActivity) ? parseInt(lastActivity) - currentTime : 0
    if (diff < 0) {
      handleSetTimeOut(1000, miliseconds)
    } else {
      const newActivity = currentTime + parseInt(miliseconds / 1000)
      localStorage.setItem('lastActivity', newActivity)
      handleSetTimeOut(miliseconds, miliseconds)
    }
  }
}
export const ordinalSuffixOf = i => {
  const j = i % 10
  const k = i % 100
  if (j === 1 && k !== 11) {
    return 'st'
  }
  if (j === 2 && k !== 12) {
    return 'nd'
  }
  if (j === 3 && k !== 13) {
    return 'rd'
  }
  return 'th'
}
