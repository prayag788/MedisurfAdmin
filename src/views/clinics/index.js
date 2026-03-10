import { useState, useEffect } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  Button,
  Row,
  Col,
  Label,
  Input,
  UncontrolledTooltip,
  Spinner,
  Badge,
} from 'reactstrap'
import { Edit, Trash, Plus } from 'react-feather'
import axios from 'axios'

import AddClinic from './AddClinic'
import { handleConfirm, deleteUser } from './utils/alert/alert'

import '@styles/react/libs/tables/react-dataTable-component.scss'
import ListTable from '../../@core/components/list-table'
import EditModal from './EditModal'
import AddNewModal from './AddNewModal'

import {
  showErrorAlert,
  showSuccessAlert,
  getErrorMessage,
  showLoadingAlert,
  hideLoadingAlert,
} from '../../utils/alerts'
const status = {
  0: { title: 'Inactive', color: 'light-danger' },
  1: { title: 'Active', color: 'light-success' },
}

const allow_edit_patient_details = {
  0: { title: 'Not Allowed', color: 'light-danger' },
  1: { title: 'Allowed', color: 'light-success' },
}

const Clinic = () => {
  const [modal, setModal] = useState(false)
  const [editModal, SetEditModal] = useState(false)
  const [newUserId, SetNewUserId] = useState('')
  const [updateData, SetUpdateData] = useState({
    _id: '',
    fname: '',
    lname: '',
    email: '',
    cno: '',
    secondaryEmail: [],
    secondaryCno: [],
    status: 1,
    allow_edit_patient_details: 0,
  })
  const [clinicList, setClinicList] = useState([])
  const [loading, setLoading] = useState(true)
  const [addDisplay, setAddDisplay] = useState(false)
  const [rowsPerPage, setRowsPerPage] = useState(7)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [tip, setTip] = useState(false)
  const [newData, setNewData] = useState(false)
  const [filter, setFilter] = useState('')
  const [toEdit, setToEdit] = useState()
  const [sortColumn, setSortColumn] = useState('')
  const [sortDirection, setSortDirection] = useState('desc')
  const [visibleColumns, setVisibleColumns] = useState([])
  const [sortField, setSortField] = useState(null)
  const [sortOrder, setSortOrder] = useState(0)
  const [searchVal, setSearchVal] = useState('')

  // ** Function to handle Modal toggle
  const handleModal = () => setModal(!modal)
  const handleEditModal = () => SetEditModal(!editModal)
  let myTimeout

  const getData = async () => {
    setLoading(true)
    await axios
      .get(
        `${process.env.REACT_APP_API_URL}/institution-clinics?page=${page}&size=${rowsPerPage}&filter=${filter}&sortdirection=${sortDirection}&sortcolumn=${sortColumn}`
      )
      .then((response) => {
        setClinicList(response.data.data)
        setTotal(response.data.total)
      })
    setLoading(false)
  }

  useEffect(() => {
    if (!modal || !editModal) {
      getData()
    }
  }, [
    page,
    rowsPerPage,
    newData,
    filter,
    addDisplay,
    sortColumn,
    sortDirection,
    modal,
    editModal,
  ])

  const deleteHandler = async (id) => {
    const res = await deleteUser(id)
    if (res) {
      setNewData(!newData)
    }
  }

  function handleSort(d) {
    if (d.sortField) {
      setSortOrder(d.sortOrder)
      setSortField(d.sortField)
      setSortColumn(d.sortField)
      setSortDirection(d.sortOrder === -1 ? 'desc' : 'asc')
      setPage(0)

      if (sortOrder === -1) {
        clinicList.sort((a, b) =>
          String(b[d.sortField]).localeCompare(String(a[d.sortField]))
        )
      } else {
        clinicList.sort((a, b) =>
          String(a[d.sortField]).localeCompare(String(b[d.sortField]))
        )
      }

      setClinicList(clinicList)
    }
  }
  const addNewInstitutionClinics = (requestData) => {
    showLoadingAlert()
    axios
      .post(
        `${process.env.REACT_APP_API_URL}/institution-clinics/add`,
        requestData
      )
      .then((response) => {
        handleModal()
        console.log(response, 'added doc')
        hideLoadingAlert()
        showSuccessAlert('Clinic Added Successfully!')
      })
      .catch((err) => {
        hideLoadingAlert()
        if (err && err.response) {
          showErrorAlert(getErrorMessage(err))
        }
      })
  }
  const updateUserDetails = (data, type) => {
    console.log(data, 'datato update')

    // }
    showLoadingAlert()
    axios
      .patch(
        `${process.env.REACT_APP_API_URL}/institution-clinics/edit/${data._id}`,
        data
      )
      .then((response) => {
        hideLoadingAlert()
        showSuccessAlert(
          `Clinic User ${type === 'activate' ? 'Activated' : type === 'deactivate' ? 'Deactivated' : 'Updated'} Successfully!`
        )
        if (editModal) {
          handleEditModal()
        }
      })
      .catch((err) => {
        hideLoadingAlert()
        if (err && err.response) {
          showErrorAlert(getErrorMessage(err))
        }
      })
  }
  const columns = [
    // {

    // },
    {
      name: 'Clinic Name',
      sortable: true,
      reorder: true,
      id: 'clinicName',
      cell: (row) => row.clinicName,
    },
    {
      name: 'Number of Studies',
      sortable: true,
      reorder: true,
      id: 'numberOfStudies',
      cell: (row) => (row.numberOfStudies ? row.numberOfStudies : 0),
    },
    {
      name: 'Exist in Orthanc',
      sortable: true,
      reorder: true,
      id: 'existInOrthanc',
      cell: (row) => (row.orthancExistStatus === 1 ? 'Yes' : 'No'),
    },
    {
      name: 'Phone Number',
      sortable: true,
      reorder: true,
      id: 'phoneNumber',
      cell: (row) => {
        const primaryPhone = row.cno && row.cno !== '' ? row.cno : '-'
        const secondaryPhones =
          row.secondaryCno &&
          Array.isArray(row.secondaryCno) &&
          row.secondaryCno.length > 0
            ? row.secondaryCno.join(' , ')
            : ''
        return `${primaryPhone}${secondaryPhones ? ` , ${secondaryPhones}` : ''}`
      },
    },
    {
      name: 'Email',
      sortable: true,
      reorder: true,
      id: 'email',
      cell: (row) => {
        const email = row.email ? row.email : ''
        const secondaryEmail =
          row.secondaryEmail &&
          Array.isArray(row.secondaryEmail) &&
          row.secondaryEmail.length > 0
            ? row.secondaryEmail.join(' , ')
            : ''
        return `${email}${secondaryEmail ? ` , ${secondaryEmail}` : ''}`
      },
    },
    {
      name: 'Status',
      selector: 'status',
      sortable: true,
      reorder: true,
      id: 'status',
      cell: (row) => {
        const statusInfo = status[row?.status] || status[0] // Default to inactive if undefined
        return (
          <Badge color={statusInfo?.color || 'light-secondary'} pill>
            {statusInfo?.title || 'Unknown'}
          </Badge>
        )
      },
    },
    {
      name: 'Allow to Edit the Patient Details?',
      selector: 'allow_edit_patient_details',
      sortable: true,
      reorder: true,
      id: 'allow_edit_patient_details',
      cell: (row) => {
        const editInfo =
          allow_edit_patient_details[row?.allow_edit_patient_details] ||
          allow_edit_patient_details[0] // Default to not allowed if undefined
        return (
          <Badge color={editInfo?.color || 'light-secondary'} pill>
            {editInfo?.title || 'Unknown'}
          </Badge>
        )
      },
    },
    {
      name: 'Actions',
      sortable: false,
      allowOverflow: true,
      maxWidth: '90px',
      id: 'action',
      style: {
        'border-left': '1px dotted #6e6b7b',
      },
      cell: (row) => {
        return (
          <div className="d-flex">
            <Edit
              size={15}
              className="mr-50"
              id="edit"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                SetUpdateData(row)
                SetEditModal(true)
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
                  'This action is irreversible. Are you sure you want to proceed with the clinic deletion?',
                  'Yes, delete it!'
                )
                setTip(!tip)
              }}
            />
            <UncontrolledTooltip target="edit" className="tooltip-react-strap">
              Edit
            </UncontrolledTooltip>
            <UncontrolledTooltip target="trash" className="tooltip-react-strap">
              Delete
            </UncontrolledTooltip>
          </div>
        )
      },
    },
  ]
  const filterHandler = (e) => {
    setSearchVal(e.target.value)
    clearTimeout(myTimeout)
    myTimeout = setTimeout(() => {
      setFilter(e.target.value)
    }, 1000)
  }

  if (addDisplay) {
    return <AddClinic AddNewModal={AddNewModal} toEdit={toEdit} />
  } else {
    return (
      <Card>
        <CardHeader className="flex-md-row flex-column align-md-items-center align-items-center border-bottom">
          <CardTitle tag="h4">Clinic Names</CardTitle>
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
              value={searchVal}
              onChange={(e) => filterHandler(e)}
            />
          </Col>
        </Row>
        <Row>
          <Col sm="12">
            <Card className="m-0">
              {loading ? (
                <Card className="loading-initial">
                  <Spinner color="primary" />
                </Card>
              ) : (
                <>
                  <Row>
                    <Col>
                      {
                        <ListTable
                          {...{
                            moduleName: 'institution-clinics',
                            tableData: clinicList,
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
                      }
                    </Col>
                  </Row>
                </>
              )}
            </Card>
          </Col>
        </Row>
        <AddNewModal
          addNewInstitutionClinics={addNewInstitutionClinics}
          open={modal}
          handleModal={handleModal}
          newUserId={newUserId}
        />
        {editModal && (
          <EditModal
            updateUser={updateUserDetails}
            open={editModal}
            handleModal={handleEditModal}
            editData={updateData}
          />
        )}
      </Card>
    )
  }
}

export default Clinic
