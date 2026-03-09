import { showErrorAlert, showToastError } from './alerts'
import { showToastError as showToastErrorUtil } from './toast'

/**
 * Enhanced error handler utility for consistent error message display
 */

/**
 * Extract error message from various error formats
 * @param {*} error - Error object, string, or response
 * @param {string} fallback - Fallback message if no error found
 * @returns {string} - Extracted error message
 */
export const extractErrorMessage = (error, fallback = 'An error occurred. Please try again.') => {
  if (!error) return fallback

  // Handle string errors
  if (typeof error === 'string') {
    return error.trim() || fallback
  }

  // Handle Error objects
  if (error instanceof Error) {
    return error.message || fallback
  }

  // Handle axios response errors
  if (error.response && error.response.data) {
    const data = error.response.data

    // Handle string response
    if (typeof data === 'string') {
      return data.trim() || fallback
    }

    // Handle object response
    if (typeof data === 'object') {
      // Handle error code objects (JCT codes)
      if (data.code && data.message) {
        return data.message
      }

      // Handle validation errors array
      if (data.error && Array.isArray(data.error)) {
        const firstError = data.error[0]
        if (firstError && firstError.msg) {
          return firstError.msg
        }
        if (firstError && typeof firstError === 'string') {
          return firstError
        }
      }

      // Handle simple error field
      if (data.error && typeof data.error === 'string') {
        return data.error
      }

      // Handle message field
      if (data.message && typeof data.message === 'string') {
        return data.message
      }

      // Handle details.error
      if (data.details && data.details.error) {
        return extractErrorMessage(data.details.error, fallback)
      }
    }
  }

  // Handle direct error field
  if (error.error) {
    return extractErrorMessage(error.error, fallback)
  }

  // Handle message field
  if (error.message) {
    return extractErrorMessage(error.message, fallback)
  }

  return fallback
}

/**
 * Display error using alert modal
 * @param {*} error - Error to display
 * @param {string} title - Alert title
 * @param {string} fallback - Fallback message
 */
export const displayErrorAlert = (error, title = 'Error', fallback) => {
  const message = extractErrorMessage(error, fallback)
  if (message && message.trim()) {
    showErrorAlert(message, `<p>${title}</p>`)
  }
}

/**
 * Display error using toast notification
 * @param {*} error - Error to display
 * @param {string} fallback - Fallback message
 */
export const displayErrorToast = (error, fallback) => {
  const message = extractErrorMessage(error, fallback)
  if (message && message.trim()) {
    showToastErrorUtil(message)
  }
}

/**
 * Handle API errors with consistent display
 * @param {*} error - Error from API call
 * @param {Object} options - Display options
 * @param {string} options.type - 'alert' or 'toast'
 * @param {string} options.title - Title for alert
 * @param {string} options.fallback - Fallback message
 */
export const handleApiError = (error, options = {}) => {
  const {
    type = 'alert',
    title = 'Error',
    fallback = 'An error occurred. Please try again.'
  } = options

  console.error('API Error:', error)

  if (type === 'toast') {
    displayErrorToast(error, fallback)
  } else {
    displayErrorAlert(error, title, fallback)
  }
}

/**
 * Enhanced form error handler
 * @param {*} error - Error from form submission
 * @param {string} context - Context of the error (e.g., 'user creation', 'data update')
 */
export const handleFormError = (error, context = 'operation') => {
  const message = extractErrorMessage(error)
  
  // Log for debugging
  console.error(`Form error in ${context}:`, error)
  
  // Display user-friendly error
  displayErrorAlert(error, 'Form Error', `Failed to complete ${context}. ${message}`)
}

/**
 * Network error handler
 * @param {*} error - Network error
 */
export const handleNetworkError = (error) => {
  if (error && error.code === 'ECONNABORTED') {
    displayErrorAlert('Request timeout. Please try again.', 'Connection Timeout')
  } else if (error && error.isNetworkError) {
    displayErrorAlert('Network error. Please check your internet connection.', 'Network Error')
  } else {
    handleApiError(error, { title: 'Network Error' })
  }
}

/**
 * Validation error handler for forms
 * @param {Object} errors - Validation errors object
 * @returns {string} - First validation error message
 */
export const getFirstValidationError = (errors) => {
  if (!errors || typeof errors !== 'object') return null

  const errorKeys = Object.keys(errors)
  if (errorKeys.length === 0) return null

  const firstError = errors[errorKeys[0]]
  if (firstError && firstError.message) {
    return firstError.message
  }

  return null
}

export default {
  extractErrorMessage,
  displayErrorAlert,
  displayErrorToast,
  handleApiError,
  handleFormError,
  handleNetworkError,
  getFirstValidationError
}