import { Modal, ModalHeader, ModalBody } from 'reactstrap'
import { ChevronDown } from 'react-feather'
import DataTable from 'react-data-table-component'
import moment from 'moment'

const EmailIdOfSharedStudyModel = ({
  toggle,
  setToggle,
  emailIdOfSharedStudy,
}) => {
  const studyDateSortValidity = (rowA, rowB) => {
    const a = moment(rowA['validity'].emailValidity).format(
      'YYYY-MM-DD hh:mm A'
    )
    const b = moment(rowB['validity'].emailValidity).format(
      'YYYY-MM-DD hh:mm A'
    )
    if (a > b) {
      return 1
    }
    if (b > a) {
      return -1
    }
    return 0
  }

  const column = [
    {
      name: 'S.No',
      selector: 'index',
      sortable: true,
      minWidth: '50px',
      maxWidth: '70px',
    },
    {
      name: 'type',
      selector: (row) => (row['type'] ? row['type'] : '-'),
      sortable: true,
      minWidth: '80px',
    },
    {
      name: 'name',
      selector: (row) => (row['name'] ? row['name'] : '-'),
      sortable: true,
      minWidth: '150px',
    },
    {
      name: 'email',
      selector: (row) => (row['email'] ? row['email'] : '-'),
      sortable: true,
      minWidth: '200px',
    },
    {
      name: 'validity',
      selector: (row) =>
        row['validity'] ? `${row['validity'].emailValidity}(UTC)` : '-',
      sortable: true,
      minWidth: '250px',
      sortType: 'datetime',
      sortFunction: studyDateSortValidity,
    },
  ]

  return (
    <>
      <Modal
        isOpen={toggle}
        toggle={() => setToggle((prev) => !prev)}
        className="modal-lg modal-dialog-centered"
        key={1}
      >
        <ModalHeader
          toggle={() => setToggle((prev) => !prev)}
          cssModule={{ 'modal-title': 'w-100 text-center' }}
        >
          LIST OF EMAILS
        </ModalHeader>
        <ModalBody>
          <h5>List Of Emails Exam Shared To</h5>
          <DataTable
            noHeader
            pagination
            paginationPerPage={5}
            paginationRowsPerPageOptions={[5, 10, 25, 50, 75, 100]}
            columns={column}
            className="react-dataTable"
            sortIcon={<ChevronDown size={10} />}
            data={emailIdOfSharedStudy}
          />
        </ModalBody>
      </Modal>
    </>
  )
}

export default EmailIdOfSharedStudyModel
