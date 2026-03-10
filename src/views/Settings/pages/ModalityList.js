import { Fragment, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Row,
  Col,
  Card,
  UncontrolledTooltip,
  Spinner,
  CardHeader,
  CardTitle,
  Button,
} from 'reactstrap'
import { useNavigate } from 'react-router-dom'
import { Edit, Trash, Radio, Plus } from 'react-feather'
import { fetchEvent, editEvent } from '../store/actions'
import axios from 'axios'
import { MySwalError, MySwalLoading, MySwalSuccess } from '../../components/MySwalAlert'
import {
  showErrorAlert,
  showSuccessAlert,
  showInfoAlert,
  showConfirm,
  hideLoadingThenShowError,
  hideLoadingThenShowSuccess,
  getErrorMessage,
} from '../../../utils/alerts'

import ListTable from '../../../@core/components/list-table'

export default () => {
  const [data, setData] = useState([])
  const [tip, setTip] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const list = useSelector(state => state.Modality.list)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [rowsPerPage, setRowsPerPage] = useState(7)
  const [page, setPage] = useState(0)
  const [sortField, setSortField] = useState(null)
  const [sortOrder, setSortOrder] = useState(0)

  useEffect(() => {
    dispatch(fetchEvent())
  }, [])

  useEffect(() => {
    console.log('Modality list from Redux:', list)
  }, [list])

  useEffect(() => {
    setIsLoading(true)
    // Handle both formats: direct modalities object or wrapped in 'modalities' property
    const modalitiesData = list?.modalities || list || {}
    setData(() => {
      return Object.keys(modalitiesData)
        .filter(key => typeof modalitiesData[key] === 'object' && modalitiesData[key].AET)
        .map((modalityName, index) => {
          return {
            sl: index + 1,
            Name: modalityName,
            AET: modalitiesData[modalityName].AET,
            Host: modalitiesData[modalityName].Host,
            Port: modalitiesData[modalityName].Port,
          }
        })
    })
    setIsLoading(false)
  }, [list])

  function handleSort(d) {
    if (d.sortField) {
      setSortOrder(d.sortOrder)
      setSortField(d.sortField)

      if (sortOrder === -1) {
        data.sort((a, b) => String(b[d.sortField]).localeCompare(String(a[d.sortField])))
      } else {
        data.sort((a, b) => String(a[d.sortField]).localeCompare(String(b[d.sortField])))
      }

      setData(data)
    }
  }

  const editHandler = id => {
    dispatch(editEvent(id))
    navigate('/settings/edit_modality', { state: { id } })
  }

  const deleteHandler = id => {
    showConfirm({
      title: `<p>Confirmation!</p>`,
      text: `Are you sure to delete ${id.Name}?`,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then(result => {
      if (result.isConfirmed) {
        console.log(`[Delete] Requesting deletion for modality: ${id.Name}`)
        axios
          .delete(`${process.env.REACT_APP_API_URL}/explorer/modalities/${id.Name}`)
          .then(res => {
            console.log(`[Delete] Success: ${id.Name} deleted.`)
            showSuccessAlert(`${id.Name} Modality Deleted Successfully!`)
            setTimeout(() => {
              location.reload()
            }, 1000)
          })
          .catch(err => {
            console.error(`[Delete] Failed for ${id.Name}:`, err.response?.data || err.message)
            // Only handle non-network errors here, let global interceptor handle network errors
            if (err?.response) {
              showErrorAlert(getErrorMessage(err))
            }
          })
      } else if (result.isDenied) {
        showInfoAlert(`${id.Name} Modality Not Deleted!`)
        setTip(!tip)
      }
    })
  }

  const performEcho = id => {
    console.log(`[C-ECHO] Requesting echo for modality: ${id.Name}`)
    MySwalLoading('Performing C-ECHO...')

    axios({
      method: 'POST',
      url: `${process.env.REACT_APP_API_URL}/explorer/modalities/${id.Name}/echo`,
    })
      .then(() => {
        console.log(`[C-ECHO] Success: ${id.Name} is reachable.`)
        hideLoadingThenShowSuccess('C-Echo successful!')
        setTip(!tip)
      })
      .catch(err => {
        console.error(`[C-ECHO] Failed for ${id.Name}:`, err.response?.data || err.message)
        // Only handle non-network errors here, let global interceptor handle network errors
        if (err?.response) {
          hideLoadingThenShowError('C-Echo has Failed!')
          setTip(!tip)
        }
      })
  }

  const columns = [
    {
      name: 'Dicom Server',
      selector: row => (row['Name'] ? row['Name'] : '-'),
      sortable: true,
      reorder: true,

      id: 'Name',
      cell: row => {
        return <div style={{ whiteSpace: 'break-spaces' }}>{row.Name}</div>
      },
    },
    {
      name: 'AET',
      selector: row => (row['AET'] ? row['AET'] : '-'),
      sortable: true,
      reorder: true,

      id: 'AET',
      cell: row => {
        return <div style={{ whiteSpace: 'break-spaces' }}>{row.AET}</div>
      },
    },
    {
      name: 'IP Address',
      selector: row => (row['Host'] ? row['Host'] : '-'),
      sortable: true,
      reorder: true,

      id: 'Host',
      cell: row => {
        return <div style={{ whiteSpace: 'break-spaces' }}>{row.Host}</div>
      },
    },
    {
      name: 'Port',
      selector: row => (row['Port'] ? row['Port'] : '-'),
      sortable: true,
      reorder: true,

      id: 'Port',
      cell: row => {
        return <div style={{ whiteSpace: 'break-spaces' }}>{row.Port}</div>
      },
    },
    {
      name: 'Actions',
      allowOverflow: true,
      sortable: false,
      reorder: true,
      id: 'actions',

      cell: row => {
        return (
          <div>
            <Edit
              size={15}
              className="mr-1"
              id="edit"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                editHandler(row)
              }}
            />
            <UncontrolledTooltip className="tooltip-react-strap" target="edit">
              Edit
            </UncontrolledTooltip>
            <Trash
              className="mr-1"
              id="delete"
              style={{ cursor: 'pointer' }}
              size={15}
              onClick={() => {
                deleteHandler(row)
              }}
            />
            <UncontrolledTooltip className="tooltip-react-strap" target="delete">
              Delete
            </UncontrolledTooltip>
            <Radio
              className="mr-1"
              id="echo"
              style={{ cursor: 'pointer' }}
              size={15}
              onClick={() => {
                performEcho(row)
              }}
            />
            <UncontrolledTooltip className="tooltip-react-strap" target="echo">
              Echo
            </UncontrolledTooltip>
          </div>
        )
      },
    },
  ]

  if (isLoading) {
    return (
      <Card className="loading-initial">
        <Spinner color="primary" />
      </Card>
    )
  }

  return (
    <Fragment>
      <Row>
        <Col sm={12}>
          <Card>
            <CardHeader className="flex-md-row flex-column align-md-items-center align-items-center border-bottom">
              <CardTitle tag="h4">Modality List</CardTitle>
              <div className="d-flex mt-md-0 mt-1">
                <Button
                  className="ml-2"
                  color={'primary'}
                  onClick={() => {
                    navigate('/settings/add_modality')
                  }}
                >
                  <Plus size={15} />
                  <span className="align-middle ml-50">Add New</span>
                </Button>
              </div>
            </CardHeader>
            <Row>
              <Col>
                <ListTable
                  {...{
                    moduleName: 'modality',
                    tableData: data,
                    visibleColumns: columns,
                    rows: rowsPerPage,
                    totalRecords: data.length,
                    onSort: handleSort,
                    first: page,
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
          </Card>
        </Col>
      </Row>
    </Fragment>
  )
}
