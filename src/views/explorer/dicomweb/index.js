import { useState, useRef, useEffect } from 'react'
import {
  Card,
  CardBody,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Col,
  UncontrolledTooltip,
  Modal,
  ModalHeader,
  Spinner,
} from 'reactstrap'
import { Folder, FileText, DownloadCloud, Eye } from 'react-feather'
import axios from 'axios'
import moment from 'moment'
import { isUserLoggedIn } from '@utils'
import STUDYSTATUS from '@configs/studyStatus'
import {
  showErrorAlert,
  showSuccessAlert,
  showLoadingAlert,
  hideLoadingAlert,
  getErrorMessage,
} from '../../../utils/alerts'

// ** Import table css
import '@styles/react/libs/tables/react-dataTable-component.scss'

import DataTable from 'react-data-table-component'
import ListTable from '../../../@core/components/list-table'

const DICOMweb = () => {
  const [studyList, setStudyList] = useState([])
  const [seriesList, setSeriesList] = useState([])
  const [DICOMservers, setDICOMservers] = useState([])
  const [selectedServer, setSelectedServer] = useState()
  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState({ title: '', data: [] })
  const [selectedStudyUID, setSelectedStudyUID] = useState('')
  const [loadDicomWeb, setLoadDicomWeb] = useState(false)

  const studyTableRef = useRef(null)
  const seriesTableRef = useRef(null)

  useEffect(() => {
    // Fetch DICOMweb servers list
    axios({
      method: 'get',
      url: `${process.env.REACT_APP_API_URL}/dicom-web/servers?expand`,
    }).then(res => {
      const servers = Object.keys(res.data)
      setDICOMservers(() => servers)

      servers.length && setSelectedServer(servers[0])
    })
  }, [])

  // Fetch study list
  const getStudyList = formData => {
    setLoadDicomWeb(true)
    axios({
      method: 'POST',
      url: `${process.env.REACT_APP_API_URL}/dicom-web/servers/${selectedServer}/qido`,
      data: {
        Uri: '/studies',
        Arguments: {
          fuzzymatching: 'true',
          ...formData,
        },
      },
    }).then(response => {
      setStudyList(() => response.data)
      setLoadDicomWeb(false)
      studyTableRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  // Fetch study list
  const getSeries = studyInstanceUID => {
    axios({
      method: 'POST',
      url: `${process.env.REACT_APP_API_URL}/dicom-web/servers/${selectedServer}/qido`,
      data: {
        Uri: `/studies/${studyInstanceUID}/series`,
      },
    }).then(response => {
      setSelectedStudyUID(() => studyInstanceUID)

      setSeriesList(() => response.data)

      seriesTableRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  // Open Tags Modal
  const openTagsModal = (title, data) => {
    setModalContent(() => {
      return {
        title,
        data: Object.keys(data).map(key => {
          return {
            Tag: key,
            Description: data[key].Name,
            Value: data[key].Value,
          }
        }),
      }
    })
    setShowModal(() => true)
  }

  // Retrieve study using WADO-RS
  const performWADORS = (Uri, title) => {
    axios({
      method: 'POST',
      url: `${process.env.REACT_APP_API_URL}/dicom-web/servers/${selectedServer}/wado`,
      data: { Uri },
    })
      .then(response => {
        showSuccessAlert(`Job to Retrieve the ${title} has been created successfully!`)
      })
      .catch(err => {
        // Only handle response errors, let global interceptor handle network errors
        if (err?.response) {
          showErrorAlert(
            `An error has occurred while retrieving the ${title}. Please try again later!`
          )
        }
      })
  }

  return (
    <>
      <Card>
        <CardBody>
          <QueryForm
            DICOMservers={DICOMservers}
            onSubmit={getStudyList}
            loadDicomWeb={loadDicomWeb}
            selectedServer={selectedServer}
            setSelectedServer={setSelectedServer}
          />
        </CardBody>
      </Card>
      {studyList.length ? (
        <div ref={studyTableRef}>
          <StudyTable
            studyList={studyList}
            fetchSeries={getSeries}
            openModal={openTagsModal}
            performWADORS={performWADORS}
          />
        </div>
      ) : null}
      {seriesList.length ? (
        <div ref={seriesTableRef}>
          <SeriesTable
            seriesList={seriesList}
            selectedStudyUID={selectedStudyUID}
            openModal={openTagsModal}
            performWADORS={performWADORS}
          />
        </div>
      ) : null}
      <TagsModal showModal={showModal} modalData={modalContent} setShowModal={setShowModal} />
    </>
  )
}

const QueryForm = ({ DICOMservers, onSubmit, loadDicomWeb, selectedServer, setSelectedServer }) => {
  const [formData, setFormData] = useState({})

  useEffect(() => {
    DICOMservers.length && setSelectedServer(() => DICOMservers[0])
  }, [DICOMservers])

  // Reset Form
  const resetForm = () => {
    setFormData(prev => {
      return {}
    })
  }

  // On Input
  const onInputChange = e => {
    setFormData(prev => {
      return { ...prev, [e.target.id]: e.target.value }
    })
  }

  return (
    <Form>
      <FormGroup row className="mb-2">
        <Label sm="3" for="dicom-server">
          DICOMweb server:
        </Label>
        <Col md="6" sm="12">
          <Input
            type="select"
            name="dicom-server"
            id="select-basic"
            onChange={e => setSelectedServer(() => e.target.value)}
            value={selectedServer}
          >
            {DICOMservers.map((value, idx) => {
              return (
                <option value={value} key={idx}>
                  {value}
                </option>
              )
            })}
          </Input>
        </Col>
      </FormGroup>

      <FormGroup row>
        <Label sm="3" for="PatientID">
          Patient ID:
        </Label>
        <Col sm="6">
          <Input
            type="text"
            name="PatientID"
            id="00100020"
            onChange={onInputChange}
            value={formData['00100020'] ? formData['00100020'] : ''}
          />
        </Col>
      </FormGroup>

      <FormGroup row>
        <Label sm="3" for="PatientName">
          Patient Name:
        </Label>
        <Col sm="6">
          <Input
            type="text"
            name="PatientName"
            id="00100010"
            onChange={onInputChange}
            value={formData['00100010'] ? formData['00100010'] : ''}
          />
        </Col>
      </FormGroup>

      <FormGroup row>
        <Label sm="3" for="AccessionNumber">
          Accession Number:
        </Label>
        <Col sm="6">
          <Input
            type="text"
            name="AccessionNumber"
            id="00080050"
            onChange={onInputChange}
            value={formData['00080050'] ? formData['00080050'] : ''}
          />
        </Col>
      </FormGroup>

      <FormGroup row>
        <Label sm="3" for="StudyDate">
          Study date:
        </Label>
        <Col sm="6">
          <Input
            type="text"
            name="StudyDate"
            id="00080020"
            onChange={onInputChange}
            value={formData['00080020'] ? formData['00080020'] : ''}
          />
        </Col>
      </FormGroup>

      <FormGroup className="mb-0" row>
        <Col className="d-flex" md={{ size: 9, offset: 3 }}>
          <Button.Ripple className="mr-1" color="primary" onClick={() => onSubmit(formData)}>
            {loadDicomWeb ? <Spinner color="light" size="sm" /> : 'Do lookup'}
          </Button.Ripple>
          <Button.Ripple className="mr-1" color="danger" outline onClick={resetForm}>
            Reset
          </Button.Ripple>
        </Col>
      </FormGroup>
    </Form>
  )
}

const StudyTable = ({ studyList, fetchSeries, openModal, performWADORS }) => {
  const [rowsPerPage, setRowsPerPage] = useState(
    localStorage.getItem('dicomwebrow') ? JSON.parse(localStorage.getItem('dicomwebrow')) : 7
  )

  const [sortField, setSortField] = useState(null)
  const [sortOrder, setSortOrder] = useState(0)
  const [page, setPage] = useState(0)
  const userData = JSON.parse(isUserLoggedIn())

  function handleSort(d) {
    if (d.sortField) {
      setSortOrder(d.sortOrder)
      setSortField(d.sortField)
    }
  }

  const studyTableColumns = [
    {
      name: 'Patient ID', //Patient ID
      cell: row => (row['00100020'] ? (row['00100020'].Value ? row['00100020'].Value : '-') : '-'),
      reorder: true,
      sortable: false,
      minWidth: '150px',
      id: 'MRN',
    },
    {
      name: 'Patient Name',
      cell: row => (row['00100010'] ? (row['00100010'].Value ? row['00100010'].Value : '-') : '-'),
      reorder: true,
      sortable: false,
      minWidth: '200px',
      id: 'PatientName',
    },
    {
      name: 'Accession',
      cell: row => (row['00080050'] ? (row['00080050'].Value ? row['00080050'].Value : '-') : '-'),
      reorder: true,
      sortable: false,
      minWidth: '205px',
      id: 'Accession',
    },
    {
      name: 'Study Date',
      cell: row =>
        row['00080020'] && row['00080020'].Value
          ? moment(row['00080020'].Value).format(userData?.dateFormats?.dateFormat)
          : '-',
      reorder: true,
      sortable: false,
      minWidth: '150px',
      id: 'StudyDate',
    },
    {
      name: 'Actions',
      id: 'Actions',
      cell: (row, idx) => {
        return (
          <>
            <Folder
              id="folder"
              size={15}
              className="mr-1"
              style={{ cursor: 'pointer' }}
              onClick={() => fetchSeries(row['0020000D'].Value)}
            />
            <UncontrolledTooltip className="tooltip-react-strap" target="folder">
              Open series
            </UncontrolledTooltip>
            <FileText
              id="fileText"
              size={15}
              className="mr-1"
              style={{ cursor: 'pointer' }}
              onClick={() => openModal('Details of Study', row)}
            />
            <UncontrolledTooltip className="tooltip-react-strap" target="fileText">
              Open tags
            </UncontrolledTooltip>
            <DownloadCloud
              id="downloadCloud"
              size={15}
              style={{ cursor: 'pointer' }}
              onClick={() => performWADORS(`studies/${row['0020000D'].Value}`, 'Study')}
            />
            <UncontrolledTooltip className="tooltip-react-strap" target="downloadCloud">
              Retrieve study
            </UncontrolledTooltip>
          </>
        )
      },
    },
  ]

  return (
    <Card>
      <ListTable
        {...{
          moduleName: 'dicom-web-study',
          tableData: studyList.slice(page, page + rowsPerPage),
          visibleColumns: studyTableColumns,
          rows: rowsPerPage,
          totalRecords: studyList.length,
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
    </Card>
  )
}

const SeriesTable = ({ seriesList, setSelectedStudyUID, openModal, performWADORS }) => {
  const userData = JSON.parse(isUserLoggedIn())

  const [rowsPerPage, setRowsPerPage] = useState(
    localStorage.getItem('dicomwebseriesrow')
      ? JSON.parse(localStorage.getItem('dicomwebseriesrow'))
      : 7
  )

  const [sortField, setSortField] = useState(null)
  const [sortOrder, setSortOrder] = useState(0)
  const [page, setPage] = useState(0)

  //   }

  const previewSeries = async uid => {
    showLoadingAlert('<p>Loading...</p>')
    const get_study = await axios({
      method: 'get',
      url: `${process.env.REACT_APP_API_URL}/dicom-web/studyId/${uid}`,
    }).then(res => {
      return res.data
    })
    hideLoadingAlert()
    const viewer_url = `${process.env.REACT_APP_VIEWER_URL}/viewer?StudyInstanceUIDs=${uid}&accessToken=${localStorage.getItem('accessToken')?.replace(/"/g, '')}&dateFormat=${userData?.dateFormats?.dateFormat || 'MM/DD/YYYY'}&id=${get_study.status ? get_study.Id : ''}&mode=${get_study.studyStatus === STUDYSTATUS.Unread ? 'create' : 'preview'}`

    window.open(viewer_url, JSON.parse(localStorage.getItem('userData'))?.viewerPreference)
  }

  const columns = [
    {
      name: 'SeriesDescription',
      selector: '0008103E',
      sortable: false,
      reorder: true,
      minWidth: '150px',
      id: 'seriesDescription',
      cell: row => {
        return row['0008103E'] ? row['0008103E'].Value : '-'
      },
    },
    {
      name: 'Modality',
      selector: '00080060',
      sortable: false,
      reorder: true,
      minWidth: '200px',
      id: 'modality',
      cell: row => {
        return row['00080060'] ? row['00080060'].Value : '-'
      },
    },
    {
      name: 'Actions',
      reorder: true,
      sortable: false,
      id: 'actions',
      cell: (row, idx) => {
        return (
          <>
            <Eye
              id="eye"
              size={15}
              className="mr-1"
              style={{ cursor: 'pointer' }}
              onClick={() => previewSeries(row['0020000D'].Value)}
            />
            <UncontrolledTooltip className="tooltip-react-strap" target="eye">
              Preview
            </UncontrolledTooltip>
            <FileText
              id="fileText"
              size={15}
              className="mr-1"
              style={{ cursor: 'pointer' }}
              onClick={() => openModal('Details of Series', row)}
            />
            <UncontrolledTooltip className="tooltip-react-strap" target="fileText">
              Open tags
            </UncontrolledTooltip>
            <DownloadCloud
              id="downloadCloud"
              size={15}
              style={{ cursor: 'pointer' }}
              onClick={() =>
                performWADORS(
                  `studies/${setSelectedStudyUID}/series/${row['0020000E'].Value}`,
                  'Series'
                )
              }
            />
            <UncontrolledTooltip className="tooltip-react-strap" target="downloadCloud">
              Retrieve study
            </UncontrolledTooltip>
          </>
        )
      },
    },
  ]

  function handleSort(d) {
    if (d.sortField) {
      setSortOrder(d.sortOrder)
      setSortField(d.sortField)
    }
  }

  const handleClick = tmpdata => {
    const e = tmpdata?.data ? tmpdata?.data : tmpdata
    previewSeries(e['0020000D'].Value)
  }

  return (
    <Card>
      <ListTable
        {...{
          moduleName: 'dicom-web-series',
          tableData: seriesList.slice(page, page + rowsPerPage),
          visibleColumns: columns,
          rows: rowsPerPage,
          totalRecords: seriesList.length,
          first: page,
          onSort: handleSort,
          sortField,
          sortOrder,
          onRowDoubleClick: handleClick,
          onPage: e => {
            setPage(e.first++)
            setRowsPerPage(prev => e.rows)
          },
        }}
      />
    </Card>
  )
}

const TagsModal = ({ showModal, modalData, setShowModal }) => {
  const columns = [
    {
      name: 'Tag',
      selector: 'Tag',
      sortable: true,
      minWidth: '150px',
    },
    {
      name: 'Description',
      selector: 'Description',
      sortable: true,
      minWidth: '200px',
    },
    {
      name: 'Value',
      selector: 'Value',
      sortable: true,
      minWidth: '205px',
    },
  ]

  return (
    <div className="vertically-centered-modal">
      <Modal
        isOpen={showModal}
        toggle={() => setShowModal(!showModal)}
        className="modal-dialog-centered modal-xl"
      >
        <ModalHeader toggle={() => setShowModal(!showModal)}>{modalData.title}</ModalHeader>
        <DataTable noHeader columns={columns} data={modalData ? modalData.data : []} />
      </Modal>
    </div>
  )
}

export default DICOMweb
