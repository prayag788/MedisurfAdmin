// ** React Imports
import { useEffect, useRef, useState, useCallback } from 'react'
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import fontawesome from '@fortawesome/fontawesome'
import { faAsterisk } from '@fortawesome/fontawesome-free-solid'
import axios from 'axios'

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
import { useSelector, useDispatch } from 'react-redux'
import { handleModalityUpdate } from '../../redux/actions/Modalities'
import ROLES from '../../configs/roles'

// ** Utils
import { STATUS_OPTIONS, showErrorAlert } from '../../utils'
import { STUDY_STATUS_OPTIONS } from '../../configs/const'

fontawesome.library.add(faAsterisk)

// Modality options: dynamic from Orthanc via Redux (ModalityReducer), populated in App.js
const AddNewModal = ({ addUser, open, handleModal }) => {
  const dispatch = useDispatch()
  // ** State
  const [isValidSelect, setIsValidSelect] = useState(true)
  const isInitialInput = useRef(true)
  const dropdownData = useSelector(state => state.dropdownDataReducer)
  const userData = useSelector(state => state.auth.userData)
  const modalityOptions = useSelector(state => state?.ModalityReducer) || []
  const [clinics, setClinics] = useState([])
  const [referringPhysicians, setReferringPhysicians] = useState([])
  const [physicianNamesList, setPhysicianNamesList] = useState([])
  const [users, setUsers] = useState([])
  const studyStatusOptions = STUDY_STATUS_OPTIONS
  const [filterForOptions] = useState([
    { value: 'CU', label: 'Clinic User' },
    { value: 'Physician', label: 'Physician' },
  ])
  const [selectedFilterFor, setSelectedFilterFor] = useState('CU')

  // ** Validation schema for filter
  const FilterSchema = yup.object().shape({
    name: yup.string().required('Filter name is required!'),
    status: yup
      .number()
      .oneOf([0, 1], 'Please select a valid status')
      .required('Status is required!'),
    filterfor: yup.string().required('Filter For is required!'),
    Users: yup.array().when('filterfor', (filterfor, schema) => {
      return filterfor === 'CU'
        ? schema.min(1, 'At least one Clinic User is required when Filter For is Clinic User')
        : schema
    }),
  })

  const {
    formState: { errors },
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
  } = useForm({
    mode: 'onSubmit',
    resolver: yupResolver(FilterSchema),
    defaultValues: {
      name: '',
      status: 1,
      filterfor: 'CU',
      clinicNames: [],
      Physicians: [],
      Users: [],
      modality: [],
      studyStatus: [],
    },
  })

  const loadFilterData = async () => {
    const token = localStorage.getItem('accessToken')
    const headers = { Authorization: `Bearer ${token}` }

    try {
      // Refetch modalities from API so dropdown always shows CR, CT, MR (not DICOM server names)
      try {
        const modRes = await axios.get(`${process.env.REACT_APP_API_URL}/orthanc/modalities`, { headers })
        const data = modRes?.data
        console.log('[FilterModal Modality] orthanc/modalities full response:', JSON.stringify(data))
        console.log('[FilterModal Modality] response type:', Array.isArray(data) ? 'array' : typeof data)
        let raw = []
        if (Array.isArray(data)) raw = data
        else if (data && typeof data === 'object') {
          console.log('[FilterModal Modality] response is object, keys:', Object.keys(data))
          const names = new Set()
          Object.keys(data).forEach((key) => {
            const config = data[key]
            const aet = config && (config.AET ?? config.AeTitle ?? config.aeTitle)
            if (aet && typeof aet === 'string') names.add(String(aet).trim())
            else names.add(String(key).trim())
          })
          raw = Array.from(names).sort()
        }
        console.log('[FilterModal Modality] normalized raw array:', JSON.stringify(raw))
        if (raw.length > 0) {
          const options = raw.filter(Boolean).map((name) => ({ value: name, label: name }))
          console.log('[FilterModal Modality] dispatching options to Redux:', JSON.stringify(options))
          dispatch(handleModalityUpdate(options))
        }
      } catch (e) {
        console.log('[FilterModal Modality] fetch error:', e?.message, e?.response?.data)
      }

      // Load clinics
      const clinicsRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/filter-module/get-clinics`,
        { headers }
      )
      setClinics(
        clinicsRes.data.data?.map(clinic => ({
          value: clinic._id,
          label: clinic.name,
          _id: clinic._id,
          name: clinic.name,
        })) || []
      )

      // Load referring physicians (All physicians)
      let allPhysiciansList = []
      try {
        const fallbackRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/dropdownData/Physician?size=500&filterfor=Physician`,
          { headers }
        )
        const dropdownData = fallbackRes.data?.dropdownData || []
        allPhysiciansList = dropdownData.map(p => ({
          value: p._id,
          label: p.physicianname || p.name || `${p.fname || ''} ${p.lname || ''}`.trim() || p.username,
          _id: p._id,
          name: p.physicianname || p.name,
        }))
      } catch (e) {
        allPhysiciansList = []
      }
      if (allPhysiciansList.length === 0) {
        try {
          const physiciansRes = await axios.get(
            `${process.env.REACT_APP_API_URL}/filter-module/get-physicians`,
            { headers }
          )
          allPhysiciansList =
            physiciansRes.data?.data?.map(physician => ({
              value: physician._id,
              label: physician.name || physician.physicianname || physician.username,
              _id: physician._id,
              name: physician.name || physician.physicianname,
            })) || []
        } catch (e2) {
          allPhysiciansList = []
        }
      }
      setReferringPhysicians(allPhysiciansList)

      // Load institutional physicians (Physician Names modal)
      let institutionalPhysicianList = []
      try {
        const institutionalRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/filter-module/get-physicians?institutionalOnly=true`,
          { headers }
        )
        institutionalPhysicianList =
          institutionalRes.data?.data?.map(physician => ({
            value: physician._id,
            label: physician.username || physician.physicianname || physician.name,
            _id: physician._id,
            name: physician.name || physician.physicianname,
          })) || []
      } catch (e2) {
        institutionalPhysicianList = []
      }
      setPhysicianNamesList(institutionalPhysicianList)

      // Load clinic users
      const usersRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/filter-module/get-clinic-users`,
        { headers }
      )
      setUsers(
        usersRes.data.data?.map(user => ({
          value: user._id,
          label: user.username,
          _id: user._id,
          name: user.name,
          username: user.username,
        })) || []
      )
    } catch (error) {
      console.error('Error loading filter data:', error)
      showErrorAlert('Failed to load filter data')
    }
  }

  // ** Load filter data when modal opens
  useEffect(() => {
    if (open) {
      loadFilterData()
      setSelectedFilterFor('CU')
    } else {
      setIsValidSelect(true)
      setSelectedFilterFor('CU')
      reset()
    }
  }, [open, reset])

  // ** Form submission handler (matching old flow)
  const onSubmit = async data => {
    try {
      const payload = { ...data }
      if (payload.modality?.some(m => m?.value === 'selectAll')) {
        payload.modality = modalityOptions
      }
      await addUser(payload)
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
  const CloseBtn = <X className="cursor-pointer" size={15} onClick={handleModal} />

  return (
    <Modal
      isOpen={open}
      toggle={handleModal}
      className="sidebar-sm sm-w-100"
      modalClassName="modal-slide-in"
      contentClassName="pt-0"
    >
      <ModalHeader className="mb-2" toggle={handleModal} close={CloseBtn} tag="div">
        <h5 className="modal-title">Add New Filter</h5>
      </ModalHeader>
      <ModalBody className="flex-grow-1">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormField name="name" label="Filter Name" placeholder="Enter filter name" required />

          <FormGroup>
            <Label for="filterfor">
              Filter For <span style={{ color: '#FF0000' }}>*</span>
            </Label>
            <Controller
              name="filterfor"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  {...field}
                  isClearable={false}
                  theme={selectThemeColors}
                  value={filterForOptions.find(option => option.value === field.value) || null}
                  options={filterForOptions}
                  className="react-select"
                  classNamePrefix="select"
                  onChange={option => {
                    field.onChange(option ? option.value : undefined)
                    setSelectedFilterFor(option ? option.value : 'CU')
                  }}
                />
              )}
            />
          </FormGroup>

          {selectedFilterFor === 'CU' && (
            <>
              <FormGroup>
                <Label for="Physicians">Referring Physician</Label>
                <Controller
                  name="Physicians"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      isMulti
                      isClearable
                      theme={selectThemeColors}
                      options={referringPhysicians}
                      className="react-select"
                      classNamePrefix="select"
                      placeholder="Select referring physicians..."
                    />
                  )}
                />
              </FormGroup>

              <FormGroup>
                <Label for="Users">
                  ClinicUser <span style={{ color: '#FF0000' }}>*</span>
                </Label>
                <Controller
                  name="Users"
                  control={control}
                  rules={{ required: selectedFilterFor === 'CU' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      isMulti
                      isClearable
                      theme={selectThemeColors}
                      options={users}
                      className="react-select"
                      classNamePrefix="select"
                      placeholder="Select clinic users..."
                    />
                  )}
                />
                {errors.Users && <FormFeedback>{errors.Users.message}</FormFeedback>}
              </FormGroup>
            </>
          )}

          {selectedFilterFor === 'Physician' && (
            <FormGroup>
              <Label for="Physicians">Physician Names</Label>
              <Controller
                name="Physicians"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    isMulti
                    isClearable
                    theme={selectThemeColors}
                    options={physicianNamesList}
                    className="react-select"
                    classNamePrefix="select"
                    placeholder="Select physicians..."
                  />
                )}
              />
            </FormGroup>
          )}

          <FormGroup>
            <Label for="clinicNames">Clinic Names</Label>
            <Controller
              name="clinicNames"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  isMulti
                  isClearable
                  theme={selectThemeColors}
                  options={clinics}
                  className="react-select"
                  classNamePrefix="select"
                  placeholder="Select clinics..."
                />
              )}
            />
          </FormGroup>

          <FormGroup>
            <div className="d-flex justify-content-between align-items-center flex-wrap mb-50">
              <Label for="modality" className="mb-0">Modality</Label>
              {watch('modality')?.length > 0 && (
                <button
                  type="button"
                  className="btn btn-sm btn-flat-secondary"
                  onClick={() => setValue('modality', [])}
                  style={{ fontSize: '12px', padding: '2px 8px' }}
                >
                  Clear all
                </button>
              )}
            </div>
            <Controller
              name="modality"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  isMulti
                  isClearable
                  theme={selectThemeColors}
                  options={[{ value: 'selectAll', label: 'SELECT ALL' }, ...modalityOptions]}
                  className="react-select"
                  classNamePrefix="select"
                  placeholder="Select modality..."
                  onChange={selected => {
                    const hasSelectAll = selected?.some(m => m?.value === 'selectAll')
                    if (hasSelectAll) {
                      field.onChange(modalityOptions)
                    } else {
                      field.onChange(selected || [])
                    }
                  }}
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      minHeight: 42,
                    }),
                    multiValue: (provided) => ({
                      ...provided,
                      borderRadius: 4,
                    }),
                    multiValueRemove: (provided, state) => ({
                      ...provided,
                      cursor: 'pointer',
                      paddingLeft: 6,
                      paddingRight: 6,
                      ':hover': {
                        backgroundColor: state.isFocused ? '#de350b' : '#ffbdad',
                        color: '#fff',
                      },
                    }),
                  }}
                />
              )}
            />
          </FormGroup>

          <FormGroup>
            <Label for="studyStatus">Study Status</Label>
            <Controller
              name="studyStatus"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  isMulti
                  isClearable
                  theme={selectThemeColors}
                  options={studyStatusOptions}
                  className="react-select"
                  classNamePrefix="select"
                  placeholder="Select study status..."
                />
              )}
            />
          </FormGroup>

          <FormGroup>
            <Label for="status">
              Filter Status <span style={{ color: '#FF0000' }}>*</span>
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
                  value={STATUS_OPTIONS.find(option => option.value === field.value) || null}
                  name="status"
                  id="status"
                  options={STATUS_OPTIONS}
                  className="react-select"
                  classNamePrefix="select"
                  onChange={option => field.onChange(option ? option.value : undefined)}
                />
              )}
            />
            {errors.status && <FormFeedback>{errors.status.message}</FormFeedback>}
          </FormGroup>
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
