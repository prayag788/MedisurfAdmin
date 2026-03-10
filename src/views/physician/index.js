// ** React Imports
import { Fragment, useEffect, useState } from 'react'
import axios from 'axios'

// ** Sweet Alert Setup
import {
  showLoadingAlert,
  hideLoadingAlert,
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

const physician = () => {
  // ** States
  const [modal, setModal] = useState(false)
  const [editModal, SetEditModal] = useState(false)
  const [newUserId, SetNewUserId] = useState('')
  const [tip, setTip] = useState(false)
  const [updateData, SetUpdateData] = useState({
    _id: '',
    physicianname: '',
    hospitalname: '',
    email: '',
    cno: '',
    location: '',
    dob: '',
    status: 1,
    designation: '',
    secondaryEmail: [],
    secondaryCno: [],
    clinics: [],
  })
  const [data, setData] = useState([])
  const [refreshLoading, setRefreshLoading] = useState(false)

  const [rowsPerPage, setRowsPerPage] = useState(
    localStorage.getItem('poweruserrow')
      ? JSON.parse(localStorage.getItem('poweruserrow'))
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

  // ** Fetch data
  const getData = async () => {
    const token = localStorage.getItem('accessToken')
    axios
      .get(`${process.env.REACT_APP_API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          role: 'Physician',
          page,
          size: rowsPerPage,
          filter: searchValue,
          sortdirection: sortDirection,
          sortcolumn: sortColumn,
        },
      })
      .then((response) => {
        setStartsrno(response.data.startsrno ? response.data.startsrno : 0)
        setData((prev) =>
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
      .catch((err) => {
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

  // ** Function to handle Modal toggle
  const handleModal = () => setModal(!modal)
  const handleEditModal = () => SetEditModal(!editModal)

  // ** CRUD Handlers
  const addNewUser = (requestData) => {
    showLoadingAlert()
    const token = localStorage.getItem('accessToken')

    // Direct physician registration using the physician endpoint
    const physicianData = {
      clinics: requestData.clinics || [],
      cno: requestData.cno || '',
      status: requestData.status || 1,
      designation: requestData.designation || '',
      location: requestData.location || '',
      email: requestData.email,
      hospitalname: requestData.hospitalname || '',
      dob: requestData.dob || null,
      role: 'Physician',
      pwdCng: false,
      byAdmin: true,
      physicianname: requestData.physicianname,
    }

    axios
      .post(
        `${process.env.REACT_APP_API_URL}/user/register/physician`,
        physicianData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        handleModal()
        getData()
        hideLoadingAlert()
        showSuccessAlert('Physician Added Successfully!')
      })
      .catch((err) => {
        hideLoadingAlert()
        if (err && err.response) {
          showErrorAlert(getErrorMessage(err))
        }
      })
  }

  const updateUserDetails = (data, type) => {
    showLoadingAlert()
    const token = localStorage.getItem('accessToken')

    // Ensure we maintain physician-specific fields
    const updateData = {
      ...data,
      role: 'Physician',
      physicianstatus: data.status, // Map status to physicianstatus for physicians
    }

    axios
      .patch(`${process.env.REACT_APP_API_URL}/user/${data._id}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        hideLoadingAlert()
        getData()

        showSuccessAlert(
          `Physician ${type === 'activate' ? 'Activated' : type === 'deactivate' ? 'Deactivated' : 'Updated'} Successfully!`
        )
        handleEditModal()
      })
      .catch((err) => {
        hideLoadingAlert()
        if (err && err.response) {
          showErrorAlert(getErrorMessage(err))
        }
      })
  }

  function deleteUser(id) {
    const token = localStorage.getItem('accessToken')
    axios
      .patch(
        `${process.env.REACT_APP_API_URL}/user/${id}`,
        { _id: id, status: -1 },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        showSuccessAlert('Physician User Deleted Successfully!')
        setPage(0)
        getData()
      })
      .catch((err) => {
        handleEditModal()
        if (err && err.response) {
          showErrorAlert(getErrorMessage(err))
        }
      })
  }

  // Confirmation Sweet Alert
  const handleConfirm = (id, callback, msg, btnMsg) => {
    return showConfirm({ text: msg, confirmButtonText: btnMsg }).then(
      (result) => {
        if (result && result.isConfirmed) {
          callback(id)
        }
        setTip(!tip)
      }
    )
  }

  // ** Table item Button Handlers
  const editHandler = (row) => {
    console.log(row, 'row Data')

    // Properly map the row data to form structure
    const mappedData = {
      _id: row._id,
      physicianname: row.physicianname || row.full_name || '',
      hospitalname: row.hospitalname || '',
      email: row.email || '',
      cno: row.cno || '',
      location: row.location || '',
      dob: row.dob || '',
      status: row.status || 1,
      designation: row.designation || '',
      secondaryEmail: row.secondaryEmail
        ? row.secondaryEmail.filter((obj) => obj !== '')
        : [],
      secondaryCno: row.secondaryCno
        ? row.secondaryCno.filter((obj) => obj !== '')
        : [],
      clinics: row.clinics || [],
    }

    SetUpdateData(mappedData)
    handleEditModal()
  }

  const deleteHandler = (id) => {
    deleteUser(id)
  }

  const DeactivationHandler = (id) => {
    const deactivationOptions = {
      _id: id,
      status: 0,
      physicianstatus: 0, // Also update physicianstatus for physicians
    }
    updateUserDetails(deactivationOptions, 'deactivate')
  }

  const ActivationHandler = (id) => {
    const activationOptions = {
      _id: id,
      status: 1,
      physicianstatus: 1, // Also update physicianstatus for physicians
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
      name: 'Username',
      selector: (row) => (row['username'] ? row['username'] : '-'),
      sortable: true,
      reorder: true,
      id: 'username',
      minWidth: '150px',
      cell: (row) => {
        return (
          <div style={{ whiteSpace: 'break-spaces' }}>
            {row.username || '-'}
          </div>
        )
      },
    },
    {
      name: 'Name',
      selector: (row) => row.physicianname || row.full_name,
      sortable: true,
      reorder: true,
      id: 'physicianname',
      minWidth: '190px',
      maxWidth: '250px',
      cell: (row) => {
        return (
          <div style={{ whiteSpace: 'break-spaces' }}>
            {row.physicianname || row.full_name}
          </div>
        )
      },
    },
    {
      name: 'Email',
      selector: (row) => (row['email'] ? row['email'] : '-'),
      sortable: true,
      reorder: true,
      id: 'email',
      minWidth: '190px',
      maxWidth: '250px',
      cell: (row) => {
        return <div style={{ whiteSpace: 'break-spaces' }}>{row.email}</div>
      },
    },
    {
      name: 'Hospital Name',
      selector: 'hospitalname',
      sortable: true,
      reorder: true,
      id: 'hospitalname',
      minWidth: '190px',
      maxWidth: '250px',
      cell: (row) => {
        return (
          <div style={{ whiteSpace: 'break-spaces' }}>
            {row.hospitalname || '-'}
          </div>
        )
      },
    },
    {
      name: 'Location',
      cell: (row) => (row['location'] ? row['location'] : '-'),
      sortable: true,
      reorder: true,
      id: 'location',
      minWidth: '150px',
    },
    {
      name: 'Date Of Birth',
      cell: (row) => (row['dob'] ? row['dob'] : '-'),
      sortable: true,
      reorder: true,
      id: 'dob',
      minWidth: '120px',
    },
    {
      name: 'Designation',
      cell: (row) => (row['designation'] ? row['designation'] : '-'),
      sortable: true,
      reorder: true,
      id: 'designation',
      minWidth: '150px',
    },
    {
      name: 'Clinic Name(s)',
      selector: (row) => (row['clinics'] ? row['clinics']['clinicName'] : '-'),
      sortable: true,
      reorder: true,
      id: 'clinic',
      minWidth: '190px',
      maxWidth: '250px',
      height: 'auto',
      cell: (row) => {
        return (
          <div style={{ whiteSpace: 'break-spaces' }}>
            {row?.clinics
              ?.map((data) => {
                return data?.clinicName
              })
              .join(' , ')}
          </div>
        )
      },
    },
    {
      name: 'Number of Studies',
      sortable: false,
      reorder: true,
      id: 'numberOfStudies',
      cell: (row) => row.numberOfStudies || '-',
    },
    {
      name: 'Status',
      selector: 'status',
      sortable: true,
      reorder: true,
      id: 'status',
      cell: (row) => {
        return (
          <Badge color={status[row?.status]?.color} pill>
            {status[row?.status]?.title || 'N/A'}
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
      cell: (row) => {
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
              <CardTitle tag="h4">Physician Name</CardTitle>
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
              <Col
                className="d-flex align-items-center justify-content-end mt-1"
                md="6"
                sm="12"
              >
                <Label className="mr-1" for="search-input">
                  Search
                </Label>
                <Input
                  className="dataTable-filter mb-50"
                  type="text"
                  bsSize="sm"
                  id="search-input"
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value)
                  }}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <ListTable
                  {...{
                    moduleName: 'physician',
                    tableData: data,
                    visibleColumns: columns,
                    rows: rowsPerPage,
                    totalRecords: total,
                    first: page,
                    onSort: handleSort,
                    sortField,
                    sortOrder,
                    onPage: (e) => {
                      setPage(e.first++)
                      setRowsPerPage((prev) => e.rows)
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
        editData={updateData}
      />
    </Fragment>
  )
}

export default physician
