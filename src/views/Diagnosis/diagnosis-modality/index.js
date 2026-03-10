// ** React Imports
import { Fragment, useEffect, useState } from 'react'
import axios from 'axios'

import { useNavigate } from 'react-router-dom'
// ** Alert Utils
import {
  showConfirm,
  showSuccessAlert,
  showErrorAlert,
  showLoadingAlert,
  hideLoadingAlert,
  getErrorMessage,
} from '../../../utils/alerts'

// ** Third Party Components
import {
  Row,
  Col,
  Badge,
  UncontrolledTooltip,
  Card,
  CardHeader,
  CardTitle,
  Button,
  Label,
  Input,
} from 'reactstrap'
import { Edit, Trash, Plus } from 'react-feather'

// ** Styles
import '@styles/react/libs/tables/react-dataTable-component.scss'
import ListTable from '../../../@core/components/list-table'

const DiagnosisModality = () => {
  // ** States
  const [data, setData] = useState([])
  const [rowsPerPage, setRowsPerPage] = useState(7)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [searchValue, setSearchValue] = useState('')
  const [sortColumn, setSortColumn] = useState('createdOn')
  const [sortDirection, setSortDirection] = useState('desc')
  const [startsrno, setStartsrno] = useState(0)
  const [sortField, setSortField] = useState(null)
  const [sortOrder, setSortOrder] = useState(0)

  const navigate = useNavigate()

  const getData = async () => {
    try {
      axios
        .get(`${process.env.REACT_APP_API_URL}/diagnosis/modality`, {
          params: {
            page,
            size: rowsPerPage,
            filter: searchValue,
            sortdirection: sortDirection,
            sortcolumn: sortColumn,
          },
        })
        .then((res) => {
          setData(res.data.list)
          setTotal(res.data.numberOfRecord)
          setStartsrno(res.data.startsrno ? res.data.startsrno : 0)
        })
    } catch (error) {}
  }
  // ** Fetch data
  useEffect(() => {
    getData()
  }, [page, rowsPerPage, searchValue, sortColumn, sortDirection])

  function handleSort(e) {
    setSortOrder(e.sortOrder)
    setSortField(e.sortField)
    setSortColumn(e.sortField)
    setSortDirection(e.sortOrder > 0 ? 'asc' : 'desc')
    setPage(0)
  }

  // ** Function to handle Modal toggle
  const handleAddNew = () => {
    navigate('/diagnosis-modality/add')
  }

  // Confirmation Sweet Alert
  const handleConfirm = async (row) => {
    try {
      const result = await showConfirm({
        title: '<p>Are you sure to delete this modality?</p>',
        text: 'This action is irreversible.',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
      })

      if (result?.isConfirmed) {
        try {
          showLoadingAlert()
          await axios.delete(
            `${process.env.REACT_APP_API_URL}/diagnosis/modality/${row?._id}`
          )
          hideLoadingAlert()
          await showSuccessAlert(
            'Modality Deleted Successfully!',
            '<p>Deleted!</p>'
          )
          getData()
        } catch (err) {
          hideLoadingAlert()
          showErrorAlert(getErrorMessage(err))
        }
      }
    } catch (err) {
      showErrorAlert(getErrorMessage(err))
    }
  }

  // ** Table item Button Handlers
  const editHandler = (row) => {
    navigate(`/diagnosis-modality/${row._id}/edit`)
  }

  const columns = [
    {
      name: 'Name',
      selector: (row) => (row['name'] ? row['name'] : '-'),
      sortable: true,
      reorder: true,
      id: 'name',
      minWidth: '150px',
      cell: (row) => {
        return <div style={{ whiteSpace: 'break-spaces' }}>{row.name}</div>
      },
    },
    {
      name: 'Status',
      selector: (row) => (row['status'] ? row['status'] : '-'),
      sortable: true,
      reorder: true,
      id: 'status',
      cell: (row) => {
        return (
          <Badge color={row.status ? 'light-success' : 'light-danger'} pill>
            {row.status ? 'Active' : 'In Active'}
          </Badge>
        )
      },
    },
    {
      name: 'Template count',
      selector: (row) => (row['templateCount'] ? row['templateCount'] : '-'),
      sortable: false,
      reorder: true,
      id: 'template-count',
      cell: (row) => {
        return (
          <div style={{ whiteSpace: 'break-spaces' }}>{row.templateCount}</div>
        )
      },
    },
    {
      name: 'Actions',
      allowOverflow: true,
      sortable: false,
      reorder: true,
      id: 'Actions',
      cell: (row) => {
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
                handleConfirm(row)
              }}
            />
            <UncontrolledTooltip className="tooltip-react-strap" target="edit">
              Edit
            </UncontrolledTooltip>
            <UncontrolledTooltip className="tooltip-react-strap" target="trash">
              Delete
            </UncontrolledTooltip>
          </div>
        )
      },
    },
  ]

  return (
    <Fragment>
      <Card>
        <CardHeader className="flex-md-row flex-column align-md-items-center align-items-center border-bottom">
          <CardTitle tag="h4">Diagnosis Modality List</CardTitle>
          <div className="d-flex mt-md-0 mt-1">
            <Button
              className="ml-2"
              color={'primary'}
              onClick={() => {
                handleAddNew()
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
                moduleName: 'diagnosis-modality',
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
                },
              }}
            />
          </Col>
        </Row>
      </Card>
    </Fragment>
  )
}

export default DiagnosisModality
