// ** React Imports
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import moment from 'moment'

// ** Third Party Components
import { X } from 'react-feather'
import Flatpickr from 'react-flatpickr'
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
import { PHYSICIAN_SCHEMA, STATUS_OPTIONS } from '../../utils'

// ** Styles
import '@styles/react/libs/flatpickr/flatpickr.scss'
import StaticDropdown from '../../@core/components/staticDropdown'
import DynamicDropdown from '../../@core/components/dynamicDropdown'
import { useSelector } from 'react-redux'

const EditModal = ({ updateUser, open, handleModal, editData }) => {
  // ** State
  const [isValidSelect, setIsValidSelect] = useState(true)
  const [formData, setFormData] = useState(editData)
  const [picker, setPicker] = useState('')

  // ** Redux state
  const dropdownData = useSelector((state) => state.dropdownDataReducer)

  // ** Form setup
  const {
    formState: { errors },
    handleSubmit,
    getValues,
    setValue,
    unregister,
    reset,
    control,
    register,
  } = useForm({
    mode: 'onSubmit',
    resolver: yupResolver(PHYSICIAN_SCHEMA),
    defaultValues: editData,
    shouldUnregister: true,
  })
  // ** Form field mapping
  const formFields = useMemo(
    () => [
      'physicianname',
      'hospitalname',
      'email',
      'location',
      'designation',
      'status',
      'cno',
      'clinics',
    ],
    []
  )

  // ** Optimized date formatting function
  const formatDate = useCallback((date) => {
    if (!date) return ''
    const d = new Date(date)
    return moment(d).format('YYYY-MM-DD') ?? ''
  }, [])

  // ** Initialize form with data
  useEffect(() => {
    if (editData && Object.keys(editData).length > 0) {
      // Reset form with new data
      reset(editData)

      // Set form values efficiently
      formFields.forEach((field) => {
        if (editData[field] !== undefined && editData[field] !== null) {
          // Special handling for clinics array
          if (field === 'clinics' && Array.isArray(editData[field])) {
            setValue(field, editData[field], { shouldValidate: false })
          } else {
            setValue(field, editData[field], { shouldValidate: false })
          }
        }
      })

      // Handle date picker
      if (editData.dob && editData.dob !== '') {
        setPicker(new Date(moment(editData.dob, 'YYYY-MM-DD').local() ?? ''))
        setValue('dob', editData.dob, { shouldValidate: false })
      }

      // Update local form data state
      setFormData(editData)
    }
  }, [editData, setValue, formFields, reset])

  // ** Handle modal open/close
  useEffect(() => {
    if (!open) {
      setIsValidSelect((prev) => true)
    }
  }, [open])
  // ** Form submission handler
  const onSubmit = useCallback(
    (data) => {
      const formData = {
        ...data,
        _id: editData._id,
        status: parseInt(data.status, 10),
        dob: picker ? formatDate(picker) : null,
        secondaryEmail: data.secondaryEmail || [],
        physicianname: data.physicianname,
        role: 'Physician',
      }
      updateUser(formData)
    },
    [picker, formatDate, editData._id, updateUser]
  )

  // ** Memoized close button
  const CloseBtn = useMemo(
    () => <X className="cursor-pointer" size={15} onClick={handleModal} />,
    [handleModal]
  )

  return (
    <Modal
      isOpen={open}
      className="sidebar-sm sm-w-100"
      modalClassName="modal-slide-in"
      contentClassName="pt-0"
    >
      <ModalHeader
        className="mb-3"
        toggle={handleModal}
        close={CloseBtn}
        tag="div"
      >
        <h5 className="modal-title">Edit Physician Details</h5>
      </ModalHeader>
      <ModalBody className="flex-grow-1">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="physicianname"
            control={control}
            render={({ field }) =>
              dropdownData?.physicianNames &&
              dropdownData?.physicianNames.length > 0 ? (
                <StaticDropdown
                  errors={errors}
                  value={field.value || ''}
                  className="w-100 mb-3"
                  setValue={setValue}
                  required={true}
                  fieldName="physicianname"
                  labelName="Physician Name"
                  options={[
                    ...dropdownData?.physicianNames.map((data) => ({
                      value: data.physicianname,
                      label: data.physicianname,
                    })),
                  ]}
                  isMulti={false}
                />
              ) : (
                <DynamicDropdown
                  required={true}
                  value={field.value || ''}
                  className="w-100 mb-3"
                  fieldName="physicianname"
                  labelName="Physician Name"
                  setValue={setValue}
                  errors={errors}
                  roleName="Physician"
                  isMulti={false}
                />
              )
            }
          />

          <Controller
            name="clinics"
            control={control}
            render={({ field }) =>
              dropdownData?.clinicNames &&
              dropdownData?.clinicNames.length > 0 ? (
                <StaticDropdown
                  errors={errors}
                  value={field.value || []}
                  className="w-100 mb-3"
                  setValue={setValue}
                  required={true}
                  fieldName="clinics"
                  labelName="Clinic Name"
                  options={[
                    ...dropdownData?.clinicNames.map((data) => {
                      const clinicName =
                        data.clinicName ||
                        data.clinic_name ||
                        data.name ||
                        `Clinic ${data._id}`
                      return {
                        value: data._id,
                        _id: data._id,
                        clinicName,
                        label: clinicName,
                      }
                    }),
                  ]}
                  isMulti={true}
                />
              ) : (
                <DynamicDropdown
                  required={true}
                  value={field.value || []}
                  className="w-100 mb-3"
                  fieldName="clinics"
                  labelName="Clinic Name"
                  setValue={setValue}
                  errors={errors}
                  roleName="clinicName"
                  isMulti={true}
                />
              )
            }
          />
          <FormGroup>
            <Label for="hospitalname">
              Hospital Name <span style={{ color: '#FF0000' }}>*</span>
            </Label>
            <Controller
              name="hospitalname"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="hospitalname"
                  placeholder="Hospital Name"
                  invalid={errors?.hospitalname && true}
                />
              )}
            />
            {errors?.hospitalname && (
              <FormFeedback style={{ display: 'block' }}>
                {errors?.hospitalname?.message}
              </FormFeedback>
            )}
          </FormGroup>
          <FormGroup>
            <Label for="location">
              Location <span style={{ color: '#FF0000' }}>*</span>
            </Label>
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="location"
                  placeholder="Location"
                  invalid={errors?.location && true}
                />
              )}
            />
            {errors?.location && (
              <FormFeedback style={{ display: 'block' }}>
                {errors?.location?.message}
              </FormFeedback>
            )}
          </FormGroup>
          <FormGroup>
            <Label for="email">
              Email <span style={{ color: '#FF0000' }}>*</span>
            </Label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="email"
                  id="email"
                  placeholder="bruce.wayne@email.com"
                  invalid={errors?.email && true}
                />
              )}
            />
            {errors?.email && (
              <FormFeedback style={{ display: 'block' }}>
                {errors?.email?.message}
              </FormFeedback>
            )}
          </FormGroup>
          <FormGroup>
            <Label for="cno">Contact Number </Label>
            <Controller
              name="cno"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="cno"
                  type="number"
                  placeholder="+1"
                  invalid={errors?.cno && true}
                />
              )}
            />
            {errors?.cno && (
              <FormFeedback style={{ display: 'block' }}>
                {errors?.cno?.message}
              </FormFeedback>
            )}
          </FormGroup>
          <FormGroup>
            <Label for="designation">Designation</Label>
            <Controller
              name="designation"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="designation"
                  placeholder="Designation"
                  invalid={errors?.designation && true}
                />
              )}
            />
            {errors?.designation && (
              <FormFeedback style={{ display: 'block' }}>
                {errors?.designation?.message}
              </FormFeedback>
            )}
          </FormGroup>
          <FormGroup>
            <Label for="default-picker">Date of Birth </Label>
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
          <FormGroup>
            <Label for="status">
              Status <span style={{ color: '#FF0000' }}>*</span>
            </Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="status"
                  type="select"
                  invalid={errors?.status && true}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Input>
              )}
            />
            {errors?.status && (
              <FormFeedback style={{ display: 'block' }}>
                {errors?.status?.message}
              </FormFeedback>
            )}
          </FormGroup>
          <div className="d-flex justify-content-start mt-1">
            <Button className="mr-1" color="primary" type="submit">
              Update
            </Button>
            <Button color="secondary" onClick={handleModal} outline>
              Cancel
            </Button>
          </div>
        </Form>
      </ModalBody>
    </Modal>
  )
}

export default EditModal

//     >

//       })

//  ))}
