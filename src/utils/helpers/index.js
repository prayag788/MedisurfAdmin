import moment from 'moment'
import axios from 'axios'

// ** Date and Time Utilities
export const dateUtils = {
  // Format date for display
  formatDate: (date, format = 'DD/MM/YYYY') => {
    return moment(date).format(format)
  },

  // Format datetime for display
  formatDateTime: (date, format = 'DD/MM/YYYY HH:mm') => {
    return moment(date).format(format)
  },

  // Get relative time
  getRelativeTime: date => {
    return moment(date).fromNow()
  },

  // Check if date is valid
  isValidDate: date => {
    return moment(date).isValid()
  },

  // Get current date
  getCurrentDate: (format = 'YYYY-MM-DD') => {
    return moment().format(format)
  },

  // Add days to date
  addDays: (date, days) => {
    return moment(date).add(days, 'days').toDate()
  },

  // Get date range
  getDateRange: (startDate, endDate) => {
    return {
      start: moment(startDate).startOf('day'),
      end: moment(endDate).endOf('day'),
    }
  },
}

// ** String Utilities
export const stringUtils = {
  // Capitalize first letter
  capitalize: str => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  },

  // Capitalize all words
  capitalizeWords: str => {
    return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
  },

  // Truncate string
  truncate: (str, length = 50, suffix = '...') => {
    if (str.length <= length) return str
    return str.substring(0, length) + suffix
  },

  // Remove special characters
  removeSpecialChars: str => {
    return str.replace(/[^a-zA-Z0-9\s]/g, '')
  },

  // Generate slug
  generateSlug: str => {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  },

  // Check if string is email
  isEmail: str => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(str)
  },

  // Check if string is phone
  isPhone: str => {
    const phoneRegex = /^[\+]?[(]?[0-9]{0,3}[)]?[-\s\.]?[0-9]{0,3}[-\s\.]?[0-9]{0,6}$/im
    return phoneRegex.test(str)
  },
}

// ** Array Utilities
export const arrayUtils = {
  // Remove duplicates
  removeDuplicates: arr => {
    return [...new Set(arr)]
  },

  // Group by key
  groupBy: (arr, key) => {
    return arr.reduce((groups, item) => {
      const group = item[key]
      groups[group] = groups[group] || []
      groups[group].push(item)
      return groups
    }, {})
  },

  // Sort by key
  sortBy: (arr, key, direction = 'asc') => {
    return arr.sort((a, b) => {
      if (direction === 'asc') {
        return a[key] > b[key] ? 1 : -1
      } else {
        return a[key] < b[key] ? 1 : -1
      }
    })
  },

  // Filter by condition
  filterBy: (arr, condition) => {
    return arr.filter(condition)
  },

  // Find item by key
  findByKey: (arr, key, value) => {
    return arr.find(item => item[key] === value)
  },

  // Chunk array
  chunk: (arr, size) => {
    const chunks = []
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size))
    }
    return chunks
  },
}

// ** Object Utilities
export const objectUtils = {
  // Deep clone object
  deepClone: obj => {
    return JSON.parse(JSON.stringify(obj))
  },

  // Merge objects
  merge: (...objects) => {
    return Object.assign({}, ...objects)
  },

  // Pick specific keys
  pick: (obj, keys) => {
    const result = {}
    keys.forEach(key => {
      if (obj.hasOwnProperty(key)) {
        result[key] = obj[key]
      }
    })
    return result
  },

  // Omit specific keys
  omit: (obj, keys) => {
    const result = { ...obj }
    keys.forEach(key => {
      delete result[key]
    })
    return result
  },

  // Check if object is empty
  isEmpty: obj => {
    return Object.keys(obj).length === 0
  },

  // Get nested value safely
  get: (obj, path, defaultValue = undefined) => {
    const keys = path.split('.')
    let result = obj
    for (const key of keys) {
      if (result === null || result === undefined || !result.hasOwnProperty(key)) {
        return defaultValue
      }
      result = result[key]
    }
    return result
  },
}

// ** Number Utilities
export const numberUtils = {
  // Format number with commas
  formatWithCommas: num => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  },

  // Round to decimal places
  roundTo: (num, decimals = 2) => {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)
  },

  // Generate random number
  random: (min = 0, max = 100) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  },

  // Check if number is valid
  isValidNumber: num => {
    return !isNaN(num) && isFinite(num)
  },

  // Convert to currency format
  toCurrency: (num, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(num)
  },
}

// ** Local Storage Utilities
export const storageUtils = {
  // Set item
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      // Error saving to localStorage - handle silently in production
    }
  },

  // Get item
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      // Error reading from localStorage - handle silently in production
      return defaultValue
    }
  },

  // Remove item
  remove: key => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      // Error removing from localStorage - handle silently in production
    }
  },

  // Clear all
  clear: () => {
    try {
      localStorage.clear()
    } catch (error) {
      // Error clearing localStorage - handle silently in production
    }
  },
}

// ** URL Utilities
export const urlUtils = {
  // Get query parameters
  getQueryParams: () => {
    const params = new URLSearchParams(window.location.search)
    const result = {}
    for (const [key, value] of params) {
      result[key] = value
    }
    return result
  },

  // Set query parameters
  setQueryParams: params => {
    const url = new URL(window.location)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        url.searchParams.set(key, value)
      } else {
        url.searchParams.delete(key)
      }
    })
    window.history.pushState({}, '', url)
  },

  // Build query string
  buildQueryString: params => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, value)
      }
    })
    return searchParams.toString()
  },
}

// ** Debounce Utility
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// ** Throttle Utility
export const throttle = (func, limit) => {
  let inThrottle
  return function (...args) {
    if (!inThrottle) {
      func.apply(null, args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

// ** Generate UUID
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// ** Legacy Utility Functions (from old Utils.js)

// ** Checks if an object is empty (returns boolean)
export const isObjEmpty = obj => Object.keys(obj).length === 0

// ** Returns K format from a number
export const kFormatter = num => (num > 999 ? `${(num / 1000).toFixed(1)}k` : num)

// ** Converts HTML to string
export const htmlToString = html => html.replace(/<\/?[^>]+(>|$)/g, '')

// ** Check if user is logged in
export const isUserLoggedIn = () => localStorage.getItem('userData')

// ** Get user data
export const getUserData = () => JSON.parse(localStorage.getItem('userData'))

// ** Get home route for logged in user
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

// ** Ordinal suffix function
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

// ** Auto logout functionality
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
            localStorage.removeItem('userData')
            localStorage.removeItem('lastActivity')
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            window.location.href = '/login'
          })
          .catch(() => {
            localStorage.removeItem('userData')
            localStorage.removeItem('lastActivity')
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            window.location.href = '/login'
          })
      } else {
        handleSetTimeOut(miliseconds, miliseconds)
      }
    }, myTimeoutSec)
  }
}

export const handleAutoLogout = () => {
  const userDetails = JSON.parse(localStorage.getItem('userData'))
  const miliseconds = isNaN(parseInt(userDetails?.logoutMinutes))
    ? 100000
    : parseInt(userDetails.logoutMinutes) * 60 * 1000

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

// ** Object utilities
export const isObject = obj => {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

// ** Lock patient data functions
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
  } catch (error) {
    // Handle error silently
  }
}

export const getLockPatientIdsDm = () => {
  let LockPatientIdsDmData = {}
  try {
    LockPatientIdsDmData = JSON.parse(localStorage.getItem('LockPatientIdsDm'))
  } catch (error) {
    // Handle error silently
  }
  return LockPatientIdsDmData
}

export const checkForEditDm = (data, msg) => {
  let flag = 0
  try {
    const LockPatientIdsDmData = getLockPatientIdsDm()

    if (LockPatientIdsDmData) {
      flag = Object.keys(LockPatientIdsDmData).length
    }
  } catch (error) {
    // Handle error silently
  }
  if (flag >= 1 && msg) {
    // Note: This would need MySwal import for the alert
    // MySwal.fire({
    //   title: "<p>Info!</p>",
    //   text: "Patient information is currently being edited in the background. Once it's done, you'll be able to edit it again.",
    //   icon: "info",
    //   customClass: {
    //     confirmButton: "btn btn-primary"
    //   }
    // })
  }
  return flag >= 1
}

export const checkForOtherOperationDm = (data, msg) => {
  let flag = 0
  try {
    // Add null/undefined check for data
    if (!data || !data.orthancPatientId) {
      return false
    }
    
    const LockPatientIdsDmData = getLockPatientIdsDm()
    if (LockPatientIdsDmData) {
      if (LockPatientIdsDmData && LockPatientIdsDmData[data.orthancPatientId]) {
        flag = 1
      }
    }
  } catch (error) {
    // Handle error silently
    console.warn('Error in checkForOtherOperationDm:', error)
  }
  if (flag >= 1 && msg) {
    // Note: This would need MySwal import for the alert
    // MySwal.fire({
    //   title: "<p>Info!</p>",
    //   text: "Patient information is currently being edited in the background. Once it's done, you'll be able to allow this action.",
    //   icon: "info",
    //   customClass: {
    //     confirmButton: "btn btn-primary"
    //   }
    // })
  }
  return flag >= 1
}

export const getStudyLockDataAPIDm = async () => {
  try {
    // Note: This would need axios import for the API call
    // await axios.get(`${process.env.REACT_APP_API_URL}/explorer/studies/getStudyLockData`)
    //   .then(res => {
    //     setLockPatientIdsDm(res.data)
    //   })
    //   .catch(err => console.log("err", err))
  } catch (error) {
    // Error fetching study lock data - handle silently in production
  }
}
