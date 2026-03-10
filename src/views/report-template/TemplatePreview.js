import parse from 'html-react-parser'

// ** Third Party Components
import { Row, Modal, ModalHeader, ModalBody } from 'reactstrap'
import { X } from 'react-feather'

const TemplatePreview = (props) => {
  const { previewText, previewOpen, setPreviewOpen } = props

  const renderPreviewContent = () => {
    try {
      if (!previewText || previewText.trim() === '') {
        return <div className="text-muted">No template content to preview</div>
      }
      return parse(previewText)
    } catch (error) {
      console.error('Error parsing template content:', error)
      return <div className="text-danger">Error rendering template preview</div>
    }
  }

  return (
    <>
      <Modal
        isOpen={previewOpen}
        toggle={() => setPreviewOpen(!previewOpen)}
        className="report-template-preview"
        size="lg"
      >
        <ModalHeader
          className="mb-2"
          close={
            <X
              className="cursor-pointer"
              size={15}
              onClick={() => setPreviewOpen(false)}
            />
          }
          tag="div"
        >
          <h5 className="modal-title">Preview Template</h5>
        </ModalHeader>
        <ModalBody>
          <Row className="ml-1 mr-1 overflowx-scroll">
            <div className="w-100">{renderPreviewContent()}</div>
          </Row>
        </ModalBody>
      </Modal>
    </>
  )
}

export default TemplatePreview
