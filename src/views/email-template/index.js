// ** React Imports
import { Fragment, useState } from 'react'

import { useNavigate } from 'react-router-dom'

// ** Third Party Components
import {
  Row,
  Col,
  UncontrolledTooltip,
  Card,
  CardHeader,
  CardTitle,
} from 'reactstrap'
import { Edit } from 'react-feather'

// ** Styles
import '@styles/react/libs/tables/react-dataTable-component.scss'
import ListTable from '../../@core/components/list-table'

const ReportTemplate = () => {
  // ** States
  const [data, setData] = useState([
    { name: 'Share study', url: 'share-study' },
    { name: 'New user registration', url: 'new-user' },
    { name: 'Assign study', url: 'assign-study' },
    { name: 'Update user email', url: 'update-user-email' },
    { name: 'Forgot password', url: 'forgot-password' },
  ])
  const [rowsPerPage, setRowsPerPage] = useState(7)
  const [page, setPage] = useState(0)
  const [sortColumn, setSortColumn] = useState('createdOn')
  const [sortDirection, setSortDirection] = useState('desc')
  const [sortField, setSortField] = useState(null)
  const [sortOrder, setSortOrder] = useState(0)

  const navigate = useNavigate()

  function handleSort(e) {
    setSortOrder(e.sortOrder)
    setSortField(e.sortField)
    setSortColumn(e.sortField)
    setSortDirection(e.sortOrder > 0 ? 'asc' : 'desc')
    setPage(0)
  }

  // ** Table item Button Handlers
  const editHandler = (row) => {
    navigate(`/email-template/${row.url}/edit`)
  }

  const columns = [
    {
      name: 'Name',
      selector: (row) => (row['name'] ? row['name'] : '-'),
      sortable: false,
      reorder: false,
      visible: true,
      id: 'name',
      minWidth: '150px',
      cell: (row) => {
        return <div style={{ whiteSpace: 'break-spaces' }}>{row.name}</div>
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
            <UncontrolledTooltip className="tooltip-react-strap" target="edit">
              Edit
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
          <CardTitle tag="h4">Email Template List</CardTitle>
        </CardHeader>
        <Row>
          <Col sm="12">
            <ListTable
              {...{
                moduleName: 'email-template',
                tableData: data,
                visibleColumns: columns,
                rows: rowsPerPage,
                totalRecords: 3,
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

export default ReportTemplate
