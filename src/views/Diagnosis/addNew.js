// ** React Imports
import { yupResolver } from '@hookform/resolvers/yup'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { Editor } from '@tinymce/tinymce-react'

import axios from 'axios'
import { toast } from 'react-toastify'
import { ToastContent, ToastContentForError } from '../../utils/toast'

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
import {
  showLoadingAlert,
  hideLoadingAlert,
  showErrorAlert,
  getErrorMessage,
} from '../../utils/alerts'
import { extractErrorMessage, handleAutoLogout } from '@utils'
import { STATUS_OPTIONS } from '../../utils/constants'

const AddNew = ({ addUser, open, handleModal, newUserId }) => {
  const editorRef = useRef(null)
  const navigate = useNavigate()

  // ** State
  const [form_data, setFormData] = useState({
    name: '',
    text: '',
    modality: '',
    status: '1',
  })
  const [modalityList, setModalityList] = useState([])

  // ** New user schema
  const NewSchema = yup.object().shape({
    name: yup
      .string('Name should be a string')
      .max(25, 'Name cannot be longer than 25 characters.')
      .required('Name is required!'),
    text: yup.string().required('layout text is required!'),
    modality: yup.string().required('modality is required!'),
    status: yup.string().optional(),
  })

  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm({ mode: 'onChange', resolver: yupResolver(NewSchema) })

  const inputHandler = (e) => {
    const name = e.target.name
    setFormData((prev) => {
      return { ...prev, [name]: e.target.value }
    })
  }

  useEffect(() => {
    const fetchModalityList = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/diagnosis/modality/list`
        )
        setModalityList(
          Array.isArray(res.data?.modality) ? res.data.modality : []
        )
      } catch (err) {
        console.error('Failed to fetch modality list:', err)
        setModalityList([]) // Ensure it's always an array
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
      }
    }
    fetchModalityList()
  }, [])

  const onSubmit = async (data) => {
    try {
      showLoadingAlert()
      data.status = form_data.status
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/diagnosis`,
        data
      )
      hideLoadingAlert()
      toast.success(
        <ToastContent message={res.data?.success?.message} type={'success'} />,
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
      navigate('/diagnosis')
    } catch (err) {
      hideLoadingAlert()
      showErrorAlert(getErrorMessage(err))
    }
  }

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
                Template Name <span style={{ color: '#FF0000' }}>*</span>
              </Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="name"
                    invalid={errors?.name && true}
                    placeholder="Template name"
                    onChange={(e) => {
                      field.onChange(e)
                      inputHandler(e)
                    }}
                  />
                )}
              />
              {errors?.name && (
                <FormFeedback>{errors.name.message}</FormFeedback>
              )}
            </FormGroup>

            <FormGroup>
              <Label for="modality">
                Modality <span style={{ color: '#FF0000' }}>*</span>
              </Label>
              <Controller
                name="modality"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="modality"
                    type="select"
                    invalid={errors?.modality && true}
                    onChange={(e) => {
                      field.onChange(e)
                      inputHandler(e)
                    }}
                  >
                    <option value="">Select Modality</option>
                    {Array.isArray(modalityList) &&
                      modalityList.map((modality) => {
                        return (
                          <option key={modality._id} value={modality._id}>
                            {' '}
                            {modality.name}{' '}
                          </option>
                        )
                      })}
                  </Input>
                )}
              />
              {errors?.modality && (
                <FormFeedback>{errors.modality.message}</FormFeedback>
              )}
            </FormGroup>

            <FormGroup>
              <Label for="text">
                Template <span style={{ color: '#FF0000' }}>*</span>
              </Label>
              <Controller
                name="text"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="hidden"
                    id="text"
                    invalid={errors?.text && true}
                  />
                )}
              />
              <Editor
                onInit={(evt, editor) => {
                  editorRef.current = editor
                }}
                onEditorChange={(content, editor) => {
                  handleAutoLogout()
                  setValue('text', content)
                }}
                init={{
                  height: 500,
                  menubar: true,
                  branding: false,
                  plugins: [
                    'advlist',
                    'autolink',
                    'lists',
                    'link',
                    'charmap',
                    'preview',
                    'anchor',
                    'searchreplace',
                    'visualblocks',
                    'code',
                    'insertdatetime',
                    'table',
                    'help',
                    'wordcount',
                  ],
                  toolbar:
                    'undo redo | formatselect | code ' +
                    'bold italic backcolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | help',
                  content_style:
                    'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                  placeholder: `Anything entered here will be added to the report layout chosen from the diagnosis template.`,
                  setup: (editor) => {
                    editor.on('keydown', (e) => {
                      handleAutoLogout()
                    })
                  },
                }}
              />

              {errors && errors.text && (
                <div>
                  <span className="is-invalid"></span>{' '}
                  <FormFeedback>{errors.text.message}</FormFeedback>
                </div>
              )}
            </FormGroup>

            <FormGroup>
              <Label for="status">
                Status <span style={{ color: '#FF0000' }}>*</span>
              </Label>
              <Controller
                name="status"
                control={control}
                defaultValue="1"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="status"
                    type="select"
                    invalid={errors?.status && true}
                    onChange={(e) => {
                      field.onChange(e)
                      inputHandler(e)
                    }}
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
                navigate('/diagnosis', { state: { tab: '1' } })
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
