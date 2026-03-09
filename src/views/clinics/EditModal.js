// ** React Imports
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Third Party Components
import { X } from 'react-feather'
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  FormGroup,
  FormFeedback,
  Input,
  Label,
  Form,
} from 'reactstrap'

// ** Utils
import {
  STATUS_OPTIONS,
  EDIT_OPTIONS,
  FIELD_LIMITS,
  createNameValidation,
  createEmailValidation,
  createPhoneValidation,
  createStatusValidation,
} from '../../utils'
import * as yup from 'yup'

// ** Edit-specific schema with optional contact number
const CLINIC_EDIT_SCHEMA = yup.object().shape({
  clinicName: createNameValidation('Clinic Name', FIELD_LIMITS.CLINIC_NAME_MAX_LENGTH),
  email: createEmailValidation(),
  cno: createPhoneValidation(false), // Optional in edit mode
  status: createStatusValidation(),
  allow_edit_patient_details: yup
    .number()
    .oneOf([0, 1], 'Please select a valid option')
    .required('Please select option'),
})

// ** Styles
import '@styles/react/libs/flatpickr/flatpickr.scss'
import AdditionalDataComponent from '../clinic-user/AdditionalDataComponent'

const EditModal = ({ updateUser, open, handleModal, editData }) => {
  // ** State
  const [isValidSelect, setIsValidSelect] = useState(true)
  const [formData, setFormData] = useState(editData)

  // ** Form setup
  const {
    formState: { errors },
    handleSubmit,
    getValues,
    setValue,
    unregister,
    reset,
    control,
    watch,
    register,
  } = useForm({
    mode: 'onSubmit',
    resolver: yupResolver(CLINIC_EDIT_SCHEMA),
    shouldUnregister: true,
  })

  // ** Form field mapping
  const formFields = useMemo(
    () => [
      '_id',
      'clinicName',
      'email',
      'secondaryEmail',
      'secondaryCno',
      'cno',
      'status',
      'allow_edit_patient_details',
    ],
    []
  )

  // ** Initialize form with data
  useEffect(() => {
    if (editData && Object.keys(editData).length > 0) {
      // Set form values efficiently
      formFields.forEach(field => {
        if (editData[field] !== undefined && editData[field] !== null) {
          setValue(field, editData[field], { shouldValidate: false })
        }
      })

      // Update local formData state
      setFormData(editData)
    }
  }, [editData, setValue, formFields])

  // ** Handle modal open/close
  useEffect(() => {
    if (!open) {
      setIsValidSelect(prev => true)
    }
  }, [open])

  // ** Form submission handler
  const onSubmit = useCallback(
    data => {
      const formData = {
        ...data,
        _id: editData._id,
        status: parseInt(data.status, 10),
        allow_edit_patient_details: parseInt(data.allow_edit_patient_details, 10),
        secondaryEmail: data.secondaryEmail || [],
        secondaryCno: data.secondaryCno || [],
      }
      updateUser(formData)
    },
    [editData._id, updateUser]
  )

  // ** Memoized close button
  const CloseBtn = useMemo(
    () => <X className="cursor-pointer" size={15} onClick={handleModal} />,
    [handleModal]
  )

  // ** Input handler for form data updates
  const inputHandler = useCallback(e => {
    const name = e.target.name
    setFormData(prev => {
      return { ...prev, [name]: e.target.value }
    })
  }, [])

  // ** Reusable FormField component
  const FormField = useCallback(
    ({ name, label, type = 'text', placeholder, required = false, ...props }) => (
      <FormGroup>
        <Label for={name}>
          {label}
          {required && <span style={{ color: '#FF0000' }}>*</span>}
        </Label>
        <Controller
          name={name}
          control={control}
          rules={{ required }}
          render={({ field }) => (
            <Input
              id={name}
              name={name}
              type={type}
              {...field}
              invalid={errors[name] && true}
              placeholder={placeholder}
              {...props}
            />
          )}
        />
        {errors[name] && <FormFeedback>{errors[name].message}</FormFeedback>}
      </FormGroup>
    ),
    [control, errors]
  )

  return (
    <Modal
      isOpen={open}
      toggle={handleModal}
      className="sidebar-sm sm-w-100"
      modalClassName="modal-slide-in"
      contentClassName="pt-0"
    >
      <ModalHeader className="mb-3" toggle={handleModal} close={CloseBtn} tag="div">
        <h5 className="modal-title">Edit Clinic Details</h5>
      </ModalHeader>
      <ModalBody className="flex-grow-1">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormField name="_id" label="ID" placeholder="f23segfsfw344r3" disabled />
          <FormField
            name="clinicName"
            label="Clinic Name"
            placeholder="Test Clinic"
            required
            maxLength={FIELD_LIMITS.CLINIC_NAME_MAX_LENGTH}
          />
          <FormGroup>
            <Label for="email">
              Email <span style={{ color: '#FF0000' }}>*</span>
            </Label>
            <Controller
              name="email"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="email"
                  id="email"
                  invalid={errors.email && true}
                  placeholder="test.clinic@email.com"
                />
              )}
            />
            {errors.email && <FormFeedback>{errors.email.message}</FormFeedback>}
          </FormGroup>
          <AdditionalDataComponent
            fieldName="secondaryEmail"
            title="Email"
            limit={2}
            inputType="email"
            formData={formData}
            errors={errors}
            setFormData={setFormData}
            setValue={setValue}
            getValues={getValues}
            placeholder="test.clinic@email.com"
          />
          <FormField name="cno" label="Contact Number" type="text" placeholder="+1" />
          <AdditionalDataComponent
            fieldName="secondaryCno"
            title="Add More"
            limit={2}
            inputType="numeric"
            formData={formData}
            errors={errors}
            setFormData={setFormData}
            setValue={setValue}
            getValues={getValues}
            placeholder={'+1'}
          />
          <FormGroup>
            <Label for="status">
              Status <span style={{ color: '#FF0000' }}>*</span>
            </Label>
            <Controller
              name="status"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  {...field}
                  name="status"
                  id="status"
                  type="select"
                  invalid={errors.status && true}
                >
                  {STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Input>
              )}
            />
            {errors.status && <FormFeedback>{errors.status.message}</FormFeedback>}
          </FormGroup>
          <FormGroup>
            <Label for="allow_edit_patient_details">
              Allow to Edit the Patient Details? <span style={{ color: '#FF0000' }}>*</span>
            </Label>
            <Controller
              name="allow_edit_patient_details"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  {...field}
                  name="allow_edit_patient_details"
                  id="allow_edit_patient_details"
                  type="select"
                  invalid={errors.allow_edit_patient_details && true}
                >
                  {EDIT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Input>
              )}
            />
            {errors.allow_edit_patient_details && (
              <FormFeedback>{errors.allow_edit_patient_details.message}</FormFeedback>
            )}
          </FormGroup>
          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button type="submit" className="me-1" color="primary">
              Update Clinic
            </Button>
            <Button type="button" color="secondary" onClick={handleModal} outline>
              Cancel
            </Button>
          </div>
        </Form>
      </ModalBody>
    </Modal>
  )
}

export default EditModal
