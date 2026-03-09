// ** React Imports
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import Flatpickr from 'react-flatpickr'
import Select from 'react-select'
import { isUserLoggedIn, selectThemeColors } from '@utils'
import { STATUS_OPTIONS } from '../../utils/constants'
import moment from 'moment'

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

const EditModal = ({ updateUser, open, handleModal, editData, editPicker, setEditPicker }) => {
  // ** Constants
  const userData = JSON.parse(isUserLoggedIn())
  const flatPickerDateFormat = useMemo(
    () =>
      userData?.dateFormats?.dateFormat === 'MM/DD/YYYY'
        ? 'm/d/Y'
        : userData?.dateFormats?.dateFormat === 'DD/MM/YYYY'
          ? 'd/m/Y'
          : userData?.dateFormats?.dateFormat === 'YYYY/MM/DD'
            ? 'Y/m/d'
            : 'm/d/Y',
    [userData]
  )

  const ACTIVATION_STATUS_OPTIONS = useMemo(
    () => [
      { value: 'Idle', label: 'Idle' },
      { value: 'Active', label: 'Active' },
      { value: 'Expired', label: 'Expired' },
    ],
    []
  )

  // ** State
  const [isPermanent, setIsPermanent] = useState(false)

  // ** Form setup
  const {
    formState: { errors },
    handleSubmit,
    setValue,
    control,
    watch,
    reset,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      licenseId: editData?.licenseId || '',
      email: editData?.email || '',
      contact: editData?.contact || '',
      activationKey: editData?.activationKey || '',
      activationStatus: editData?.activationStatus || 'Idle',
      status: editData?.status || 0,
    },
  })

  // ** Optimized date formatting function
  const formatDate = useCallback(date => {
    if (!date) return ''
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }, [])

  // ** Initialize form when editData changes
  useEffect(() => {
    if (editData && open) {
      reset({
        licenseId: editData.licenseId || '',
        email: editData.email || '',
        contact: editData.contact || '',
        activationKey: editData.activationKey || '',
        activationStatus: editData.activationStatus || 'Idle',
        status: editData.status || 0,
      })

      // Handle permanent license checkbox
      if (editData.expiryDate === '2099-12-31') {
        setIsPermanent(true)
      } else {
        setIsPermanent(false)
      }
    }
  }, [editData, open, reset])

  // ** Form submission handler
  const onSubmit = useCallback(
    data => {
      const formData = {
        ...data,
        expiryDate: formatDate(editPicker),
        licenseId: editData.licenseId,
        contact: editData.contact,
        email: editData.email,
        activationKey: editData.activationKey,
        activationStatus: editData.activationStatus,
        status: editData.status,
      }
      updateUser(formData)
    },
    [formatDate, editPicker, editData, updateUser]
  )

  // ** Status change handlers
  const handleStatusChange = useCallback(
    selectedOption => {
      setValue('status', selectedOption.value, { shouldValidate: true })
    },
    [setValue]
  )

  const handleActivationStatusChange = useCallback(
    selectedOption => {
      setValue('activationStatus', selectedOption.value, { shouldValidate: true })
    },
    [setValue]
  )

  // ** Watch form values
  const statusValue = watch('status')
  const activationStatusValue = watch('activationStatus')

  // ** Memoized close button
  const CloseBtn = useMemo(
    () => <X className="cursor-pointer" size={15} onClick={handleModal} />,
    [handleModal]
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
        <h5 className="modal-title">Edit License Details</h5>
      </ModalHeader>
      <ModalBody className="flex-grow-1">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <Label for="licenseId">
              ID <span style={{ color: '#FF0000' }}>*</span>
            </Label>
            <Controller
              name="licenseId"
              control={control}
              render={({ field }) => (
                <Input {...field} id="licenseId" placeholder="License ID" disabled />
              )}
            />
            {errors.licenseId && <FormFeedback>{errors.licenseId.message}</FormFeedback>}
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
                  id="email"
                  type="email"
                  placeholder="bruce.wayne@email.com"
                  disabled
                />
              )}
            />
            {errors.email && <FormFeedback>{errors.email.message}</FormFeedback>}
          </FormGroup>
          <FormGroup>
            <Label for="contact">
              Contact <span style={{ color: '#FF0000' }}>*</span>
            </Label>
            <Controller
              name="contact"
              control={control}
              render={({ field }) => <Input {...field} id="contact" placeholder="+1" disabled />}
            />
            {errors.contact && <FormFeedback>{errors.contact.message}</FormFeedback>}
          </FormGroup>
          <FormGroup>
            <Label for="Activationkey">Activation Key </Label>
            <Controller
              name="activationKey"
              control={control}
              render={({ field }) => (
                <Input {...field} id="ActivationKey" placeholder="Activation Key" disabled />
              )}
            />
            {errors.activationKey && <FormFeedback>{errors.activationKey.message}</FormFeedback>}
            <Button
              onClick={() => navigator.clipboard.writeText(editData.activationKey)}
              className="mt-1"
              color="success"
            >
              Copy key
            </Button>
          </FormGroup>
          <FormGroup>
            <Label for="default-picker">Expiry Date </Label>
            {!isPermanent && (
              <Flatpickr
                className="form-control"
                value={editPicker}
                options={{ dateFormat: flatPickerDateFormat }}
                onChange={date => setEditPicker(date)}
                id="default-picker"
              />
            )}
            <Label className="d-flex align-items-center gap-5">
              <Input
                className="dataTable-filter"
                type="checkbox"
                bsSize="sm"
                id="permanentExpiryDate"
                name="permanentExpiryDate"
                checked={isPermanent}
                onChange={() => {
                  setIsPermanent(!isPermanent)
                  setEditPicker(
                    moment('2099-12-31', 'YYYY-MM-DD').format(
                      userData?.dateFormats?.dateFormat || 'MM/DD/YYYY'
                    )
                  )
                }}
              />
              <span className="ml-2">Is Permanent?</span>
            </Label>
            {errors.expiryDate && <FormFeedback>{errors.expiryDate.message}</FormFeedback>}
          </FormGroup>
          <FormGroup>
            <Label for="activationStatus">Activation Status </Label>
            <Controller
              name="activationStatus"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  isClearable={false}
                  theme={selectThemeColors}
                  value={
                    ACTIVATION_STATUS_OPTIONS.find(
                      option => option.value === activationStatusValue
                    ) || ACTIVATION_STATUS_OPTIONS[0]
                  }
                  name="activationStatus"
                  id="activationStatus"
                  options={ACTIVATION_STATUS_OPTIONS}
                  className="react-select"
                  classNamePrefix="select"
                  onChange={handleActivationStatusChange}
                />
              )}
            />
            {errors.activationStatus && (
              <FormFeedback>{errors.activationStatus.message}</FormFeedback>
            )}
          </FormGroup>
          <FormGroup>
            <Label for="status">Status </Label>
            <Controller
              name="status"
              control={control}
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
            {errors.status && <FormFeedback>{errors.status.message}</FormFeedback>}
          </FormGroup>
          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button type="submit" className="me-1" color="primary">
              Update License
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
