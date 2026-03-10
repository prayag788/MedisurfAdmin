import { Alert } from 'reactstrap'
import { AlertTriangle, XCircle, Info, CheckCircle } from 'react-feather'

/**
 * Reusable Error Display Component
 * @param {Object} props - Component props
 * @param {string} props.type - Error type (error, warning, info, success)
 * @param {string} props.title - Error title
 * @param {string|Array} props.message - Error message(s)
 * @param {boolean} props.dismissible - Whether error can be dismissed
 * @param {Function} props.onDismiss - Dismiss handler
 * @param {string} props.className - Additional CSS class
 */
const ErrorDisplay = ({
  type = 'error',
  title,
  message,
  dismissible = false,
  onDismiss,
  className = '',
  ...props
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} />
      case 'warning':
        return <AlertTriangle size={16} />
      case 'info':
        return <Info size={16} />
      default:
        return <XCircle size={16} />
    }
  }

  const getColor = () => {
    switch (type) {
      case 'success':
        return 'success'
      case 'warning':
        return 'warning'
      case 'info':
        return 'info'
      default:
        return 'danger'
    }
  }

  const renderMessage = () => {
    if (Array.isArray(message)) {
      return (
        <ul className="mb-0">
          {message.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      )
    }
    return message
  }

  return (
    <Alert
      color={getColor()}
      className={`d-flex align-items-start ${className}`}
      {...props}
    >
      <div className="me-2 mt-1">{getIcon()}</div>
      <div className="flex-grow-1">
        {title && <h4 className="alert-heading">{title}</h4>}
        {renderMessage()}
      </div>
      {dismissible && onDismiss && (
        <button
          type="button"
          className="btn-close"
          onClick={onDismiss}
          aria-label="Close"
        >
          <XCircle size={16} />
        </button>
      )}
    </Alert>
  )
}

/**
 * Form Error Summary Component
 * @param {Object} props - Component props
 * @param {Object} props.errors - Form errors object
 * @param {string} props.title - Summary title
 * @param {boolean} props.dismissible - Whether summary can be dismissed
 * @param {Function} props.onDismiss - Dismiss handler
 */
export const FormErrorSummary = ({
  errors,
  title = 'Please fix the following errors:',
  dismissible = false,
  onDismiss,
  className = '',
}) => {
  if (!errors || Object.keys(errors).length === 0) {
    return null
  }

  const errorMessages = Object.entries(errors).map(([field, error]) => {
    if (Array.isArray(error)) {
      return error
        .map((err, index) => `${field}[${index}]: ${err.message || err}`)
        .join(', ')
    }
    return `${field}: ${error.message || error}`
  })

  return (
    <ErrorDisplay
      type="error"
      title={title}
      message={errorMessages}
      dismissible={dismissible}
      onDismiss={onDismiss}
      className={className}
    />
  )
}

/**
 * Field Error Component
 * @param {Object} props - Component props
 * @param {Object} props.error - Field error object
 * @param {string} props.className - Additional CSS class
 */
export const FieldError = ({ error, className = '' }) => {
  if (!error) return null

  const errorMessage = error.message || error

  return (
    <small className={`text-danger d-block ${className}`}>{errorMessage}</small>
  )
}

export default ErrorDisplay
