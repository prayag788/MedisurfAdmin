import { useRef, useState } from 'react'
import {
  Form,
  Card,
  CardHeader,
  Spinner,
  CardTitle,
  CardBody,
  FormGroup,
  Input,
  Button,
  Row,
  Col,
} from 'reactstrap'
import axios from 'axios'
import {
  showInfoAlert,
  showSuccessAlert,
  showErrorAlert,
  getErrorMessage,
} from '../../utils/alerts'

const InputFile = () => {
  const [image, setImage] = useState()
  const [fileUploading, setFileUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, percent: 0 })
  const fileInputRef = useRef()

  const onSubmit = async e => {
    e.preventDefault()
    if (!image || !image.file.length) {
      showInfoAlert('Select a file please!')
      return
    }

    const files = image.file
    setFileUploading(true)
    setUploadProgress({ current: 0, total: files.length, percent: 0 })

    try {
      const results = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setUploadProgress(prev => ({ ...prev, current: i + 1, percent: 0 }))
        const formdata = new FormData()
        formdata.append('binary-data', file)

        try {
          const res = await axios.post(
            `${process.env.REACT_APP_API_URL}/orthanc/instances`,
            formdata,
            {
              headers: { 'Content-Type': 'multipart/form-data' },
              timeout: 0,
              onUploadProgress: ev => {
                if (ev.total) {
                  const percent = Math.round((ev.loaded / ev.total) * 100)
                  setUploadProgress(prev => ({ ...prev, percent }))
                }
              },
            }
          )
          results.push({ file: file.name, success: res.data?.success, response: res.data })
        } catch (err) {
          results.push({ file: file.name, success: false, error: getErrorMessage(err) })
        }
      }

      const failed = results.filter(r => !r.success)
      const succeeded = results.filter(r => r.success)

      if (succeeded.length) {
        showSuccessAlert(`${succeeded.length} file(s) uploaded successfully!`)
      }
      if (failed.length) {
        const failedList = failed.map(f => `${f.file} (${f.error || 'failed'})`).join(', ')
        showErrorAlert(`Some files failed: ${failedList}`)
      }

      // Reset input only if all files succeeded
      if (failed.length === 0) {
        document.getElementById('inputFile').value = ''
        setImage('')
      }
    } catch (error) {
      showErrorAlert(getErrorMessage(error))
    } finally {
      setFileUploading(false)
      setUploadProgress({ current: 0, total: 0, percent: 0 })
    }
  }

  const imageHandler = e => {
    const files = Array.from(e.target.files)
    setImage({ file: files })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle tag="h4">Dicom file upload</CardTitle>
      </CardHeader>
      <CardBody>
        <Form onSubmit={onSubmit}>
          <Row>
            <Col md="6" sm="12">
              <FormGroup>
                <Input
                  type="file"
                  ref={fileInputRef}
                  id="inputFile"
                  onClick={() => {
                    document.getElementById('inputFile').value = ''
                    setImage('')
                  }}
                  onChange={imageHandler}
                  accept="image/dicom,.dcm,.zip"
                />
              </FormGroup>
            </Col>
            <Col md="12" sm="12" className="mt-1">
              <Button
                color="primary"
                type="submit"
                disabled={fileUploading}
                className="d-flex align-items-center"
              >
                {!fileUploading ? 'Upload Image File' : <Spinner color="white" size="sm" />}
                {fileUploading && (
                  <p className="ml-50 mb-0">
                    {uploadProgress.total > 1
                      ? `Uploading file ${uploadProgress.current} of ${uploadProgress.total}`
                      : 'Uploading'}
                    {uploadProgress.percent > 0 ? ` (${uploadProgress.percent}%)` : ''}
                  </p>
                )}
              </Button>
            </Col>
          </Row>
        </Form>
      </CardBody>
    </Card>
  )
}

export default InputFile
