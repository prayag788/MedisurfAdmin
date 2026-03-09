// ** React Imports
import { useEffect, useState, useCallback, useMemo } from 'react'
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import Select from 'react-select'
import { selectThemeColors } from '@utils'
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

// ** Styles
import '@styles/react/libs/flatpickr/flatpickr.scss'

// ** Utils
import { STATUS_OPTIONS, showInfoAlert } from '../../utils'

const EditModal = ({ updateUser, open, handleModal, editData }) => {
  // ** Constants
  const PHONE_REGEXP = useMemo(
    () => /^[\+]?[(]?[0-9]{0,3}[)]?[-\s\.]?[0-9]{0,3}[-\s\.]?[0-9]{0,6}$/im,
    []
  )

  // ** State
  const [signatureImage, setSignatureImage] = useState(null)
  const [signatureBase64, setSignatureBase64] = useState(editData.digitalSignature)
  const [signaturePreview, setSignaturePreview] = useState(editData.digitalSignature)

  // ** Validation schema
  const validationSchema = useMemo(
    () =>
      yup.object().shape({
        fname: yup
          .string('First Name should be a string')
          .max(25, 'First name cannot be longer than 25 characters.')
          .required('First Name is required!'),
        lname: yup
          .string()
          .max(25, 'Last name cannot be longer than 25 characters.')
          .required('Last Name is required!'),
        email: yup
          .string()
          .email('Please provide valid email address')
          .required('Please provide your email address. This field is required.'),
        cno: yup.string().matches(PHONE_REGEXP, 'Please enter a valid contact number'),
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
    mode: 'onSubmit',
  })

  // ** Form field mapping
  const formFields = useMemo(
    () => [
      'referenceId',
      'fname',
      'lname',
      'email',
      'cno',
      'status',
      'medicalQualifications',
      'boardCertifications',
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
    }
  }, [editData, setValue, formFields])

  // ** Form submission handler
  const onSubmit = useCallback(
    data => {
      const formData = {
        ...data,
        _id: editData._id,
        status: data.status || editData.status,
        digitalSignature: signatureBase64 || editData.digitalSignature,
      }
      updateUser(formData)
    },
    [editData._id, editData.status, editData.digitalSignature, signatureBase64, updateUser]
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

  // ** Digital signature handler
  const digitalSignatureHandler = useCallback(e => {
    if (e.target.files.length > 0 && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type === 'image/png' || file.type === 'image/jpeg') {
        setSignatureImage(file)
        setSignaturePreview(URL.createObjectURL(file))

        // Convert to base64
        const reader = new FileReader()
        reader.onload = () => {
          setSignatureBase64(reader.result)
        }
        reader.readAsDataURL(file)
      } else {
        showInfoAlert('Please select a file type .png or .jpeg!')
        setSignatureImage(null)
        setSignaturePreview(null)
        setSignatureBase64(null)
      }
    } else {
      setSignatureImage(null)
      setSignaturePreview(null)
      setSignatureBase64(null)
    }
  }, [])

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

  const blobToBase64 = blob => {
    return new Promise((resolve, _) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    })
  }

  useEffect(() => {
    if (signatureImage) {
      blobToBase64(signatureImage).then(res => {
        setSignatureBase64(res)
      })
    }
  }, [signatureImage])

  useEffect(() => {
    if (open && editData?.digitalSignature) {
      setSignatureBase64(editData.digitalSignature)
      setSignaturePreview(editData.digitalSignature)
    }
  }, [editData, open])

  return (
    <Modal
      isOpen={open}
      toggle={handleModal}
      className="sidebar-sm sm-w-100"
      modalClassName="modal-slide-in"
      contentClassName="pt-0"
    >
      <ModalHeader className="mb-3" toggle={handleModal} close={CloseBtn} tag="div">
        <h5 className="modal-title">Edit Radiologist User Details</h5>
      </ModalHeader>
      <ModalBody className="flex-grow-1">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormField name="referenceId" label="ID" placeholder="ID" required readOnly />
          <FormField name="fname" label="First Name" placeholder="Bruce" required />
          <FormField name="lname" label="Last Name" placeholder="Wayne" required />
          <FormField
            name="email"
            label="Email"
            type="email"
            placeholder="bruce.wayne@email.com"
            required
          />
          <FormField name="cno" label="Contact Number" type="text" placeholder="+1" />
          <FormField
            name="medicalQualifications"
            label="Medical Qualifications"
            placeholder="MBBS"
          />
          <FormField name="boardCertifications" label="Board Qualifications" placeholder="MD" />
          <FormGroup>
            <Label for="digitalSignature">Digital Signature</Label>
            <Controller
              name="digitalSignature"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <>
                  <Input type="hidden" {...field} value={signatureBase64} />
                  <Input
                    type="file"
                    onChange={digitalSignatureHandler}
                    accept="image/png, image/jpeg"
                    invalid={errors.digitalSignature && true}
                  />
                </>
              )}
            />
            {signaturePreview && (
              <img
                src={signaturePreview}
                style={{ width: '100%', marginTop: 10 }}
                alt="Digital Signature Preview"
              />
            )}
            {errors.digitalSignature && (
              <FormFeedback style={{ display: 'block' }}>
                {errors?.digitalSignature?.message}
              </FormFeedback>
            )}
          </FormGroup>
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
              Update Radiologist User
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
