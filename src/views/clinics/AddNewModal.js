// ** React Imports
import { useEffect, useRef, useState } from 'react'
import fontawesome from '@fortawesome/fontawesome'
import { faAsterisk } from '@fortawesome/fontawesome-free-solid'

// ** Third Party Components
import { X } from 'react-feather'
import { Button, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap'

// ** Styles
import '@styles/react/libs/flatpickr/flatpickr.scss'

// ** Utils
import {
  FormValidationWrapper,
  NameField,
  EmailField,
  PhoneField,
  SelectField,
  FormErrorSummary,
  AdditionalDataComponent,
  STATUS_OPTIONS,
  EDIT_OPTIONS,
  FORM_DEFAULTS,
  CLINIC_SCHEMA,
  FIELD_LIMITS,
  showSuccessAlert,
  showErrorAlert,
} from '../../utils'

fontawesome.library.add(faAsterisk)

const AddNewModal = ({ addNewInstitutionClinics, open, handleModal }) => {
  // ** State
  const [isValidSelect, setIsValidSelect] = useState(true)
  const isInitialInput = useRef(true)

  // ** Form setup using utility
  const defaultValues = {
    ...FORM_DEFAULTS.CLINIC,
    status: 1,
    allow_edit_patient_details: 0,
  }

  // ** Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setIsValidSelect(true)
    }
  }, [open])

  // ** Form submission handler using utility
  const onSubmit = async (data) => {
    try {
      await addNewInstitutionClinics(data)
      showSuccessAlert('Clinic created successfully!')
      handleModal()
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
  const CloseBtn = (
    <X className="cursor-pointer" size={15} onClick={handleModal} />
  )

  return (
    <Modal
      isOpen={open}
      toggle={handleModal}
      className="sidebar-sm sm-w-100"
      modalClassName="modal-slide-in"
      contentClassName="pt-0"
    >
      <ModalHeader
        className="mb-2"
        toggle={handleModal}
        close={CloseBtn}
        tag="div"
      >
        <h5 className="modal-title">Add New Clinic</h5>
      </ModalHeader>
      <ModalBody className="flex-grow-1">
        <FormValidationWrapper
          schema={CLINIC_SCHEMA}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
        >
          {({
            control,
            errors,
            handleSubmit,
            setValue,
            getValues,
            isSubmitting,
          }) => (
            <>
              <FormErrorSummary errors={errors} />

              <Row>
                <Col md="6" sm="12">
                  <NameField
                    name="clinicName"
                    control={control}
                    label="Clinic Name"
                    placeholder="Enter clinic name"
                    errors={errors}
                    required={true}
                    maxLength={FIELD_LIMITS.CLINIC_NAME_MAX_LENGTH}
                  />
                </Col>
                <Col md="6" sm="12">
                  <EmailField
                    name="email"
                    control={control}
                    label="Email"
                    placeholder="Enter email address"
                    errors={errors}
                    required={true}
                  />
                </Col>
              </Row>

              <Row>
                <Col md="6" sm="12">
                  <PhoneField
                    name="cno"
                    control={control}
                    label="Contact Number"
                    placeholder="Enter contact number"
                    errors={errors}
                  />
                </Col>
                <Col md="6" sm="12">
                  <SelectField
                    name="status"
                    control={control}
                    label="Status"
                    options={STATUS_OPTIONS}
                    errors={errors}
                    required={true}
                  />
                </Col>
              </Row>

              <Row>
                <Col md="6" sm="12">
                  <SelectField
                    name="allow_edit_patient_details"
                    control={control}
                    label="Allow Edit Patient Details"
                    options={EDIT_OPTIONS}
                    errors={errors}
                    required={true}
                  />
                </Col>
              </Row>

              <AdditionalDataComponent
                fieldName="secondaryEmail"
                title="Secondary Email"
                limit={2}
                inputType="email"
                formData={getValues()}
                errors={errors}
                setFormData={setValue}
                setValue={setValue}
                getValues={getValues}
                placeholder="Enter secondary email"
                control={control}
              />

              <AdditionalDataComponent
                fieldName="secondaryCno"
                title="Secondary Contact Number"
                limit={2}
                inputType="text"
                formData={getValues()}
                errors={errors}
                setFormData={setValue}
                setValue={setValue}
                getValues={getValues}
                placeholder="Enter secondary contact number"
                control={control}
              />

              <div className="d-flex justify-content-end mt-2">
                <Button
                  type="submit"
                  className="me-1"
                  color="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
                <Button
                  type="button"
                  color="secondary"
                  outline
                  onClick={handleModal}
                  disabled={isSubmitting}
                >
                  Cancel
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
