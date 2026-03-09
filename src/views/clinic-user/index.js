// ** React Imports
import { Fragment, useEffect, useState } from 'react'
import axios from 'axios'

// ** Sweet Alert Setup
import {
  showLoadingAlert,
  hideLoadingAlert,
  hideLoadingThenShowError,
  showSuccessAlert,
  showErrorAlert,
  showConfirm,
  getErrorMessage,
} from '../../utils/alerts'

// centralized alerts

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
import { Edit, Trash, Plus } from 'react-feather'

// ** Tables

// ** Add New Modal Component
import AddNewModal from './AddNewModal'
import EditModal from './EditModal'

// ** Styles
import '@styles/react/libs/tables/react-dataTable-component.scss'
import ListTable from '../../@core/components/list-table'

const ClinicUser = () => {
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
    secondaryEmail: [],
    secondaryCno: [],
    clinics: [],
    status: 1,
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
          role: 'CU',
          page,
          size: rowsPerPage,
          filter: searchValue,
          sortdirection: sortDirection,
          sortcolumn: sortColumn,
        },
      })
      .then(response => {
        setStartsrno(response.data.startsrno ? response.data.startsrno : 0)
        setData(prev =>
          response.data.list.map((obj, index) => {
            obj.sl = startsrno + index + 1
            obj.full_name = `${obj.fname} ${obj.lname}`
            return obj
          })
        )
        SetNewUserId(response.data.nextId)
        setRefreshLoading(false)
        setTotal(response.data.numberOfRecord)
      })
  }
  useEffect(() => {
    if (!modal && !editModal) {
      getData()
    }
  }, [page, rowsPerPage, searchValue, sortColumn, sortDirection, modal, editModal])

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

  // ** CRUD Handlers - return promise so modal can await and avoid double success/loader
  const addNewUser = requestData => {
    requestData = {
      ...requestData,
      role: 'CU',
      pwdCng: false,
      byAdmin: true,
    }
    showLoadingAlert()
    return axios
      .post(`${process.env.REACT_APP_API_URL}/user/register/admin`, requestData)
      .then(response => {
        handleModal()
        hideLoadingAlert()
        showSuccessAlert('Clinic User Added Successfully!')
        getData()
      })
      .catch(err => {
        const isValidationError = err?.response?.status === 422
        hideLoadingAlert()
        hideLoadingThenShowError(err)
        if (!isValidationError) {
          handleModal()
        }
        throw err
      })
  }

  const updateUserDetails = (data, type) => {
    const url = `${process.env.REACT_APP_API_URL}/user/${data._id}`
    console.log('[ClinicUser Edit] updateUserDetails called', { type, userId: data._id })
    console.log('[ClinicUser Edit] PATCH URL:', url)
    console.log('[ClinicUser Edit] Request payload:', JSON.stringify(data, null, 2))

    showLoadingAlert()
    axios
      .patch(url, data)
      .then(response => {
        console.log('[ClinicUser Edit] PATCH success', { status: response?.status, data: response?.data })
        if (editModal) {
          handleEditModal()
        }
        hideLoadingAlert()
        showSuccessAlert(
          `Clinic User ${type === 'activate' ? 'Activated' : type === 'deactivate' ? 'Deactivated' : 'Updated'} Successfully!`
        )
        getData()
      })
      .catch(err => {
        console.error('[ClinicUser Edit] PATCH failed', {
          message: err?.message,
          response: err?.response?.data,
          status: err?.response?.status,
        })
        hideLoadingThenShowError(err)
      })
  }

  function deleteUser(id) {
    axios
      .patch(`${process.env.REACT_APP_API_URL}/user/${id}`, { _id: id, status: -1 })
      .then(response => {
        showSuccessAlert('Clinic User Deleted Successfully!')
        setPage(0)
        getData()
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

  // ** Table item Button Handlers — set selected row first, then open modal next tick so editData has row values
  const editHandler = row => {
    setSelectedItem(prev => {
      const newData = { ...prev }
      const keys = Object.keys(prev)
      for (const key of keys) {
        if (key === 'secondaryEmail' || key === 'secondaryCno') {
          newData[key] = row[key] ? row[key].filter(obj => obj !== '') : []
        } else if (key === 'fname') {
          newData.fname = row.fname ?? row.first_name ?? (typeof row.full_name === 'string' ? row.full_name.split(' ')[0] : '') ?? ''
        } else if (key === 'lname') {
          newData.lname = row.lname ?? row.last_name ?? (typeof row.full_name === 'string' ? row.full_name.split(' ').slice(1).join(' ') : '') ?? ''
        } else {
          newData[key] = row[key]
        }
      }
      return newData
    })
    // Open modal after state update so EditModal receives editData with row values
    setTimeout(() => handleEditModal(), 0)
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
        return <div style={{ whiteSpace: 'break-spaces' }}>{row?.username ?? '-'}</div>
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
        const secondaryEmail = row?.secondaryEmail?.length > 0 ? row.secondaryEmail.join(' , ') : ''
        return `${row.email} ${row?.secondaryEmail?.length > 0 ? ' , ' : ' '} ${secondaryEmail}`
      },
    },
    {
      name: 'Clinic Name(s)',
      selector: row => (row['clinics'] ? row['clinics']['clinicName'] : '-'),
      sortable: true,
      reorder: true,
      id: 'clinic',
      minWidth: '190px',
      maxWidth: '250px',
      height: 'auto',
      cell: row => {
        return (
          <div style={{ whiteSpace: 'break-spaces' }}>
            {row?.clinics
              ?.map(data => {
                return data?.clinicName
              })
              .join(' , ')}
          </div>
        )
      },
    },
    {
      name: 'Contact Number',

      cell: row =>
        `${row.cno ?? '-'} ${row?.secondaryCno?.length > 0 ? ' , ' : ' '} ${row?.secondaryCno?.length > 0 ? row?.secondaryCno?.join(' , ') : ''}`,
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
          <Badge color={status[row?.status]?.color} pill>
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
            {}
            <UncontrolledTooltip className="tooltip-react-strap" target="edit">
              Edit
            </UncontrolledTooltip>
            <UncontrolledTooltip className="tooltip-react-strap" target="trash">
              Delete
            </UncontrolledTooltip>
            {}
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
              <CardTitle tag="h4">Clinic User</CardTitle>
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
                    moduleName: 'clinic-user',
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
      {editModal && (
        <EditModal
          updateUser={updateUserDetails}
          open={editModal}
          handleModal={handleEditModal}
          editData={selectedItem}
        />
      )}
    </Fragment>
  )
}

export default ClinicUser
