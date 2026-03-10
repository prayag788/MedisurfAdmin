import { toast, Slide } from 'react-toastify'
import Avatar from '@components/avatar'
import { Check, X } from 'react-feather'

export const ToastContentForError = ({ message }) => {
  // Ensure we have a meaningful error message
  const displayMessage = message || 'An error occurred. Please try again.'

  return (
    <div className="d-flex">
      <Avatar
        size="sm"
        color="danger"
        icon={<X size={12} />}
        className="me-2 flex-shrink-0"
      />
      <div className="flex-grow-1">
        <div className="toast-title font-weight-bold">Error</div>
        <div className="toast-message">{displayMessage}</div>
      </div>
    </div>
  )
}

export const ToastContent = ({ message }) => (
  <div className="d-flex">
    <Avatar
      size="sm"
      color="success"
      icon={<Check size={12} />}
      className="me-2 flex-shrink-0"
    />
    <div className="flex-grow-1">
      <div className="toast-title font-weight-bold">Success</div>
      <div className="toast-message">{message}</div>
    </div>
  </div>
)

const defaultOptions = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: false,
  pauseOnFocusLoss: false,
  draggable: false,
  progress: undefined,
  icon: false,
  transition: Slide,
}

const scheduleDismiss = (id, delay) => {
  if (!delay || delay <= 0) {
    return
  }
  setTimeout(() => {
    toast.dismiss(id)
  }, delay + 200)
}

export const showToastSuccess = (message, options = {}) => {
  const merged = { ...defaultOptions, ...options }
  const toastId =
    typeof merged.toastId !== 'undefined'
      ? merged.toastId
      : `success-${Math.random().toString(36).slice(2)}`

  const id = toast(<ToastContent message={message} />, {
    ...merged,
    toastId,
    icon: false,
    className: 'custom-toast-success',
  })

  scheduleDismiss(id, merged.autoClose)
  return id
}

export const showToastError = (message, options = {}) => {
  const merged = { ...defaultOptions, ...options }
  const toastId =
    typeof merged.toastId !== 'undefined'
      ? merged.toastId
      : `error-${Math.random().toString(36).slice(2)}`

  const id = toast(<ToastContentForError message={message} />, {
    ...merged,
    toastId,
    icon: false,
    className: 'custom-toast-error',
  })

  scheduleDismiss(id, merged.autoClose)
  return id
}

export default {
  ToastContent,
  ToastContentForError,
  showToastSuccess,
  showToastError,
}
