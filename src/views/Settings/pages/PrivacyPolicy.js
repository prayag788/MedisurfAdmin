import { Fragment, useState, useEffect, useRef } from 'react'
import { Row, Col, Card, CardBody, CardTitle, CardHeader, Button } from 'reactstrap'
import { Editor } from '@tinymce/tinymce-react'

import '@styles/react/libs/editor/editor.scss'
import axios from 'axios'
import { handleAutoLogout } from '@utils'
import { showErrorAlert, showSuccessAlert, getErrorMessage } from '../../../utils/alerts'
export default () => {
  const [value, setValue] = useState('<p>Enter your privacy policy here...</p>')
  const [isLoaded, setIsLoaded] = useState(false)
  const editorRef = useRef(null)
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    axios
      .get(`${process.env.REACT_APP_API_URL}/policy/Privacy-Policy`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(doc => {
        // Handle both response formats: {policy: {...}} or direct policy object
        const policyData = doc?.data?.policy || doc?.data
        if (policyData && policyData.markup) {
          setValue(policyData.markup)
        }
        setIsLoaded(true)
      })
      .catch(err => {
        console.error('Error loading privacy policy:', err)
        setIsLoaded(true)
      })
  }, [])

  const onSubmit = () => {
    const content = editorRef.current?.getContent() || value
    const token = localStorage.getItem('accessToken')
    axios
      .patch(
        `${process.env.REACT_APP_API_URL}/policy/Privacy-Policy`,
        {
          markup: content,
          content,
          name: 'Privacy Policy',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(doc => {
        showSuccessAlert('Privacy Policy Updated Successfully!')
      })
      .catch(err => {
        if (err?.response) {
          showErrorAlert(getErrorMessage(err))
        }
      })
  }

  return (
    <Fragment>
      <Row>
        <Col sm={12}>
          <Card>
            <CardHeader className="flex-md-row flex-column align-md-items-center align-items-center border-bottom">
              <CardTitle tag="h4">Privacy Policy</CardTitle>
              <div className="d-flex mt-md-0 mt-1">
                <Button color="primary" onClick={onSubmit}>
                  <span className="align-middle">Save Changes</span>
                </Button>
              </div>
            </CardHeader>
            <CardBody className="pt-2">
              {isLoaded && (
                <Editor
                  onInit={(evt, editor) => {
                    editorRef.current = editor
                  }}
                  initialValue={value}
                  onEditorChange={(content, editor) => {
                    handleAutoLogout()
                    // Don't call setValue to prevent cursor jumping
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
                    placeholder: `Enter your privacy policy here...`,
                    setup: editor => {
                      editor.on('keydown', e => {
                        handleAutoLogout()
                      })
                    },
                  }}
                />
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Fragment>
  )
}
