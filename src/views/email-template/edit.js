// ** React Imports
import { yupResolver } from '@hookform/resolvers/yup'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { Editor } from '@tinymce/tinymce-react'

import axios from 'axios'
import { toast } from 'react-toastify'
import { ToastContent, ToastContentForError } from '../../utils/toast'
import { Button as MButton } from '@mui/material'
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
  CardHeader,
  CardTitle,
  CardBody,
  Card,
} from 'reactstrap'

import assignStudyTemplete from '@src/assets/template/email-template/assign-study-to-doctor'
import newUserTemplete from '@src/assets/template/email-template/new-user'
import shareStudyTemplete from '@src/assets/template/email-template/share-study'
import updateUserEmailTemplete from '@src/assets/template/email-template/update-user-email'
import forgotPasswordEmailTemplete from '@src/assets/template/email-template/forgot-password'

// ** Styles
import '@styles/react/libs/flatpickr/flatpickr.scss'
import { useNavigate, useParams } from 'react-router-dom'
import {
  showLoadingAlert,
  hideLoadingAlert,
  showErrorAlert,
  getErrorMessage,
} from '../../utils/alerts'

import { extractErrorMessage, handleAutoLogout } from '@utils'

const templateVariables = {
  'new-user': ['name', 'username', 'password', 'Log_in_URL', 'Website_URL'],
  'assign-study': [
    'doctor_name',
    'study_id',
    'Patient_name',
    'Patient_DOB',
    'Patient_ID',
    'Patient_sex',
    'Log_in_URL',
    'Website_URL',
  ],
  'share-study': [
    'hospital_name',
    'username',
    'doctor_name/patient_name',
    'Study_URL',
    'Password',
    'Study_URL_expiration_time',
    'QR_code',
    'Log_in_URL',
    'Website_URL',
  ],
  'update-user-email': [
    'name',
    'Log_in_URL',
    'username',
    'old_email',
    'updated_email',
    'Website_URL',
  ],
  'forgot-password': [
    'name',
    'username',
    'Password',
    'Website_URL',
    'Log_in_URL',
  ],
}

const EditRecord = (props) => {
  const { id } = useParams()
  const [editorText, setEditorText] = useState(null)
  const [editorValue, setEditorValue] = useState('')
  const [name, setName] = useState('')
  const [template, setTemplate] = useState('')

  const editorRef = useRef(null)
  const navigate = useNavigate()

  // ** State
  const [form_data, setFormData] = useState({
    name: '',
    text: '',
    subject: '',
  })

  // ** New user schema
  const NewSchema = yup.object().shape({
    name: yup
      .string('Name should be a string')
      .max(25, 'Name cannot be longer than 25 characters.')
      .required('Name is required!'),
    text: yup.string().required('layout text is required!'),
    subject: yup.string().required('Email subject is required!'),
  })

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    reset,
  } = useForm({ mode: 'onSubmit', resolver: yupResolver(NewSchema) })

  const inputHandler = (e) => {
    const name = e.target.name
    setFormData((prev) => {
      return { ...prev, [name]: e.target.value }
    })
  }

  const CancelForm = () => {
    navigate(-1)
  }
  const onSubmit = async (data) => {
    try {
      showLoadingAlert()
      const replace_url = `src="${process.env.REACT_APP_URL}api_static/`
      let text = data.text
      text = text.replace('src="../../api_static/', replace_url)
      text = text.replace('src="../api_static/', replace_url)
      text = text.replace('src="/api_static/', replace_url)
      text = text.replace('src="api_static/', replace_url)
      data.text = text

      data.name = id
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/email-template/update`,
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
      navigate('/email-template')
    } catch (err) {
      hideLoadingAlert()
      showErrorAlert(getErrorMessage(err))
    }
  }

  const handleVaribaleClick = (tag) => {
    const editor = editorRef.current
    editor.insertContent(`{{${tag}}}`)
  }
  const handleFileBrowse = (cb, value, meta) => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.onchange = async function (e) {
      const file = e.target.files[0]

      // try {

      // }
      const reader = new FileReader()
      reader.addEventListener('load', async () => {
        const id = `blobid-${file.name}`
        const blobCache = tinymce.activeEditor.editorUpload.blobCache
        const base64 = reader.result.split(',')[1]
        const blobInfo = blobCache.create(id, file, base64)
        blobCache.add(blobInfo)
        cb(blobInfo.blobUri(), { title: file.name })
      })
      reader.readAsDataURL(file)
    }
    input.click()
  }

  useEffect(() => {
    const fetchTemplateData = async () => {
      if (id) {
        try {
          const res = await axios.get(
            `${process.env.REACT_APP_API_URL}/email-template/${id}`
          )
          let templateName, templateString, templateSubject
          templateName = res?.data?.result?.name || id
          if (res.data.status && res?.data?.result !== null) {
            // Use values directly from API response
            templateName = res?.data?.result?.name || id
            templateString = res?.data?.result?.text
            templateSubject = res?.data?.result?.subject
            console.log('pppp ', templateName, templateString, templateSubject)
            // Set display name based on template type
            switch (templateName) {
              case 'share-study':
                setName('Share study')
                break
              case 'new-user':
                setName('New user registration')
                break
              case 'assign-study':
                setName('Assign study')
                break
              case 'update-user-email':
                setName("Update user's email")
                break
              case 'forgot-password':
                setName('Forgot password')
                break
              default:
                setName('Share study')
                break
            }
          } else {
            switch (templateName) {
              case 'share-study':
                setName('Share study')
                templateName = 'Share study'
                setTemplate(shareStudyTemplete)
                templateString = shareStudyTemplete
                templateSubject = `Shared a ${process.env.REACT_APP_INNER_NAME} study list`
                break
              case 'new-user':
                setName('New user registration')
                templateName = 'New user registration'
                setTemplate(newUserTemplete)
                templateString = newUserTemplete
                templateSubject = `New Registration - ${process.env.REACT_APP_INNER_NAME}`
                break
              case 'assign-study':
                setName('Assign study')
                templateName = 'Assign study'
                setTemplate(assignStudyTemplete)
                templateString = assignStudyTemplete
                templateSubject = 'Dicom study has been assigned to you'
                break
              case 'update-user-email':
                setName("Update user's email")
                templateName = 'Update user email'
                setTemplate(updateUserEmailTemplete)
                templateString = updateUserEmailTemplete
                templateSubject = 'Profile update'
                break
              case 'forgot-password':
                setName('Forgot password')
                templateName = 'Forgot password'
                setTemplate(forgotPasswordEmailTemplete)
                templateString = forgotPasswordEmailTemplete

                templateSubject = `Reset password request - ${process.env.REACT_APP_INNER_NAME}`
                break
              default:
                setName('Share study')
                templateName = 'Share study'
                setTemplate(shareStudyTemplete)
                templateString = shareStudyTemplete
                templateSubject = `Shared a ${process.env.REACT_APP_INNER_NAME} study list`
                break
            }
          }
          // Reset form with new values
          reset({
            name: templateName,
            subject: templateSubject,
            text: templateString,
          })

          setFormData({
            name: templateName,
            text: templateString,
            subject: templateSubject,
          })
          setEditorText(templateString)
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

          navigate('/email-template')
        }
      }
    }
    fetchTemplateData()
  }, [id])

  return (
    <Fragment>
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
                value={form_data.name}
                onChange={(e) => {
                  inputHandler(e)
                  setValue('name', e.target.value)
                }}
              />
              {errors?.name && (
                <FormFeedback>{errors.name.message}</FormFeedback>
              )}
            </FormGroup>

            <FormGroup>
              <Label for="subject">
                Email subject <span style={{ color: '#FF0000' }}>*</span>
              </Label>
              <Input
                name="subject"
                id="subject"
                {...register('subject', { required: true })}
                invalid={errors?.subject && true}
                placeholder="Email subject"
                value={form_data.subject}
                onChange={(e) => {
                  inputHandler(e)
                  setValue('subject', e.target.value)
                }}
              />
              {errors?.subject && (
                <FormFeedback>{errors.subject.message}</FormFeedback>
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
                    setValue('text', content, { shouldValidate: true })
                    setEditorText(content)
                  }}
                  init={{
                    file_picker_type: 'image',
                    file_picker_callback: handleFileBrowse,
                    images_replace_base64: false,
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
                      'image',
                    ],
                    toolbar:
                      'undo redo | formatselect | code ' +
                      'bold italic backcolor | alignleft aligncenter ' +
                      'alignright alignjustify | bullist numlist outdent indent | ' +
                      'removeformat | help | image',
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

              {errors?.text && (
                <div>
                  <span className="is-invalid"></span>{' '}
                  <FormFeedback>{errors.text.message}</FormFeedback>
                </div>
              )}
            </FormGroup>

            <Button.Ripple
              type="submit"
              className="mr-1 sm-mb-1"
              color="primary"
            >
              Save
            </Button.Ripple>
            <Button.Ripple color="secondary" outline onClick={CancelForm}>
              Cancel
            </Button.Ripple>
          </Form>
        </Col>
        <Col sm="12" md="6" lg="6">
          <Card>
            <CardHeader className="border-bottom">
              <CardTitle tag="h4">Template Variables</CardTitle>
            </CardHeader>

            <CardBody>
              <Row className="mt-1 mb-50 pb-2 border-bottom">
                <Col>
                  If you want to add dynamic values to the template, please use
                  the variables below. Click on a variable to add it to the
                  template.
                </Col>
              </Row>
              <Row className="mt-1 mb-50">
                {templateVariables[id]?.map((variable) => {
                  return (
                    <Col className="mt-1 mb-1">
                      <MButton
                        variant="tonal"
                        onClick={() => handleVaribaleClick(variable)}
                        type="button"
                      >
                        {variable}
                      </MButton>
                    </Col>
                  )
                })}
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Fragment>
  )
}

export default EditRecord
