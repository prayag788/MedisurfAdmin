// Global fetch configuration and interceptors

const getToken = () => {
  const tokenRaw = localStorage.getItem('accessToken') || localStorage.getItem('authToken')
  
  if (!tokenRaw) {
    return null
  }

  let token = tokenRaw

  try {
    const parsed = JSON.parse(tokenRaw)
    if (typeof parsed === 'object' && parsed !== null) {
      token = parsed.token || parsed.accessToken || tokenRaw
    }
  } catch (_) {
    token = tokenRaw
  }

  return token && typeof token === 'string' ? token.trim() : null
}

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8005/api'

export const fetchWithInterceptors = async (url, options = {}) => {
  const token = getToken()
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  if (fullUrl.includes('/user')) {
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    headers['Pragma'] = 'no-cache'
    headers['Expires'] = '0'
  }

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
      timeout: 30000,
    })

    if (typeof response.data === 'string' && response.data?.startsWith('eyJ')) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('authToken')
      window.location.href = '/login'
      throw new Error('Authentication failed')
    }

    if (response.status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('authToken')
      window.location.href = '/login'
      throw new Error('Unauthorized')
    }

    const shouldRefresh = response.headers.get('x-refresh-required') || response.headers.get('x-fresh-data')
    if (shouldRefresh) {
      window.dispatchEvent(new CustomEvent('userDataRefresh', {
        detail: {
          action: response.headers.get('x-action'),
          role: response.headers.get('x-role'),
          userId: response.headers.get('x-user-updated'),
        }
      }))
    }

    return response
  } catch (error) {
    if (!error?.response) {
      error.isNetworkError = true
    }
    throw error
  }
}

// Keep axios import for backward compatibility with existing code
import axios from 'axios'
import { getErrorMessage, showConfirm } from './alerts'

// Request: attach token globally and convert status objects to integers
axios.interceptors.request.use(
  config => {
    try {
      const token = getToken()

      if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
      }

      if (config.url && config.url.includes('/user')) {
        config.headers = config.headers || {}
        config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        config.headers['Pragma'] = 'no-cache'
        config.headers['Expires'] = '0'
      }

      if (config.data && typeof config.data === 'object') {
        if (config.data.status !== undefined) {
          if (typeof config.data.status === 'object' && config.data.status !== null) {
            config.data.status = parseInt(config.data.status.value || config.data.status, 10)
          } else if (typeof config.data.status === 'string') {
            config.data.status = parseInt(config.data.status, 10)
          }
        }
      }
    } catch (_) {}
    return config
  },
  error => Promise.reject(error)
)

// Response: network error handling + 401
let isShowingNetworkAlert = false
let suppressNetworkAlertUntil = 0

axios.interceptors.response.use(
  response => {
    // Check if response data is a JWT token string instead of JSON
    if (typeof response.data === 'string' && response.data.startsWith('eyJ')) {
      console.error('Received JWT token as response data, this indicates an authentication issue')
      // Treat this as an authentication error
      localStorage.removeItem('accessToken')
      localStorage.removeItem('authToken')
      window.location.href = '/login'
      return Promise.reject(new Error('Authentication failed - received token instead of data'))
    }
    
    // LIVE UPDATES: Handle refresh flags and emit events
    const shouldRefresh = response.data?.refresh || 
                         response.headers['x-refresh-required'] ||
                         response.headers['x-fresh-data']
    
    if (shouldRefresh) {
      // Emit custom event for components to listen to
      window.dispatchEvent(new CustomEvent('userDataRefresh', {
        detail: {
          action: response.headers['x-action'] || response.data?.action,
          role: response.headers['x-role'] || response.data?.role,
          userId: response.headers['x-user-updated'] || response.data?.userId
        }
      }))
    }
    
    return response
  },
  async error => {
    // Handle network errors (no response) with confirm and single retry
    if (!error?.response) {
      // Mark as network error for proper handling
      error.isNetworkError = true
      
      const now = Date.now()
      const skipGlobalAlert = error?.config?.__skipGlobalNetworkAlert === true
      if (
        skipGlobalAlert ||
        isShowingNetworkAlert ||
        now < suppressNetworkAlertUntil ||
        error?.code === 'ERR_CANCELED' ||
        /canceled/i.test(error?.message || '')
      ) {
        return Promise.reject(error)
      }
      isShowingNetworkAlert = true
      try {
        const result = await showConfirm({
          title: '<p>Network Error</p>',
          text: `Please check your internet connection.\nRetry the request?`,
          confirmButtonText: 'Retry',
          cancelButtonText: 'Cancel',
        })
        if (result?.isConfirmed && error.config && !error.config.__retried) {
          const retryConfig = { ...error.config, __retried: true }
          return await axios.request(retryConfig)
        } else {
          // User cancelled - return a resolved promise to prevent unhandled rejection
          return Promise.resolve({ data: null, status: 'cancelled' })
        }
      } finally {
        isShowingNetworkAlert = false
        suppressNetworkAlertUntil = Date.now() + 0
      }
    }

    // 401: clear and redirect (except for migration endpoints which handle their own errors)
    if (error.response?.status === 401) {
      const url = error.config?.url || ''
      // Don't auto-logout for migration endpoints - let the component handle it
      // if (url.includes('/api/migration/')) {
        return Promise.reject(error)
      // }
      // localStorage.removeItem('accessToken')
      // localStorage.removeItem('authToken')
      // window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Defaults
if (process.env.REACT_APP_API_URL) {
  axios.defaults.baseURL = process.env.REACT_APP_API_URL
}
axios.defaults.timeout = 30000
axios.defaults.headers['Content-Type'] = 'application/json'
