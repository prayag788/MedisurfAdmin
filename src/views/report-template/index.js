// ** React Imports
import { Fragment, useEffect, useState } from 'react'
import axios from 'axios'

import { useNavigate } from 'react-router-dom'
// ** Centralized Alerts
import {
  showConfirm,
  showSuccessAlert,
  showErrorAlert,
  getErrorMessage,
} from '../../utils/alerts'

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
} from 'reactstrap'
import { Edit, Trash, Eye, Plus } from 'react-feather'

// ** Styles
import '@styles/react/libs/tables/react-dataTable-component.scss'
import ListTable from '../../@core/components/list-table'
import TemplatePreview from './TemplatePreview'

const ReportTemplate = () => {
  const userData = JSON.parse(localStorage.getItem('userData'))

  // ** States
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewText, setPreviewText] = useState('')
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
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/report-template`,
        {
          params: {
            page: page + 1,
            size: rowsPerPage,
            filter: searchValue,
            sortdirection: sortDirection,
            sortcolumn: sortColumn,
          },
        }
      )

      if (response.data.success) {
        setData(response.data.list || [])
        setTotal(response.data.numberOfRecord || 0)
        setStartsrno(response.data.startsrno || 0)
      }
    } catch (error) {
      console.error('Error fetching report templates:', error)
      setData([])
      setTotal(0)
    }
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
    navigate('/report-template/new')
  }

  // Confirmation using centralized alerts
  const handleConfirm = async (row) => {
    const result = await showConfirm({
      title: '<p>Are you sure to delete this template?</p>',
      text: 'This action is irreversible.',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    })
    if (result?.isConfirmed) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/report-template/${row?._id}`
        )
        await showSuccessAlert(
          'Template Deleted Successfully!.',
          '<p>Deleted!</p>'
        )
        getData()
      } catch (err) {
        await showErrorAlert(getErrorMessage(err))
      }
    }
  }

  // ** Table item Button Handlers
  const editHandler = (row) => {
    navigate(`/report-template/${row._id}/edit`)
  }

  const previewHandler = (row) => {
    setPreviewOpen(true)
    setPreviewText(row?.text)
  }

  const columns = [
    {
      name: 'Name',
      selector: (row) => (row['name'] ? row['name'] : '-'),
      sortable: true,
      reorder: true,
      visible: true,
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
      visible: true,
      id: 'status',
      cell: (row) => {
        return (
          <Badge
            color={row.status === '1' ? 'light-success' : 'light-danger'}
            pill
          >
            {row.status === '1' ? 'Active' : 'In Active'}
          </Badge>
        )
      },
    },
    {
      name: 'Actions',
      allowOverflow: true,
      visible: true,
      sortable: false,
      reorder: false,
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
            <Eye
              size={15}
              className="ml-50 mr-50"
              id="preview"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                previewHandler(row)
              }}
            />
            <UncontrolledTooltip
              target="preview"
              className="tooltip-react-strap"
            >
              Preview
            </UncontrolledTooltip>
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
          <CardTitle tag="h4">Template List</CardTitle>
          {parseInt(userData?.reportLimit) > parseInt(total) && (
            <div className="d-flex mt-md-0 mt-1 ">
              <Button className="ml-2" color="primary" onClick={handleAddNew}>
                <Plus size={15} />
                <span className="align-middle ml-50">Add New</span>
              </Button>
            </div>
          )}
        </CardHeader>
        <Row>
          <Col sm="12">
            <ListTable
              {...{
                moduleName: 'report-template',
                tableData: data,
                visibleColumns: columns,
                rows: rowsPerPage,
                totalRecords: total,
                first: page,
                onSort: handleSort,
                sortField,
                sortOrder,
                onPage: (e) => {
                  setPage(e.first)
                  setRowsPerPage(e.rows)
                },
              }}
            />
          </Col>
        </Row>
      </Card>

      <TemplatePreview
        previewOpen={previewOpen}
        setPreviewOpen={setPreviewOpen}
        previewText={previewText}
      />
    </Fragment>
  )
}

export default ReportTemplate
