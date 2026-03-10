// ** React Imports
import { Fragment, useEffect, useState } from 'react'
import axios from 'axios'

// ** Sweet Alert Setup
import {
  showErrorAlert,
  showSuccessAlert,
  getErrorMessage,
  showLoadingAlert,
  hideLoadingAlert,
  hideLoadingThenShowError,
  showConfirm,
  showInfoAlert,
} from '../../utils'

// ** Third Party Components
import {
  Row,
  Col,
  Badge,
  UncontrolledTooltip,
  CardHeader,
  CardTitle,
  Button,
  Label,
  Input,
  Card,
} from 'reactstrap'
import { Edit, Trash, Check, X, Plus } from 'react-feather'

// ** Add New Modal Component
import AddNewModal from './AddNewModal'
import EditModal from './EditModal'

// ** Styles
import '@styles/react/libs/tables/react-dataTable-component.scss'
import ListTable from '../../@core/components/list-table'

const TechnicianUser = () => {
  // ** States
  const [modal, setModal] = useState(false)
  const [editModal, SetEditModal] = useState(false)
  const [newUserId, SetNewUserId] = useState('')
  const [updateData, SetUpdateData] = useState({
    _id: '',
    referenceId: '',
    fname: '',
    lname: '',
    email: '',
    cno: '',
    email: '',
    username: '',
    status: 1,
  })

  const [data, setData] = useState([])
  const [limitReach, setLimitReach] = useState(false)

  const userData = JSON.parse(localStorage.getItem('userData'))

  const [rowsPerPage, setRowsPerPage] = useState(
    localStorage.getItem('technicianuserrow')
      ? JSON.parse(localStorage.getItem('technicianuserrow'))
      : 7
  )
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [searchValue, setSearchValue] = useState('')
  const [sortColumn, setSortColumn] = useState('createdOn')
  const [sortDirection, setSortDirection] = useState('desc')
  const [startsrno, setStartsrno] = useState(0)
  const [visibleColumns, setVisibleColumns] = useState([])
  const [sortField, setSortField] = useState(null)
  const [sortOrder, setSortOrder] = useState(0)

  const getUpdatedData = async () => {
    const params = {
      role: 'TCU',
      page,
      size: rowsPerPage,
      filter: searchValue,
      sortdirection: sortDirection,
      sortcolumn: sortColumn,
    }
    console.log('Fetching technician users with params:', params)
    axios
      .get(`${process.env.REACT_APP_API_URL}/user`, {
        params,
      })
      .then(response => {
        console.log('Technician users API response:', response.data)
        console.log('Number of technician users found:', response.data.numberOfRecord)
        console.log('Technician users list:', response.data.list)
        setStartsrno(response.data.startsrno ? response.data.startsrno : 0)
        setData(prev =>
          response.data.list.map((obj, index) => {
            obj.sl = startsrno + index + 1
            obj.full_name = `${obj.fname} ${obj.lname}`
            return obj
          })
        )
        if (response.data.numberOfRecord >= parseInt(userData.technician || 0)) {
          setLimitReach(true)
        } else {
          setLimitReach(false)
        }
        SetNewUserId(response.data.nextId)
        setTotal(response.data.numberOfRecord)
      })
      .catch(err => {
        console.error('Error fetching technician users:', err)
        if (err && err.response) {
          showErrorAlert(getErrorMessage(err))
        }
      })
  }
  // ** Fetch data
  useEffect(() => {
    getUpdatedData()
  }, [page, rowsPerPage, searchValue, sortColumn, sortDirection, limitReach])


  function handleSort(d) {
    if (d.sortField) {
      setSortOrder(d.sortOrder)
      setSortField(d.sortField)
      setSortColumn(d.sortField)
      setSortDirection(d.sortOrder === -1 ? 'desc' : 'asc')
      setPage(0)
    }
  }

  // ** Function to handle Modal toggle
  const handleModal = () => setModal(!modal)
  const handleEditModal = () => SetEditModal(!editModal)

  // ** CRUD Handlers
  const addNewUser = requestData => {
    requestData = {
      ...requestData,
      role: 'TCU',
      pwdCng: false,
      byAdmin: true,
    }
    console.log('Creating technician user with data:', requestData)
    showLoadingAlert()
    axios
      .post(`${process.env.REACT_APP_API_URL}/user/register/admin`, requestData)
      .then(response => {
        console.log('Technician user created successfully:', response.data)
        handleModal()
        hideLoadingAlert()
        showSuccessAlert('Technologist Added Successfully!')
        // Add a small delay to ensure data is indexed before refreshing
        setTimeout(() => {
          getUpdatedData()
        }, 1000)
      })
      .catch(err => {
        console.error('Error creating technician user:', err)
        const isValidationError = err?.response?.status === 422
        const message = err?.response ? undefined : 'Failed to create technician user'
        hideLoadingThenShowError(err, message)
        if (!isValidationError) {
          handleModal()
        }
      })
  }

  const limitHandler = () => {
    showInfoAlert('You have reached the limit to create new technologist.')
  }

  const updateUserDetails = (data, type) => {
    if (editModal) {
      handleEditModal()
    }
    showLoadingAlert()
    axios
      .patch(`${process.env.REACT_APP_API_URL}/user/${data._id}`, data)
      .then(response => {
        hideLoadingAlert()
        showSuccessAlert(
          `Technologist User ${type === 'activate' ? 'Activated' : type === 'deactivate' ? 'Deactivated' : 'Updated'} Successfully!`
        )
        // Update frontend state immediately
        setData(prev => prev.map(user => {
          if (user._id === data._id) {
            const updatedUser = { ...user, ...data }
            updatedUser.full_name = `${updatedUser.fname} ${updatedUser.lname}`
            return updatedUser
          }
          return user
        }))
        // Refresh from API with delay
        setTimeout(() => getUpdatedData(), 500)
      })
      .catch(err => {
        hideLoadingThenShowError(err)
      })
  }

  function deleteUser(id) {
    axios
      .patch(`${process.env.REACT_APP_API_URL}/user/${id}`, { _id: id, status: -1 })
      .then(response => {
        showSuccessAlert('Technologist User Deleted Successfully!')
        // Immediately remove from frontend state
        setData(prev => prev.filter(user => user._id !== id))
        // Refresh from API with longer delay
        setTimeout(() => getUpdatedData(), 500)
        setTimeout(() => getUpdatedData(), 1000)
      })
      .catch(err => {
        handleEditModal()
        showErrorAlert(err)
      })
  }

  // Confirmation Sweet Alert
  const handleConfirm = (id, callback, msg, btnMsg) => {
    return showConfirm({ text: msg, confirmButtonText: btnMsg }).then(result => {
      if (result && result.isConfirmed) {
        callback(id)
      }
    })
  }

  // ** Table item Button Handlers

  const editHandler = row => {
    SetUpdateData(prev => {
      const newData = { ...prev }
      const keys = Object.keys(prev)
      for (const key of keys) {
        if (Array.isArray(prev[key]) && prev[key].length === 0) {
          newData[key] = []
        } else {
          newData[key] = row[key]
        }
      }
      return newData
    })
    handleEditModal()
  }

  const deleteHandler = id => {
    deleteUser(id)
  }

  const DeactivationHandler = id => {
    const deactivationOptions = {
      _id: id,
      status: 0,
    }
    updateUserDetails(deactivationOptions, 'deactivate')
  }

  const ActivationHandler = id => {
    const activationOptions = {
      _id: id,
      status: 1,
    }
    updateUserDetails(activationOptions, 'activate')
  }

  // ** Component Columns
  const status = {
    0: { title: 'In Active', color: 'light-danger' },
    1: { title: 'Active', color: 'light-success' },
  }

  const columns = [
    {
      name: 'ID',
      cell: row => (row['referenceId'] || row['reference_id'] || '-'),
      sortable: true,
      reorder: true,
      id: 'referenceId',
      maxWidth: '100px',
      minWidth: '80px',
    },
    {
      name: 'Name',
      selector: 'full_name',
      sortable: true,
      reorder: true,

      id: 'fname',
      minWidth: '190px',
      maxWidth: '250px',
      cell: row => {
        return <div style={{ whiteSpace: 'break-spaces' }}>{row.full_name}</div>
      },
    },
    {
      name: 'Contact Number',
      selector: row => (row['cno'] ? row['cno'] : '-'),
      sortable: true,
      reorder: true,

      id: 'cno',
      minWidth: '200px',
      cell: row => {
        return <div style={{ whiteSpace: 'break-spaces' }}>{row.cno ? row.cno : '-'}</div>
      },
    },
    {
      name: 'Email',
      selector: row => (row['email'] ? row['email'] : '-'),
      sortable: true,
      reorder: true,

      id: 'email',
      minWidth: '190px',
      maxWidth: '250px',
      cell: row => {
        return <div style={{ whiteSpace: 'break-spaces' }}>{row.email}</div>
      },
    },
    {
      name: 'User Name',
      selector: row => (row['username'] ? row['username'] : '-'),
      sortable: true,
      reorder: true,

      id: 'username',
      minWidth: '190px',
      maxWidth: '250px',
      cell: row => {
        return <div style={{ whiteSpace: 'break-spaces' }}>{row.username}</div>
      },
    },
    {
      name: 'Status',
      selector: 'status',
      sortable: true,
      reorder: true,

      id: 'status',
      cell: row => {
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
      reorder: true,
      id: 'actions',
      cell: row => {
        return (
          <div className="d-flex">
            <Edit
              size={15}
              id="edit"
              className="mr-50"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                editHandler(row)
              }}
            />

            <Trash
              size={15}
              id="trash"
              className="ml-50 mr-50"
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
                id="x"
                className="ml-50"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  handleConfirm(
                    row._id,
                    DeactivationHandler,
                    'You want to deactivate this Technologist User?',
                    'Yes, Deactivate!'
                  )
                }}
              />
            ) : (
              <Check
                size={15}
                id="check"
                className="ml-50"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  handleConfirm(
                    row._id,
                    ActivationHandler,
                    'You want to activate this Technologist User?',
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

  // Custom table styles
  // ** Custom Styles
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
      <Row>
        <Col sm="12">
          <Card>
            <CardHeader className="flex-md-row flex-column align-md-items-center align-items-center border-bottom">
              <CardTitle tag="h4">Technologist User</CardTitle>
              <div className="d-flex mt-md-0 mt-1">
                <Button
                  className="ml-2"
                  color={limitReach ? 'secondary' : 'primary'}
                  disabled={limitReach}
                  onClick={() => {
                    if (limitReach) {
                      limitHandler()
                    } else {
                      handleModal()
                    }
                  }}
                >
                  <Plus size={15} />
                  <span className="align-middle ml-50">Add New</span>
                </Button>
              </div>
            </CardHeader>
            <Row className="justify-content-end mx-0">
              <Col className="d-flex align-items-center justify-content-end mt-1" md="6" sm="12">
                <Label className="mr-1" for="search-input">
                  Search
                </Label>
                <Input
                  className="dataTable-filter mb-50"
                  type="text"
                  bsSize="sm"
                  id="search-input"
                  value={searchValue}
                  onChange={e => {
                    setSearchValue(e.target.value)
                  }}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <ListTable
                  {...{
                    moduleName: 'technician-user',
                    tableData: data,
                    visibleColumns: columns,
                    rows: rowsPerPage,
                    totalRecords: total,
                    first: page,
                    onSort: handleSort,
                    sortField,
                    sortOrder,
                    onPage: e => {
                      setPage(e.first++)
                      setRowsPerPage(prev => e.rows)
                      localStorage.setItem('technicianuserrow', e.rows)
                    },
                  }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      <AddNewModal
        addUser={addNewUser}
        open={modal}
        handleModal={handleModal}
        newUserId={newUserId}
      />
      <EditModal
        updateUser={updateUserDetails}
        open={editModal}
        handleModal={handleEditModal}
        editData={updateData}
      />
    </Fragment>
  )
}

export default TechnicianUser
