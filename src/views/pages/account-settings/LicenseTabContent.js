import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Col, Form, FormGroup, Input, Label, Row, Spinner } from 'reactstrap'
import axios from 'axios'
import { selectThemeColors } from '@utils'
import Select from 'react-select'
import moment from 'moment'
import { useForm } from 'react-hook-form'
import { showErrorAlert, showSuccessAlert, getErrorMessage } from '../../../utils/alerts'

const LicenseTabContent = () => {
  const navigate = useNavigate()
  const [licenseDetails, setLicenseDetails] = useState([
    {
      label: 'licenseId',
      name: 'License ID',
      value: '',
    },
    {
      label: 'activationKey',
      name: 'Activation Key',
      value: '',
    },
    {
      label: 'email',
      name: 'Email',
      value: '',
    },
    {
      label: 'contact',
      name: 'Contact',
      value: '',
    },
    {
      label: 'activationDate',
      name: 'Activation Date',
      value: '',
    },
    {
      label: 'expiryDate',
      name: 'Expiry Date',
      value: '',
    },
    {
      label: 'radiologistLimit',
      name: 'Radiologist Limit',
      value: '',
    },
    {
      label: 'technicianLimit',
      name: 'Technologist Limit',
      value: '',
    },
    {
      label: 'reportTemplateLimit',
      name: 'Report Template Limit',
      value: '',
    },
    {
      label: 'dateFormat',
      name: 'Date Format',
      value: 'MM/DD/YYYY',
      options: [
        {
          value: 'MM/DD/YYYY',
          label: 'MM/DD/YYYY',
        },
        {
          value: 'DD/MM/YYYY',
          label: 'DD/MM/YYYY',
        },
        {
          value: 'YYYY/MM/DD',
          label: 'YYYY/MM/DD',
        },
      ],
    },
    {
      label: 'timeFormat',
      name: 'Select Time Format',
      value: 'hh:mmA',
      options: [
        {
          value: 'hh:mmA',
          label: '12 Hours',
        },
        {
          value: 'hh:mm',
          label: '24 Hours',
        },
      ],
    },
  ])
  const [loading, setLoading] = useState(false)
  const [dateFormats, setDateFormats] = useState({})

  useEffect(() => {
    const dateFormatArray = {}
    licenseDetails &&
      licenseDetails.map(item => {
        if (
          item.label === 'dateFormat' ||
          item.label === 'timeFormat' ||
          item.label === 'dateTimeFormat'
        ) {
          dateFormatArray[item.label] = item.value
        }
      })
    setDateFormats(dateFormatArray)
  }, [licenseDetails])

  const { handleSubmit } = useForm({
    mode: 'onChange',
  })

  useEffect(() => {
    setLoading(true)
    axios
      .get(`${process.env.REACT_APP_API_URL}/user/license/details`)
      .then(res => {
        setLicenseDetails(res.data.message)
        setLoading(false)
      })
      .catch(err => {
        setLoading(false)
      })
  }, [])

  const selectHandler = (value, item) => {
    setDateFormats({
      ...dateFormats,
      [item]: value,
    })
  }

  if (loading) {
    return (
      <Card className="loading-initial">
        <Spinner color="primary" />
      </Card>
    )
  }

  const CancelForm = () => {
    navigate(-1)
  }

  const onSubmit = (data, e) => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/user/update-date-format`, {
        ...dateFormats,
        dateTimeFormat: `${dateFormats.dateFormat} ${dateFormats.timeFormat}`,
      })
      .then(doc => {
        showSuccessAlert(doc?.data?.message?.message || 'Success').then(() => {
          const userDetails = JSON.parse(localStorage.getItem('userData'))
          if (userDetails.dateCng === false) {
            userDetails.dateCng = true
            navigate('/')
          }
          userDetails.dateFormats = dateFormats
          userDetails.dateFormats.dateTimeFormat = `${dateFormats.dateFormat} ${dateFormats.timeFormat}`
          localStorage.setItem('userData', JSON.stringify(userDetails))
        })
      })
      .catch(err => {
        if (err && err.response) {
          showErrorAlert(getErrorMessage(err))
        }
      })
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Row>
        {licenseDetails &&
          licenseDetails.map(item => {
            if (
              item.label === 'dateFormat' ||
              item.label === 'timeFormat' ||
              item.label === 'dateTimeFormat'
            ) {
              const [selectedOption] = item.options.filter(dates => {
                return dates.value === item.value
              })
              return (
                <Col lg={6} md={12} sm={12}>
                  <FormGroup>
                    <Label for={item.label}>{item.name}</Label>
                    <Select
                      isClearable={false}
                      theme={selectThemeColors}
                      defaultValue={{ value: item.value, label: selectedOption?.label }}
                      name={item.label}
                      id={item.label}
                      options={item.options}
                      className="react-select"
                      classNamePrefix="select"
                      onChange={e => selectHandler(e.value, item.label)}
                    />
                  </FormGroup>
                </Col>
              )
            } else {
              return (
                <Col lg={6} md={12} sm={12}>
                  <FormGroup>
                    <Label for={item.label}>{item.name}</Label>
                    <Input
                      name={item.label}
                      id={item.label}
                      type="text"
                      value={
                        item.label === 'activationDate' || item.label === 'expiryDate'
                          ? moment(item.value).format(dateFormats.dateFormat)
                          : item.value
                      }
                      disabled={true}
                    />
                  </FormGroup>
                </Col>
              )
            }
          })}
      </Row>
      <Row>
        <Col lg={12} md={12} sm={12}>
          <Button.Ripple type="submit" className="mr-1 sm-mb-1" color="primary">
            Save license
          </Button.Ripple>
          <Button.Ripple color="secondary" outline onClick={CancelForm}>
            Cancel
          </Button.Ripple>
        </Col>
      </Row>
    </Form>
  )
}

export default LicenseTabContent
