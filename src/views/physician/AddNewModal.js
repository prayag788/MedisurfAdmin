// ** React Imports
import { useEffect, useState } from 'react'

// ** Third Party Components
import { X } from 'react-feather'
import { Button, Row, Col, Modal, ModalHeader, ModalBody, FormGroup, Label } from 'reactstrap'
import Flatpickr from 'react-flatpickr'

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
  STATUS_OPTIONS,
  FORM_DEFAULTS,
  USER_BASIC_SCHEMA,
  showSuccessAlert,
  showErrorAlert,
  getErrorMessage,
} from '../../utils'

// ** Custom Components
import DynamicDropdown from '../../@core/components/dynamicDropdown'
import { Controller } from 'react-hook-form'

const AddNewModal = ({ addUser, open, handleModal }) => {
  // ** State for date picker
  const [picker, setPicker] = useState('')

  // ** Form setup using utility
  const defaultValues = {
    ...FORM_DEFAULTS.PHYSICIAN,
    hospitalname: '',
    location: '',
    designation: '',
    dob: '',
    physicianname: '',
    status: 1,
  }

  // ** Form submission handler using utility
  const onSubmit = async data => {
    console.log('Form submitted with data:', data)

    // Use admin registration endpoint for creating new physicians
    const transformedData = {
      email: data.email,
      cno: data.cno || '',
      hospitalname: data.hospitalname || '',
      location: data.location || '',
      designation: data.designation || '',
      dob: picker ? new Date(picker).toISOString().split('T')[0] : '',
      status: data.status,
      role: 'Physician',
      physicianname: data.physicianname?.name || data.physicianname,
      clinics: data.clinics || [],
    }

    addUser(transformedData)
  }

  // ** Custom close btn
  const CloseBtn = <X className="cursor-pointer" size={15} onClick={handleModal} />

  return (
    <Modal
      isOpen={open}
      toggle={handleModal}
      className="sidebar-sm sm-w-100"
      modalClassName="modal-slide-in"
      contentClassName="pt-0"
    >
      <ModalHeader className="mb-2" toggle={handleModal} close={CloseBtn} tag="div">
        <h5 className="modal-title">Add New Physician</h5>
      </ModalHeader>
      <ModalBody className="flex-grow-1">
        <FormValidationWrapper
          schema={USER_BASIC_SCHEMA}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
        >
          {({ control, errors, handleSubmit, setValue, getValues, isSubmitting }) => (
            <>
              <FormErrorSummary errors={errors} />

              <Row>
                <Col md="12" sm="12">
                  <div className="mb-3">
                    <DynamicDropdown
                      className="mb-0"
                      fieldName="physicianname"
                      labelName="Physician Name"
                      isMulti={false}
                      errors={errors}
                      required={true}
                      setValue={setValue}
                      value={getValues('physicianname')}
                      roleName="Physician"
                      control={control}
                      name="physicianname"
                    />
                  </div>
                </Col>
              </Row>

              <Row>
                <Col md="12" sm="12">
                  <div className="mb-3">
                    <DynamicDropdown
                      className="mb-0"
                      fieldName="clinics"
                      labelName="Clinic Name"
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

              <Row>
                <Col md="6" sm="12">
                  <NameField
                    name="hospitalname"
                    control={control}
                    label="Hospital Name"
                    placeholder="Enter hospital name"
                    errors={errors}
                    required={true}
                  />
                </Col>
                <Col md="6" sm="12">
                  <NameField
                    name="location"
                    control={control}
                    label="Location"
                    placeholder="Enter location"
                    errors={errors}
                    required={true}
                  />
                </Col>
              </Row>

              <Row>
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
                <Col md="6" sm="12">
                  <PhoneField
                    name="cno"
                    control={control}
                    label="Contact Number"
                    placeholder="Enter contact number"
                    errors={errors}
                  />
                </Col>
              </Row>

              <Row>
                <Col md="6" sm="12">
                  <NameField
                    name="designation"
                    control={control}
                    label="Designation"
                    placeholder="Enter designation"
                    errors={errors}
                    required={false}
                  />
                </Col>
                <Col md="6" sm="12">
                  <FormGroup>
                    <Label for="dob">Date of Birth</Label>
                    <Flatpickr
                      className="form-control"
                      value={picker}
                      options={{
                        maxDate: new Date(),
                        allowInput: false,
                        closeOnSelect: true, // Close after selecting date for single date picker
                      }}
                      onChange={date => {
                        if (date && date.length > 0) {
                          setPicker(date[0])
                        }
                      }}
                      id="dob"
                      placeholder="Select date of birth"
                    />
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col md="12" sm="12">
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

              <div className="d-flex justify-content-end mt-2">
                <Button type="submit" className="me-1" color="primary" disabled={isSubmitting}>
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
