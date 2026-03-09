// ** React Imports
import { Fragment, useEffect, useState } from 'react'
import axios from 'axios'

import { isUserLoggedIn } from '@utils'

// ** Third Party Components
import { Row, Col, Spinner, Card, CardHeader, CardTitle, Label, Input, Button } from 'reactstrap'
import moment from 'moment'

// ** Add New Modal Component

// ** Styles
import '@styles/react/libs/tables/react-dataTable-component.scss'
import ListTable from '../../@core/components/list-table'
import {
  showErrorAlert,
  showSuccessAlert,
  showConfirm,
  showLoadingAlert,
  getErrorMessage,
} from '../../utils/alerts'

const unauthorized = () => {
  // ** States

  const [searchValue, setSearchValue] = useState('')

  const [data, setData] = useState([])

  const [refreshLoading, setRefreshLoading] = useState(true)

  const [total, setTotal] = useState(0)
  const [sortColumn, setSortColumn] = useState('information.createdOn')
  const [sortDirection, setSortDirection] = useState('desc')

  const [rowsPerPage, setRowsPerPage] = useState(
    localStorage.getItem('unauthorizedrow')
      ? JSON.parse(localStorage.getItem('unauthorizedrow'))
      : 7
  )

  const [page, setPage] = useState(0)
  const [sortField, setSortField] = useState(null)
  const [sortOrder, setSortOrder] = useState(0)
  const userData = JSON.parse(isUserLoggedIn())
  const [filter, setFilter] = useState('')

  function formatDifferences(allData) {
    const differences = []

    // Extract licenseSystemInfo and clinicSystemInfo
    const licenseInfo = allData.licenseSystemInfo
    const clinicInfo = allData.clinicSystemInfo

    // Compare licenseSystemInfo and clinicSystemInfo
    function compareObjects(obj1, obj2, category) {
      for (const key in obj1) {
        category = category.replace(/^\.+|\.+$/g, '')
        if (typeof obj1[key] === 'object' && obj1[key] !== null) {
          compareObjects(obj1[key], obj2[key], `${category}.${key}`)
        } else {
          if (obj1[key] !== obj2[key]) {
            differences.push({
              category,
              key,
              licenseValue: obj1[key] || '-',
              clinicValue: obj2[key] || '-',
            })
          }
        }
      }
    }

    compareObjects(licenseInfo, clinicInfo, '')

    return differences
  }
  // ** Fetch data
  const getData = async () => {
    setRefreshLoading(true)
    await axios
      .get(`${process.env.REACT_APP_API_URL}/unauthorizeddata`, {
        params: {
          page,
          size: rowsPerPage,
          filter: searchValue,
          sortdirection: sortDirection,
          sortcolumn: sortColumn,
        },
      })
      .then(doc => {
        setTotal(doc.data.numberOfRecord)
        if (doc.data && doc.data.list && doc.data.list.length) {
          setData(prev =>
            doc.data.list.map((obj, index) => {
              // Add a serial number property
              obj.sl = index + 1

              // Add clinic data information
              obj.clinicdata = obj?.clinic || '-'

              let allData
              try {
                // Parse the JSONB data stored in all_data field
                allData = obj.all_data
                if (typeof allData === 'string') {
                  allData = JSON.parse(allData)
                }

                // Check and process licenseSystemInfo if it exists
                if (allData?.licenseSystemInfo) {
                  try {
                    const decodedString = Buffer.from(allData.licenseSystemInfo, 'base64').toString(
                      'utf8'
                    )
                    allData.licenseSystemInfo = JSON.parse(decodedString)
                  } catch (error) {
                    allData.licenseSystemInfo = {}
                  }
                }

                // Check and process clinicSystemInfo if it exists
                if (allData?.clinicSystemInfo) {
                  try {
                    const decodedString = Buffer.from(allData.clinicSystemInfo, 'base64').toString(
                      'utf8'
                    )
                    allData.clinicSystemInfo = JSON.parse(decodedString)
                  } catch (error) {
                    allData.clinicSystemInfo = {}
                  }
                }
              } catch (err) {
                // Handle any errors in parsing all_data
                allData = {}
              }

              obj.allDataDiff = {}

              if (allData?.licenseSystemInfo && allData?.clinicSystemInfo) {
                try {
                  const differences = formatDifferences(allData)

                  obj.allDataDiff = differences
                } catch (error) {
                  obj.allDataDiff = {}
                }
              }
              // Update obj.allData with the processed allData object
              obj.allData = allData

              return obj
            })
          )
        }
      })
    setRefreshLoading(false)
  }

  useEffect(() => {
    getData()
  }, [page, rowsPerPage, filter, sortColumn, sortDirection])

  function handleSort(d) {
    if (d.sortField) {
      setSortOrder(d.sortOrder)
      setSortField(d.sortField)
      setSortColumn(d.sortField)
      setSortDirection(d.sortOrder === -1 ? 'desc' : 'asc')
      setPage(0)
    }
  }

  const filterHandler = e => {
    setSearchValue(e.target.value)
    clearTimeout(myTimeout)
    myTimeout = setTimeout(() => {
      setFilter(e.target.value)
    }, 1000)
  }

  const updateAuthorizeHandler = (updatedata, type) => {
    showLoadingAlert('<p>Loading...</p>')
    axios
      .patch(
        `${process.env.REACT_APP_API_URL}/unauthorizeddata/update/${updatedata.id}`,
        updatedata
      )
      .then(doc => {
        showSuccessAlert(
          `License ${type === 'authorize' ? 'Authorized' : type === 'unauthorize' ? 'Unauthorized' : 'Updated'} Successfully!`
        )
        getData()
      })
      .catch(err => {
        // Only handle response errors, let global interceptor handle network errors
        if (err?.response) {
          showErrorAlert(getErrorMessage(err))
        }
      })
  }

  const AuthorizeHandler = id => {
    const authorizeOptions = {
      id,
      status: 1,
    }
    updateAuthorizeHandler(authorizeOptions, 'authorize')
  }

  // Confirmation Sweet Alert
  const handleConfirm = (id, callback, msg, btnMsg) => {
    return showConfirm({
      title: '<p>Are you sure</p>',
      text: msg,
      confirmButtonText: btnMsg,
      cancelButtonText: 'Cancel',
    }).then(function (result) {
      if (result.isConfirmed) {
        callback(id)
      }
    })
  }

  // ** Component Columns
  const status = {
    0: { title: 'Inactive', color: 'light-danger' },
    1: { title: 'Active', color: 'light-success' },
  }

  const columns = [
    {
      name: 'ID',
      selector: 'license_id',
      sortable: true,
      reorder: true,

      id: 'license_id',
      minWidth: '20px',
      maxWidth: '90px',
      cell: row => {
        return (
          <div style={{ whiteSpace: 'break-spaces' }}>{row.license_id ? row.license_id : '-'}</div>
        )
      },
    },
    {
      name: 'Clinic',
      selector: 'clinic',
      sortable: true,
      reorder: true,

      id: 'clinic',
      minWidth: '180px',
      maxWidth: '250px',
      cell: row => {
        return <div style={{ whiteSpace: 'break-spaces' }}>{row.clinic || '-'}</div>
      },
    },
    {
      name: 'Name',
      selector: 'name',
      sortable: true,
      reorder: true,

      id: 'name',
      minWidth: '150px',
      maxWidth: '200px',
      cell: row => {
        return <div style={{ whiteSpace: 'break-spaces' }}>{row.name || '-'}</div>
      },
    },
    {
      name: 'URL',
      selector: 'url',
      sortable: true,
      reorder: true,

      id: 'url',
      minWidth: '200px',
      maxWidth: '300px',
      cell: row => {
        return <div style={{ whiteSpace: 'break-spaces', wordBreak: 'break-all' }}>{row.url || '-'}</div>
      },
    },
    {
      name: 'Method',
      selector: 'method',
      sortable: true,
      reorder: true,

      id: 'method',
      minWidth: '80px',
      maxWidth: '100px',
      cell: row => {
        return <div style={{ whiteSpace: 'break-spaces' }}>{row.method || '-'}</div>
      },
    },
    {
      name: 'Difference',
      selector: 'allDataDiff',
      sortable: false,
      reorder: true,

      id: 'allData',
      minWidth: '110px',
      maxWidth: '140px',
      cell: row => {
        // Construct formatted string
        let formattedString = ''
        console.log('row.allDataDiff', row.allDataDiff)

        // Check if allDataDiff is an array before calling forEach
        if (Array.isArray(row.allDataDiff)) {
          row.allDataDiff.forEach((diff, index) => {
            formattedString += `<div class="col-md-4">`
            formattedString += `   <span style="font-weight: bold;">${index + 1}: ${diff.category} ${diff.key}:</span>`
            formattedString += `   <div style="margin-left: 10px;">`
            formattedString += `      <span>License - ${diff.licenseValue}</span><br/>`
            formattedString += `      <span>Clinic  - ${diff.clinicValue}</span><br/>`
            formattedString += `   </div>`
            formattedString += `</div>`
          })
        }

        return (
          <>
            {Array.isArray(row.allDataDiff) && row.allDataDiff.length > 0 ? (
              <div
                div
                style={{ whiteSpace: 'break-spaces', maxHeight: '150px' }}
                dangerouslySetInnerHTML={{ __html: formattedString }}
                className="col-md-12 row formattedString "
              />
            ) : (
              '-'
            )}
          </>
        )
      },
    },
    {
      name: 'Created On',
      selector: 'created_on',
      sortable: true,
      reorder: true,

      id: 'created_on',
      minWidth: '130px',
      maxWidth: '130px',
      cell: row => {
        return (
          <div style={{ whiteSpace: 'break-spaces' }}>
            {row.created_on
              ? moment(row.created_on, 'YYYY-MM-DD hh:mm:ss').format(
                  userData?.dateFormats?.dateTimeFormat || 'MMM-DD-YYYY hh:mmA'
                )
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
      minWidth: '80px',
      maxWidth: '100px',
      cell: row => {
        const statusObj = status[row.status] || { title: 'Unknown', color: 'light-secondary' }
        return (
          <div style={{ whiteSpace: 'break-spaces' }}>
            <span className={`badge badge-${statusObj.color}`}>{statusObj.title}</span>
          </div>
        )
      },
    },
    {
      name: 'Actions',
      sortable: false,
      allowOverflow: true,
      maxWidth: '90px',
      id: 'actions',
      style: {
        position: 'sticky',
        right: '0',
        'border-left': '1px dotted #6e6b7b',
      },
      cell: row => {
        if (row.status === 1) {
          return <div className="d-flex">Authorized</div>
        } else {
          return (
            <div className="d-flex">
              <Button.Ripple
                color="danger"
                size="sm"
                onClick={() => {
                  handleConfirm(
                    row._id,
                    AuthorizeHandler,
                    'Are you sure you want to Authorize this?',
                    'Yes, Authorize!'
                  )
                }}
              >
                Authorize
              </Button.Ripple>
            </div>
          )
        }
      },
    },
  ]

  return (
    <div className="licenseListDiv">
      <Fragment>
        <Row>
          <Col sm="12">
            <Card>
              <CardHeader className="flex-md-row flex-column align-md-items-center align-items-center border-bottom">
                <CardTitle tag="h4">Un-Authorized Request</CardTitle>
              </CardHeader>
              {refreshLoading ? (
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
                        value={searchValue}
                        onChange={e => {
                          filterHandler(e)
                        }}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <ListTable
                        {...{
                          moduleName: 'unauthorized',
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
      </Fragment>
    </div>
  )
}

export default unauthorized
