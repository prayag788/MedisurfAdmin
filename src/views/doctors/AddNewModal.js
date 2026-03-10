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
  FormFeedback,
  Input,
} from 'reactstrap'
import Flatpickr from 'react-flatpickr'
import Select from 'react-select'
import { selectThemeColors } from '@utils'

// ** Styles
import '@styles/react/libs/flatpickr/flatpickr.scss'
import { useSelector } from 'react-redux'

// ** Utils
import { FIELD_LIMITS, STATUS_OPTIONS, showErrorAlert } from '../../utils'

fontawesome.library.add(faAsterisk)

const AddNewModal = ({ addUser, open, handleModal }) => {
  // ** State
  const [isValidSelect, setIsValidSelect] = useState(true)
  const [picker, setPicker] = useState(new Date())
  const isInitialInput = useRef(true)
  const dropdowndata = useSelector((state) => state.dropdownDataReducer)

  // ** Validation schema (matching old flow)
  const phoneRegExp =
    /^[\+]?[(]?[0-9]{0,3}[)]?[-\s\.]?[0-9]{0,3}[-\s\.]?[0-9]{0,6}$/im
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
      .email('Please provide valid email address')
      .required('Please provide your email address. This field is required.'),
    hospitalname: yup
      .string()
      .max(
        FIELD_LIMITS.HOSPITAL_NAME_MAX_LENGTH,
        `Hospital name cannot be longer than ${FIELD_LIMITS.HOSPITAL_NAME_MAX_LENGTH} characters.`
      ),
    designation: yup
      .string()
      .max(25, 'Designation name cannot be longer than 25 characters.'),
    cno: yup
      .string()
      .matches(phoneRegExp, 'Please enter a valid contact number'),
    location: yup.string(),
    status: yup
      .number()
      .oneOf([0, 1], 'Please select a valid status')
      .required('Status is required!'),
  })

  const {
    formState: { errors },
    handleSubmit,
    control,
  } = useForm({
    mode: 'onSubmit',
    resolver: yupResolver(NewUserSchema),
    defaultValues: {
      status: 1,
    },
  })

  // ** Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setIsValidSelect(true)
    }
  }, [open])

  // ** Date formatting function
  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // ** Form submission handler (matching old flow)
  const onSubmit = async (data) => {
    try {
      data.dob = formatDate(picker)
      await addUser(data)
      setPicker(new Date())
    } catch (err) {
      // Error is already handled by parent component's addNewUser function
      // which shows the error alert via showErrorAlert
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

  // ** Reusable FormField component (matching EditModal pattern)
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
        <h5 className="modal-title">Add New</h5>
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
          <FormField
            name="designation"
            label="Designation"
            placeholder="Doctor"
          />
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
              onChange={(date) => {
                if (date && date.length > 0) {
                  setPicker(date[0])
                }
              }}
              id="default-picker"
            />
          </FormGroup>
          <FormField
            name="cno"
            label="Contact Number"
            type="number"
            placeholder="+1"
          />
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
                    STATUS_OPTIONS.find(
                      (option) => option.value === field.value
                    ) || null
                  }
                  name="status"
                  id="status"
                  options={STATUS_OPTIONS}
                  className="react-select"
                  classNamePrefix="select"
                  onChange={(option) =>
                    field.onChange(option ? option.value : undefined)
                  }
                />
              )}
            />
            {errors.status && (
              <FormFeedback style={{ display: 'block' }}>
                {errors?.status?.message}
              </FormFeedback>
            )}
          </FormGroup>
          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button type="submit" className="me-1" color="primary">
              Submit
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

export default AddNewModal
