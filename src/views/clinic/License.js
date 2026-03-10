import { useState, useEffect } from 'react'
import {
  Card,
  Button,
  Row,
  Col,
  Label,
  Input,
  Form,
  FormGroup,
  FormFeedback,
  Spinner,
  UncontrolledTooltip,
} from 'reactstrap'
import { Copy } from 'react-feather'
import Flatpickr from 'react-flatpickr'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import moment from 'moment'
import { v1 as uuidv1 } from 'uuid'
import axios from 'axios'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { isUserLoggedIn } from '@utils'
import {
  showSuccessAlert,
  showErrorAlert,
  getErrorMessage,
} from '../../utils/alerts'

import { onlyNumberRegExp } from './utils/regex'
import { STATUS_OPTIONS } from '../../utils/constants'

import '@styles/react/libs/flatpickr/flatpickr.scss'

const License = ({ toggleTab, infoData, redirectList, toEdit, toEditId }) => {
  const [formatExpiryDate, setFormatExpiryDate] = useState(
    toEdit && toEdit.expiryDate
      ? new Date(toEdit.expiryDate)
      : new Date().fp_incr(1)
  )
  const [dateChange, setDateChange] = useState(false)
  const [isPermanent, setIsPermanent] = useState(
    toEdit && toEdit.expiryDate && toEdit.expiryDate === '2099-12-31'
  )
  const [activationKey, setActivationKey] = useState(
    toEdit && toEdit.activationKey ? toEdit.activationKey : uuidv1()
  )
  const [activationStatus, setActivationStatus] = useState(
    toEdit && toEdit.activationStatus ? toEdit.activationStatus : 'Idle'
  )
  const [status, setStatus] = useState(
    toEdit && toEdit.status
      ? toEdit.status === 1
        ? 'Active'
        : 'Inactive'
      : 'Active'
  )
  const [checkReport, setCheckReport] = useState(
    toEdit && toEdit.report ? toEdit.report : false
  )
  const [refresh, setRefresh] = useState(false)
  const [copyKey, setCopykey] = useState(false)
  const [licenseId, setLicenseId] = useState(
    toEdit && toEdit.licenseId ? toEdit.licenseId : null
  )
  const [systemInfo, setSystemInfo] = useState({})

  useEffect(() => {
    let systemInfoData = {}
    try {
      if (toEdit && toEdit.getSystemInfo) {
        const decodedJsonString = Buffer.from(
          toEdit.getSystemInfo,
          'base64'
        ).toString('utf8')
        systemInfoData = JSON.parse(decodedJsonString)
        setSystemInfo(systemInfoData)
      }
    } catch (err) {
      console.error('Failed to decode and parse system info:', err)
    }
  }, [toEdit])

  const userData = JSON.parse(isUserLoggedIn())
  const flatPickerDateFormat =
    userData?.dateFormats?.dateFormat === 'MM/DD/YYYY'
      ? 'm/d/Y'
      : userData?.dateFormats?.dateFormat === 'DD/MM/YYYY'
        ? 'd/m/Y'
        : userData?.dateFormats?.dateFormat === 'YYYY/MM/DD'
          ? 'Y/m/d'
          : 'm/d/Y'
  const NewUserSchema = yup.object().shape({
    radiologist: yup
      .string()
      .required(
        'Please specify the limit for radiologists. This field is required.'
      )
      .matches(onlyNumberRegExp, 'Please enter a numeric value only.!'),
    technician: yup
      .string()
      .required(
        'Please specify the limit for technologists. This field is required.'
      )
      .matches(onlyNumberRegExp, 'Please enter a numeric value only.!'),
    report: yup.boolean(),
    advanceFilter: yup
      .number()
      .required('Please select the advance filter. This field is required.'),
    reportLimit: yup
      .string()
      .test(
        'isRequired',
        'Please provide the report limit, which must be greater than 0.',
        (value, testContext) => {
          if (testContext.parent.report) {
            return parseInt(value) > 0
          } else {
            return true
          }
        }
      ),
  })

  const {
    register,
    formState: { errors },
    handleSubmit,
    clearErrors,
    setValue,
    trigger,
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(NewUserSchema),
    ...(toEdit && {
      defaultValues: {
        radiologist: toEdit.radiologist || '',
        technician: toEdit.technician || '',
        report: toEdit.report || false,
        advanceFilter: toEdit.advanceFilter || 0,
        reportLimit: toEdit.reportLimit || '',
      },
    }),
  })
  console.log(errors, 'errors from license')

  useEffect(() => {
    if (toEdit && toEdit.expiryDate === '2099-12-31') setIsPermanent(true)
  }, [])

  // Initialize form values when editing
  useEffect(() => {
    if (toEdit) {
      setValue('radiologist', toEdit.radiologist || '')
      setValue('technician', toEdit.technician || '')
      setValue('report', toEdit.report || false)
      setValue('advanceFilter', toEdit.advanceFilter || 0)
      setValue('reportLimit', toEdit.reportLimit || '')
      setCheckReport(toEdit.report || false)
    }
  }, [toEdit, setValue])

  const dateHandler = (e) => {
    console.log(e[0])
    if (e.length <= 0) return setFormatExpiryDate(null)
    setFormatExpiryDate(e[0])
    setDateChange(true)
  }

  const onSubmit = async (data) => {
    if (!dateChange) {
      if (toEdit.expiryDate) {
        data.expiryDate = toEdit.expiryDate
      } else {
        data.expiryDate = moment().add(1, 'days').format('YYYY-MM-DD')
      }
    } else {
      data.expiryDate = moment(formatExpiryDate).format('YYYY-MM-DD')
    }
    data.activationKey = activationKey
    data.activationStatus = activationStatus
    data.status = status === 'Active' ? 1 : 0
    data.licenseId = licenseId

    data.reportLimit = data?.reportLimit ? data.reportLimit : 0

    const payData = {
      license: data,
      information: infoData,
    }

    if (toEdit && toEditId) {
      await axios
        .patch(
          `${process.env.REACT_APP_API_URL}/clinic/edit/${toEditId}`,
          payData,
          {
            headers: { 'content-type': 'application/json' },
          }
        )
        .then((res) => {
          showSuccessAlert(res.data.message)
          redirectList(false)
        })
        .catch((err) => {
          showErrorAlert(getErrorMessage(err))
        })
    } else {
      await axios
        .post(`${process.env.REACT_APP_API_URL}/clinic/add`, payData, {
          headers: { 'content-type': 'application/json' },
        })
        .then((res) => {
          showSuccessAlert(res.data.message)
          redirectList(false)
        })
        .catch((err) => {
          showErrorAlert(getErrorMessage(err))
        })
    }
  }

  if (refresh) {
    return (
      <Card className="loading-initial">
        <Spinner color="primary" />
      </Card>
    )
  }

  return (
    <Card>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Row className="justify-content-start mx-0 p-1">
          <Col
            className="d-flex align-items-start justify-content-end"
            md="4"
            sm="12"
          >
            <FormGroup className="w-100">
              <Label for="activationKey">Activation key</Label>
              <Input
                name="activationKey"
                id="activationKey"
                defaultValue={
                  toEdit && toEdit.activationKey
                    ? toEdit.activationKey
                    : activationKey
                }
                {...register('activationKey', { required: true })}
                autoComplete="off"
                disabled
              />
              <CopyToClipboard text={activationKey}>
                <div
                  className={copyKey ? 'activation-copied' : 'activation-copy'}
                  id="copy"
                  onClick={() => setCopykey(true)}
                >
                  <Copy size={18} />
                </div>
              </CopyToClipboard>
              <UncontrolledTooltip
                className="tooltip-react-strap"
                target="copy"
              >
                {copyKey ? 'Copied' : 'copy'}
              </UncontrolledTooltip>
              {errors && errors.activationKey && (
                <FormFeedback className="d-block">
                  {errors.activationKey.message}
                </FormFeedback>
              )}
            </FormGroup>
          </Col>
          <Col
            className="d-flex align-items-start justify-content-end"
            md="4"
            sm="12"
          >
            <FormGroup className="w-100">
              <Label for="radiologist">Radiologist limit</Label>
              <Input
                name="radiologist"
                id="radiologist"
                defaultValue={
                  toEdit && toEdit.radiologist ? toEdit.radiologist : ''
                }
                {...register('radiologist', { required: true })}
                invalid={errors?.radiologist && true}
                onChange={(e) => {
                  setValue('radiologist', e.target.value)
                  if (errors?.radiologist) {
                    clearErrors('radiologist')
                  }
                  setTimeout(() => trigger('radiologist'), 100)
                }}
                onFocus={() => {
                  if (errors?.radiologist) {
                    clearErrors('radiologist')
                  }
                }}
                autoComplete="off"
              />
              {errors && errors.radiologist && (
                <FormFeedback className="d-block">
                  {errors.radiologist.message}
                </FormFeedback>
              )}
            </FormGroup>
          </Col>
          <Col
            className="d-flex align-items-start justify-content-end"
            md="4"
            sm="12"
          >
            <FormGroup className="w-100">
              <Label for="technician">Technologist limit </Label>
              <Input
                name="technician"
                id="technician"
                defaultValue={
                  toEdit && toEdit.technician ? toEdit.technician : ''
                }
                {...register('technician', { required: true })}
                invalid={errors?.technician && true}
                onChange={(e) => {
                  setValue('technician', e.target.value)
                  if (errors?.technician) {
                    clearErrors('technician')
                  }
                  setTimeout(() => trigger('technician'), 100)
                }}
                onFocus={() => {
                  if (errors?.technician) {
                    clearErrors('technician')
                  }
                }}
                autoComplete="off"
              />
              {errors && errors.technician && (
                <FormFeedback className="d-block">
                  {errors.technician.message}
                </FormFeedback>
              )}
            </FormGroup>
          </Col>
        </Row>
        <Row className="justify-content-start mx-0 pl-1 pr-1">
          <Col
            className="d-flex align-items-start justify-content-end"
            md="4"
            sm="12"
          >
            <FormGroup className="w-100">
              <Label for="expiryDate">Expiry date </Label>
              {!isPermanent && (
                <Flatpickr
                  className="license-date"
                  id="expiryDate"
                  name="expiryDate"
                  value={formatExpiryDate}
                  options={{
                    minDate: new Date().fp_incr(1),
                    dateFormat: flatPickerDateFormat,
                  }}
                  {...register('expiryDate', { required: true })}
                  onChange={dateHandler}
                  autoComplete="off"
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
                    setFormatExpiryDate(
                      moment('2099-12-31', 'YYYY-MM-DD').format('YYYY-MM-DD')
                    )
                    setDateChange(!dateChange)
                  }}
                />
                <span className="ml-2">Is Permanent?</span>
              </Label>

              {!formatExpiryDate && (
                <FormFeedback className="d-block">
                  Expiray date if required!
                </FormFeedback>
              )}
            </FormGroup>
          </Col>
          <Col
            className="d-flex align-items-start justify-content-end"
            md="4"
            sm="12"
          >
            <FormGroup className="w-100">
              <Label for="pin">Activation status </Label>
              <Input
                type="select"
                name="activationStatus"
                id="activationStatus"
                defaultValue={
                  toEdit && toEdit.activationStatus
                    ? toEdit.activationStatus
                    : activationStatus
                }
                {...register('activationStatus', { required: true })}
                autoComplete="off"
                disabled={!toEdit ?? false}
                onChange={(e) => {
                  setActivationStatus(e.target.value)
                }}
              >
                <option value="Idle">Idle</option>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
              </Input>
              {errors && errors.activationStatus && (
                <FormFeedback className="d-block">
                  {errors.activationStatus.message}
                </FormFeedback>
              )}
            </FormGroup>
          </Col>
          <Col
            className="d-flex align-items-start justify-content-end"
            md="4"
            sm="12"
          >
            <FormGroup className="w-100">
              <Label for="website">Status </Label>
              <Input
                type="select"
                name="status"
                id="status"
                defaultValue={
                  toEdit && toEdit.status
                    ? toEdit.status === 1
                      ? 'Active'
                      : 'Inactive'
                    : status
                }
                {...register('status', { required: true })}
                autoComplete="off"
                disabled={!toEdit ?? false}
                onChange={(e) => {
                  setStatus(e.target.value)
                }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </Input>
              {errors && errors.status && (
                <FormFeedback className="d-block">
                  {errors.status.message}
                </FormFeedback>
              )}
            </FormGroup>
          </Col>
        </Row>
        <Row className="justify-content-start mx-0 pl-1 pr-1 row">
          <Col
            className="d-flex align-items-center justify-content-start"
            md="4"
            sm="12"
          >
            <FormGroup className="w-100">
              <Label className="d-flex align-items-center gap-5">
                <Input
                  className="dataTable-filter"
                  type="checkbox"
                  bsSize="sm"
                  id="report"
                  name="report"
                  checked={checkReport}
                  {...register('report', { required: true })}
                  onChange={() => {
                    setCheckReport(!checkReport)
                  }}
                />
                <span className="ml-2">Include Reports?</span>
              </Label>

              <Input
                type="number"
                name="reportLimit"
                id="reportLimit"
                defaultValue={
                  toEdit && toEdit.reportLimit ? toEdit.reportLimit : ''
                }
                {...register('reportLimit', { required: true })}
                invalid={errors?.reportLimit && true}
                onChange={(e) => {
                  setValue('reportLimit', e.target.value)
                  if (errors?.reportLimit) {
                    clearErrors('reportLimit')
                  }
                  setTimeout(() => trigger('reportLimit'), 100)
                }}
                onFocus={() => {
                  if (errors?.reportLimit) {
                    clearErrors('reportLimit')
                  }
                }}
                autoComplete="off"
                placeholder="Number of report template?"
                disabled={!checkReport}
              />
              {errors && errors.reportLimit && (
                <FormFeedback className="d-block">
                  {errors.reportLimit.message}
                </FormFeedback>
              )}
            </FormGroup>
          </Col>
          <Col
            className="d-flex align-items-start justify-content-end"
            md="4"
            sm="12"
          >
            <FormGroup className="w-100">
              <Label for="website">Include Advanced Filter </Label>
              <Input
                type="select"
                name="advanceFilter"
                id="advanceFilter"
                defaultValue={
                  toEdit && toEdit?.advanceFilter
                    ? toEdit?.advanceFilter === 1
                      ? '1'
                      : '0'
                    : '0'
                }
                {...register('advanceFilter', { required: true })}
                invalid={errors?.advanceFilter && true}
                onChange={(e) => {
                  setValue('advanceFilter', e.target.value)
                  if (errors?.advanceFilter) {
                    clearErrors('advanceFilter')
                  }
                }}
                onFocus={() => {
                  if (errors?.advanceFilter) {
                    clearErrors('advanceFilter')
                  }
                }}
                autoComplete="off"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Input>
              {errors && errors.advanceFilter && (
                <FormFeedback className="d-block">
                  {errors.advanceFilter.message}
                </FormFeedback>
              )}
            </FormGroup>
          </Col>
        </Row>
        {toEditId ? (
          <div className="justify-content-start">
            <Row className="justify-content-start mx-0 pt-1 pl-1 pr-1">
              <Col
                className="d-flex align-items-start justify-content-start"
                md="12"
                sm="12"
              >
                <h4 className="mr-1 font-weight-bold" htmlFor="search-input">
                  Clinic Server Information:
                </h4>
              </Col>
            </Row>
            <hr />
            {}
            <Row className="justify-content-start mx-0 pl-1 pr-1">
              <Col
                className="d-flex align-items-start justify-content-start"
                md="4"
                sm="12"
              >
                <h5 className="font-weight-bold">System Information:</h5>
              </Col>
            </Row>
            <Row className="justify-content-start mx-0 pl-1 pr-1">
              <Col md="4" sm="12">
                <FormGroup className="w-100">
                  <Label for="manufacturer" className="pr-1">
                    Manufacturer
                  </Label>{' '}
                  :
                  <span className="pl-1">
                    {systemInfo?.system?.manufacturer || ''}
                  </span>
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup className="w-100">
                  <Label for="model" className="pr-1">
                    Model
                  </Label>{' '}
                  :
                  <span className="pl-1">
                    {systemInfo?.system?.model || ''}
                  </span>
                </FormGroup>
              </Col>
            </Row>
            <hr />
            {}
            <Row className="justify-content-start mx-0 pl-1 pr-1">
              <Col
                className="d-flex align-items-start justify-content-start"
                md="4"
                sm="12"
              >
                <h5 className="font-weight-bold">BIOS Information:</h5>
              </Col>
            </Row>
            <Row className="justify-content-start mx-0 pl-1 pr-1">
              <Col md="4" sm="12">
                <FormGroup className="w-100">
                  <Label for="bios_vendor" className="pr-1">
                    BIOS Vendor
                  </Label>{' '}
                  :
                  <span className="pl-1">{systemInfo?.bios?.vendor || ''}</span>
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup className="w-100">
                  <Label for="bios_version" className="pr-1">
                    BIOS Version
                  </Label>{' '}
                  :
                  <span className="pl-1">
                    {systemInfo?.bios?.version || ''}
                  </span>
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup className="w-100">
                  <Label for="bios_releaseDate" className="pr-1">
                    BIOS Release Date
                  </Label>{' '}
                  :
                  <span className="pl-1">
                    {systemInfo?.bios?.releaseDate || ''}
                  </span>
                </FormGroup>
              </Col>
            </Row>
            <hr />
            {}
            <Row className="justify-content-start mx-0 pl-1 pr-1">
              <Col
                className="d-flex align-items-start justify-content-start"
                md="4"
                sm="12"
              >
                <h5 className="font-weight-bold">Baseboard Information:</h5>
              </Col>
            </Row>
            <Row className="justify-content-start mx-0 pl-1 pr-1">
              <Col md="4" sm="12">
                <FormGroup className="w-100">
                  <Label for="baseboard_manufacturer" className="pr-1">
                    Baseboard Manufacturer
                  </Label>{' '}
                  :
                  <span className="pl-1">
                    {systemInfo?.baseboard?.manufacturer || ''}
                  </span>
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup className="w-100">
                  <Label for="baseboard_model" className="pr-1">
                    Baseboard Model
                  </Label>{' '}
                  :
                  <span className="pl-1">
                    {systemInfo?.baseboard?.model || ''}
                  </span>
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup className="w-100">
                  <Label for="baseboard_version" className="pr-1">
                    Baseboard Version
                  </Label>{' '}
                  :
                  <span className="pl-1">
                    {systemInfo?.baseboard?.version || ''}
                  </span>
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup className="w-100">
                  <Label for="baseboard_assetTag" className="pr-1">
                    Baseboard Asset Tag
                  </Label>{' '}
                  :
                  <span className="pl-1">
                    {systemInfo?.baseboard?.assetTag || ''}
                  </span>
                </FormGroup>
              </Col>
            </Row>
            <hr />
            {}
            <Row className="justify-content-start mx-0 pl-1 pr-1">
              <Col
                className="d-flex align-items-start justify-content-start"
                md="4"
                sm="12"
              >
                <h5 className="font-weight-bold">Disk Information:</h5>
              </Col>
            </Row>
            <Row className="justify-content-start mx-0 pl-1 pr-1">
              <Col md="4" sm="12">
                <FormGroup className="w-100">
                  <Label for="disk_name" className="pr-1">
                    Disk Name
                  </Label>{' '}
                  :<span className="pl-1">{systemInfo?.disks?.name || ''}</span>
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup className="w-100">
                  <Label for="disk_size" className="pr-1">
                    Disk Size
                  </Label>{' '}
                  :<span className="pl-1">{systemInfo?.disks?.size || ''}</span>
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup className="w-100">
                  <Label for="disk_serialNum" className="pr-1">
                    Disk Serial Number
                  </Label>{' '}
                  :
                  <span className="pl-1">
                    {systemInfo?.disks?.serialNum || ''}
                  </span>
                </FormGroup>
              </Col>
            </Row>
            <hr />
            {}
            <Row className="justify-content-start mx-0 pl-1 pr-1">
              <Col
                className="d-flex align-items-start justify-content-start"
                md="4"
                sm="12"
              >
                <h5 className="font-weight-bold">Network Information:</h5>
              </Col>
            </Row>
            <Row className="justify-content-start mx-0 pl-1 pr-1">
              <Col md="4" sm="12">
                <FormGroup className="w-100">
                  <Label for="IP_ADDRESS" className="pr-1">
                    IP Address
                  </Label>{' '}
                  :
                  <span className="pl-1">
                    {systemInfo?.network?.IP_ADDRESS || ''}
                  </span>
                </FormGroup>
              </Col>
              {}
            </Row>
            <hr />
          </div>
        ) : (
          ''
        )}
        <Row className="justify-content-end mx-0 p-2">
          <div className="d-flex mt-md-0 mt-1">
            <Button
              className="ml-2 cursor-pointer"
              color="outline-danger"
              onClick={() => redirectList(false)}
            >
              <span className="align-middle">Cancel</span>
            </Button>
            <Button
              className="ml-2 cursor-pointer"
              color="secondary"
              onClick={() => toggleTab('1')}
            >
              <span className="align-middle">Back</span>
            </Button>
            <Button
              className="ml-2 cursor-pointer"
              color="primary"
              type="submit"
            >
              <span className="align-middle">
                {checkReport
                  ? 'Next'
                  : toEdit && toEditId
                    ? 'Save Changes'
                    : 'Add clinic'}
              </span>
            </Button>
          </div>
        </Row>
      </Form>
    </Card>
  )
}

export default License
