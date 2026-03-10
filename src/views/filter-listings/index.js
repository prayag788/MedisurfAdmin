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
import { useSelector } from 'react-redux'
import ROLES from '../../configs/roles'
import ROLES_NAME from '../../configs/roles_name'

const ClinicUser = () => {
  // ** States
  const [modal, setModal] = useState(false)
  const [editModal, SetEditModal] = useState(false)
  const [newUserId, SetNewUserId] = useState('')
  const [tip, setTip] = useState(false)
  const [selectedItem, setSelectedItem] = useState({
    Physicians: [],
    clinicNames: [],
    Users: [],
    modality: [],
    name: '',
    status: 1,
    _id: '',
    studyStatus: [],
    filterfor: '',
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
  const userData = useSelector((state) => state.auth.userData)

  // ** Fetch data
  const getData = async () => {
    const token = localStorage.getItem('accessToken')
    axios
      .get(`${process.env.REACT_APP_API_URL}/filter-module/get`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page,
          size: rowsPerPage,
          filter: searchValue,
          sortdirection: sortDirection,
          sortcolumn: sortColumn,
        },
      })
      .then((doc) => {
        const dataPayload = doc.data
        // Support both shapes: { list, numberOfRecord, startsrno } or { success, result } (single filter row)
        // Do not treat table-config (moduleName + columns) as filter list
        let list = Array.isArray(dataPayload?.list) ? dataPayload.list : null
        if (
          (list === null || list === undefined) &&
          dataPayload?.result !== null &&
          dataPayload?.result !== undefined
        ) {
          const result = dataPayload.result
          const isTableConfig =
            result &&
            (result.moduleName === 'filter-listings' ||
              (result.columns && Array.isArray(result.columns)))
          if (!isTableConfig) {
            list = Array.isArray(result) ? result : [result]
          }
        }
        list = list || []
        // Exclude soft-deleted (status === -1) from display
        const activeList = list.filter((obj) => {
          const row = typeof obj?.toJSON === 'function' ? obj.toJSON() : obj
          return row !== null && row !== undefined && row.status !== -1
        })
        const numberOfRecord = dataPayload?.numberOfRecord ?? activeList.length
        const startsrnoVal =
          dataPayload?.startsrno !== null &&
          dataPayload?.startsrno !== undefined
            ? dataPayload.startsrno
            : 0

        setStartsrno(startsrnoVal)
        setData(
          activeList.map((obj, index) => {
            const row =
              typeof obj?.toJSON === 'function' ? obj.toJSON() : { ...obj }
            row.sl = startsrnoVal + index + 1
            return row
          })
        )
        SetNewUserId(dataPayload?.nextId ?? '')
        setRefreshLoading(false)
        setTotal(numberOfRecord)
      })
      .catch((err) => {
        setRefreshLoading(false)
        if (err && err.response) {
          showErrorAlert(getErrorMessage(err))
        }
      })
  }
  useEffect(() => {
    if (!modal && !editModal) {
      getData()
    }
  }, [
    page,
    rowsPerPage,
    searchValue,
    sortColumn,
    sortDirection,
    modal,
    editModal,
  ])

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
    const token = localStorage.getItem('accessToken')
    showLoadingAlert()
    axios
      .post(`${process.env.REACT_APP_API_URL}/filter-module/add`, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((doc) => {
        handleModal()
        hideLoadingAlert()
        showSuccessAlert('Filter Added Successfully!')
        getData() // Refresh the list
      })
      .catch((err) => {
        hideLoadingAlert()
        if (err && err.response) {
          showErrorAlert(getErrorMessage(err))
        }
      })
  }

  const updateUserDetails = (data, type) => {
    if (editModal) {
      handleEditModal()
    }
    const token = localStorage.getItem('accessToken')
    showLoadingAlert()
    axios
      .patch(
        `${process.env.REACT_APP_API_URL}/filter-module/update/${data._id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((doc) => {
        hideLoadingAlert()
        showSuccessAlert(
          `Filter ${type === 'activate' ? 'Activated' : type === 'deactivate' ? 'Deactivated' : 'Updated'} Successfully!`
        )
        getData() // Refresh the list
      })
      .catch((err) => {
        hideLoadingAlert()
        if (err && err.response) {
          showErrorAlert(getErrorMessage(err))
        }
      })
  }

  function deleteFilter(id) {
    console.log('Deleting filter with ID:', id)
    const token = localStorage.getItem('accessToken')
    showLoadingAlert()

    axios
      .delete(`${process.env.REACT_APP_API_URL}/filter-module/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((doc) => {
        hideLoadingAlert()
        showSuccessAlert('Filter Deleted Successfully!')
        getData()
      })
      .catch((err) => {
        hideLoadingAlert()
        console.error('Delete error:', err)
        if (err && err.response) {
          showErrorAlert(getErrorMessage(err))
        } else {
          showErrorAlert('Failed to delete filter')
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
    console.log('Edit handler called with row:', row)

    // Map the row data to the expected format for the edit modal
    const mappedData = {
      _id: row._id || row.id,
      name: row.name || '',
      status: row.status || 1,
      filterfor: row.filterfor || 'CU',
      clinicNames: row.clinicNames || [],
      Physicians: row.Physicians || [],
      Users: row.Users || [],
      modality: row.modality || [],
      studyStatus: row.studyStatus || [],
    }

    console.log('Mapped edit data:', mappedData)
    setSelectedItem(mappedData)
    handleEditModal()
  }

  const deleteHandler = (id) => {
    deleteFilter(id)
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

  // ** Component Columns – status map (soft-deleted -1 filtered out above, not shown)
  const statusMap = {
    0: { title: 'Inactive', color: 'light-danger' },
    1: { title: 'Active', color: 'light-success' },
  }
  const getStatusDisplay = (rowStatus) => {
    const key =
      rowStatus !== null && rowStatus !== undefined ? Number(rowStatus) : null
    return statusMap[key] || { title: 'Unknown', color: 'light-secondary' }
  }

  const columns = [
    {
      name: 'Filter Name',
      selector: 'name',
      sortable: true,
      reorder: true,
      id: 'name',
      visible: true,
      minWidth: '150px',
      cell: (row) => {
        return <div style={{ whiteSpace: 'break-spaces' }}>{row.name}</div>
      },
    },
    {
      name: 'Physicians',
      sortable: true,
      reorder: true,
      id: 'physicians',
      minWidth: '150px',
      cell: (row) => {
        const names = row.physicianNames || []
        return (
          <div style={{ whiteSpace: 'break-spaces' }}>
            {names.length > 0 ? names.join(', ') : '-'}
          </div>
        )
      },
    },
    {
      name: 'Clinic Users',
      sortable: true,
      reorder: true,
      id: 'clinicUsers',
      minWidth: '150px',
      cell: (row) => {
        const clinicUsers = row.clinicUserNames || []
        return (
          <div style={{ whiteSpace: 'break-spaces' }}>
            {clinicUsers.length > 0
              ? clinicUsers.filter((name) => name && name.trim()).join(', ')
              : '-'}
          </div>
        )
      },
    },
    {
      name: 'Clinic Names',
      sortable: true,
      reorder: true,
      id: 'clinicNames',
      visible: true,
      minWidth: '190px',
      maxWidth: '250px',
      cell: (row) => {
        return (
          <div style={{ whiteSpace: 'break-spaces' }}>
            {row['clinicNamesDisplay'] && row['clinicNamesDisplay'].length > 0
              ? row['clinicNamesDisplay']
                  .filter((name) => name && name !== 'undefined')
                  .join(', ')
              : '-'}
          </div>
        )
      },
    },
    {
      name: 'Modality',
      sortable: true,
      reorder: true,
      id: 'modality',
      minWidth: '190px',
      maxWidth: '250px',
      cell: (row) => {
        return (
          <div style={{ whiteSpace: 'break-spaces' }}>
            {row.modality && row.modality.length > 0
              ? row.modality
                  .map((item) => item.label || item.value || item)
                  .join(', ')
              : '-'}
          </div>
        )
      },
    },
    {
      name: 'Study Status',
      sortable: true,
      reorder: true,
      id: 'studyStatus',
      minWidth: '190px',
      maxWidth: '250px',
      cell: (row) => {
        const studyStatusMap = {
          examined: 'Examined',
          draft: 'Draft',
          reported: 'Reported',
          verified: 'Verified',
          Examined: 'Examined',
          Draft: 'Draft',
          Reported: 'Reported',
          Verified: 'Verified',
        }
        return (
          <div style={{ whiteSpace: 'break-spaces' }}>
            {row['studyStatus'] && row['studyStatus'].length > 0
              ? row['studyStatus']
                  .map((item) => {
                    const value = item.value || item.label || item
                    return studyStatusMap[value.toLowerCase()] || value
                  })
                  .join(', ')
              : '-'}
          </div>
        )
      },
    },

    {
      name: 'Status',
      selector: 'status',
      sortable: true,
      reorder: true,
      id: 'status',
      cell: (row) => {
        const display = getStatusDisplay(row?.status)
        return (
          <Badge color={display.color} pill>
            {display.title}
          </Badge>
        )
      },
    },
    {
      name: 'Actions',
      allowOverflow: true,
      sortable: false,
      reorder: true,
      id: 'action',
      cell: (row) => {
        return userData._id === row.created_by ? (
          <div className="d-flex">
            <Edit
              size={15}
              id="edit"
              className="mr-50"
              style={{ cursor: 'pointer' }}
              onClick={() => editHandler(row)} // Ensure editHandler is defined
            />
            <Trash
              size={15}
              id={`trash-${row._id || row.id}`}
              className="ml-50 mr-50"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                const filterId = row._id || row.id
                console.log('Delete clicked for filter:', filterId)
                handleConfirm(
                  filterId,
                  deleteHandler,
                  "You won't be able to revert this!",
                  'Yes, delete it!'
                )
              }}
            />

            <UncontrolledTooltip className="tooltip-react-strap" target="edit">
              Edit
            </UncontrolledTooltip>
            <UncontrolledTooltip
              className="tooltip-react-strap"
              target={`trash-${row._id || row.id}`}
            >
              Delete
            </UncontrolledTooltip>
          </div>
        ) : (
          'N/A'
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
              <CardTitle tag="h4">Filter Listing</CardTitle>
              <div className="d-flex mt-md-0 mt-1">
                {userData.role !== ROLES.ClinicUser && (
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
                )}
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
                    moduleName: 'filter-listings',
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
        key={selectedItem?._id || 'edit-modal'}
        updateUser={updateUserDetails}
        open={editModal}
        handleModal={handleEditModal}
        editData={selectedItem}
      />
    </Fragment>
  )
}

export default ClinicUser
