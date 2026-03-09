import { useCallback, useEffect, useState } from 'react'
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  Row,
  Col,
  Label,
  FormGroup,
  Input,
  Form,
  FormFeedback,
} from 'reactstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import DynamicDropdown from '../dynamicDropdown'
import StaticDropdown from '../staticDropdown'
import {
  showErrorAlert,
  showSuccessAlert,
  getErrorMessage,
  showLoadingAlert,
  hideLoadingAlert,
} from '../../../utils/alerts'
import axios from 'axios'

import { useSelector, useDispatch } from 'react-redux'
import NestedModal from './NestedModal'
import ROLES from '../../../configs/roles'
import { STATUS_OPTIONS } from '../../../utils/constants'
import { handleModalityUpdate } from '../../../redux/actions/Modalities'
import { STUDY_STATUS_OPTIONS } from '../../../configs/const'

const FilterModal = ({ open, toggle, style }) => {
  const dispatch = useDispatch()
  const modalityOptions = useSelector(state => state?.ModalityReducer) || []
  const dropdownData = useSelector(state => state.dropdownDataReducer)
  const [userData, setUserData] = useState(JSON.parse(localStorage.getItem('userData')))
  const [searchValue, setSearchValue] = useState(ROLES.ClinicUser)
  const [referringPhysicians, setReferringPhysicians] = useState([])
  const [physicianNamesList, setPhysicianNamesList] = useState([])

  const [isMultiPhysicians, setIsMultiPhysicians] = useState(true)

  const schema = yup
    .object()
    .shape({
      name: yup
        .string()
        .max(25, 'Filter name cannot be longer than 25 characters.')
        .required('Filter name is required!'),
      clinicNames: yup
        .array()
        .of(
          yup.object().shape({ _id: yup.string().required(), clinicName: yup.string().required() })
        ),
      status: yup.object().required('Status is required!'),
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
      // ,
      // Physicians: yup.array().of(yup.object().shape({ _id: yup.string().required(), _id: yup.string().required(), username: yup.string() })),
      // Users: yup.array().of(yup.object().shape({ _id: yup.string().required(), username: yup.string() })).required('Clinic users are required!')
    })
    .test(
      'at-least-one',
      'Select Atleast One Of The Filtering Criteria(Modalities, Physicians, Clinic Names, Study Status)',
      function (value) {
        const { Physicians, modality, clinicNames, studyStatus } = value
        return (
          modality?.length > 0 ||
          clinicNames?.length > 0 ||
          studyStatus?.length > 0 ||
          Physicians?.length > 0
        )
      }
    )
    .required()
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    getValues,
    reset,
    clearErrors,
    trigger,
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema),
    defaultValues: {
      filterfor: ROLES.ClinicUser,
      Users: userData?.role === ROLES.ClinicAdmin ? undefined : [userData],
    },
  })
  const loadFilterData = async () => {
    const token = localStorage.getItem('accessToken')
    const headers = { Authorization: `Bearer ${token}` }

    try {
      // Refetch modalities
      try {
        const modRes = await axios.get(`${process.env.REACT_APP_API_URL}/orthanc/modalities`, {
          headers,
        })
        const data = modRes?.data
        let raw = []
        if (Array.isArray(data)) raw = data
        else if (data && typeof data === 'object') {
          const names = new Set()
          Object.keys(data).forEach(key => {
            const config = data[key]
            const aet = config && (config.AET ?? config.AeTitle ?? config.aeTitle)
            if (aet && typeof aet === 'string') names.add(String(aet).trim())
            else names.add(String(key).trim())
          })
          raw = Array.from(names).sort()
        }
        if (raw.length > 0) {
          const options = raw.filter(Boolean).map(name => ({ value: name, label: name }))
          dispatch(handleModalityUpdate(options))
        }
      } catch (e) {
        console.log('[FilterModal Modality] fetch error:', e?.message)
      }

      // Load referring physicians (All physicians)
      let allPhysiciansList = []
      try {
        const fallbackRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/dropdownData/Physician?size=500&filterfor=Physician`,
          { headers }
        )
        const dData = fallbackRes.data?.dropdownData || []
        allPhysiciansList = dData.map(p => ({
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

    } catch (error) {
      console.error('Error loading filter data:', error)
    }
  }

  useEffect(() => {
    if (open) {
      loadFilterData()
    }
  }, [open])

  useEffect(() => {
    if (userData?.role !== ROLES.ClinicAdmin) {
      register('Users')
    }
  }, [register])

  // Clear errors when form has valid values
  useEffect(() => {
    const values = getValues()
    if (values.name && errors.name) {
      clearErrors('name')
    }
    if (values.status && errors.status) {
      clearErrors('status')
    }
  }, [getValues, errors, clearErrors])
  const [nestedModal, setNestedModal] = useState(false)
  const toggleNested = () => {
    setNestedModal(!nestedModal)
  }
  const openNestedModal = useCallback(() => {
    setNestedModal(true)
  }, [])
  const addNewFilter = async requestData => {
    showLoadingAlert()
    if (requestData?.modality && requestData?.modality?.find(data => data?.value === 'selectAll')) {
      requestData.modality = modalityOptions
    }
    axios
      .post(`${process.env.REACT_APP_API_URL}/filter-module/add`, requestData)
      .then(async doc => {
        await hideLoadingAlert()
        showSuccessAlert('Filter Added Successfully!')
        reset()
        toggle()
      })
      .catch(err => {
        hideLoadingThenShowError(err)
      })
  }

  const onSubmit = data => {
    addNewFilter(data)
  }

  const addNewUserTodropdown = a => {
    setValue('Users', getValues()?.Users ? [...getValues()?.Users, a] : [a])
  }

  const onChange = filterfor => {
    setValue('filterfor', filterfor)
    setSearchValue(filterfor)
    setIsMultiPhysicians(filterfor === ROLES.ClinicAdmin)
  }

  return (
    <div>
      <Modal
        isOpen={open}
        toggle={() => {
          reset()
          clearErrors()
          toggle()
        }}
        size={'lg'}
        centered={true}
        className={' modal-dialog add-new-filter'}
      >
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div className="m-0 modal-header align-items-center ">
            <h5 className="modal-title ">Add New Filter</h5>
            <button
              type="button"
              className="close m-0 "
              aria-label="Close"
              onClick={() => {
                reset()
                clearErrors()
                toggle()
              }}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <ModalBody>
            <Row className="gap-2">
              <Col md={4}>
                <Row>
                  <FormGroup className="mx-1 w-100">
                    <Label for="name">
                      Filter Name: <span style={{ color: '#FF0000' }}>*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Filter"
                      {...register('name', { required: true })}
                      invalid={errors?.name && true}
                      onChange={e => {
                        setValue('name', e.target.value)
                        if (e.target.value && errors?.name) {
                          clearErrors('name')
                        }
                      }}
                      onFocus={() => {
                        if (errors?.name) {
                          clearErrors('name')
                        }
                      }}
                    />
                    {errors?.name && (
                      <label
                        className="error"
                        style={{ color: 'red', fontSize: '12px', fontWeight: '200' }}
                      >{`${errors.name?.message ?? ''}`}</label>
                    )}
                  </FormGroup>
                </Row>
              </Col>
              <Col md={4}>
                <Row>
                  <FormGroup className="mx-1 w-100">
                    {userData?.role === ROLES.ClinicAdmin && (
                      <FormGroup>
                        <Label for="filterfor">Filter For </Label>
                        <Input
                          name="filterfor"
                          id="filterfor"
                          type="select"
                          {...register('filterfor', { required: true })}
                          onChange={e => {
                            const val = e.target.value
                            setValue('filterfor', val)
                            onChange(val)
                            if (errors?.filterfor) {
                              clearErrors('filterfor')
                            }
                          }}
                          invalid={errors?.filterfor && true}
                          onFocus={() => {
                            if (errors?.filterfor) {
                              clearErrors('filterfor')
                            }
                          }}
                        >
                          <option value={ROLES.ClinicUser}>Clinic User</option>
                          <option value={ROLES.Physician}>Physician</option>
                        </Input>
                        {errors?.status && <FormFeedback>{errors.status.message}</FormFeedback>}
                      </FormGroup>
                    )}
                    {userData?.role !== ROLES.ClinicAdmin && (
                      <FormGroup>
                        <Input
                          name="filterfor"
                          id="filterfor"
                          type="hidden"
                          value={userData?.role}
                        ></Input>
                      </FormGroup>
                    )}
                  </FormGroup>
                </Row>
              </Col>

              <Col md={4}>
                <Row>
                  <FormGroup className="mx-1 w-100">
                    {watch('filterfor') === ROLES.ClinicUser ? (
                      <StaticDropdown
                        errors={errors}
                        className="w-100"
                        setValue={setValue}
                        register={register}
                        required={false}
                        fieldName="Physicians"
                        labelName="Referring Physician"
                        options={referringPhysicians}
                        isMulti={true}
                        value={watch('Physicians')}
                      />
                    ) : (
                      <StaticDropdown
                        errors={errors}
                        className="w-100"
                        setValue={setValue}
                        register={register}
                        required={false}
                        fieldName="Physicians"
                        labelName="Physician Name"
                        options={physicianNamesList}
                        isMulti={true}
                        value={watch('Physicians')}
                      />
                    )}
                  </FormGroup>
                </Row>
              </Col>

              {userData?.role === ROLES.ClinicAdmin && watch('filterfor') === ROLES.ClinicUser && (
                <Col md={4}>
                  {' '}
                  <Row>
                    <FormGroup className="mx-1 w-100">
                      <DynamicDropdown
                        className=""
                        required={true}
                        fieldName="Users"
                        labelName="Clinic Users"
                        setValue={setValue}
                        register={register}
                        errors={errors}
                        roleName="CU"
                        isMulti={true}
                        openNestedModal={openNestedModal}
                        value={watch('Users')}
                      />
                    </FormGroup>
                  </Row>{' '}
                </Col>
              )}
              <Col md={4}>
                <Row>
                  <FormGroup className="mx-1 w-100">
                    {dropdownData?.clinicNames && dropdownData?.clinicNames.length > 0 ? (
                      <StaticDropdown
                        errors={errors}
                        className=""
                        setValue={setValue}
                        register={register}
                        required={false}
                        fieldName="clinicNames"
                        labelName="Clinic Names"
                        options={[
                          ...dropdownData?.clinicNames.map(data => {
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
                        value={watch('clinicNames')}
                      />
                    ) : (
                      <DynamicDropdown
                        required={false}
                        className=""
                        fieldName="clinicNames"
                        labelName="Clinic Names"
                        setValue={setValue}
                        register={register}
                        errors={errors}
                        roleName="clinicName"
                        isMulti={true}
                        value={watch('clinicNames')}
                      />
                    )}
                  </FormGroup>
                </Row>
              </Col>
              <Col md={4}>
                <Row>
                  <FormGroup className="mx-1 w-100">
                    <StaticDropdown
                      className=""
                      errors={errors}
                      setValue={setValue}
                      register={register}
                      required={false}
                      fieldName="modality"
                      labelName="Modality"
                      options={[{ value: 'selectAll', label: 'SELECT ALL' }, ...modalityOptions]}
                      isMulti={true}
                      value={watch('modality')}
                    />
                  </FormGroup>
                </Row>
              </Col>

              <Col md={4}>
                <Row>
                  <FormGroup className="mx-1 w-100">
                    <StaticDropdown
                      isSearchable={false}
                      className=""
                      errors={errors}
                      setValue={setValue}
                      register={register}
                      required={true}
                      labelName="Filter Status"
                      fieldName="status"
                      options={STATUS_OPTIONS}
                      isMulti={false}
                      value={watch('status')}
                    />
                  </FormGroup>
                </Row>
              </Col>
              <Col md={4}>
                <Row>
                  <FormGroup className="mx-1 w-100">
                    <StaticDropdown
                      isSearchable={false}
                      className=""
                      errors={errors}
                      setValue={setValue}
                      register={register}
                      required={false}
                      labelName="Study Status"
                      fieldName="studyStatus"
                      options={STUDY_STATUS_OPTIONS}
                      isMulti={true}
                      value={watch('studyStatus')}
                    />
                  </FormGroup>
                </Row>
              </Col>
            </Row>
            <Row>
              {errors?.['at-least-one'] && (
                <label
                  className="error"
                  style={{ color: 'red', fontSize: '12px', fontWeight: '200' }}
                >{`${errors['at-least-one']?.message ?? ''}`}</label>
              )}
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" type="submit">
              Submit
            </Button>{' '}
            <Button
              color="secondary"
              onClick={() => {
                reset()
                clearErrors()
                toggle()
              }}
            >
              Cancel
            </Button>
          </ModalFooter>
        </Form>
        <NestedModal
          addNewUserTodropdown={addNewUserTodropdown}
          open={nestedModal}
          toggle={toggleNested}
        />
      </Modal>
    </div>
  )
}

export default FilterModal
