// ** React Imports
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import Select from 'react-select'
// ** Third Party Components
import { X } from 'react-feather'
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  FormGroup,
  Input,
  Label,
  Form,
  FormFeedback,
} from 'reactstrap'
import Flatpickr from 'react-flatpickr'
// ** Styles
import '@styles/react/libs/flatpickr/flatpickr.scss'
import { selectThemeColors } from '@utils'
import { FIELD_LIMITS, STATUS_OPTIONS } from '../../utils/constants'
import { useState, useEffect, useCallback, useMemo } from 'react'

const EditModal = ({ updateUser, open, handleModal, editData }) => {
  // ** Constants
  const PHONE_REGEXP = useMemo(
    () => /^[\+]?[(]?[0-9]{0,3}[)]?[-\s\.]?[0-9]{0,3}[-\s\.]?[0-9]{0,6}$/im,
    []
  )

  // ** State
  const [picker, setPicker] = useState(new Date())
  const [formData, setFormData] = useState(editData)

  // ** Validation schema
  const validationSchema = useMemo(
    () =>
      yup.object().shape({
        fname: yup
          .string('Name should be a string')
          .max(25, 'First name cannot be longer than 25 characters')
          .required('First Name is required!'),
        lname: yup
          .string()
          .max(25, 'Last name cannot be longer than 25 characters.')
          .required('Last Name is required!'),
        email: yup
          .string()
          .email('Please provide valid email address')
          .required('Please provide your email address. This field is required.'),
        hospitalname: yup
          .string()
          .max(
            FIELD_LIMITS.HOSPITAL_NAME_MAX_LENGTH,
            `Hospital name cannot be longer than ${FIELD_LIMITS.HOSPITAL_NAME_MAX_LENGTH} characters.`
          ),
        designation: yup.string().max(25, 'Designation name cannot be longer than 25 characters.'),
        cno: yup.string().matches(PHONE_REGEXP, 'Please enter a valid contact number'),
        location: yup.string(),
        status: yup
          .number()
          .oneOf([0, 1], 'Please select a valid status')
          .required('Status is required!'),
      }),
    [PHONE_REGEXP]
  )

  // ** Form setup
  const {
    formState: { errors },
    handleSubmit,
    setValue,
    control,
    watch,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
  })

  // ** Form field mapping
  const formFields = useMemo(
    () => ['fname', 'lname', 'email', 'hospitalname', 'designation', 'cno', 'location', 'status'],
    []
  )

  // ** Optimized date formatting function
  const formatDate = useCallback(date => {
    if (!date) return ''
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }, [])

  // ** Initialize form with data
  useEffect(() => {
    if (editData && Object.keys(editData).length > 0) {
      // Set form values efficiently
      formFields.forEach(field => {
        if (editData[field] !== undefined && editData[field] !== null) {
          setValue(field, editData[field], { shouldValidate: false })
        }
      })

      // Handle date picker
      if (editData.dob) {
        setPicker(new Date(editData.dob))
        setValue('dob', editData.dob, { shouldValidate: false })
      }
    }
  }, [editData, setValue, formFields])

  // ** Form submission handler
  const onSubmit = useCallback(
    data => {
      const formData = {
        ...data,
        dob: formatDate(picker),
        status: data.status || editData.status,
        _id: editData._id,
      }
      updateUser(formData)
    },
    [picker, formatDate, editData.status, editData._id, updateUser]
  )

  // ** Status change handler
  const handleStatusChange = useCallback(
    selectedOption => {
      setValue('status', selectedOption.value, { shouldValidate: true })
    },
    [setValue]
  )

  // ** Watch status for Select component
  const statusValue = watch('status')

  // ** Memoized close button
  const CloseBtn = useMemo(
    () => <X className="cursor-pointer" size={15} onClick={handleModal} />,
    [handleModal]
  )

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
              invalid={errors?.[name] && true}
              placeholder={placeholder}
              {...props}
            />
          )}
        />
        {errors?.[name] && <FormFeedback>{errors[name].message}</FormFeedback>}
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
      <ModalHeader className="mb-2" toggle={handleModal} close={CloseBtn} tag="div">
        <h5 className="modal-title">Edit Referring Doctor Details</h5>
      </ModalHeader>
      <ModalBody className="flex-grow-1">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormField name="fname" label="First Name" placeholder="Bruce" required />
          <FormField name="lname" label="Last Name" placeholder="Wayne" required />
          <FormField
            name="email"
            label="Email"
            type="email"
            placeholder="bruce.wayne@email.com"
            required
          />
          <FormField
            name="hospitalname"
            label="Hospital Name"
            placeholder="Fortis"
            maxLength={FIELD_LIMITS.HOSPITAL_NAME_MAX_LENGTH}
          />
          <FormField name="designation" label="Designation" placeholder="Doctor" />
          <FormGroup>
            <Label for="default-picker">Date of birth</Label>
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
              id="default-picker"
            />
          </FormGroup>
          <FormField name="cno" label="Contact Number" type="number" placeholder="+1" />
          <FormField name="location" label="Location" placeholder="New York" />
          <FormGroup>
            <Label for="status">
              Status <span style={{ color: '#FF0000' }}>*</span>
            </Label>
            <Controller
              name="status"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  {...field}
                  isClearable={false}
                  theme={selectThemeColors}
                  value={
                    STATUS_OPTIONS.find(option => option.value === statusValue) || STATUS_OPTIONS[0]
                  }
                  name="status"
                  id="status"
                  options={STATUS_OPTIONS}
                  className="react-select"
                  classNamePrefix="select"
                  onChange={handleStatusChange}
                />
              )}
            />
            {errors.status && (
              <FormFeedback style={{ display: 'block' }}>{errors?.status?.message}</FormFeedback>
            )}
          </FormGroup>
          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button type="submit" className="me-1" color="primary">
              Update Referring Doctor
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
