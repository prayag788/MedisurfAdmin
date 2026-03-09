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
} from '../../utils/alerts'

// ** Third Party Components
import {
  Row,
  Col,
  Card,
  Badge,
  UncontrolledTooltip,
  Spinner,
  CardHeader,
  CardTitle,
  Button,
  Label,
  Input,
} from 'reactstrap'
import { Edit, Trash, Check, X, Plus } from 'react-feather'

// ** Tables

// ** Add New Modal Component
import AddNewModal from './AddNewModal'
import EditModal from './EditModal'

// ** Styles
import '@styles/react/libs/tables/react-dataTable-component.scss'
import ListTable from '../../@core/components/list-table'

const roleOptions = [
  { value: { action: 'manage', subject: 'study-list' }, label: 'Study List', isFixed: false },
  { value: { action: 'manage', subject: 'viewer' }, label: 'Viewer', isFixed: false },
  {
    value: { action: 'manage', subject: 'upload-dicom' },
    label: 'Upload Dicom Image',
    isFixed: false,
  },
  {
    value: { action: 'manage', subject: 'referring-doctor' },
    label: 'Referring Doctor',
    isFixed: true,
  },
  { value: { action: 'manage', subject: 'power-user' }, label: 'Power User', isFixed: false },
  {
    value: [
      { action: 'manage', subject: 'modality' },
      { action: 'manage', subject: 'add_modality' },
      { action: 'manage', subject: 'edit_modality' },
    ],
    label: 'Modality',
    isFixed: true,
  },
  { value: { action: 'manage', subject: 't&c' }, label: 'Terms & Conditions', isFixed: true },
  {
    value: { action: 'manage', subject: 'privacy-policy' },
    label: 'Privacy Policy',
    isFixed: true,
  },
  { value: { action: 'manage', subject: 'cookie-policy' }, label: 'Cookie Policy', isFixed: true },
  {
    value: { action: 'manage', subject: 'data-analytics' },
    label: 'Data Analytics',
    isFixed: false,
  },
]

const PowerUser = () => {
  // ** States
  const [modal, setModal] = useState(false)
  const [editModal, SetEditModal] = useState(false)
  const [newUserId, SetNewUserId] = useState('')
  const [tip, setTip] = useState(false)
  const [selectedItem, setSelectedItem] = useState({
    _id: '',
    fname: '',
    lname: '',
    email: '',
    cno: '',
    status: '',
  })
  const [data, setData] = useState([])
  const [refreshLoading, setRefreshLoading] = useState(false)

  const [rowsPerPage, setRowsPerPage] = useState(
    localStorage.getItem('poweruserrow') ? JSON.parse(localStorage.getItem('poweruserrow')) : 7
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

  // ** Fetch data
  const getData = async () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/user`, {
        params: {
          role: 'PU',
          page,
          size: rowsPerPage,
          filter: searchValue,
          sortdirection: sortDirection,
          sortcolumn: sortColumn,
        },
      })
      .then(response => {
        setStartsrno(response.data.startsrno ? response.data.startsrno : 0)
        if (response.data.list && Array.isArray(response.data.list)) {
          const currentStartsrno = response.data.startsrno ? response.data.startsrno : 0
          const processedData = response.data.list.map((obj, index) => {
            obj.sl = currentStartsrno + index + 1
            obj.full_name = `${obj.fname} ${obj.lname}`
            return obj
          })
          setData(processedData)
        } else {
          setData([])
        }
        SetNewUserId(response.data.nextId)
        setRefreshLoading(false)
        setTotal(response.data.numberOfRecord)
      })
  }
  useEffect(() => {
    getData()
  }, [page, rowsPerPage, searchValue, sortColumn, sortDirection])
  
  // LIVE UPDATES: Listen for refresh events
  useEffect(() => {
    const handleRefresh = (event) => {
      const { role } = event.detail || {}
      // Refresh if it's for power users or general user update
      if (!role || role === 'PowerUser' || role === 'PU') {
        getData()
      }
    }
    
    window.addEventListener('userDataRefresh', handleRefresh)
    return () => window.removeEventListener('userDataRefresh', handleRefresh)
  }, [])

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
      role: 'PU',
      status: 1,
      pwdCng: false,
      byAdmin: true,
    }
    showLoadingAlert()
    axios
      .post(`${process.env.REACT_APP_API_URL}/user/register/admin`, requestData)
      .then(response => {
        handleModal()
        hideLoadingAlert()
        showSuccessAlert('Power User Added Successfully!')
        setData(prev => {
          prev = [response.data.user].concat(prev)
          prev.map((obj, index) => {
            obj.sl = startsrno + index + 1
            obj.full_name = `${obj.fname} ${obj.lname}`
            return obj
          })
          return prev
        })
      })
      .catch(err => {
        const isValidationError = err?.response?.status === 422
        hideLoadingThenShowError(err)
        if (!isValidationError) {
          handleModal()
        }
      })
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
          `Power User ${type === 'activate' ? 'Activated' : type === 'deactivate' ? 'Deactivated' : 'Updated'} Successfully!`
        )
        // Update frontend state immediately
        setData(prev => prev.map(user => {
          if (user._id === data._id) {
            const updatedUser = { ...user, ...data }
            updatedUser.full_name = `${updatedUser.fname || ''} ${updatedUser.lname || ''}`
            return updatedUser
          }
          return user
        }))
        // Refresh from API with delay
        setTimeout(() => getData(), 500)
      })
      .catch(err => {
        hideLoadingThenShowError(err)
      })
  }

  function deleteUser(id) {
    axios
      .patch(`${process.env.REACT_APP_API_URL}/user/${id}`, { _id: id, status: -1 })
      .then(response => {
        showSuccessAlert('Power User Deleted Successfully!')
        // Immediately remove from frontend state
        setData(prev => prev.filter(user => user._id !== id))
        // Refresh from API with longer delay
        setTimeout(() => getData(), 500)
        setTimeout(() => getData(), 1000)
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
      setTip(!tip)
    })
  }

  // ** Table item Button Handlers
  const editHandler = row => {
    setSelectedItem(prev => {
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
    0: { title: 'Inactive', color: 'light-danger' },
    1: { title: 'Active', color: 'light-success' },
  }

  const columns = [
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
      name: 'Contact Number',
      cell: row => (row['cno'] ? row['cno'] : '-'),
      sortable: true,
      reorder: true,
      id: 'cno',
      minWidth: '200px',
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
                    'You want to deactivate this Power User?',
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
                    'You want to activate this Power User?',
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

  if (refreshLoading) {
    return (
      <Card className="loading-initial">
        <Spinner color="primary" />
      </Card>
    )
  }

  return (
    <Fragment>
      <Row>
        <Col sm="12">
          <Card>
            <CardHeader className="flex-md-row flex-column align-md-items-center align-items-center border-bottom">
              <CardTitle tag="h4">Power user</CardTitle>
              <div className="d-flex mt-md-0 mt-1">
                <Button
                  className="ml-2"
                  color={'primary'}
                  onClick={() => {
                    handleModal()
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
                    moduleName: 'power-user',
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
                      localStorage.setItem('poweruserrow', e.rows)
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
        editData={selectedItem}
      />
    </Fragment>
  )
}

export default PowerUser
