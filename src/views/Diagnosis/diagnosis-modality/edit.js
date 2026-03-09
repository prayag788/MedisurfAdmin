// ** React Imports
import { yupResolver } from '@hookform/resolvers/yup'
import { Fragment, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'

import axios from 'axios'
import { toast } from 'react-toastify'
import { ToastContent, ToastContentForError } from '../../../utils/toast'
// ** Third Party Components
import { Row, Col, Button, Form, FormFeedback, FormGroup, Input, Label } from 'reactstrap'

import Breadcrumbs from '@components/breadcrumbs'

// ** Styles
import '@styles/react/libs/flatpickr/flatpickr.scss'
import { useNavigate } from 'react-router-dom'
import {
  showLoadingAlert,
  hideLoadingAlert,
  showErrorAlert,
  getErrorMessage,
} from '../../../utils/alerts'
import { STATUS_OPTIONS } from '../../../utils/constants'
import { extractErrorMessage } from '@utils'

const EditRecord = props => {
  const [id] = useState(props?.match?.params?.id)

  const navigate = useNavigate()

  // ** State
  const [form_data, setFormData] = useState({
    name: '',
    status: '1',
  })

  // ** New user schema
  const NewSchema = yup.object().shape({
    name: yup
      .string('Name should be a string')
      .max(25, 'Name cannot be longer than 25 characters.')
      .required('Name is required!'),
  })

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    getValue,
  } = useForm({ mode: 'onSubmit', resolver: yupResolver(NewSchema) })

  const inputHandler = e => {
    const name = e.target.name
    setFormData(prev => {
      return { ...prev, [name]: e.target.value }
    })
  }

  const onSubmit = async data => {
    try {
      showLoadingAlert()
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/diagnosis/modality/update/${id}`,
        data
      )
      hideLoadingAlert()

      toast.success(<ToastContent message={res.data?.success?.message} type={'success'} />, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      navigate('/diagnosis', { state: { tab: '2' } })
    } catch (err) {
      hideLoadingAlert()
      showErrorAlert(getErrorMessage(err))
    }
  }

  useEffect(() => {
    const fetchDiagnosisDetail = async () => {
      if (id) {
        try {
          const res = await axios.get(
            `${process.env.REACT_APP_API_URL}/diagnosis/modality/detail/${id}`
          )
          setValue('name', res.data?.result?.name)
          setValue('status', res.data?.result?.status ? '1' : '0')
          setFormData({
            ...form_data,
            status: res.data?.result?.status ? '1' : '0',
          })
        } catch (err) {
          toast.error(
            <ToastContentForError
              message={extractErrorMessage(err?.response?.data ?? err)}
              type={'error'}
            />,
            {
              position: 'top-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            }
          )

          navigate('/diagnosis', { state: { tab: '2' } })
        }
      }
    }
    fetchDiagnosisDetail()
  }, [id])

  return (
    <Fragment>
      <Breadcrumbs
        breadCrumbTitle="Diagnosis"
        breadCrumbParent="Diagnosis Templates"
        breadCrumbActive="List"
      />
      <Row>
        <Col sm="12" md="6" lg="6">
          <Form onSubmit={handleSubmit(onSubmit)}>
            <FormGroup>
              <Label for="name">
                Modality <span style={{ color: '#FF0000' }}>*</span>
              </Label>
              <Input
                name="name"
                id="name"
                {...register('name', { required: true })}
                invalid={errors?.name && true}
                placeholder="Modality"
                onChange={inputHandler}
              />
              {errors?.name && <FormFeedback>{errors.name.message}</FormFeedback>}
            </FormGroup>

            <FormGroup>
              <Label for="status">
                Status <span style={{ color: '#FF0000' }}>*</span>
              </Label>
              <Input
                id="status"
                name="status"
                type="select"
                {...register('status', { required: true })}
                invalid={errors?.status && true}
                onChange={inputHandler}
                value={form_data.status}
              >
                {STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Input>
              {errors?.status && <FormFeedback>{errors.status.message}</FormFeedback>}
            </FormGroup>
            <Button color="primary" type="submit">
              Save
            </Button>
            <Button
              color="secondary ml-1"
              outline
              onClick={() => {
                navigate('/diagnosis', { state: { tab: '2' } })
              }}
            >
              Cancel
            </Button>
          </Form>
        </Col>
      </Row>
    </Fragment>
  )
}

export default EditRecord
