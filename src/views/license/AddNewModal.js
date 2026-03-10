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
import Select from 'react-select'
import { selectThemeColors } from '@utils'

// ** Styles
import '@styles/react/libs/flatpickr/flatpickr.scss'
import { useSelector } from 'react-redux'

// ** Utils
import { STATUS_OPTIONS, showErrorAlert } from '../../utils'

fontawesome.library.add(faAsterisk)

const AddNewModal = ({ addUser, open, handleModal }) => {
  // ** State
  const [isValidSelect, setIsValidSelect] = useState(true)
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
    cno: yup
      .string()
      .matches(phoneRegExp, 'Please enter a valid contact number'),
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

  // ** Form submission handler (matching old flow)
  const onSubmit = async (data) => {
    try {
      await addUser(data)
    } catch (err) {
      // Error is already handled by parent component's addUser function
      // which shows the error alert via showErrorAlert
    }
  }

  const validateSelect = () => {
    setIsValidSelect(true)
    return true
  }

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
            name="cno"
            label="Contact Number"
            type="number"
            placeholder="+1"
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
              <FormFeedback>{errors.status.message}</FormFeedback>
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
