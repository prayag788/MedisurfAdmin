// ** React Imports
import { yupResolver } from '@hookform/resolvers/yup'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { Editor } from '@tinymce/tinymce-react'

import axios from 'axios'
import { toast } from 'react-toastify'
import { ToastContent, ToastContentForError } from '../../utils/toast'
import { Button as MButton, FormGroup as FormGroupMui } from '@mui/material'
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

import Breadcrumbs from '@components/breadcrumbs'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import StandardTemplete from '@src/assets/template/standard'
import ClassicTemplete from '@src/assets/template/classic'
import TemplatePreview from './TemplatePreview'

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
import { STATUS_OPTIONS } from '../../utils/constants'

const EditRecord = props => {
  const { id } = useParams()
  const [editorText, setEditorText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [editorValue, setEditorValue] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewText, setPreviewText] = useState('')

  const editorRef = useRef(null)
  const navigate = useNavigate()

  const [form_data, setFormData] = useState({
    name: '',
    text: '',
    status: '1',
    default: false,
  })

  const NewSchema = yup.object().shape({
    name: yup
      .string('Name should be a string')
      .max(25, 'Name cannot be longer than 25 characters.')
      .required('Name is required!'),
    text: yup.string().required('layout text is required!'),
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
      if (e.target.name === 'default') {
        return { ...prev, [name]: e.target.checked }
      }
      return { ...prev, [name]: e.target.value }
    })
  }

  const CancelForm = () => {
    navigate(-1)
  }

  const showTemplatePreview = () => {
    const templatePreview = editorRef.current.getContent()
    setPreviewOpen(true)
    setPreviewText(templatePreview)
  }

  const onSubmit = async data => {
    data.default = form_data.default
    try {
      showLoadingAlert()

      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/report-template/update/${id}`,
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
      navigate('/report-template')
    } catch (err) {
      hideLoadingAlert()
      showErrorAlert(getErrorMessage(err))
    }
  }

  const handleVaribaleClick = tag => {
    const editor = editorRef.current
    editor.insertContent(`{{${tag}}}`)
  }

  const handleSampleReportChange = report => {
    if (report !== '') {
      let content = StandardTemplete
      if (report === 'classic') {
        content = ClassicTemplete
      }

      editorRef.current.setContent(content)
    }
  }

  const handleFileBrowse = (cb, value, meta) => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.onchange = async function (e) {
      const file = e.target.files[0]

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
        setIsLoading(true)
        try {
          const res = await axios.get(
            `${process.env.REACT_APP_API_URL}/report-template/detail/${id}`
          )

          if (res.data?.result) {
            const templateData = res.data.result

            setValue('name', templateData.name || '')
            setValue('text', templateData.text || '')
            setValue('status', templateData.status || '1')
            setValue('default', templateData.default || false)

            setFormData({
              name: templateData.name || '',
              text: templateData.text || '',
              status: templateData.status || '1',
              default: templateData.default || false,
            })

            setEditorText(templateData.text || '')

            if (editorRef.current) {
              editorRef.current.setContent(templateData.text || '')
            }
          } else {
            throw new Error('Template data not found')
          }
        } catch (err) {
          console.error('Error fetching template:', err)
          toast.error(
            <ToastContentForError
              message={
                extractErrorMessage(err?.response?.data ?? err, 'Failed to load template')
              }
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

          navigate('/report-template')
        } finally {
          setIsLoading(false)
        }
      }
    }
    fetchTemplateData()
  }, [id, setValue, navigate])

  useEffect(() => {
    if (editorText) {
      setValue('text', editorText)
    }
  }, [editorText, setValue])

  return (
    <Fragment>
      <Breadcrumbs
        breadCrumbTitle="Report template"
        breadCrumbParent="Report Template"
        breadCrumbActive="Edit"
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
                value={form_data.name}
                onChange={inputHandler}
              />
              {errors?.name && <FormFeedback>{errors.name.message}</FormFeedback>}
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
              {!isLoading && (
                <Editor
                  key={`editor-${id}-${editorText ? 'loaded' : 'empty'}`}
                  onInit={(evt, editor) => {
                    if (editor) {
                      editorRef.current = editor
                      if (editorText) {
                        editor.setContent(editorText)
                      }
                    }
                  }}
                  value={editorText}
                  onEditorChange={(content, editor) => {
                    if (editor && content !== undefined) {
                      handleAutoLogout()
                      setValue('text', content)
                      setEditorText(content)
                    }
                  }}
                  init={{
                    file_picker_type: 'image',
                    file_picker_callback: handleFileBrowse,
                    images_replace_base64: true,
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
                    setup: editor => {
                      editor.on('keydown', e => {
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

            <FormGroupMui row>
              <FormControlLabel
                label="Mark as default"
                control={
                  <Checkbox
                    {...register('default', { required: true })}
                    checked={form_data.default}
                    onChange={inputHandler}
                    id="default"
                    name="default"
                    color="primary"
                  />
                }
              />
            </FormGroupMui>

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
                value={form_data.status}
                onChange={inputHandler}
              >
                {STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Input>
              {errors?.status && <FormFeedback>{errors.status.message}</FormFeedback>}
            </FormGroup>

            <Button.Ripple type="submit" className="mr-1 sm-mb-1" color="primary">
              Save
            </Button.Ripple>
            <Button.Ripple className="mr-1 sm-mb-1" color="info" onClick={showTemplatePreview}>
              Preview
            </Button.Ripple>
            <Button.Ripple color="secondary" outline onClick={CancelForm}>
              Cancel
            </Button.Ripple>
          </Form>
        </Col>
        <Col sm="12" md="6" lg="6">
          <Card>
            <CardHeader className="border-bottom">
              <CardTitle tag="h4">Default Sample Templates</CardTitle>
            </CardHeader>

            <CardBody>
              <Row className="mt-1 mb-50 pb-2 border-bottom">
                <Col>
                  <Label for="sample_template">Sample Template</Label>
                  <Input
                    id="sample_template"
                    name="sample_template"
                    type="select"
                    onChange={e => handleSampleReportChange(e.target.value)}
                  >
                    <option value="">Select Sample Template</option>
                    <option value="standard"> Standard </option>
                    <option value="classic"> Classic </option>
                  </Input>
                </Col>
              </Row>
            </CardBody>

            <CardHeader className="border-bottom">
              <CardTitle tag="h4">Template Variables</CardTitle>
            </CardHeader>

            <CardBody>
              <Row className="mt-1 mb-50 pb-2 border-bottom">
                <Col>
                  If you want to add dynamic values to the template, please use the variables below.
                  Click on a variable to add it to the template.
                </Col>
              </Row>
              <Row className="mt-1 mb-50">
                <Col className="mt-1 mb-1">
                  <MButton
                    variant="tonal"
                    onClick={() => handleVaribaleClick('patient_name')}
                    type="button"
                  >
                    patient_name
                  </MButton>
                </Col>
                <Col className="mt-1 mb-1">
                  <MButton
                    variant="tonal"
                    onClick={() => handleVaribaleClick('patient_ID')}
                    type="button"
                  >
                    patient_ID
                  </MButton>
                </Col>
                <Col className="mt-1 mb-1">
                  <MButton
                    variant="tonal"
                    onClick={() => handleVaribaleClick('patient_DOB')}
                    type="button"
                  >
                    patient_DOB
                  </MButton>
                </Col>
                <Col className="mt-1 mb-1">
                  <MButton
                    variant="tonal"
                    onClick={() => handleVaribaleClick('patient_age')}
                    type="button"
                  >
                    patient_age
                  </MButton>
                </Col>
                <Col className="mt-1 mb-1">
                  <MButton
                    variant="tonal"
                    onClick={() => handleVaribaleClick('patient_sex')}
                    type="button"
                  >
                    patient_sex
                  </MButton>
                </Col>
                <Col className="mt-1 mb-1">
                  <MButton
                    variant="tonal"
                    onClick={() => handleVaribaleClick('location')}
                    type="button"
                  >
                    location
                  </MButton>
                </Col>
                <Col className="mt-1 mb-1">
                  <MButton
                    variant="tonal"
                    onClick={() => handleVaribaleClick('study_type')}
                    type="button"
                  >
                    study_type
                  </MButton>
                </Col>
                <Col className="mt-1 mb-1">
                  <MButton
                    variant="tonal"
                    onClick={() => handleVaribaleClick('study_date')}
                    type="button"
                  >
                    study_date
                  </MButton>
                </Col>
                <Col className="mt-1 mb-1">
                  <MButton
                    variant="tonal"
                    onClick={() => handleVaribaleClick('service_date')}
                    type="button"
                  >
                    service_date
                  </MButton>
                </Col>
                <Col className="mt-1 mb-1">
                  <MButton
                    variant="tonal"
                    onClick={() => handleVaribaleClick('exam_description')}
                    type="button"
                    title="Study/Exam description (from edit dialog)"
                  >
                    exam_description
                  </MButton>
                </Col>
                <Col className="mt-1 mb-1">
                  <MButton
                    variant="tonal"
                    onClick={() => handleVaribaleClick('study_description')}
                    type="button"
                    title="Same as exam_description – Study Description from edit"
                  >
                    study_description
                  </MButton>
                </Col>
                <Col className="mt-1 mb-1">
                  <MButton
                    variant="tonal"
                    onClick={() => handleVaribaleClick('referring_physician')}
                    type="button"
                  >
                    referring_physician
                  </MButton>
                </Col>
                <Col className="mt-1 mb-1">
                  <MButton
                    variant="tonal"
                    onClick={() => handleVaribaleClick('attendant')}
                    type="button"
                  >
                    attendant
                  </MButton>
                </Col>
                <Col className="mt-1 mb-1">
                  <MButton
                    variant="tonal"
                    onClick={() => handleVaribaleClick('radiologist')}
                    type="button"
                  >
                    radiologist
                  </MButton>
                </Col>
                <Col className="mt-1 mb-1">
                  <MButton
                    variant="tonal"
                    onClick={() => handleVaribaleClick('title_of_report')}
                    type="button"
                    title="Report title / Reason for Exam"
                  >
                    title_of_report
                  </MButton>
                </Col>
                <Col className="mt-1 mb-1">
                  <MButton
                    variant="tonal"
                    onClick={() => handleVaribaleClick('radiologist_diagnosis')}
                    type="button"
                  >
                    radiologist_diagnosis
                  </MButton>
                </Col>
                <Col className="mt-1 mb-1">
                  <MButton
                    variant="tonal"
                    onClick={() => handleVaribaleClick('report_addendum')}
                    type="button"
                  >
                    report_addendum
                  </MButton>
                </Col>
                <Col className="mt-1 mb-1">
                  <MButton
                    variant="tonal"
                    onClick={() => handleVaribaleClick('dicom_images')}
                    type="button"
                  >
                    dicom_images
                  </MButton>
                </Col>
                <Col className="mt-1 mb-1">
                  <MButton
                    variant="tonal"
                    onClick={() => handleVaribaleClick('electronic_sign')}
                    type="button"
                  >
                    electronic_sign
                  </MButton>
                </Col>
                <Col className="mt-1 mb-1">
                  <MButton
                    variant="tonal"
                    onClick={() => handleVaribaleClick('Log_in_URL')}
                    type="button"
                  >
                    Log_in_URL
                  </MButton>
                </Col>
                <Col className="mt-1 mb-1">
                  <MButton
                    variant="tonal"
                    onClick={() => handleVaribaleClick('Website_URL')}
                    type="button"
                  >
                    Website_URL
                  </MButton>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <TemplatePreview
        previewOpen={previewOpen}
        setPreviewOpen={setPreviewOpen}
        previewText={previewText}
      />
    </Fragment>
  )
}

export { EditRecord }
export default EditRecord
