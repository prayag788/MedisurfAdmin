import { useEffect, useState } from 'react'
import { Modal, ModalHeader, ModalBody, Button } from 'reactstrap'
import { ChevronDown, Check, X } from 'react-feather'
import DataTable from 'react-data-table-component'
import ReactPaginate from 'react-paginate'
import axios from 'axios'
import Avatar from '@components/avatar'
import { toast } from 'react-toastify'
import { ToastContent } from '../../utils/toast'
// ** Sweet Alert Setup
import {
  showLoadingAlert,
  hideLoadingAlert,
  showErrorAlert,
  getErrorMessage,
} from '../../utils/alerts'
import PropTypes from 'prop-types'
import ROLES from '../../configs/roles'

// alerts handled via utils/alerts and shared toast component

const AssignToDoctorModel = ({ toggle, setToggle, study }) => {
  const [currentPage, setCurrentPage] = useState(0)
  const [Picker, setPicker] = useState('')
  const [searchName, setSearchName] = useState('')
  const [searchPost, setSearchPost] = useState('')
  const [searchCity, setSearchCity] = useState('')
  const [searchEmail, setSearchEmail] = useState('')
  const [searchSalary, setSearchSalary] = useState('')
  const [data, setTableData] = useState([])
  const [totalDataLength, setTotalDataLength] = useState(0)
  const [sortcolumn, setSortcolumn] = useState('')
  const [sortdirection, setSortdirection] = useState('')

  // ** Fetch data
  useEffect(() => {
    const queryParams = {
      role: ROLES.ReferringDoctor,
    }
    if (sortcolumn !== '') queryParams.sortcolumn = sortcolumn
    if (currentPage >= 0) queryParams.page = currentPage * 7
    if (sortdirection !== '') queryParams.sortdirection = sortdirection

    axios
      .get(`${process.env.REACT_APP_API_URL}/user`, {
        params: queryParams,
      })
      .then(doc => {
        let indexNumber = currentPage * 7
        setTotalDataLength(doc?.data?.numberOfRecord || 1)
        setTableData(prev =>
          doc.data.list.map((obj, index) => {
            obj.sl = ++indexNumber
            obj.fname = `${obj.fname} ${obj.lname}`
            return obj
          })
        )
      })
  }, [currentPage, sortcolumn, sortdirection])

  const handleAssignment = doc => {
    showLoadingAlert()

    axios
      .patch(`${process.env.REACT_APP_API_URL}/user/referring-doctor/assign-study`, {
        docId: doc['_id'],
        studyId: study._id,
        email: doc.email,
        study,
        doc,
      })
      .then(response => {
        hideLoadingAlert()
        toast.success(
          <ToastContent
            message={"Email sent to respective referring doctor's email address"}
            type={'success'}
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
        setTableData(prev => {
          return prev.map(obj => {
            return obj['_id'] === response.data['_id']
              ? { ...obj, assignedStudies: response.data['assignedStudies'] }
              : obj
          })
        })
      })
      .catch(err => {
        hideLoadingAlert()
        if (err && err.response) {
          showErrorAlert(getErrorMessage(err)).then(() => location.reload())
        }
      })
  }

  const CloseBtn = (
    <X
      className="cursor-pointer"
      size={15}
      onClick={() => {
        setToggle(prev => !prev)
      }}
    />
  )

  const handleUnassignment = doc => {
    axios
      .patch(`${process.env.REACT_APP_API_URL}/user/referring-doctor/unassign-study`, {
        docId: doc['_id'],
        studyId: study._id,
        email: doc.email,
      })
      .then(response => {
        setTableData(prev => {
          return prev.map(obj => {
            return obj['_id'] === response.data['_id']
              ? { ...obj, assignedStudies: response.data['assignedStudies'] }
              : obj
          })
        })
      })
      .catch(err => console.log(err.response))
  }

  // ** Function to handle Pagination
  const handlePagination = page => {
    setCurrentPage(page.selected)
    setPage(page.selected + 1)
  }

  // ** Custom Pagination
  const CustomPagination = () => (
    <ReactPaginate
      previousLabel={''}
      nextLabel={''}
      forcePage={currentPage}
      onPageChange={page => handlePagination(page)}
      pageCount={totalDataLength / 7 || 1}
      breakLabel={'...'}
      pageRangeDisplayed={2}
      marginPagesDisplayed={2}
      activeClassName={'active'}
      pageClassName={'page-item'}
      nextLinkClassName={'page-link'}
      nextClassName={'page-item next'}
      previousClassName={'page-item prev'}
      previousLinkClassName={'page-link'}
      pageLinkClassName={'page-link'}
      breakClassName="page-item"
      breakLinkClassName="page-link"
      containerClassName={
        'pagination react-paginate separated-pagination pagination-sm justify-content-end pr-1 mt-1'
      }
    />
  )

  // ** Table Columns
  const column = [
    {
      name: 'S.No',
      selector: row => row.sl,
      sortable: false,
      minWidth: '50px',
    },
    {
      name: 'Name',
      selector: row => row.fname,
      sortable: true,
      minWidth: '200px',
    },
    {
      name: 'Email',
      selector: row => row.email,
      sortable: true,
      minWidth: '350px',
    },
    {
      name: 'Actions',
      allowOverflow: true,
      minWidth: '150px',
      cell: (row) => {
        if (!row || !row._id) {
          return <div>-</div>
        }
        
        const assignedStudies = Array.isArray(row.assignedStudies) ? row.assignedStudies : []
        const isStudyAssigned = assignedStudies.includes(study._id)
        
        return (
          <div className="d-flex">
            {!isStudyAssigned ? (
              <Button.Ripple
                color="success"
                size="sm"
                onClick={() => handleAssignment(row)}
              >
                Assign
              </Button.Ripple>
            ) : (
              <Button.Ripple
                color="danger"
                size="sm"
                onClick={() => handleUnassignment(row)}
              >
                Unassign
              </Button.Ripple>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <Modal isOpen={toggle} toggle={() => setToggle(prev => !prev)} className="modal-lg" key={1}>
      <ModalHeader
        toggle={() => setToggle(prev => !prev)}
        close={
          <X
            className="cursor-pointer"
            size={15}
            onClick={() => {
              setToggle(prev => !prev)
            }}
          />
        }
      >
        Assign Study to Referring Doctors
      </ModalHeader>
      <ModalBody>
        <DataTable
          noHeader
          pagination
          columns={column}
          paginationPerPage={7}
          className="react-dataTable"
          sortIcon={<ChevronDown size={10} />}
          paginationDefaultPage={currentPage + 1}
          paginationComponent={CustomPagination}
          onChangePage={(page, totalRows) => {
            setCurrentPage(page - 1)
          }}
          onSort={(selectedColumn, sortDirection, sortedRows) => {
            setSortdirection(sortDirection)
            setSortcolumn(selectedColumn.name)
          }}
          data={data}
        />
      </ModalBody>
    </Modal>
  )
}
export default AssignToDoctorModel
