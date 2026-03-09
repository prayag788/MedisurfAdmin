import { useEffect, useRef, useState } from 'react'
import {
  Button,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap'
import EditableDropdown from '../../../views/components/EditableDropdown'
import AdditionalDataComponent from '../../../views/clinic-user/AdditionalDataComponent'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useForm } from 'react-hook-form'
import { X } from 'react-feather'

import axios from 'axios'

// ** Sweet Alert Setup
import {
  showLoadingAlert,
  hideLoadingAlert,
  hideLoadingThenShowError,
  showSuccessAlert,
  showErrorAlert,
  getErrorMessage,
} from '../../../utils/alerts'

// centralized alerts

const NestedModal = ({ addNewUserTodropdown, open, toggle }) => {
  // ** State
  const [form_data, setFormData] = useState({
    fname: '',
    lname: '',
    email: '',
    cno: '',
    secondaryCno: [],
    secondaryEmail: [],
  })
  console.log('addNewUserTodropdown', addNewUserTodropdown)
  const [isValidSelect, setIsValidSelect] = useState(true)
  const isInitialInput = useRef(true)

  const validateSelect = () => {
    if (!form_data?.access?.length) {
      setIsValidSelect(prev => false)
      return false
    } else {
      setIsValidSelect(prev => true)
      return true
    }
  }

  useEffect(() => {
    if (!isInitialInput.current) {
      validateSelect()
    }
  }, [form_data.access])

  useEffect(() => {
    if (!open) {
      setIsValidSelect(prev => true)
    }
  }, [open])

  const phoneRegExp = /^[\+]?[(]?[0-9]{0,3}[)]?[-\s\.]?[0-9]{0,3}[-\s\.]?[0-9]{0,6}$/im
  // ** New user schema
  const NewCUSchema = yup.object().shape({
    fname: yup
      .string('First name should be a string')
      .max(25, 'First name cannot be longer than 25 characters.')
      .required('First Name is required!')
      .test('First name cannot be only spaces.', value => {
        return value.trim().length > 0
      }),
    lname: yup
      .string()
      .max(25, 'Last name cannot be longer than 25 characters.')
      .required('Last Name is required!')
      .test('no-spaces', 'First name cannot be only spaces.', value => {
        return value.trim().length > 0
      }),
    email: yup
      .string()
      .email('Please provide valid email address')
      .required('Please provide your email address. This field is required.'),
    secondaryEmail: yup
      .array()
      .of(
        yup
          .string()
          .email('Please provide valid email address')
          .required('Please provide your email address. This field is required.')
      ),
    secondaryCno: yup
      .array()
      .of(yup.string().matches(phoneRegExp, 'Please enter a valid contact number')),
    cno: yup.string().matches(phoneRegExp, 'Please enter a valid contact number'),
    clinics: yup
      .array()
      .of(
        yup.object().shape({
          _id: yup.string('Id should be a string').required('Id is required!'),
          clinicName: yup.string().required('Clinic Name is required!'),
        })
      )
      .required('Clinics field is required!')
      .min(1, 'Atleast one clinic is required!'),
  })

  const {
    register,
    getValues,
    setValue,
    clearErrors,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm({ mode: 'onChange', resolver: yupResolver(NewCUSchema) })

  const addNewUser = async requestData => {
    requestData = {
      ...requestData,
      role: 'CU',
      status: 1,
      pwdCng: false,
      byAdmin: true,
    }
    showLoadingAlert()
    axios
      .post(`${process.env.REACT_APP_API_URL}/user/register/admin`, requestData)
      .then(async doc => {
        addNewUserTodropdown(doc.data.user, doc)
        toggle()
        await hideLoadingAlert()
        showSuccessAlert('User Added Successfully!')
      })
      .catch(err => {
        const isValidationError = err?.response?.status === 422
        hideLoadingThenShowError(err)
        if (!isValidationError) {
          toggle()
        }
      })
  }
  const formSubmt = data => {
    addNewUser(data)
    isInitialInput.current = true
    setFormData(prev => {
      return {
        ...prev,
        fname: '',
        lname: '',
        email: '',
        cno: '',
        secondaryCno: [],
        secondaryEmail: [],
        clinics: [],
      }
    })
  }

  const inputHandler = e => {
    const name = e.target.name

    setFormData(prev => {
      return { ...prev, [name]: e.target.value }
    })
  }

  const onSubmit = data => {
    formSubmt(data)
    reset()
  }

  const onError = (errors, e) => {
    validateSelect()
  }

  // ** Custom close btn
  const CloseBtn = <X className="cursor-pointer" size={15} onClick={toggle} />
  const addMoreEmails = () => {
    setFormData(prev => {
      console.log(prev, 'prev', { ...prev, secondaryEmail: [...(prev?.secondaryEmail ?? []), ''] })
      return { ...prev, secondaryEmail: [...(prev?.secondaryEmail ?? []), ''] }
    })
  }
  return (
    <Modal isOpen={open} toggle={toggle} size={'lg'}>
      <ModalHeader>Add New Clinic User</ModalHeader>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody className="flex-grow-1">
          <EditableDropdown
            setValue={setValue}
            register={register}
            errors={errors}
            fieldName="clinics"
          />
          <FormGroup>
            <Label for="fname">
              First Name <span style={{ color: '#FF0000' }}>*</span>
            </Label>
            <Input
              name="fname"
              id="fname"
              {...register('fname', { required: true })}
              invalid={errors?.fname && true}
              onChange={e => {
                setValue('fname', e.target.value)
                if (e.target.value && errors?.fname) {
                  clearErrors('fname')
                }
              }}
              placeholder="Bruce"
            />
            {errors?.fname && <FormFeedback>{errors.fname.message}</FormFeedback>}
          </FormGroup>
          <FormGroup>
            <Label for="lname">
              Last Name <span style={{ color: '#FF0000' }}>*</span>
            </Label>
            <Input
              name="lname"
              id="lname"
              {...register('lname', { required: true })}
              invalid={errors?.lname && true}
              onChange={e => {
                setValue('lname', e.target.value)
                if (e.target.value && errors?.lname) {
                  clearErrors('lname')
                }
              }}
              placeholder="Wayne"
            />
            {errors?.lname && <FormFeedback>{errors.lname.message}</FormFeedback>}
          </FormGroup>
          <FormGroup>
            <Label for="email">
              Email <span style={{ color: '#FF0000' }}>*</span>
            </Label>
            <Input
              type="email"
              name="email"
              id="email"
              {...register('email', { required: true })}
              invalid={errors?.email && true}
              onChange={e => {
                setValue('email', e.target.value)
                if (e.target.value && errors?.email) {
                  clearErrors('email')
                }
              }}
              placeholder="bruce.wayne@email.com"
            />
            {errors?.email && <FormFeedback>{errors.email.message}</FormFeedback>}
          </FormGroup>
          <AdditionalDataComponent
            fieldName="secondaryEmail"
            title="Email"
            limit={2}
            inputType="email"
            formData={form_data}
            errors={errors}
            register={register}
            setFormData={setFormData}
            setValue={setValue}
            getValues={getValues}
            placeholder="bruce.wayne@email.com"
          />
          <FormGroup>
            <Label for="cno">Contact Number </Label>
            <Input
              name="cno"
              id="cno"
              type="number"
              {...register('cno', { required: false })}
              invalid={errors?.cno && true}
              onChange={e => {
                inputHandler(e)
                setValue('cno', e.target.value)
                if (errors?.cno) {
                  clearErrors('cno')
                }
              }}
              placeholder="+1"
            />
            {errors?.cno && <FormFeedback>{errors.cno.message}</FormFeedback>}
          </FormGroup>
          <AdditionalDataComponent
            fieldName="secondaryCno"
            title="Add More"
            limit={2}
            inputType="number"
            formData={form_data}
            errors={errors}
            register={register}
            setFormData={setFormData}
            setValue={setValue}
            getValues={getValues}
            placeholder={'+1'}
          />

          <div className="d-flex justify-content-start mt-1"></div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" type="submit">
            Submit
          </Button>{' '}
          <Button
            color="secondary"
            onClick={() => {
              ;(reset(), toggle())
            }}
          >
            cancel
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  )
}

export default NestedModal
