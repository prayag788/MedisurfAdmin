// ** React Imports
import { Fragment, useEffect, useState } from 'react'
import axios from 'axios'

import { useNavigate, useLocation } from 'react-router-dom'

import parse from 'html-react-parser'
import {
  showErrorAlert,
  showSuccessAlert,
  showConfirm,
  showLoadingAlert,
  hideLoadingAlert,
  getErrorMessage,
} from '../../utils/alerts'

// ** Third Party Components
import {
  Row,
  Col,
  Badge,
  UncontrolledTooltip,
  Modal,
  Card,
  ModalHeader,
  ModalBody,
  CardHeader,
  CardTitle,
  Button,
  Label,
  Input,
  TabContent,
  TabPane,
} from 'reactstrap'
import { Edit, Trash, X, Eye, Plus } from 'react-feather'
import Select from 'react-select'

// ** Styles
import '@styles/react/libs/tables/react-dataTable-component.scss'
import ListTable from '../../@core/components/list-table'
import Tabs from './Tabs'
import DiagnosisModality from './diagnosis-modality/index'
import { selectThemeColors } from '@utils'

const Diagnosis = () => {
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
  const [activeTab, setActiveTab] = useState('1')
  const [selectedModalities, setSelectedModalities] = useState(null)
  const [searchModalities, setSearchModalities] = useState([])
  const [modalityOptions, setModalityOptions] = useState([])
  const location = useLocation()
  const props = location.state

  const navigate = useNavigate()

  useEffect(() => {
    if (props?.tab) {
      setActiveTab(props?.tab)
    }
  }, [location])

  const getData = async () => {
    try {
      axios
        .get(`${process.env.REACT_APP_API_URL}/diagnosis`, {
          params: {
            page,
            size: rowsPerPage,
            filter: searchValue,
            modality: searchModalities,
            sortdirection: sortDirection,
            sortcolumn: sortColumn,
          },
        })
        .then((res) => {
          setData(res.data.list)
          setTotal(res.data.numberOfRecord)
          setStartsrno(res.data.startsrno ? res.data.startsrno : 0)
          setModalityOptions(res.data.modalityOptionList || [])
        })
    } catch (error) {}
  }
  // ** Fetch data
  useEffect(() => {
    getData()
  }, [
    page,
    rowsPerPage,
    searchValue,
    sortColumn,
    sortDirection,
    searchModalities,
  ])

  function handleSort(e) {
    setSortOrder(e.sortOrder)
    setSortField(e.sortField)
    setSortColumn(e.sortField)
    setSortDirection(e.sortOrder > 0 ? 'asc' : 'desc')
    setPage(0)
  }

  // ** Function to handle Modal toggle
  const handleAddNew = () => {
    navigate('/diagnosis/new')
  }

  // Confirmation Sweet Alert
  const handleConfirm = (row) => {
    return showConfirm({
      title: '<p>Are you sure to delete this template?</p>',
      text: 'This action is irreversible.',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    }).then(async function (result) {
      if (result.isConfirmed) {
        try {
          showLoadingAlert('<p>Deleting...</p>')
          await axios.delete(
            `${process.env.REACT_APP_API_URL}/diagnosis/${row?._id}`
          )
          hideLoadingAlert()
          showSuccessAlert('Template Deleted Successfully!')
          getData()
        } catch (err) {
          hideLoadingAlert()
          // Only handle response errors, let global interceptor handle network errors
          if (err?.response) {
            showErrorAlert(getErrorMessage(err))
          }
        }
      }
    })
  }

  // ** Table item Button Handlers
  const editHandler = (row) => {
    navigate(`/diagnosis/${row._id}/edit`)
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
      id: 'name',
      minWidth: '150px',
      cell: (row) => {
        return <div style={{ whiteSpace: 'break-spaces' }}>{row.name}</div>
      },
    },
    {
      name: 'Template',
      sortable: false,
      reorder: true,
      id: 'text',
      minWidth: '150px',
      cell: (row) => {
        return (
          <>
            <div
              onClick={() => {
                previewHandler(row)
              }}
              style={{ cursor: 'pointer' }}
              id="preview"
            >
              Preview <Eye size={15} className="mr-50" />
            </div>
            <UncontrolledTooltip
              target="preview"
              className="tooltip-react-strap"
            >
              Click to Preview Template
            </UncontrolledTooltip>
          </>
        )
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
      name: 'Modality',
      selector: (row) =>
        row['modality'] && row['modality'].name ? row['modality'].name : '-',
      sortable: true,
      reorder: true,
      id: 'modality',
      minWidth: '150px',
      cell: (row) => {
        return (
          <div style={{ whiteSpace: 'break-spaces' }}>
            {row['modality']?.name || '-'}
          </div>
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

  const checkSelectedModalities = (value) => {
    const modalityArray = value.map((modalityList) => modalityList.value)
    setSearchModalities(modalityArray)
    setSelectedModalities(value)
  }

  const toggleTab = (tab) => {
    setActiveTab(tab)
  }

  return (
    <Fragment>
      <Row>
        <Tabs activeTab={activeTab} toggleTab={toggleTab} />
      </Row>
      <Card>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="1">
            <Card>
              <CardHeader className="flex-md-row flex-column align-md-items-center align-items-center border-bottom">
                <CardTitle tag="h4">Template List</CardTitle>
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
              <Row className="justify-content-start mx-0">
                <Col lg="3" md="6">
                  <Label for="Modality">Modality:</Label>
                  <Select
                    value={selectedModalities}
                    onChange={checkSelectedModalities}
                    theme={selectThemeColors}
                    className="react-select"
                    classNamePrefix="select"
                    options={modalityOptions}
                    isMulti
                  />
                </Col>
              </Row>
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
                      moduleName: 'diagnosis',
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
          </TabPane>
        </TabContent>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="2">
            <DiagnosisModality />
          </TabPane>
        </TabContent>
      </Card>
      <Modal isOpen={previewOpen} toggle={() => setPreviewOpen(!previewOpen)}>
        <ModalHeader
          className="mb-2"
          close={
            <X
              className="cursor-pointer"
              size={15}
              onClick={() => setPreviewOpen(false)}
            />
          }
          tag="div"
        >
          <h5 className="modal-title">Preview Template</h5>
        </ModalHeader>
        <ModalBody>
          <Row className="ml-1 mr-1">
            <div className="w-100">{parse(`${previewText}`)}</div>
          </Row>
        </ModalBody>
      </Modal>
    </Fragment>
  )
}

export default Diagnosis
