// ** React Imports
import { useEffect, useRef, useState } from 'react'
import fontawesome from '@fortawesome/fontawesome'
import { faAsterisk } from '@fortawesome/fontawesome-free-solid'

// ** Third Party Components
import { X } from 'react-feather'
import { Button, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap'

// ** Styles
import '@styles/react/libs/flatpickr/flatpickr.scss'
import DynamicDropdown from '../../@core/components/dynamicDropdown'
import { useSelector } from 'react-redux'

// ** Utils
import {
  FormValidationWrapper,
  NameField,
  EmailField,
  PhoneField,
  SelectField,
  STATUS_OPTIONS,
  FORM_DEFAULTS,
  CLINIC_USER_SCHEMA,
  showErrorAlert,
  getErrorMessage,
} from '../../utils'

fontawesome.library.add(faAsterisk)

const AddNewModal = ({ addUser, open, handleModal }) => {
  // ** State
  const [isValidSelect, setIsValidSelect] = useState(true)
  const isInitialInput = useRef(true)
  const dropdowndata = useSelector(state => state.dropdownDataReducer)

  // ** Form setup using utility
  const defaultValues = {
    ...FORM_DEFAULTS.USER,
    clinics: [],
    status: 1,
  }

  // ** Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setIsValidSelect(true)
    }
  }, [open])

  // ** Form submission handler - parent addUser shows loading, success and closes modal; we only await and show error on failure
  const onSubmit = async data => {
    try {
      await addUser(data)
    } catch (err) {
      if (err && err.response) {
        showErrorAlert(getErrorMessage(err))
      }
    }
  }

  const validateSelect = () => {
    setIsValidSelect(true)
    return true
  }

  // ** Custom close btn
  const CloseBtn = <X className="cursor-pointer" size={15} onClick={handleModal} />

  return (
    <Modal
      isOpen={open}
      toggle={handleModal}
      className="modal-dialog-centered modal-lg"
      modalClassName="modal-slide-in"
      contentClassName="pt-0"
    >
      <ModalHeader
        className="mb-3 pb-3 border-bottom"
        toggle={handleModal}
        close={CloseBtn}
        tag="div"
      >
        <h4 className="modal-title fw-bold text-primary mb-0">Add New Clinic User</h4>
      </ModalHeader>
      <ModalBody className="flex-grow-1 px-4 py-3">
        <FormValidationWrapper
          schema={CLINIC_USER_SCHEMA}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
        >
          {({ control, errors, handleSubmit, setValue, getValues, isSubmitting }) => (
            <>
              <div className="mb-4">
                <h6 className="text-muted mb-3 fw-semibold">Personal Information</h6>
                <Row className="g-3">
                  <Col md="6">
                    <NameField
                      name="fname"
                      control={control}
                      label="First Name"
                      placeholder="Enter first name"
                      errors={errors}
                      required={true}
                    />
                  </Col>
                  <Col md="6">
                    <NameField
                      name="lname"
                      control={control}
                      label="Last Name"
                      placeholder="Enter last name"
                      errors={errors}
                      required={true}
                    />
                  </Col>
                </Row>
              </div>

              <div className="mb-4">
                <h6 className="text-muted mb-3 fw-semibold">Contact Information</h6>
                <Row className="g-3">
                  <Col md="6">
                    <EmailField
                      name="email"
                      control={control}
                      label="Email Address"
                      placeholder="Enter email address"
                      errors={errors}
                      required={true}
                    />
                  </Col>
                  <Col md="6">
                    <PhoneField
                      name="cno"
                      control={control}
                      label="Contact Number"
                      placeholder="Enter contact number"
                      errors={errors}
                    />
                  </Col>
                </Row>
              </div>

              <div className="mb-4">
                <h6 className="text-muted mb-3 fw-semibold">Account Settings</h6>
                <Row className="g-3">
                  <Col md="6">
                    <SelectField
                      name="status"
                      control={control}
                      label="Account Status"
                      options={STATUS_OPTIONS}
                      errors={errors}
                      required={true}
                    />
                  </Col>
                  <Col md="6">
                    <div className="mb-3">
                      <DynamicDropdown
                        className="mb-0"
                        fieldName="clinics"
                        labelName="Clinic Assignment"
                        isMulti={true}
                        errors={errors}
                        required={true}
                        setValue={setValue}
                        value={getValues('clinics')}
                        roleName="clinicName"
                        control={control}
                        name="clinics"
                      />
                    </div>
                  </Col>
                </Row>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                <Button
                  type="button"
                  color="secondary"
                  outline
                  onClick={handleModal}
                  disabled={isSubmitting}
                  className="px-4"
                >
                  Cancel
                </Button>
                <Button type="submit" color="primary" disabled={isSubmitting} className="px-4">
                  {isSubmitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Creating...
                    </>
                  ) : (
                    'Create User'
                  )}
                </Button>
              </div>
            </>
          )}
        </FormValidationWrapper>
      </ModalBody>
    </Modal>
  )
}

export default AddNewModal
