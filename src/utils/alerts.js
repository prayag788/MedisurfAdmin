/**
 * Alert utilities (SweetAlert2) for loading, success, error, and confirmation dialogs.
 *
 * ERROR HANDLING PATTERN (use consistently for all API calls that show loading):
 * - When you call showLoadingAlert() before an API request, handle errors with
 *   hideLoadingThenShowError(err) in the catch block so the error dialog always
 *   appears after the loading dialog closes (avoids the error popup closing or not showing).
 * - Do NOT use hideLoadingAlert() then showErrorAlert() in catch—use hideLoadingThenShowError(err).
 * - For 422 validation errors, you may keep the form/modal open so the user can correct and resubmit.
 *
 * API error shape supported: { error: { code: 'JCT014', message: '...' } }
 */

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

const normaliseErrorPayload = (payload, fallback) => {
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
    // Handle error code objects (like JCT codes)
    if (payload.code && payload.message) {
      return payload.message
    }

    // Handle array of errors (validation errors)
    if (Array.isArray(payload)) {
      const firstError = payload[0]
      if (firstError && firstError.msg) {
        return firstError.msg
      }
      if (firstError && typeof firstError === 'string') {
        return firstError
      }
    }

    if (payload.message) return normaliseErrorPayload(payload.message, fallback)
    if (payload.error) return normaliseErrorPayload(payload.error, fallback)
    if (payload.details && payload.details.error) {
      return normaliseErrorPayload(payload.details.error, fallback)
    }
  }

  return fallback
}

export const getErrorMessage = (err, fallback = 'Please Try Again Later!') => {
  try {
    // Only suppress message for actual network errors, not API errors
    if (err && err.code === 'ECONNABORTED') {
      return 'Request timeout. Please try again.'
    }

    if (err && err.isNetworkError) {
      return 'Network error. Please check your connection.'
    }

    // Handle API response errors
    if (err && err.response && err.response.data) {
      const errorData = err.response.data
      const status = err.response.status

      // Friendly message for payload/file too large (413)
      if (status === 413) {
        const maxMb = errorData?.maxAllowedBytes
          ? Math.round(errorData.maxAllowedBytes / (1024 * 1024))
          : null
        return maxMb !== null && maxMb !== undefined
          ? `File is too large. Maximum allowed size is ${maxMb} MB.`
          : 'File is too large. Please choose a smaller file or contact support for the size limit.'
      }

      // Handle different error response formats
      if (typeof errorData === 'string') {
        return errorData
      }

      // Handle JCT / API shape first: { error: { code: 'JCT014', message: '...' } }
      if (errorData && typeof errorData === 'object' && errorData.error) {
        const e = errorData.error
        if (e && typeof e === 'object') {
          const text = e.message ?? e.msg
          if (
            text !== null &&
            text !== undefined &&
            String(text).trim() !== ''
          ) {
            return String(text)
          }
        }
      }

      // Handle validation errors array (express-validator format)
      if (errorData.error && Array.isArray(errorData.error)) {
        const firstError = errorData.error[0]
        if (firstError && firstError.msg) {
          const msg = firstError.msg
          if (typeof msg === 'object' && msg !== null && msg.message)
            return String(msg.message)
          return typeof msg === 'string' ? msg : fallback
        }
      }

      return normaliseErrorPayload(errorData, fallback)
    }

    return normaliseErrorPayload(err, fallback)
  } catch (e) {
    console.error('Error processing error message:', e)
    return fallback
  }
}

export const showErrorAlert = (errorOrMessage, title = '<p>Error!</p>') => {
  const message = getErrorMessage(errorOrMessage)
  const displayMessage =
    message && String(message).trim()
      ? String(message).trim()
      : 'Something went wrong. Please try again.'
  return MySwal.fire({
    title,
    text: displayMessage,
    icon: 'error',
    customClass: { confirmButton: 'btn btn-primary' },
    buttonsStyling: false,
  })
}

export const showSuccessAlert = (message, title = '<p>Success!</p>') => {
  return MySwal.fire({
    title,
    text: message,
    icon: 'success',
    customClass: { confirmButton: 'btn btn-primary' },
    buttonsStyling: false,
  })
}

export const showInfoAlert = (message, title = '<p>Info</p>') => {
  return MySwal.fire({
    title,
    text: message,
    icon: 'info',
    customClass: { confirmButton: 'btn btn-primary' },
    buttonsStyling: false,
  })
}

export const showConfirm = ({
  title = '<p>Are you sure</p>',
  text = '',
  confirmButtonText = 'Yes',
  cancelButtonText = 'Cancel',
} = {}) => {
  return MySwal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    customClass: {
      confirmButton: 'btn btn-primary',
      cancelButton: 'btn btn-danger ml-1',
    },
    buttonsStyling: false,
  })
}

// Backward-compatible helpers expected by existing imports
export const showLoadingAlert = (title = '<p>Loading...</p>') => {
  return MySwal.fire({
    title,
    allowEscapeKey: false,
    allowOutsideClick: false,
    didOpen() {
      MySwal.showLoading()
    },
  })
}

/**
 * Closes the loading alert. Always returns a Promise so callers can safely
 * chain .then(() => showErrorAlert(...)). Uses a short delay so the loading
 * popup is fully closed before the next alert is shown (avoids dialog conflict).
 */
export const hideLoadingAlert = () => {
  const closeResult = MySwal.close()
  const hasThen = closeResult && typeof closeResult.then === 'function'
  if (hasThen) {
    return closeResult.then(() => new Promise((r) => setTimeout(r, 80)))
  }
  return new Promise((resolve) => setTimeout(resolve, 80))
}

/**
 * Closes the loading alert and then shows the error dialog. Use this in catch
 * blocks so the error always appears after loading is gone (no race, no missing .then).
 * @param {*} err - Error or response object (passed to getErrorMessage)
 * @param {string} [messageOverride] - Optional message to show instead of getErrorMessage(err)
 */
export const hideLoadingThenShowError = (err, messageOverride) => {
  MySwal.close()
  setTimeout(() => {
    showErrorAlert(
      messageOverride !== null && messageOverride !== undefined
        ? messageOverride
        : err
    )
  }, 100)
}

/**
 * Closes the loading alert and then shows the success dialog.
 * @param {string} message - Success message to show
 * @param {string} [title] - Optional title
 */
export const hideLoadingThenShowSuccess = (
  message,
  title = '<p>Success!</p>'
) => {
  MySwal.close()
  setTimeout(() => {
    showSuccessAlert(message, title)
  }, 100)
}

// Generic API response handler
export const handleApiResponse = async (
  apiCall,
  successMessage = 'Operation completed successfully!'
) => {
  try {
    const result =
      typeof apiCall === 'function' ? await apiCall() : await apiCall
    if (successMessage) {
      await showSuccessAlert(successMessage)
    }
    return result
  } catch (err) {
    await showErrorAlert(getErrorMessage(err))
    throw err
  }
}

export const handleFormSubmission = async (
  submitFn,
  successMessage = 'Saved successfully!'
) => {
  return handleApiResponse(submitFn, successMessage)
}

export { MySwal }

export default {
  getErrorMessage,
  showErrorAlert,
  showSuccessAlert,
  showInfoAlert,
  showConfirm,
  showLoadingAlert,
  hideLoadingAlert,
  hideLoadingThenShowError,
  hideLoadingThenShowSuccess,
  handleApiResponse,
  handleFormSubmission,
}
