// ** React Imports
import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import axios from 'axios'

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
import { CLINIC_USER_SCHEMA, STATUS_OPTIONS } from '../../utils'

// ** Styles
import '@styles/react/libs/flatpickr/flatpickr.scss'
import AdditionalDataComponent from './AdditionalDataComponent'
import StaticDropdown from '../../@core/components/staticDropdown'

// Build form values from editData (with fallbacks for full_name / first_name / last_name)
function getValuesFromEditData(editData) {
  if (!editData || Object.keys(editData).length === 0) {
    return {
      fname: '',
      lname: '',
      email: '',
      cno: '',
      status: 1,
      secondaryEmail: [],
      secondaryCno: [],
      clinics: [],
    }
  }
  const fn =
    editData.fname ??
    editData.first_name ??
    (typeof editData.full_name === 'string'
      ? editData.full_name.split(' ')[0]
      : '') ??
    ''
  const ln =
    editData.lname ??
    editData.last_name ??
    (typeof editData.full_name === 'string'
      ? editData.full_name.split(' ').slice(1).join(' ')
      : '') ??
    ''
  return {
    fname: fn,
    lname: ln,
    email: editData.email ?? '',
    cno: editData.cno ?? '',
    status: editData.status ?? 1,
    secondaryEmail: Array.isArray(editData.secondaryEmail)
      ? editData.secondaryEmail.filter(Boolean)
      : [],
    secondaryCno: Array.isArray(editData.secondaryCno)
      ? editData.secondaryCno.filter(Boolean)
      : [],
    clinics: Array.isArray(editData.clinics) ? editData.clinics : [],
  }
}

const EditModal = ({ updateUser, open, handleModal, editData }) => {
  const [isValidSelect, setIsValidSelect] = useState(true)
  const [formData, setFormData] = useState(editData)
  const [clinics, setClinics] = useState([])

  const defaultValues = useMemo(
    () => getValuesFromEditData(editData),
    [editData?._id]
  )

  const {
    formState: { errors },
    handleSubmit,
    getValues,
    setValue,
    reset,
    control,
    watch,
    register,
  } = useForm({
    mode: 'onSubmit',
    resolver: yupResolver(CLINIC_USER_SCHEMA),
    shouldUnregister: true,
    defaultValues,
  })

  const lastSyncedEditIdRef = useRef(null)
  const prevClinicsLengthRef = useRef(0)

  // Register clinics so it's included in form state for validation and submit (same as filter EditModal)
  useEffect(() => {
    register('clinics', { required: true })
  }, [register])

  // Load clinics when modal opens (same as filter listing EditModal loadFilterData for clinics)
  const loadClinicData = useCallback(async () => {
    const token = localStorage.getItem('accessToken')
    const headers = { Authorization: `Bearer ${token}` }
    try {
      const clinicsRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/filter-module/get-clinics`,
        { headers }
      )
      setClinics(
        clinicsRes.data.data?.map((clinic) => ({
          value: clinic._id,
          label: clinic.name,
          _id: clinic._id,
          clinicName: clinic.name,
        })) || []
      )
    } catch (error) {
      console.error('Error loading clinic data:', error)
    }
  }, [])

  // ** Sync form from editData when modal opens or user switches record
  useEffect(() => {
    if (!open || !editData || Object.keys(editData).length === 0) return

    const editId = editData._id || editData.id
    if (lastSyncedEditIdRef.current === editId) return
    lastSyncedEditIdRef.current = editId

    loadClinicData()

    const rawClinics = Array.isArray(editData.clinics) ? editData.clinics : []
    const formattedClinics = rawClinics
      .map((clinic) => {
        const id =
          typeof clinic === 'string'
            ? clinic
            : (clinic?._id ?? clinic?.value ?? clinic?.id)
        if (!id) return null
        const idStr = String(id).trim()
        const label =
          (clinic &&
            typeof clinic === 'object' &&
            (clinic.clinicName ||
              clinic.clinic_name ||
              clinic.name ||
              clinic.label)) ||
          `Clinic ${idStr}`
        return {
          value: idStr,
          _id: idStr,
          label,
          clinicName: label,
          name: label,
        }
      })
      .filter(Boolean)

    const fromEdit = getValuesFromEditData(editData)
    const initialValues = { ...fromEdit, clinics: formattedClinics }
    reset(initialValues)
    setFormData(editData)
  }, [open, editData, reset, loadClinicData])

  // When clinics options load after modal opened, re-set value so dropdown uses exact option objects (like filter)
  useEffect(() => {
    if (!open || !editData) return
    const prevLen = prevClinicsLengthRef.current
    const nowLen = clinics.length
    prevClinicsLengthRef.current = nowLen
    if (nowLen === 0 || prevLen > 0) return
    const rawClinics = Array.isArray(editData.clinics) ? editData.clinics : []
    const formattedClinics = rawClinics
      .map((clinic) => {
        const id =
          typeof clinic === 'string'
            ? clinic
            : (clinic?._id ?? clinic?.value ?? clinic?.id)
        if (!id) return null
        const idStr = String(id).trim()
        const exactOption = clinics.find(
          (opt) => String(opt.value || opt._id || '').trim() === idStr
        )
        if (exactOption) return exactOption
        const label =
          (clinic &&
            typeof clinic === 'object' &&
            (clinic.clinicName ||
              clinic.clinic_name ||
              clinic.name ||
              clinic.label)) ||
          `Clinic ${idStr}`
        return {
          value: idStr,
          _id: idStr,
          label,
          clinicName: label,
          name: label,
        }
      })
      .filter(Boolean)
    setValue('clinics', formattedClinics, { shouldValidate: false })
  }, [clinics, open, editData, setValue])

  useEffect(() => {
    if (!open) {
      lastSyncedEditIdRef.current = null
      prevClinicsLengthRef.current = 0
      setIsValidSelect(true)
      setClinics([])
      setFormData({
        fname: '',
        lname: '',
        email: '',
        cno: '',
        secondaryEmail: [],
        secondaryCno: [],
        clinics: [],
        status: 1,
        _id: '',
      })
    }
  }, [open])

  // ** Update click: build payload from form + editData fallback so update always runs (validation was clearing form state)
  const onUpdateClick = useCallback(
    (e) => {
      e.preventDefault()
      const raw = getValues()
      const fromEdit = getValuesFromEditData(editData)
      const fname =
        (raw.fname && String(raw.fname).trim()) || fromEdit.fname || ''
      const lname =
        (raw.lname && String(raw.lname).trim()) || fromEdit.lname || ''
      const email =
        (raw.email && String(raw.email).trim()) || fromEdit.email || ''
      const cno =
        raw.cno !== null && raw.cno !== undefined
          ? String(raw.cno).trim()
          : fromEdit.cno || ''
      const status = parseInt(raw.status, 10) || fromEdit.status || 1
      const secondaryEmail = Array.isArray(raw.secondaryEmail)
        ? raw.secondaryEmail
            .map((s) => (typeof s === 'string' ? s.trim() : s))
            .filter(Boolean)
        : fromEdit.secondaryEmail || []
      const secondaryCno = Array.isArray(raw.secondaryCno)
        ? raw.secondaryCno
            .map((s) => (typeof s === 'string' ? String(s).trim() : s))
            .filter(Boolean)
        : fromEdit.secondaryCno || []
      const clinicIds = Array.isArray(raw.clinics)
        ? raw.clinics
            .map((c) => (typeof c === 'string' ? c : (c?._id ?? c?.value)))
            .filter(Boolean)
        : Array.isArray(editData.clinics)
          ? editData.clinics
              .map((c) => (typeof c === 'string' ? c : (c?._id ?? c?.value)))
              .filter(Boolean)
          : []

      const processedData = {
        _id: editData._id || editData.id,
        fname,
        lname,
        email,
        cno,
        status,
        secondaryEmail,
        secondaryCno,
        clinics: clinicIds,
      }
      updateUser(processedData, 'update')
    },
    [editData, getValues, updateUser]
  )

  // ** Memoized close button
  const CloseBtn = useMemo(
    () => <X className="cursor-pointer" size={15} onClick={handleModal} />,
    [handleModal]
  )

  // ** Input handler for form data updates
  const inputHandler = useCallback((e) => {
    const name = e.target.name
    setFormData((prev) => {
      return { ...prev, [name]: e.target.value }
    })
  }, [])

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
        className="mb-3"
        toggle={handleModal}
        close={CloseBtn}
        tag="div"
      >
        <h5 className="modal-title">Edit Clinic-user Details</h5>
      </ModalHeader>
      <ModalBody className="flex-grow-1">
        <Form onSubmit={onUpdateClick}>
          <StaticDropdown
            errors={errors}
            value={watch('clinics')}
            className="w-100"
            setValue={setValue}
            register={register}
            required={true}
            fieldName="clinics"
            labelName="Clinics"
            options={clinics}
            isMulti={true}
          />

          <FormField
            name="fname"
            label="First Name"
            placeholder="Jhon"
            required
          />
          <FormField
            name="lname"
            label="Last Name"
            placeholder="Doe"
            required
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
                  placeholder="bruce.wayne@email.com"
                />
              )}
            />

            {errors.email && (
              <FormFeedback style={{ display: 'block' }}>
                {errors?.email?.message}
              </FormFeedback>
            )}
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
            reset={reset}
            getValues={getValues}
            placeholder="bruce.wayne@email.com"
          />

          <FormField
            name="cno"
            label="Contact Number"
            type="text"
            placeholder="+1"
          />
          <AdditionalDataComponent
            fieldName="secondaryCno"
            title="Add More"
            limit={2}
            inputType="number"
            formData={formData}
            errors={errors}
            setFormData={setFormData}
            setValue={setValue}
            reset={reset}
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
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Input>
              )}
            />

            {errors.status && (
              <FormFeedback style={{ display: 'block' }}>
                {errors?.status?.message}
              </FormFeedback>
            )}
          </FormGroup>
          <div className="d-flex justify-content-start mt-1">
            <Button className="mr-1" color="primary" type="submit">
              Update
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

//     >

//       })

//  ))}
