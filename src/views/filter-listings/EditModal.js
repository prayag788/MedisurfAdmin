// ** React Imports
import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

import {
  showLoadingAlert,
  hideLoadingAlert,
  showSuccessAlert,
  showErrorAlert,
} from '../../utils/alerts'
import axios from 'axios'
// centralized alerts

// ** Third Party Components
import { X } from 'react-feather'
import {
  Form,
  Input,
  FormFeedback,
  FormGroup,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Label,
} from 'reactstrap'

// ** Styles
import '@styles/react/libs/flatpickr/flatpickr.scss'
import StaticDropdown from '../../@core/components/staticDropdown'
import DynamicDropdown from '../../@core/components/dynamicDropdown'

import { useSelector, useDispatch } from 'react-redux'
import { handleModalityUpdate } from '../../redux/actions/Modalities'
import NestedModal from '../../@core/components/filter-modal/NestedModal'
import ROLES from '../../configs/roles'
import { STATUS_OPTIONS } from '../../utils/constants'
import { STUDY_STATUS_OPTIONS } from '../../configs/const'

// Modality options: dynamic from Orthanc via Redux (ModalityReducer), populated in App.js
const EditModel = ({ open, handleModal, editData, updateUser }) => {
  const dispatch = useDispatch()
  // ** State
  const modalityOptions = useSelector((state) => state?.ModalityReducer) || []
  const [userData, setUserData] = useState(
    JSON.parse(localStorage.getItem('userData'))
  )
  const [formData, setFormData] = useState(editData)
  const [isValidSelect, setIsValidSelect] = useState(true)
  const isInitialInput = useRef(true)
  const [clinics, setClinics] = useState([])
  const [physicians, setPhysicians] = useState([])
  const [users, setUsers] = useState([])
  const studyStatusOptions = STUDY_STATUS_OPTIONS
  const [filterForOptions] = useState([
    { value: 'CU', label: 'Clinic User' },
    { value: 'Physician', label: 'Physician' },
  ])
  const [selectedFilterFor, setSelectedFilterFor] = useState('CU')

  // ** Validation schema
  const validationSchema = useMemo(
    () =>
      yup
        .object()
        .shape({
          name: yup
            .string()
            .max(25, 'Filter name cannot be longer than 25 characters.')
            .required('Filter name is required!'),
          clinicNames: yup
            .array()
            .of(
              yup
                .object()
                .shape({
                  _id: yup.string().required(),
                  clinicName: yup.string().required(),
                })
            ),
          status: yup.number().required('Status is a required field'),
          modality: yup.array().of(
            yup.object().shape({
              label: yup.string().required('label is required!.'),
              value: yup.string().required(' value is required!.'),
            })
          ),
          studyStatus: yup.array().of(
            yup.object().shape({
              label: yup.string().required('label is required!.'),
              value: yup.string().required(' value is required!.'),
            })
          ),
        })
        .test(
          'at-least-one',
          'Select Atleast One Of The Filtering Criteria(Modalities, Physicians, Clinic Names, Study Status)',
          function (value) {
            const { modality, clinicNames, studyStatus } = value

            return (
              modality?.length > 0 ||
              clinicNames?.length > 0 ||
              studyStatus?.length > 0
            )
          }
        )
        .required(),
    []
  )

  // ** Form field mapping
  const formFields = useMemo(
    () => ['name', 'clinicNames', 'status', 'modality', 'studyStatus'],
    []
  )
  const [isMultiPhysicians, setIsMultiPhysicians] = useState(true)
  const [searchValue, setSearchValue] = useState(ROLES.ClinicUser)

  const [userregistrationCompleted, setUserregistrationCompleted] =
    useState(false)

  // ** Form setup
  const {
    formState: { errors },
    handleSubmit,
    setValue,
    getValues,
    control,
    watch,
    register,
  } = useForm({
    mode: 'onSubmit',
    resolver: yupResolver(validationSchema),
    shouldUnregister: true,
  })

  const onChange = useCallback(
    (filterfor) => {
      setValue('filterfor', filterfor)
      setSearchValue(filterfor)
      setIsMultiPhysicians(filterfor === ROLES.ClinicAdmin)
    },
    [setValue]
  )

  const loadFilterData = async () => {
    const token = localStorage.getItem('accessToken')
    const headers = { Authorization: `Bearer ${token}` }

    try {
      // Refetch modalities from API so dropdown always shows CR, CT, MR (not DICOM server names)
      try {
        const modRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/orthanc/modalities`,
          { headers }
        )
        const data = modRes?.data
        console.log(
          '[FilterModal Edit Modality] orthanc/modalities full response:',
          JSON.stringify(data)
        )
        console.log(
          '[FilterModal Edit Modality] response type:',
          Array.isArray(data) ? 'array' : typeof data
        )
        let raw = []
        if (Array.isArray(data)) raw = data
        else if (data && typeof data === 'object') {
          console.log(
            '[FilterModal Edit Modality] response is object, keys:',
            Object.keys(data)
          )
          const names = new Set()
          Object.keys(data).forEach((key) => {
            const config = data[key]
            const aet =
              config && (config.AET ?? config.AeTitle ?? config.aeTitle)
            if (aet && typeof aet === 'string') names.add(String(aet).trim())
            else names.add(String(key).trim())
          })
          raw = Array.from(names).sort()
        }
        console.log(
          '[FilterModal Edit Modality] normalized raw array:',
          JSON.stringify(raw)
        )
        if (raw.length > 0) {
          const options = raw
            .filter(Boolean)
            .map((name) => ({ value: name, label: name }))
          console.log(
            '[FilterModal Edit Modality] dispatching options to Redux:',
            JSON.stringify(options)
          )
          dispatch(handleModalityUpdate(options))
        }
      } catch (e) {
        console.log(
          '[FilterModal Edit Modality] fetch error:',
          e?.message,
          e?.response?.data
        )
      }

      // Load clinics
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

      // Load physicians: use dropdownData/Physician as primary (returns all physicians);
      // fallback to filter-module/get-physicians if that fails.
      let physicianList = []
      try {
        const fallbackRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/dropdownData/Physician?size=500&filterfor=Physician`,
          { headers }
        )
        const dropdownData = fallbackRes.data?.dropdownData || []
        physicianList = dropdownData.map((p) => ({
          value: p._id,
          label:
            p.physicianname ||
            p.name ||
            `${p.fname || ''} ${p.lname || ''}`.trim() ||
            p.username,
          _id: p._id,
          name: p.physicianname || p.name,
          physicianname: p.physicianname || p.name,
        }))
      } catch (e) {
        physicianList = []
      }
      if (physicianList.length === 0) {
        try {
          const physiciansRes = await axios.get(
            `${process.env.REACT_APP_API_URL}/filter-module/get-physicians`,
            { headers }
          )
          physicianList =
            physiciansRes.data?.data?.map((physician) => ({
              value: physician._id,
              label:
                physician.name || physician.physicianname || physician.username,
              _id: physician._id,
              name: physician.name || physician.physicianname,
              physicianname: physician.name || physician.physicianname,
            })) || []
        } catch (e2) {
          physicianList = []
        }
      }
      setPhysicians(physicianList)

      // Load clinic users
      const usersRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/filter-module/get-clinic-users`,
        { headers }
      )
      setUsers(
        usersRes.data.data?.map((user) => ({
          value: user._id,
          label: user.username,
          _id: user._id,
          name: user.name,
          username: user.username,
        })) || []
      )
    } catch (error) {
      console.error('Error loading filter data:', error)
    }
  }

  const lastSyncedEditIdRef = useRef(null)
  const hadUsersOptionsRef = useRef(false)
  const hadClinicsOptionsRef = useRef(false)

  // Format Users for dropdown: option-shaped so StaticDropdown can display (value, label, _id)
  const formatUsersValue = (usersList, optionsList) => {
    const raw = Array.isArray(usersList) ? usersList : []
    return raw
      .map((u) => {
        const id = u?._id ?? u?.value ?? u
        const idStr = typeof id === 'string' ? id : String(id)
        const option =
          Array.isArray(optionsList) &&
          optionsList.find(
            (opt) => String(opt._id || opt.value || '') === idStr
          )
        if (option) return option
        const label = u?.username ?? u?.label ?? u?.name ?? idStr
        return { _id: idStr, value: idStr, label, username: label }
      })
      .filter(Boolean)
  }

  // Format ClinicNames for dropdown: option-shaped so StaticDropdown can display (value, label, _id, clinicName)
  const formatClinicNamesValue = (clinicsList, optionsList) => {
    const raw = Array.isArray(clinicsList) ? clinicsList : []
    return raw
      .map((c) => {
        const id = c?._id ?? c?.value ?? c
        const idStr = typeof id === 'string' ? id : String(id)
        const option =
          Array.isArray(optionsList) &&
          optionsList.find(
            (opt) => String(opt._id || opt.value || '') === idStr
          )
        if (option) {
          // Ensure clinicName is present
          return {
            ...option,
            clinicName:
              option.clinicName || option.name || option.label || idStr,
          }
        }
        const clinicName =
          c?.clinicName ?? c?.clinic_name ?? c?.name ?? c?.label ?? idStr
        return {
          _id: idStr,
          value: idStr,
          label: clinicName,
          clinicName,
          name: clinicName,
        }
      })
      .filter(Boolean)
  }

  // ** Load filter data only when modal opens or user switches to a different filter (don't overwrite on parent re-render)
  useEffect(() => {
    if (!open || !editData || Object.keys(editData).length === 0) return

    const editId = editData._id || editData.id
    if (lastSyncedEditIdRef.current === editId) return
    lastSyncedEditIdRef.current = editId
    hadUsersOptionsRef.current = false
    hadClinicsOptionsRef.current = false

    if (open) loadFilterData()

    setValue('name', editData.name || '', { shouldValidate: false })
    setValue('status', editData.status || 1, { shouldValidate: false })
    setValue('filterfor', editData.filterfor || 'CU', { shouldValidate: false })
    setValue(
      'clinicNames',
      formatClinicNamesValue(editData.clinicNames || [], []),
      { shouldValidate: false }
    )
    setValue('Physicians', editData.Physicians || [], { shouldValidate: false })
    setValue('Users', formatUsersValue(editData.Users, []), {
      shouldValidate: false,
    })
    setValue('modality', editData.modality || [], { shouldValidate: false })
    setValue('studyStatus', editData.studyStatus || [], {
      shouldValidate: false,
    })

    setFormData(editData)
    setSelectedFilterFor(editData?.filterfor || 'CU')
    setSearchValue(editData?.filterfor || 'CU')
    onChange(editData?.filterfor || 'CU')
  }, [editData, setValue, onChange, open])

  // When users (clinic users options) load after modal opened, re-set Users so dropdown uses exact option objects
  useEffect(() => {
    if (!open || !editData || users.length === 0) return
    const prevHad = hadUsersOptionsRef.current
    hadUsersOptionsRef.current = true
    if (prevHad) return
    const formatted = formatUsersValue(editData.Users, users)
    setValue('Users', formatted, { shouldValidate: false })
  }, [users, open, editData, setValue])

  // When clinics options load after modal opened, re-set clinicNames so dropdown uses exact option objects
  useEffect(() => {
    if (!open || !editData || clinics.length === 0) return
    const prevHad = hadClinicsOptionsRef.current
    hadClinicsOptionsRef.current = true
    if (prevHad) return
    const currentClinicNames =
      watch('clinicNames') || editData.clinicNames || []
    const formatted = formatClinicNamesValue(currentClinicNames, clinics)
    setValue('clinicNames', formatted, { shouldValidate: false })
  }, [clinics, open, editData, setValue, watch])

  useEffect(() => {
    if (!open) {
      lastSyncedEditIdRef.current = null
      setIsValidSelect((prev) => true)
      setFormData({
        Physicians: [],
        clinicNames: [],
        Users: [],
        modality: [],
        name: '',
        status: 1,
        _id: '',
        studyStatus: [],
        filterfor: 'CU',
      })
      setSelectedFilterFor('CU')
      setSearchValue('CU')
    }
  }, [open])

  const phoneRegExp =
    /^[\+]?[(]?[0-9]{0,3}[)]?[-\s\.]?[0-9]{0,3}[-\s\.]?[0-9]{0,6}$/im
  // ** New user schema
  // Do NOT sync formData to setValue — it would overwrite dropdowns when user types in name or formData reference changes.

  useEffect(() => {
    if (userData?.role !== 'ClinicAdmin') {
      register('Users')
      setUserregistrationCompleted(true)
    }
  }, [register])

  const [nestedModal, setNestedModal] = useState(false)
  const dropdownData = useSelector((state) => state.dropdownDataReducer)

  const toggleNested = () => {
    setNestedModal(!nestedModal)
  }
  const openNestedModal = useCallback(() => {
    setNestedModal(true)
  }, [])

  const editFilter = (requestData) => {
    console.log('Submitting filter update:', requestData)
    if (updateUser) {
      // Add the filter ID to the request data
      const dataWithId = {
        ...requestData,
        _id: editData._id || editData.id,
      }
      updateUser(dataWithId)
    }
  }
  // ** Form submission handler
  const onSubmit = useCallback(
    (data) => {
      console.log('Form submitted with data:', data)

      // Convert status to number to avoid "[object Object]" error
      const processedData = {
        ...data,
        status: parseInt(data.status, 10),
        _id: editData._id || editData.id,
      }
      if (processedData.modality?.some((m) => m?.value === 'selectAll')) {
        processedData.modality = modalityOptions
      }
      console.log('Processed data for update:', processedData)
      editFilter(processedData)
    },
    [editFilter, editData, modalityOptions]
  )

  const inputHandler = useCallback((e) => {
    const name = e.target.name
    setFormData((prev) => {
      return { ...prev, [name]: e.target.value }
    })
  }, [])

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

  const onError = (errors, e) => {
    validateSelect()
  }

  const addMoreEmails = () => {
    setFormData((prev) => {
      return { ...prev, secondaryEmail: [...(prev?.secondaryEmail ?? []), ''] }
    })
  }
  const addNewUserTodropdown = (a) => {
    setValue('Users', getValues()?.Users ? [...getValues()?.Users, a] : [a])
  }
  return (
    <Modal
      isOpen={open}
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
        <h5 className="modal-title">Edit Filter</h5>
      </ModalHeader>
      <ModalBody className="flex-grow-1">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <Label for="name">
              Filter Name <span style={{ color: '#FF0000' }}>*</span>
            </Label>
            <Controller
              name="name"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  {...field}
                  name="name"
                  id="name"
                  type="text"
                  placeholder="Enter filter name"
                  value={field.value || formData.name || ''}
                  onChange={(e) => {
                    field.onChange(e.target.value)
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }}
                  invalid={errors.name && true}
                />
              )}
            />
            {errors.name && <FormFeedback>{errors.name.message}</FormFeedback>}
          </FormGroup>
          <FormGroup>
            <Label for="filterfor">
              Filter For <span style={{ color: '#FF0000' }}>*</span>
            </Label>
            <Controller
              name="filterfor"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  {...field}
                  name="filterfor"
                  id="filterfor"
                  type="select"
                  value={field.value || searchValue}
                  onChange={(e) => {
                    field.onChange(e.target.value)
                    setSelectedFilterFor(e.target.value)
                    setSearchValue(e.target.value)
                  }}
                >
                  <option value="CU">Clinic User</option>
                  <option value="Physician">Physician</option>
                </Input>
              )}
            />
          </FormGroup>
          {(selectedFilterFor === 'CU' || searchValue === 'CU') && (
            <>
              <StaticDropdown
                errors={errors}
                value={watch('Physicians')}
                className="w-100"
                setValue={setValue}
                register={register}
                required={false}
                fieldName="Physicians"
                labelName="Referring Physician"
                options={physicians}
                isMulti={true}
              />
              <StaticDropdown
                errors={errors}
                value={watch('Users')}
                className="w-100"
                setValue={setValue}
                register={register}
                required={true}
                fieldName="Users"
                labelName="ClinicUser"
                options={users}
                isMulti={true}
              />
            </>
          )}
          {(selectedFilterFor === 'Physician' ||
            searchValue === 'Physician') && (
            <StaticDropdown
              errors={errors}
              value={watch('Physicians')}
              className="w-100"
              setValue={setValue}
              register={register}
              required={false}
              fieldName="Physicians"
              labelName="Physician Names"
              options={physicians}
              isMulti={true}
            />
          )}
          <StaticDropdown
            errors={errors}
            value={watch('clinicNames')}
            className="w-100"
            setValue={setValue}
            register={register}
            required={false}
            fieldName="clinicNames"
            labelName="Clinic Names"
            options={clinics}
            isMulti={true}
          />
          <StaticDropdown
            errors={errors}
            value={watch('modality')}
            className="w-100"
            setValue={setValue}
            register={register}
            required={false}
            fieldName="modality"
            labelName="Modality"
            options={[
              { value: 'selectAll', label: 'SELECT ALL' },
              ...modalityOptions,
            ]}
            isMulti={true}
          />
          <FormGroup>
            <Label for="status">Filter Status </Label>
            <Input
              name="status"
              id="status"
              type="select"
              invalid={errors?.status && true}
              {...register('status', {
                required: true,
                valueAsNumber: true,
              })}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Input>
            {errors?.status && (
              <FormFeedback>{errors.status.message}</FormFeedback>
            )}
          </FormGroup>
          <StaticDropdown
            value={watch('studyStatus')}
            className="w-100"
            setValue={setValue}
            register={register}
            required={false}
            isSearchable={false}
            errors={errors}
            labelName="Study Status"
            fieldName="studyStatus"
            options={studyStatusOptions}
            isMulti={true}
          />
          {errors && errors['at-least-one'] && (
            <label
              className="error"
              style={{ color: 'red', fontSize: '12px', fontWeight: '200' }}
            >{`${errors?.['at-least-one']?.message ?? ''}`}</label>
          )}
          <Button color="primary" type="submit">
            Update
          </Button>{' '}
          <Button color="secondary" onClick={handleModal}>
            Cancel
          </Button>
        </Form>
      </ModalBody>
      <NestedModal
        addNewUserTodropdown={addNewUserTodropdown}
        open={nestedModal}
        toggle={toggleNested}
      />
    </Modal>
  )
}

export default EditModel
