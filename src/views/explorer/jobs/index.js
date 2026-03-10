import { useEffect, useState } from 'react'
import axios from 'axios'

import '@styles/react/libs/tables/react-dataTable-component.scss'
import './jobs.css'
import {
  Card,
  Progress,
  UncontrolledTooltip,
  Spinner,
  CardHeader,
  CardTitle,
  Row,
  Col,
} from 'reactstrap'
import { Repeat, Send } from 'react-feather'
import moment from 'moment'
import ListTable from '../../../@core/components/list-table'
import { isUserLoggedIn } from '@utils'
import Header from '../components/header'

const Jobs = () => {
  const [jobDetail, setJobDetail] = useState([])
  const [rowsPerPage, setRowsPerPage] = useState(
    localStorage.getItem('jobsrow')
      ? JSON.parse(localStorage.getItem('jobsrow'))
      : 7
  )
  const [currentPage, setCurrentPage] = useState(0)
  const [totalJobs, setTotalJobs] = useState(0)
  const [refreshLoading, setRefreshLoading] = useState(false)
  const [tip, setTip] = useState(false)

  const [sortField, setSortField] = useState(null)
  const [sortOrder, setSortOrder] = useState(0)
  const userData = JSON.parse(isUserLoggedIn())

  useEffect(() => {
    const jobsRefresh = async () => {
      const jobsList = await axios.get(
        `${process.env.REACT_APP_API_URL}/explorer/jobs`,
        {
          params: {
            limit: rowsPerPage,
            since: currentPage,
          },
        }
      )
      setJobDetail(() => jobsList.data.jobs)
      setTotalJobs(() => jobsList.data.total)

      let flag = 0
      jobsList.data.jobs.map((data) => {
        if (data.State === 'Running') {
          flag += 1
        }
      })
      if (flag > 0) {
        setTimeout(() => {
          jobsRefresh()
        }, 1000)
      }
    }
    jobsRefresh()
  }, [rowsPerPage, currentPage, tip])

  const jobsHandler = async (row) => {
    setTip(!tip)

    try {
      const jobsList = await axios.get(
        `${process.env.REACT_APP_API_URL}/explorer/jobs/${row.ID}`
      )

      setJobDetail((prev) => {
        prev.map((item, index) => {
          if (item.ID === row.ID) {
            prev[index] = jobsList.data
          }
        })
        return [...prev]
      })
    } catch (err) {
      console.log(err)
    }
  }

  const resubmitHandler = async (id) => {
    setTip(!tip)
    const jobsList = await axios.post(
      `${process.env.REACT_APP_API_URL}/explorer/jobs/${id}/resubmit`
    )

    setJobDetail((prev) => {
      prev.map((item, index) => {
        if (item.ID === id) {
          prev[index] = jobsList.data
        }
      })
      return [...prev]
    })
  }

  const columns = [
    {
      name: 'Job ID',
      cell: (row) => (row.ID ? row.ID : '-'),
      sortable: true,
      reorder: true,

      id: 'ID',
      minWidth: '250px',
    },
    {
      name: 'Remote AET',
      cell: (row) => {
        return row.Content
          ? row.Content.RemoteAet
            ? row.Content.RemoteAet
            : '-'
          : '-'
      },
      sortable: true,
      reorder: true,

      id: 'Content.RemoteAet',
      minWidth: '150px',
    },
    {
      name: 'State',
      cell: (row) => (row.State ? row.State : '-'),
      sortable: true,
      reorder: true,

      id: 'State',
      minWidth: '150px',
    },
    {
      name: 'Completed Time',
      cell: (row) => {
        return row.CompletionTime
          ? moment
              .utc(row.CompletionTime)
              .local()
              .format(userData?.dateFormats?.dateTimeFormat)
          : '-'
      },
      sortable: true,
      reorder: true,

      id: 'CompletionTime',
      minWidth: '250px',
    },
    {
      name: 'Progress',
      selector: (row) => (row.Progress ? row.Progress : '-'),
      sortable: true,
      reorder: true,

      id: 'Progress',
      minWidth: '150px',
      cell: (row) => {
        return row.Progress ? (
          <Progress
            className="progress-bar-success"
            style={
              row.State === 'Failure'
                ? { background: '#ea5455' }
                : { backgroud: '#28c76f' }
            }
            value={row.Progress}
          />
        ) : (
          '-'
        )
      },
    },
    {
      name: 'Actions',
      sortable: false,
      reorder: true,
      id: 'Actions',
      cell: (row) => {
        return (
          <>
            <div>
              {row.State !== 'Success' ? (
                <Repeat
                  id="Refresh"
                  size={15}
                  className="mr-1"
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.preventDefault()
                    jobsHandler(row)
                  }}
                />
              ) : (
                <Repeat
                  id="Refresh"
                  size={15}
                  className="mr-1"
                  style={{
                    opacity: 0.2,
                    pointerEvents: 'none',
                    cursor: 'default',
                  }}
                />
              )}
              <UncontrolledTooltip
                className="tooltip-react-strap"
                target="Refresh"
              >
                Refresh
              </UncontrolledTooltip>
              {row.State !== 'Success' ? (
                <Send
                  id="Resubmit"
                  size={15}
                  className="mr-1"
                  style={{ cursor: 'pointer' }}
                  onClick={() => resubmitHandler(row.ID)}
                />
              ) : (
                <Send
                  id="Resubmit"
                  size={15}
                  className="mr-1"
                  style={{
                    opacity: 0.2,
                    pointerEvents: 'none',
                    cursor: 'default',
                  }}
                />
              )}
              <UncontrolledTooltip
                className="tooltip-react-strap"
                target="Resubmit"
              >
                Resubmit
              </UncontrolledTooltip>
            </div>
          </>
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

  const handleSort = (d) => {
    if (d.sortField) {
      setSortOrder(d.sortOrder)
      setSortField(d.sortField)

      if (sortOrder === -1) {
        jobDetail.sort((a, b) =>
          String(b[d.sortField]).localeCompare(String(a[d.sortField]))
        )
      } else {
        jobDetail.sort((a, b) =>
          String(a[d.sortField]).localeCompare(String(b[d.sortField]))
        )
      }
      setJobDetail(jobDetail)
    }
  }

  return (
    <>
      <Header>
        <CardTitle tag="h4" className="mb-0">
          Orthanc Jobs Monitor
        </CardTitle>
      </Header>
      <Row>
        <Col sm="12">
          <Card>
            <CardHeader className="flex-md-row flex-column align-md-items-center align-items-center border-bottom">
              <CardTitle tag="h4">Jobs</CardTitle>
            </CardHeader>
            <Row>
              <Col>
                <ListTable
                  {...{
                    moduleName: 'jobs',
                    tableData: jobDetail,
                    visibleColumns: columns,
                    rows: rowsPerPage,
                    totalRecords: totalJobs,
                    first: currentPage,
                    onSort: handleSort,
                    sortField,
                    sortOrder,
                    onPage: (e) => {
                      setCurrentPage(e.first++)
                      setRowsPerPage((prev) => e.rows)
                      localStorage.setItem('jobsrow', e.rows)
                    },
                  }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default Jobs
