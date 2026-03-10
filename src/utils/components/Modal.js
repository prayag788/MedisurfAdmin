import { Modal, ModalHeader, ModalBody, Button } from 'reactstrap'
import { X } from 'react-feather'

/**
 * Reusable Modal component with consistent styling
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.toggle - Function to toggle modal
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.size - Modal size (sm, lg, xl)
 * @param {boolean} props.centered - Whether modal is centered
 * @param {string} props.className - Additional CSS class
 * @param {Object} props.footer - Footer buttons configuration
 * @param {boolean} props.closable - Whether modal can be closed
 */
const CustomModal = ({
  isOpen,
  toggle,
  title,
  children,
  size = 'lg',
  centered = true,
  className = '',
  footer = null,
  closable = true,
  ...props
}) => {
  const CloseBtn = closable ? (
    <X className="cursor-pointer" size={15} onClick={toggle} />
  ) : null

  const getModalClassName = () => {
    const baseClass = `modal-dialog-centered modal-${size}`
    return className ? `${baseClass} ${className}` : baseClass
  }

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      className={getModalClassName()}
      centered={centered}
      {...props}
    >
      <ModalHeader
        className="bg-transparent"
        toggle={closable ? toggle : undefined}
        close={CloseBtn}
      >
        <h5 className="modal-title">{title}</h5>
      </ModalHeader>

      <ModalBody className="px-sm-5 pt-50 pb-5">{children}</ModalBody>

      {footer && <div className="modal-footer">{footer}</div>}
    </Modal>
  )
}

/**
 * Modal with form functionality
 */
export const FormModal = ({
  isOpen,
  toggle,
  title,
  children,
  onSubmit,
  submitText = 'Submit',
  cancelText = 'Cancel',
  isLoading = false,
  ...props
}) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit(e)
    }
  }

  const footer = (
    <>
      <Button
        type="submit"
        className="me-1"
        color="primary"
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : submitText}
      </Button>
      <Button
        type="button"
        color="secondary"
        outline
        onClick={toggle}
        disabled={isLoading}
      >
        {cancelText}
      </Button>
    </>
  )

  return (
    <CustomModal
      isOpen={isOpen}
      toggle={toggle}
      title={title}
      footer={footer}
      {...props}
    >
      <form onSubmit={handleSubmit}>{children}</form>
    </CustomModal>
  )
}

/**
 * Confirmation Modal
 */
export const ConfirmModal = ({
  isOpen,
  toggle,
  title = 'Confirm Action',
  message,
  onConfirm,
  confirmText = 'Yes, proceed!',
  cancelText = 'Cancel',
  type = 'warning',
  ...props
}) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    toggle()
  }

  const footer = (
    <>
      <Button color="primary" onClick={handleConfirm}>
        {confirmText}
      </Button>
      <Button color="secondary" outline onClick={toggle}>
        {cancelText}
      </Button>
    </>
  )

  return (
    <CustomModal
      isOpen={isOpen}
      toggle={toggle}
      title={title}
      footer={footer}
      size="sm"
      {...props}
    >
      <p>{message}</p>
    </CustomModal>
  )
}

export default CustomModal
