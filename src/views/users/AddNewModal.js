// ** React Imports
import { useEffect, useRef, useState, useCallback } from 'react'
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import fontawesome from '@fortawesome/fontawesome'
import { faAsterisk } from '@fortawesome/fontawesome-free-solid'

// ** Third Party Components
import { X } from 'react-feather'
import {
  Form,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  FormGroup,
  Label,
  Input,
  FormFeedback,
} from 'reactstrap'

// ** Styles
import '@styles/react/libs/flatpickr/flatpickr.scss'
import { useSelector } from 'react-redux'

// ** Utils
import { FIELD_LIMITS, STATUS_OPTIONS } from '../../utils'
import { handleFormError, getFirstValidationError } from '../../utils/error-handler'

fontawesome.library.add(faAsterisk)

const AddNewModal = ({ addUser, open, handleModal }) => {
  // ** State
  const [isValidSelect, setIsValidSelect] = useState(true)
  const isInitialInput = useRef(true)
  const dropdownData = useSelector(state => state.dropdownDataReducer)

  // ** Validation schema (matching old flow)
  const phoneRegExp = /^[\+]?[(]?[0-9]{0,3}[)]?[-\s\.]?[0-9]{0,3}[-\s\.]?[0-9]{0,6}$/im
  const NewUserSchema = yup.object().shape({
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
      .email()
      .required('Please provide your email address. This field is required.'),
    cno: yup.string().matches(phoneRegExp, 'Please enter a valid contact number'),
    hospitalname: yup
      .string()
      .max(
        FIELD_LIMITS.HOSPITAL_NAME_MAX_LENGTH,
        `Hospital name cannot be longer than ${FIELD_LIMITS.HOSPITAL_NAME_MAX_LENGTH} characters.`
      ),
    designation: yup.string().max(25, 'Designation name cannot be longer than 25 characters.'),
    status: yup
      .number()
      .oneOf([0, 1], 'Please select a valid status')
      .required('Status is required!'),
  })

  const {
    register,
    formState: { errors },
    handleSubmit,
    control,
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(NewUserSchema),
    defaultValues: {
      status: 1
    }
  })

  // ** Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setIsValidSelect(true)
    }
  }, [open])

  // ** Form submission handler with enhanced error handling
  const onSubmit = async data => {
    try {
      await addUser(data)
    } catch (err) {
      // Enhanced error handling for form submission
      handleFormError(err, 'user creation')
      console.error('User registration error:', err)
    }
  }

  const validateSelect = () => {
    setIsValidSelect(true)
    return true
  }

  // ** Custom close btn
  const CloseBtn = <X className="cursor-pointer" size={15} onClick={handleModal} />

  // ** Reusable FormField component (matching EditModal pattern)
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
        <h5 className="modal-title">Add New</h5>
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
          <FormField name="cno" label="Contact Number" type="number" placeholder="+1" />
          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button type="submit" className="me-1" color="primary">
              Submit
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

export default AddNewModal
