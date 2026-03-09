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
  Button,
  Label,
  Input,
  CardTitle,
} from 'reactstrap'
import { Edit, Trash, Check, X, Plus } from 'react-feather'

// ** Add New Modal Component
import AddNewModal from './AddNewModal'
import EditModal from './EditModal'

// ** Styles
import '@styles/react/libs/tables/react-dataTable-component.scss'
import ListTable from '../../@core/components/list-table'
import ROLES from '../../configs/roles'

const ReferringDoctor = () => {
  // ** States
  const [modal, setModal] = useState(false)
  const [editModal, SetEditModal] = useState(false)
  const [tip, setTip] = useState(false)
  const [updateData, SetUpdateData] = useState({
    _id: '',
    fname: '',
    lname: '',
    email: '',
    hospitalname: '',
    designation: '',
    cno: '',
    dob: '',
    location: '',
    status: '',
  })
  const [data, setData] = useState([])
  const [refreshLoading, setRefreshLoading] = useState(false)
  const [newUserId, SetNewUserId] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(
    localStorage.getItem('doctorrow') ? JSON.parse(localStorage.getItem('doctorrow')) : 7
  )
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [searchValue, setSearchValue] = useState('')
  const [sortColumn, setSortColumn] = useState('createdOn')
  const [sortDirection, setSortDirection] = useState('desc')
  const [startsrno, setStartsrno] = useState(0)
  const [sortField, setSortField] = useState(null)
  const [sortOrder, setSortOrder] = useState(0)

  // ** Fetch data
  const getData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/user`, {
        params: {
          role: ROLES.ReferringDoctor,
          page,
          size: rowsPerPage,
          filter: searchValue,
          sortdirection: sortDirection,
          sortcolumn: sortColumn,
        },
      })
      
      if (response.data) {
        const currentStartsrno = response.data.startsrno || 0
        setStartsrno(currentStartsrno)

        if (response.data.list && Array.isArray(response.data.list)) {
          const processedData = response.data.list.map((obj, index) => {
            obj.sl = currentStartsrno + index + 1
            obj.full_name = `${obj.fname} ${obj.lname}`
            return obj
          })
          setData(processedData)
        } else {
          setData([])
        }

        SetNewUserId(response.data.nextId || '')
        setTotal(response.data.numberOfRecord || 0)
      }
      setRefreshLoading(false)
    } catch (error) {
      console.error('Error fetching referring doctors:', error)
      setRefreshLoading(false)
      showErrorAlert('Failed to fetch referring doctors')
    }
  }

  useEffect(() => {
    getData()
  }, [page, rowsPerPage, searchValue, sortColumn, sortDirection])
  


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
      role: ROLES.ReferringDoctor,
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
        showSuccessAlert('Referring Doctor Added Successfully!')
        setData(prev => {
          const newData = [response.data.user].concat(prev)

          return newData.map((obj, index) => {
            obj.sl = startsrno + index + 1
            obj.full_name = `${obj.fname} ${obj.lname}`
            return obj
          })
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
          `Doctor ${type === 'activate' ? 'Activated' : type === 'deactivate' ? 'Deactivated' : 'Updated'} Successfully!`
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
        setTip(!tip)
      })
  }

  function deleteUser(id) {
    axios
      .patch(`${process.env.REACT_APP_API_URL}/user/${id}`, {
        _id: id,
        status: -1,
      })
      .then(response => {
        showSuccessAlert('Referring Doctor Deleted Successfully!')
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
    })
  }

  // ** Table item Button Handlers
  const editHandler = Udata => {
    SetUpdateData(prev => {
      return {
        ...prev,
        ...Udata,
      }
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
      minWidth: '120px',
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
      selector: 'email',
      sortable: true,
      reorder: true,

      id: 'email',
      minWidth: '190px',
      cell: row => {
        return <div style={{ whiteSpace: 'break-spaces' }}>{row.email}</div>
      },
    },
    {
      name: 'Hospital Name',
      selector: 'hospitalname',
      sortable: true,
      reorder: true,

      id: 'hospitalname',
      minWidth: '160px',
      cell: row => {
        return (
          <div style={{ whiteSpace: 'break-spaces' }}>
            {row.hospitalname ? row.hospitalname : '-'}
          </div>
        )
      },
    },
    {
      name: 'Designation',
      selector: 'designation',
      sortable: true,
      reorder: true,

      id: 'designation',
      cell: row => {
        return (
          <div style={{ whiteSpace: 'break-spaces' }}>
            {row.designation ? row.designation : '-'}
          </div>
        )
      },
    },
    {
      name: 'Contact Number',
      selector: 'cno',
      sortable: true,
      reorder: true,

      id: 'cno',
      minWidth: '190px',
      maxWidth: 'fit-content',
      cell: row => {
        return <div style={{ whiteSpace: 'break-spaces' }}>{row.cno ? row.cno : '-'}</div>
      },
    },
    {
      name: 'Status',
      selector: 'status',
      sortable: true,
      reorder: true,

      id: 'status',
      maxWidth: '120px',
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
      id: 'actions',
      maxWidth: '130px',
      cell: row => {
        return (
          <div className="d-flex">
            <Edit
              size={15}
              className="mr-50"
              id="edit"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                editHandler(row)
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
                setTip(!tip)
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
                    'You want to deactivate this Referring Doctor?',
                    'Yes, Deactivate!'
                  )
                  setTip(!tip)
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
                    'You want to activate this Referring Doctor?',
                    'Yes, Activate!'
                  )
                }}
              />
            )}
            <UncontrolledTooltip target="edit" className="tooltip-react-strap">
              Edit
            </UncontrolledTooltip>
            <UncontrolledTooltip target="trash" className="tooltip-react-strap">
              Delete
            </UncontrolledTooltip>
            <UncontrolledTooltip
              target={row.status ? 'x' : 'check'}
              className="tooltip-react-strap"
            >
              {row.status ? 'Deactivate' : 'Activate'}
            </UncontrolledTooltip>
          </div>
        )
      },
    },
  ]

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
              <CardTitle tag="h4">Referring Doctor List</CardTitle>
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
                    moduleName: 'referring-doctor',
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
                      localStorage.setItem('doctorrow', e.rows)
                    },
                  }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      <AddNewModal addUser={addNewUser} open={modal} handleModal={handleModal} />
      <EditModal
        updateUser={updateUserDetails}
        open={editModal}
        handleModal={handleEditModal}
        editData={updateData}
      />
    </Fragment>
  )
}

export default ReferringDoctor
