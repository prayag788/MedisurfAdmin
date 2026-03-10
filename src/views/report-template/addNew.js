// ** React Imports
import { yupResolver } from '@hookform/resolvers/yup'
import { extractErrorMessage, handleAutoLogout } from '@utils'
import { STATUS_OPTIONS } from '../../utils/constants'
import { Fragment, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { Editor } from '@tinymce/tinymce-react'
import { showLoadingAlert, hideLoadingAlert } from '../../utils/alerts'
import { showToastSuccess, showToastError } from '../../utils/toast'
import axios from 'axios'
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

// ** Styles
import '@styles/react/libs/flatpickr/flatpickr.scss'
import { useNavigate } from 'react-router-dom'

import StandardTemplete from '@src/assets/template/standard'
import ClassicTemplete from '@src/assets/template/classic'
import TemplatePreview from './TemplatePreview'

const AddNew = ({ addUser, open, handleModal, newUserId }) => {
  const editorRef = useRef(null)
  const navigate = useNavigate()

  const [form_data, setFormData] = useState({
    name: '',
    text: '',
    status: '1',
    default: false,
  })
  const [editorValue, setEditorValue] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewText, setPreviewText] = useState('')

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
    clearErrors,
  } = useForm({ mode: 'onSubmit', resolver: yupResolver(NewSchema) })

  const inputHandler = (e) => {
    const name = e.target.name
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value

    setFormData((prev) => ({ ...prev, [name]: value }))

    if (value && value.toString().trim()) {
      clearErrors(name)
    }
  }

  const showTemplatePreview = () => {
    const templatePreview = editorRef.current.getContent()
    setPreviewOpen(true)
    setPreviewText(templatePreview)
  }

  const onSubmit = async (data) => {
    try {
      showLoadingAlert()
      data.status = form_data.status
      data.default = form_data.default
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/report-template`,
        data
      )
      hideLoadingAlert()
      showToastSuccess(res.data?.success?.message)
      navigate('/report-template')
    } catch (err) {
      console.log(err)
      hideLoadingAlert()
      showToastError(extractErrorMessage(err?.response?.data ?? err))
    }
  }

  const handleVaribaleClick = (tag) => {
    const editor = editorRef.current
    editor.insertContent(`{{${tag}}}`)
  }

  const handleSampleReportChange = (report) => {
    let content = StandardTemplete
    if (report === 'classic') {
      content = ClassicTemplete
    }
    editorRef.current.setContent(content)
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

  return (
    <Fragment>
      <Breadcrumbs
        breadCrumbTitle="Report template"
        breadCrumbParent="Report Template"
        breadCrumbActive="Add"
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

              {errors?.name && (
                <FormFeedback>{errors.name.message}</FormFeedback>
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

              <Editor
                onInit={(evt, editor) => {
                  editorRef.current = editor
                }}
                value={editorValue || StandardTemplete}
                onEditorChange={(content, editor) => {
                  handleAutoLogout()
                  setEditorValue(content)
                  setValue('text', content)
                  if (content && content.trim()) {
                    clearErrors('text')
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
                  placeholder: `Anything entered here will be added to the report layout chosen from the report template.`,
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
            <Button color="primary" type="submit" className="mr-1 sm-mb-1">
              Submit
            </Button>
            <Button.Ripple
              className="mr-1 sm-mb-1"
              color="info"
              onClick={showTemplatePreview}
            >
              Preview
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
                    onChange={(e) => handleSampleReportChange(e.target.value)}
                  >
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
                  If you want to add dynamic values to the template, please use
                  the variables below. Click on a variable to add it to the
                  template.{' '}
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

export default AddNew
