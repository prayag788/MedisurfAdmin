// ** React Imports
import { Fragment, useEffect, useState } from 'react'
import axios from 'axios'

// ** Sweet Alert Setup
import { isUserLoggedIn } from '@utils'
import {
  showErrorAlert,
  showSuccessAlert,
  getErrorMessage,
  showLoadingAlert,
  hideLoadingAlert,
  showConfirm,
} from '../../utils/alerts'

// ** Third Party Components
import {
  Row,
  Col,
  UncontrolledTooltip,
  Spinner,
  Card,
  CardHeader,
  CardTitle,
  Label,
  Input,
} from 'reactstrap'
import { Edit, Check, X } from 'react-feather'
import moment from 'moment'

// ** Add New Modal Component
import EditModal from './EditModal'

// ** Styles
import '@styles/react/libs/tables/react-dataTable-component.scss'
import ListTable from '../../@core/components/list-table'

const license = () => {
  // ** States
  const [modal, setModal] = useState(false)
  const [editModal, SetEditModal] = useState(false)
  const [updateState, setUpdateState] = useState(false)
  const [filteredData, setFilteredData] = useState([])
  const [searchValue, setSearchValue] = useState('')
  const [selectedItem, setSelectedItem] = useState({
    licenseId: '',
    email: '',
    contact: '',
    activationKey: '',
    activationStatus: '',
    expiryDate: '',
    status: 0,
  })

  // Missing timeout variable
  let myTimeout
  const [editPicker, setEditPicker] = useState('')
  const [data, setData] = useState([])
  const [newId, setNewId] = useState('0')
  const [refreshLoading, setRefreshLoading] = useState(true)

  const [total, setTotal] = useState(0)
  const [sortColumn, setSortColumn] = useState('information.createdOn')
  const [sortDirection, setSortDirection] = useState('desc')

  const [rowsPerPage, setRowsPerPage] = useState(
    localStorage.getItem('licenserow') ? JSON.parse(localStorage.getItem('licenserow')) : 7
  )

  const [page, setPage] = useState(0)
  const [sortField, setSortField] = useState(null)
  const [sortOrder, setSortOrder] = useState(0)
  const userData = JSON.parse(isUserLoggedIn())
  const [filter, setFilter] = useState('')

  // ** Fetch data
  const getData = async () => {
    setRefreshLoading(true)
    await axios
      .get(`${process.env.REACT_APP_API_URL}/license/getLicenseList`, {
        params: {
          page,
          size: rowsPerPage,
          filter: searchValue,
          sortdirection: sortDirection,
          sortcolumn: sortColumn,
        },
      })
      .then(response => {
        setNewId(response.data.numberOfLicense + 1)
        setTotal(response.data.numberOfLicense)
        if (response.data && response.data.licenseList) {
          if (response.data.licenseList.length > 0) {
            setData(prev =>
              response.data.licenseList.map((obj, index) => {
                obj.sl = index + 1
                return obj
              })
            )
          } else {
            setData([])
          }
        } else {
          setData([])
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

  // ** Function to handle Modal toggle
  const handleEditModal = () => SetEditModal(!editModal)

  const updateDataInFilter = data => {
    let updatedData = []
    const value = searchValue
    if (value.length) {
      updatedData = data.filter(item => {
        const startWiths = Object.keys(item).some(val => {
          if (
            typeof item[val] === 'string' ||
            typeof item[val] === 'number' ||
            typeof item[val] === 'object'
          ) {
            if (typeof item[val] === 'string') {
              return item[val].toLowerCase().includes(value.toLowerCase())
            } else if (typeof item[val] === 'number') {
              return item[val].toString().includes(value)
            } else if (typeof item[val] === 'object' && item[val] && item[val].length) {
              if (
                item[val].find(o => {
                  if (o.subject) {
                    return o.subject.toString().includes(value)
                  }
                })
              ) {
                return item[val].find(o => o.subject.toString().includes(value))
              } else if (
                item[val].find(o => o.subject === 't&c') &&
                'Terms & Conditions'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'upload-dicom') &&
                'Upload Dicom Image'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'doctors') &&
                'Doctors'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'Study List Viewer') &&
                'Study list'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'power-user') &&
                'Power User'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'Modality') &&
                'Modality'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'privacy-policy') &&
                'Privacy policy'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'cookie-policy') &&
                'Cookie policy'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'data-analytics') &&
                'Data analytics'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              }
            }
          }
        })

        const includes = Object.keys(item).some(val => {
          if (
            typeof item[val] === 'string' ||
            typeof item[val] === 'number' ||
            typeof item[val] === 'object'
          ) {
            if (typeof item[val] === 'string') {
              return item[val].toLowerCase().includes(value.toLowerCase())
            } else if (typeof item[val] === 'number') {
              return item[val].toString().includes(value)
            } else if (typeof item[val] === 'object' && item[val] && item[val].length) {
              if (
                item[val].find(o => {
                  if (o.subject) {
                    return o.subject.toString().includes(value)
                  }
                })
              ) {
                return item[val].find(o => o.subject.toString().includes(value))
              } else if (
                item[val].find(o => o.subject === 't&c') &&
                'Terms & Conditions'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'upload-dicom') &&
                'Upload Dicom Image'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'doctors') &&
                'Doctors'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'Study List Viewer') &&
                'Study list'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'power-user') &&
                'Power User'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'Modality') &&
                'Modality'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'privacy-policy') &&
                'Privacy policy'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'cookie-policy') &&
                'Cookie policy'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'data-analytics') &&
                'Data analytics'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              }
            }
          }
        })

        if (startWiths) {
          return startWiths
        } else if (!startWiths && includes) {
          return includes
        } else return null
      })
      setFilteredData(updatedData)
    }
  }

  const updateUserDetails = (updatedata, type) => {
    if (editModal) {
      handleEditModal()
    }
    showLoadingAlert()
    axios
      .patch(
        `${process.env.REACT_APP_API_URL}/license/updateStatus/${updatedata.licenseId}`,
        updatedata
      )
      .then(response => {
        hideLoadingAlert()
        showSuccessAlert(
          `License ${type === 'activate' ? 'Activated' : type === 'deactivate' ? 'Deactivated' : 'Updated'} Successfully!`
        )
        setData(prev => {
          const Mprev = [...prev]
          Mprev.splice(
            Mprev.findIndex(obj => obj.licenseId === updatedata.licenseId),
            1,
            response.data.updated_data
          )
          prev = Mprev
          prev.map((obj, index) => {
            obj.sl = index + 1
            return obj
          })
          updateDataInFilter(prev)
          return prev
        })
      })
      .catch(err => {
        hideLoadingAlert()
        if (err && err.response) {
          showErrorAlert(getErrorMessage(err))
        }
      })
  }

  function deleteLicense(id) {
    axios
      .post(`${process.env.REACT_APP_API_URL}/license/deleteLicense`, { licenseId: id })
      .then(response => {
        showSuccessAlert('License Deleted Successfully!.', '<p>Deleted!</p>')
        setData(prev => {
          let Mprev = [...data]
          Mprev = Mprev.filter(obj => {
            return obj.licenseId !== id
          })
          prev = Mprev
          prev.map((obj, index) => {
            obj.sl = index + 1
            return obj
          })
          updateDataInFilter(prev)
          return prev
        })
      })
      .catch(err => {
        handleEditModal()
        showErrorAlert(getErrorMessage(err))
      })
  }

  // Confirmation Sweet Alert
  const handleConfirm = (id, callback, msg, btnMsg) => {
    return showConfirm({ text: msg, confirmButtonText: btnMsg }).then(result => {
      if (result && result.isConfirmed) {
        callback(id)
      }
    })
  }

  // ** Table item Button Handlers
  const editHandler = row => {
    setSelectedItem(prev => {
      const newData = { ...prev }
      const keys = Object.keys(prev)
      for (const key of keys) {
        newData[key] = row[key]
      }
      return newData
    })
    setEditPicker(() =>
      moment(row.expiryDate, 'YYYY-MM-DD').format(userData?.dateFormats?.dateFormat || 'MM/DD/YYYY')
    )
    handleEditModal()
  }

  const deleteHandler = id => {
    deleteLicense(id)
  }

  const DeactivationHandler = id => {
    const deactivationOptions = {
      licenseId: id,
      status: 0,
    }
    updateUserDetails(deactivationOptions, 'deactivate')
  }

  const ActivationHandler = id => {
    const activationOptions = {
      licenseId: id,
      status: 1,
    }
    updateUserDetails(activationOptions, 'activate')
  }

  // ** Component Columns
  const status = {
    '-1': { title: 'Inactive', color: 'light-danger' },
    0: { title: 'Inactive', color: 'light-danger' },
    1: { title: 'Active', color: 'light-success' },
  }

  const columns = [
    {
      name: 'ID',
      selector: 'licenseId',
      sortable: false,
      reorder: true,

      id: 'licenseId',
      minWidth: '20px',
      maxWidth: '90px',
      cell: row => {
        return (
          <div style={{ whiteSpace: 'break-spaces' }}>{row.licenseId ? row.licenseId : '-'}</div>
        )
      },
    },
    {
      name: 'Hospital',
      selector: 'hospital',
      sortable: false,
      reorder: true,

      id: 'hospital',
      minWidth: '20px',
      maxWidth: '150px',
      cell: row => {
        return <div style={{ whiteSpace: 'break-spaces' }}>{row.hospital ? row.hospital : '-'}</div>
      },
    },
    {
      name: 'Email',
      selector: 'email',
      sortable: false,
      reorder: true,

      id: 'email',
      minWidth: '180px',
      maxWidth: '250px',
      cell: row => {
        return <div style={{ whiteSpace: 'break-spaces' }}>{row.email}</div>
      },
    },
    {
      name: 'Contact',
      selector: 'contact',
      sortable: false,
      reorder: true,

      id: 'contact',
      minWidth: '110px',
      maxWidth: '140px',
      cell: row => {
        return <div style={{ whiteSpace: 'break-spaces' }}>{row.contact ? row.contact : '-'}</div>
      },
    },
    {
      name: 'Activation Key',
      selector: 'activationKey',
      sortable: false,
      reorder: true,

      id: 'activationKey',
      minWidth: '300px',
      maxWidth: '350px',
      cell: row => {
        return (
          <div style={{ whiteSpace: 'break-spaces' }}>
            {row.activationKey ? row.activationKey : '-'}
          </div>
        )
      },
    },
    {
      name: 'Expiry Date',
      selector: 'expiryDate',
      sortable: false,
      reorder: true,

      id: 'expiryDate',
      minWidth: '130px',
      maxWidth: '130px',
      cell: row => {
        return (
          <div style={{ whiteSpace: 'break-spaces' }}>
            {row.expiryDate
              ? moment(row.expiryDate, 'YYYY-MM-DD').format(
                  userData?.dateFormats?.dateFormat || 'MM-DD-YYYY'
                )
              : '-'}
          </div>
        )
      },
    },
    {
      name: 'Activation Status',
      selector: 'activationStatus',
      sortable: false,
      reorder: true,

      id: 'activationStatus',
      minWidth: '180px',
      maxWidth: '190px',
      cell: row => {
        return (
          <div style={{ whiteSpace: 'break-spaces' }}>
            {row.activationStatus ? row.activationStatus : '-'}
          </div>
        )
      },
    },
    {
      name: 'Status',
      selector: 'status',
      sortable: false,
      reorder: true,

      id: 'status',
      minWidth: '80px',
      maxWidth: '90px',
      cell: row => {
        return <></>
      },
    },
    {
      name: 'Selected Date format',
      selector: 'selectedDateFormat',
      sortable: false,
      reorder: true,

      id: 'selectedDateFormat',
      minWidth: '80px',
      maxWidth: '120px',
      cell: row => {
        return (
          <div className="d-flex flex-column">
            <p className="m-0">{row.dateFormat ? `1. ${row.dateFormat}` : '-'}</p>
            <p className="m-0">{row.timeFormat ? `2. ${row.timeFormat}` : '-'}</p>
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
        return (
          <div className="d-flex align-items-center">
            <Edit
              size={15}
              className="mr-50"
              id="edit"
              style={{ cursor: 'pointer' }}
              onClick={() => editHandler(row)}
            />
            {row.status ? (
              <X
                size={15}
                className="ml-50"
                id="x"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  handleConfirm(
                    row.licenseId,
                    DeactivationHandler,
                    'Are you sure you want to deactivate the status?',
                    'Yes, Deactivate!'
                  )
                  setUpdateState(prev => !prev)
                }}
              />
            ) : (
              <Check
                size={15}
                id="check"
                style={{ cursor: 'pointer' }}
                className="ml-50"
                onClick={() => {
                  handleConfirm(
                    row.licenseId,
                    ActivationHandler,
                    'Are you sure you want to activate the status?',
                    'Yes, Activate!'
                  )
                  setUpdateState(prev => !prev)
                }}
              />
            )}
            <UncontrolledTooltip target="edit" className="tooltip-react-strap">
              Edit
            </UncontrolledTooltip>
            <UncontrolledTooltip
              target={row.status ? 'x' : 'check'}
              className="tooltip-react-strap"
            >
              {row.status ? 'Deactivate' : 'Activate'}
            </UncontrolledTooltip>
          </div>
        )
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
                <CardTitle tag="h4">License list</CardTitle>
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
                          moduleName: 'license',
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
        {editModal && (
          <EditModal
            updateUser={updateUserDetails}
            open={editModal}
            handleModal={handleEditModal}
            editData={selectedItem}
            editPicker={editPicker}
            setEditPicker={setEditPicker}
          />
        )}
      </Fragment>
    </div>
  )
}

export default license
