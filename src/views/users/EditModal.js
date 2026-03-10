// ** React Imports
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

import { FIELD_LIMITS } from '../../utils/constants'
import { handleFormError } from '../../utils/error-handler'

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

// ** Styles
import '@styles/react/libs/flatpickr/flatpickr.scss'
import { useState, useEffect, useCallback, useMemo } from 'react'

const EditModal = ({ updateUser, open, handleModal, editData }) => {
  // ** Constants
  const PHONE_REGEXP = useMemo(
    () => /^[\+]?[(]?[0-9]{0,3}[)]?[-\s\.]?[0-9]{0,3}[-\s\.]?[0-9]{0,6}$/im,
    []
  )

  // ** State
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
        hospitalname: yup
          .string()
          .max(
            FIELD_LIMITS.HOSPITAL_NAME_MAX_LENGTH,
            `Hospital name cannot be longer than ${FIELD_LIMITS.HOSPITAL_NAME_MAX_LENGTH} characters.`
          ),
        designation: yup.string(),
        cno: yup
          .string()
          .matches(PHONE_REGEXP, 'Please enter a valid contact number'),
      }),
    [PHONE_REGEXP]
  )

  // ** Form setup
  const {
    formState: { errors },
    handleSubmit,
    setValue,
    control,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
  })

  // ** Form field mapping
  const formFields = useMemo(
    () => ['fname', 'lname', 'hospitalname', 'designation', 'cno'],
    []
  )

  // ** Initialize form with data
  useEffect(() => {
    if (editData && Object.keys(editData).length > 0) {
      // Set form values efficiently
      formFields.forEach((field) => {
        if (editData[field] !== undefined && editData[field] !== null) {
          setValue(field, editData[field], { shouldValidate: false })
        }
      })
    }
  }, [editData, setValue, formFields])

  // ** Form submission handler with enhanced error handling
  const onSubmit = useCallback(
    async (data) => {
      try {
        const formData = {
          ...data,
          _id: editData._id,
        }
        await updateUser(formData)
      } catch (err) {
        // Enhanced error handling for form submission
        handleFormError(err, 'user update')
        console.error('User update error:', err)
      }
    },
    [editData._id, updateUser]
  )

  // ** Memoized close button
  const CloseBtn = useMemo(
    () => <X className="cursor-pointer" size={15} onClick={handleModal} />,
    [handleModal]
  )

  // ** Reusable FormField component
  const FormField = useCallback(
    ({
      name,
      label,
      type = 'text',
      placeholder,
      required = false,
      ...props
    }) => (
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
      <ModalHeader
        className="mb-2"
        toggle={handleModal}
        close={CloseBtn}
        tag="div"
      >
        <h5 className="modal-title">Edit User Details</h5>
      </ModalHeader>
      <ModalBody className="flex-grow-1">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormField
            name="fname"
            label="First Name"
            placeholder="Bruce"
            required
          />
          <FormField
            name="lname"
            label="Last Name"
            placeholder="Wayne"
            required
          />
          <FormField
            name="hospitalname"
            label="Hospital Name"
            placeholder="Fortis"
            maxLength={FIELD_LIMITS.HOSPITAL_NAME_MAX_LENGTH}
          />
          <FormField
            name="designation"
            label="Designation"
            placeholder="Doctor"
          />
          <FormField
            name="cno"
            label="Contact Number"
            type="number"
            placeholder="+1"
          />
          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button type="submit" className="me-1" color="primary">
              Update User
            </Button>
            <Button
              type="button"
              color="secondary"
              onClick={handleModal}
              outline
            >
              Cancel
            </Button>
          </div>
        </Form>
      </ModalBody>
    </Modal>
  )
}

export default EditModal
