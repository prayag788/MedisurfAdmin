// ** React Imports
import { yupResolver } from '@hookform/resolvers/yup'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
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

const EditRecord = (props) => {
  const [id] = useState(props?.match?.params?.id)
  const [editorText, setEditorText] = useState(null)

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
  const [selectedModality, setSelectedModality] = useState()

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
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    getValue,
  } = useForm({ mode: 'onSubmit', resolver: yupResolver(NewSchema) })

  const inputHandler = (e) => {
    const name = e.target.name
    setFormData((prev) => {
      return { ...prev, [name]: e.target.value }
    })
  }
  useEffect(() => {
    if (form_data?.modality) {
      const exists = modalityList.some((obj) => {
        return obj._id === form_data?.modality
      })
      if (!exists) {
        if (selectedModality?._id === form_data.modality) {
          setModalityList((prev) => [
            { _id: selectedModality?._id, name: selectedModality?.name },
            ...prev,
          ])
        }
      }
    }
  }, [form_data])

  const onSubmit = async (data) => {
    try {
      showLoadingAlert()
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/diagnosis/update/${id}`,
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

  useEffect(() => {
    const fetchModalityList = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/diagnosis/modality/list`
        )
        setModalityList(res.data?.modality)
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

        navigate('/diagnosis')
      }
    }
    fetchModalityList()
  }, [])

  useEffect(() => {
    const fetchDiagnosisDetail = async () => {
      if (id) {
        try {
          const res = await axios.get(
            `${process.env.REACT_APP_API_URL}/diagnosis/detail/${id}`
          )
          setValue('name', res.data?.result?.name)
          setValue('text', res.data?.result?.text)
          setValue('status', res.data?.result?.status)
          setValue('modality', res.data?.result?.modality?._id)
          setSelectedModality(res.data?.result?.modality)
          setFormData({
            ...form_data,
            status: res.data?.result?.status,
            modality: res.data?.result?.modality?._id,
          })
          setEditorText(res.data?.result?.text)
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

          navigate('/diagnosis')
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
                Template Name <span style={{ color: '#FF0000' }}>*</span>
              </Label>
              <Input
                name="name"
                id="name"
                {...register('name', { required: true })}
                invalid={errors?.name && true}
                placeholder="Template name"
                onChange={inputHandler}
              />
              {errors?.name && (
                <FormFeedback>{errors.name.message}</FormFeedback>
              )}
            </FormGroup>

            <FormGroup>
              <Label for="modality">
                Modality <span style={{ color: '#FF0000' }}>*</span>
              </Label>
              <Input
                name="modality"
                id="modality"
                type="select"
                {...register('modality', { required: true })}
                invalid={errors?.modality && true}
                placeholder="Modality"
                onChange={inputHandler}
                value={form_data?.modality || ''}
              >
                {modalityList &&
                  modalityList.map((modality) => {
                    return (
                      <option key={modality._id} value={modality._id}>
                        {' '}
                        {modality.name}{' '}
                      </option>
                    )
                  })}
              </Input>
              {errors?.modality && (
                <FormFeedback>{errors.modality.message}</FormFeedback>
              )}
            </FormGroup>

            <FormGroup>
              <Label for="text">
                Template <span style={{ color: '#FF0000' }}>*</span>
              </Label>
              <Input
                name="text"
                type="hidden"
                id="text"
                {...register('text', { required: true })}
                invalid={errors?.text && true}
                onChange={inputHandler}
              />
              {editorText && (
                <Editor
                  onInit={(evt, editor) => {
                    editorRef.current = editor
                  }}
                  value={editorText}
                  onEditorChange={(content, editor) => {
                    handleAutoLogout()
                    setValue('text', content)
                    setEditorText(content)
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
              )}

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
              <Input
                id="status"
                name="status"
                type="select"
                {...register('status')}
                invalid={errors?.status && true}
                value={form_data.status}
                onChange={inputHandler}
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

export default EditRecord
