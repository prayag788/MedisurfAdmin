import '@styles/react/libs/tables/react-dataTable-component.scss'
import AddNewModal from './AddNewModal'
import EditModal from './EditModal'
import ListTable from '../../@core/components/list-table'
import {
  showErrorAlert,
  showSuccessAlert,
  getErrorMessage,
  showConfirm,
  showLoadingAlert,
  hideLoadingAlert,
  hideLoadingThenShowError,
} from '../../utils/alerts'
import axios from 'axios'
import { Edit, Trash, Check, X, Plus } from 'react-feather'
import { Fragment, useEffect, useState } from 'react'
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

const Doctors = () => {
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
  const getData = async () => {
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
      .then(response => {
        const currentStartsrno = response.data.startsrno ? response.data.startsrno : 0
        setStartsrno(currentStartsrno)
        
        if (response?.data?.list && Array.isArray(response.data.list)) {
          const processedData = response.data.list
            .map((obj, index) => {
              if (obj) {
                obj.sl = currentStartsrno + index + 1
                obj.full_name = `${obj.fname || ''} ${obj.lname || ''}`
              }
              return obj
            })
            .filter(obj => obj !== null && obj !== undefined)
          setData(processedData)
        } else {
          setData([])
        }
        
        SetNewUserId(response.data.nextId)
        setRefreshLoading(false)
        setTotal(response.data.numberOfRecord)
      })
      .catch(err => {
        setRefreshLoading(false)
        if (err && err.response) {
          showErrorAlert(getErrorMessage(err))
        }
      })
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
  const handleModal = () => setModal(!modal)
  const handleEditModal = () => SetEditModal(!editModal)
  const addNewUser = async requestData => {
    requestData = { ...requestData, role: 'Doc', status: 1, pwdCng: false, byAdmin: true }
    showLoadingAlert()
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/user/register/admin`,
        requestData
      )
      handleModal()
      hideLoadingAlert()
      showSuccessAlert('Doctor Added Successfully!')
      setData(prev => {
        if (response?.data?.user) {
          prev = [response.data.user].concat(prev || [])
          prev = prev.map((obj, index) => {
            if (obj) {
              obj.sl = startsrno + index + 1
              obj.full_name = `${obj.fname || ''} ${obj.lname || ''}`
            }
            return obj
          })
        }
        return prev || []
      })
    } catch (err) {
      const isValidationError = err?.response?.status === 422
      hideLoadingThenShowError(err)
      if (!isValidationError) {
        handleModal()
      }
      throw err
    }
  }
  const updateUserDetails = async (data, type) => {
    if (editModal) {
      handleEditModal()
    }
    showLoadingAlert()
    try {
      const response = await axios.patch(`${process.env.REACT_APP_API_URL}/user/${data._id}`, data)
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
    } catch (err) {
      hideLoadingThenShowError(err)
      setTip(!tip)
      throw err
    }
  }
  function deleteUser(id) {
    axios
      .patch(`${process.env.REACT_APP_API_URL}/user/${id}`, {
        _id: id,
        status: -1,
      })
      .then(response => {
        showSuccessAlert('Doctor Deleted Successfully!')
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
  const handleConfirm = (id, callback, msg, btnMsg) => {
    return showConfirm({ text: msg, confirmButtonText: btnMsg }).then(result => {
      if (result && result.isConfirmed) {
        callback(id)
      }
    })
  }
  const editHandler = row => {
    SetUpdateData(prev => {
      const newData = { ...prev }
      const keys = Object.keys(newData)
      for (const key of keys) {
        if (Array.isArray(newData[key]) && newData[key].length === 0) {
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
                    'You want to deactivate this Doctor?',
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
                    'You want to activate this Doctor?',
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
              <CardTitle tag="h4">Doctor List</CardTitle>
              <div className="d-flex mt-md-0 mt-1">
                <Button
                  className="ms-2"
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
                <Label className="me-1" for="search-input">
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
                    moduleName: 'doctor',
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
export default Doctors
