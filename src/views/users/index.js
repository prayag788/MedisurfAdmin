// ** React Imports
import { Fragment, useEffect, useState } from 'react'
import axios from 'axios'

// ** Alerts
import {
  showErrorAlert,
  showSuccessAlert,
  getErrorMessage,
  showLoadingAlert,
  hideLoadingAlert,
  showConfirm,
} from '../../utils/alerts'

// ** Enhanced Error Handling
import { handleApiError, extractErrorMessage } from '../../utils/error-handler'

// ** Third Party Components
import { Row, Col, Badge, UncontrolledTooltip } from 'reactstrap'
import { Edit, Trash, Check, X } from 'react-feather'

// ** Tables
import TableWithButtons from '../components/TableWithButtons'

// ** Add New Modal Component
import AddNewModal from './AddNewModal'
import EditModal from './EditModal'

// ** Styles
import '@styles/react/libs/tables/react-dataTable-component.scss'

const Users = () => {
  // ** States
  const [modal, setModal] = useState(false)
  const [editModal, SetEditModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState({
    _id: '',
    fname: '',
    lname: '',
    hospitalname: '',
    designation: '',
    cno: '',
    role: '',
  })
  const [data, setData] = useState([])

  const [rowsPerPage, setRowsPerPage] = useState(7)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [searchValue, setSearchValue] = useState('')
  const [sortColumn, setSortColumn] = useState('createdOn')
  const [sortDirection, setSortDirection] = useState('desc')
  const [startsrno, setStartsrno] = useState(0)

  // ** Fetch data
  useEffect(() => {
    try {
      axios
        .get(`${process.env.REACT_APP_API_URL}/user`, {
          params: {
            role: 'Doc',
            page,
            size: rowsPerPage,
            filter: searchValue,
            sortdirection: sortDirection,
            sortcolumn: sortColumn,
          },
        })
        .then((response) => {
          setData((prev) =>
            response.data.list.map((obj, index) => {
              obj.sl = startsrno + index + 1
              obj.full_name = `${obj.fname} ${obj.lname}`
              return obj
            })
          )

          setTotal(response.data.numberOfRecord)
          setStartsrno(response.data.startsrno ? response.data.startsrno : 0)
        })
    } catch (error) {}
  }, [page, rowsPerPage, searchValue, sortColumn, sortDirection])
  function handleSort(column, direction) {
    setSortColumn(column.id)
    setSortDirection(direction)
    setPage(0)
  }
  // ** Function to handle Modal toggle
  const handleModal = () => setModal(!modal)
  const handleEditModal = () => SetEditModal(!editModal)

  // ** CRUD Handlers
  const addNewUser = (requestData) => {
    return new Promise((resolve, reject) => {
      requestData = { ...requestData, status: 1, pwdCng: false, byAdmin: true }
      showLoadingAlert()
      axios
        .post(
          `${process.env.REACT_APP_API_URL}/user/register/user`,
          requestData
        )
        .then((response) => {
          hideLoadingAlert()
          handleModal() // Close modal only on success
          showSuccessAlert('User Added Successfully!')
          setData((prev) => {
            prev = [response.data.user].concat(prev)
            prev.map((obj, index) => {
              obj.sl = startsrno + index + 1
              obj.full_name = `${obj.fname} ${obj.lname}`
              return obj
            })
            return prev
          })
          resolve(response)
        })
        .catch((err) => {
          hideLoadingAlert()
          // Use enhanced error handling
          const errorMessage = extractErrorMessage(
            err,
            'Failed to create user. Please try again.'
          )
          showErrorAlert(errorMessage)
          reject(err)
        })
    })
  }

  const updateUserDetails = (data, type) => {
    if (editModal) {
      handleEditModal()
    }
    showLoadingAlert()
    axios
      .patch(`${process.env.REACT_APP_API_URL}/user/${data._id}`, data)
      .then((response) => {
        hideLoadingAlert()
        showSuccessAlert(
          `Doctor ${type === 'activate' ? 'Activated' : type === 'deactivate' ? 'Deactivated' : 'Updated'} Successfully!`
        )
        setData((prev) => {
          const Mprev = [...prev]
          Mprev.splice(
            Mprev.findIndex((obj) => obj._id === response.data.user._id),
            1,
            response.data.user
          )
          prev = Mprev
          prev.map((obj, index) => {
            obj.sl = startsrno + index + 1
            obj.full_name = `${obj.fname} ${obj.lname}`
            return obj
          })
          return prev
        })
      })
      .catch((err) => {
        hideLoadingAlert()
        // Use enhanced error handling for better error messages
        handleApiError(err, {
          type: 'alert',
          title: 'Update Error',
          fallback: 'Failed to update user details. Please try again.',
        })
      })
  }

  function deleteUser(id) {
    axios
      .patch(`${process.env.REACT_APP_API_URL}/user/${id}`, {
        _id: id,
        status: -1,
      })
      .then((response) => {
        showSuccessAlert('Doctor Deleted Successfully!')
        setData((prev) => {
          let Mprev = [...data]
          Mprev = Mprev.filter((obj) => obj._id !== response.data.user._id)
          prev = Mprev
          prev.map((obj, index) => {
            obj.sl = startsrno + index + 1
            obj.full_name = `${obj.fname} ${obj.lname}`
            return obj
          })
          return prev
        })
      })
      .catch((err) => {
        handleEditModal()
        // Use enhanced error handling
        handleApiError(err, {
          type: 'alert',
          title: 'Delete Error',
          fallback: 'Failed to delete user. Please try again.',
        })
      })
  }

  // Confirmation Sweet Alert
  const handleConfirm = (id, callback, msg, btnMsg) => {
    return showConfirm({ text: msg, confirmButtonText: btnMsg }).then(
      (result) => {
        if (result && result.isConfirmed) {
          callback(id)
        }
      }
    )
  }

  // ** Table item Button Handlers
  const editHandler = (id) => {
    const Udata = data.filter((obj) => obj._id === id)[0]
    setSelectedItem((prev) => {
      const newData = { ...prev }
      const keys = Object.keys(prev)
      for (const key of keys) {
        if (Array.isArray(prev[key]) && prev[key].length === 0) {
          newData[key] = []
        } else {
          newData[key] = Udata[key]
        }
      }
      return newData
    })
    handleEditModal()
  }

  const deleteHandler = (id) => {
    deleteUser(id)
  }

  const DeactivationHandler = (id) => {
    const deactivationOptions = {
      _id: id,
      status: 0,
    }
    updateUserDetails(deactivationOptions, 'deactivate')
  }

  const ActivationHandler = (id) => {
    const activationOptions = {
      _id: id,
      status: 1,
    }
    updateUserDetails(activationOptions, 'activate')
  }

  // ** Component Columns
  const status = {
    0: { title: 'Inactive', color: 'light-danger' },
    1: { title: 'Active', color: 'light-success' },
  }

  const doctorColumns = [
    {
      name: 'S.No',
      selector: (row) => (row['sl'] ? row['sl'] : '-'),
      sortable: true,
      reorder: true,

      id: 'sl',
      maxWidth: '50px',
    },
    {
      name: 'Name',
      selector: (row) => (row['full_name'] ? row['full_name'] : '-'),
      sortable: true,
      reorder: true,

      id: 'fname',
      minWidth: '150px',
      cell: (row) => {
        return <div style={{ whiteSpace: 'break-spaces' }}>{row.full_name}</div>
      },
    },
    {
      name: 'Email',
      selector: (row) => (row['email'] ? row['email'] : '-'),
      sortable: true,
      reorder: true,

      id: 'email',
      minWidth: '250px',
      cell: (row) => {
        return <div style={{ whiteSpace: 'break-spaces' }}>{row.email}</div>
      },
    },
    {
      name: 'Hospital Name',
      selector: (row) => (row['hospitalname'] ? row['hospitalname'] : '-'),
      sortable: true,
      reorder: true,

      id: 'hospitalname',
      minWidth: '171px',
    },
    {
      name: 'Designation',
      selector: (row) => (row['designation'] ? row['designation'] : '-'),
      sortable: true,
      reorder: true,

      id: 'designation',
    },
    {
      name: 'Contact Number',
      selector: (row) => (row['cno'] ? row['cno'] : '-'),
      sortable: true,
      reorder: true,

      id: 'cno',
      minWidth: '200px',
    },
    {
      name: 'Status',
      selector: (row) => (row['status'] ? row['status'] : '-'),
      sortable: true,
      reorder: true,

      id: 'status',
      cell: (row) => {
        return (
          <Badge color={status[row.status].color} pill>
            {status[row.status].title}
          </Badge>
        )
      },
    },
    {
      name: 'Actions',
      allowOverflow: true,
      sortable: false,
      reorder: false,

      cell: (row) => {
        return (
          <div className="d-flex">
            <Edit
              size={15}
              className="mr-50"
              id="edit"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                editHandler(row._id)
              }}
            />
            <Trash
              size={15}
              className="ml-50 mr-50"
              id="trash"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                handleConfirm(
                  row._id,
                  deleteHandler,
                  "You won't be able to revert this!",
                  'Yes, delete it!'
                )
              }}
            />
            {row.status ? (
              <X
                size={15}
                className="ml-50"
                id="x"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  handleConfirm(
                    row._id,
                    DeactivationHandler,
                    'You want to deactivate this Doctor?',
                    'Yes, Deactivate!'
                  )
                }}
              />
            ) : (
              <Check
                size={15}
                id="check"
                style={{ cursor: 'pointer' }}
                className="ml-50"
                onClick={() => {
                  handleConfirm(
                    row._id,
                    ActivationHandler,
                    'You want to activate this Doctor?',
                    'Yes, Activate!'
                  )
                }}
              />
            )}
            <UncontrolledTooltip className="tooltip-react-strap" target="edit">
              Edit
            </UncontrolledTooltip>
            <UncontrolledTooltip className="tooltip-react-strap" target="trash">
              Delete
            </UncontrolledTooltip>
            <UncontrolledTooltip
              className="tooltip-react-strap"
              target={row.status ? 'x' : 'check'}
            >
              {row.status ? 'Deactivate' : 'Activate'}
            </UncontrolledTooltip>
          </div>
        )
      },
    },
  ]

  const customStyles = {
    rows: {
      style: {
        minHeight: '100% !important',
        justifyContent: 'center',
        alignItems: 'center',
      },
    },
    cells: {
      style: {
        minHeight: '53px',
        height: '100% !important',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
      },
    },
  }

  return (
    <Fragment>
      {}
      <Row>
        <Col sm="12">
          <TableWithButtons
            data={data}
            columns={doctorColumns}
            AddNewModal={handleModal}
            title="Users List"
            customStyles={customStyles}
            row="alluser"
            rowperpage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            totalRows={total}
            handleSort={handleSort}
            rowsPerPage={rowsPerPage}
            setPage={setPage}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
          />
        </Col>
      </Row>
      <AddNewModal
        addUser={addNewUser}
        open={modal}
        handleModal={handleModal}
      />
      <EditModal
        updateUser={updateUserDetails}
        open={editModal}
        handleModal={handleEditModal}
        editData={selectedItem}
      />
    </Fragment>
  )
}

export default Users
