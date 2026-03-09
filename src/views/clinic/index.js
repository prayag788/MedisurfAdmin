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
} from 'reactstrap'
import { Edit, Trash, Plus } from 'react-feather'
import axios from 'axios'

import AddClinic from './AddClinic'
import { handleConfirm, deleteUser } from './utils/alert/alert'

import '@styles/react/libs/tables/react-dataTable-component.scss'
import ListTable from '../../@core/components/list-table'

const Clinic = () => {
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
  const [sortColumn, setSortColumn] = useState('information.createdOn')
  const [sortDirection, setSortDirection] = useState('desc')
  const [visibleColumns, setVisibleColumns] = useState([])
  const [sortField, setSortField] = useState(null)
  const [sortOrder, setSortOrder] = useState(0)
  const [searchVal, setSearchVal] = useState('')
  let myTimeout

  const getData = async () => {
    setLoading(true)
    await axios
      .get(
        `${process.env.REACT_APP_API_URL}/clinic?page=${page}&size=${rowsPerPage}&filter=${filter}&sortdirection=${sortDirection}&sortcolumn=${sortColumn}`
      )
      .then(res => {
        setClinicList(res.data.data)
        setTotal(res.data.total)
      })
    setLoading(false)
  }

  useEffect(() => {
    getData()
  }, [page, rowsPerPage, newData, filter, addDisplay, sortColumn, sortDirection])

  const deleteHandler = async id => {
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

      if (sortOrder === -1) {
        clinicList.sort((a, b) => String(b[d.sortField]).localeCompare(String(a[d.sortField])))
      } else {
        clinicList.sort((a, b) => String(a[d.sortField]).localeCompare(String(b[d.sortField])))
      }

      setClinicList(clinicList)
    }
  }

  const columns = [
    {
      name: 'Hospital',
      sortable: false,
      reorder: true,
      id: 'information.hospital',
      cell: row => row.information.hospital,
    },
    {
      name: 'Email',
      sortable: false,
      reorder: true,
      id: 'information.email',
      cell: row => row.information.email,
    },
    {
      name: 'Contact',
      sortable: false,
      reorder: true,
      id: 'information.contact',
      cell: row => row.information.contact,
    },
    {
      name: 'Template',
      sortable: false,
      reorder: true,
      id: 'template',
      cell: row => row.license?.reportLimit ?? 0,
    },
    {
      name: 'Radiologist',
      sortable: false,
      reorder: true,
      id: 'license.radiologist',
      cell: row => row.license.radiologist,
    },
    {
      name: 'Technologist',
      sortable: false,
      reorder: true,
      id: 'license.technician',
      cell: row => row.license.technician,
    },
    {
      name: 'Report Module',
      sortable: false,
      reorder: true,
      id: 'license.report',
      cell: row => (row.license.report ? 'Yes' : 'No'),
    },
    {
      name: 'Actions',
      sortable: false,
      allowOverflow: true,
      maxWidth: '90px',
      id: 'information.action',
      style: {
        position: 'sticky',
        right: '0',
        'border-left': '1px dotted #6e6b7b',
      },
      cell: row => {
        return (
          <div className="d-flex">
            <Edit
              size={15}
              className="mr-50"
              id="edit"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setToEdit(row)
                setAddDisplay(true)
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

  const AddNewModal = data => {
    setAddDisplay(data)
    setToEdit()
  }

  const filterHandler = e => {
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
          <CardTitle tag="h4">Clinic list</CardTitle>
          <div className="d-flex mt-md-0 mt-1">
            <Button className="ml-2" color="primary" onClick={() => setAddDisplay(!addDisplay)}>
              <Plus size={15} />
              <span className="align-middle ml-50">Add New</span>
            </Button>
          </div>
        </CardHeader>
        <Row>
          <Col sm="12">
            <Card className="m-0">
              {loading ? (
                <Card className="loading-initial">
                  <Spinner color="primary" />
                </Card>
              ) : (
                <>
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
                        onChange={e => filterHandler(e)}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <ListTable
                        {...{
                          moduleName: 'clinic',
                          tableData: clinicList,
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
                </>
              )}
            </Card>
          </Col>
        </Row>
      </Card>
    )
  }
}

export default Clinic
