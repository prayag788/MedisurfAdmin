// ** React Imports
import { yupResolver } from '@hookform/resolvers/yup'
import { Fragment, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { showLoadingAlert, hideLoadingAlert } from '../../../utils/alerts'
import { showToastSuccess, showToastError } from '../../../utils/toast'
import axios from 'axios'
import { toast } from 'react-toastify'
import Avatar from '@components/avatar'

// ** Third Party Components
import {
  Row,
  Col,
  Button,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
} from 'reactstrap'

import Breadcrumbs from '@components/breadcrumbs'

// ** Styles
import '@styles/react/libs/flatpickr/flatpickr.scss'
import { useNavigate } from 'react-router-dom'
import { Check, X } from 'react-feather'
import { STATUS_OPTIONS } from '../../../utils/constants'
import { extractErrorMessage } from '@utils'

const ToastContentForError = ({ message, type }) => (
  <>
    <div className="toastify-header">
      <div className="title-wrapper">
        <Avatar size="sm" color={'danger'} icon={<X size={12} />} />
        <h6 className="toast-title font-weight-bold">Error</h6>
      </div>
    </div>
    <div className="toastify-body">
      <span>{message}</span>
    </div>
  </>
)

const ToastContent = ({ message, type }) => (
  <>
    <div className="toastify-header">
      <div className="title-wrapper">
        <Avatar size="sm" color={'success'} icon={<Check size={12} />} />
        <h6 className="toast-title font-weight-bold">Success</h6>
      </div>
    </div>
    <div className="toastify-body">
      <span>{message}</span>
    </div>
  </>
)

const AddNew = ({ addUser, open, handleModal, newUserId }) => {
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
    trigger,
    watch,
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(NewSchema),
    defaultValues: {
      name: '',
      status: '1',
    },
  })

  const inputHandler = async (e) => {
    const name = e.target.name
    const value = e.target.value

    setFormData((prev) => {
      return { ...prev, [name]: value }
    })

    // Update react-hook-form value and trigger validation
    setValue(name, value)
    await trigger(name)
  }

  const onSubmit = async (data) => {
    try {
      showLoadingAlert()
      data.status = form_data.status
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/diagnosis/modality`,
        data
      )
      hideLoadingAlert()
      showToastSuccess(res.data?.success?.message)
      navigate('/diagnosis')
    } catch (err) {
      console.log(err)
      hideLoadingAlert()
      showToastError(extractErrorMessage(err?.response?.data ?? err))
    }
  }

  return (
    <Fragment>
      <Breadcrumbs
        breadCrumbTitle="Diagnosis"
        breadCrumbParent="Diagnosis Templates"
        breadCrumbActive="Modality"
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
                {...register('name')}
                invalid={!!errors?.name}
                placeholder="Modality"
                value={form_data.name}
                onChange={inputHandler}
              />
              {errors?.name && (
                <FormFeedback>{errors.name.message}</FormFeedback>
              )}
            </FormGroup>

            <FormGroup>
              <Label for="status">
                Status <span style={{ color: '#FF0000' }}>*</span>
              </Label>
              <Input
                id="status"
                name="status"
                type="select"
                {...register('status')}
                invalid={!!errors?.status}
                onChange={inputHandler}
                value={form_data.status}
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

export default AddNew
