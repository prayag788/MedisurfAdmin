// ** React Imports
import fontawesome from '@fortawesome/fontawesome'
import { faAsterisk } from '@fortawesome/fontawesome-free-solid'
// ** Third Party Components
import { X } from 'react-feather'
import { Modal, ModalHeader, ModalBody } from 'reactstrap'

// ** Styles
import '@styles/react/libs/flatpickr/flatpickr.scss'

fontawesome.library.add(faAsterisk)

const WorkSheetModal = ({ handleWorksheetModal }) => {
  // ** Custom close btn
  const CloseBtn = <X className="cursor-pointer" size={15} onClick={handleWorksheetModal} />

  return (
    <Modal
      isOpen={open}
      toggle={handleWorksheetModal}
      className="sidebar-sm sm-w-100"
      modalClassName="modal-slide-in"
      contentClassName="pt-0"
    >
      <ModalHeader className="mb-2" toggle={handleWorksheetModal} close={CloseBtn} tag="div">
        <h5 className="modal-title">Worksheet</h5>
      </ModalHeader>
      <ModalBody className="flex-grow-1"></ModalBody>
    </Modal>
  )
}

export default WorkSheetModal
