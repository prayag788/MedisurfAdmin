// ** React Imports
import { useState, useEffect, useContext } from 'react'

import { checkForOtherOperationDm } from '@utils'

// ** Third Party Components
import { ChevronDown, Eye, Download, X } from 'react-feather'
import DataTable from 'react-data-table-component'
import { UncontrolledTooltip, Modal, ModalHeader, ModalBody } from 'reactstrap'
import {
  showLoadingAlert,
  hideLoadingAlert,
  showErrorAlert,
  getErrorMessage,
} from '../../utils/alerts'
import { showToastSuccess } from '../../utils/toast'
import { useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BackgroundProcessContext } from '../../context/BackgroundProcessContext'
import { socket } from '../../socket'

// ** Styles
import '@styles/react/libs/flatpickr/flatpickr.scss'
import STUDYSTATUS from '@configs/studyStatus'
import ROLES from '@configs/roles'
import axios from 'axios'
// alerts handled via utils/alerts

const SharedStudyTable = ({ toggleAuth }) => {
  const { showBackgroundLoader, hideBackgroundLoader } = useContext(
    BackgroundProcessContext
  )
  // ** States
  const [Picker, setPicker] = useState('')
  const [data, setTableData] = useState([])
  const [rowsPerPage, setRowsPerPage] = useState(7)
  const [currentPage, setCurrentPage] = useState(1)
  const [changeState, setChangeState] = useState(false)
  const [totalStudies, setTotalStudies] = useState(0)
  const [searchName, setSearchName] = useState('')
  const [searchID, setSearchID] = useState('')
  const [searchAccesstion, setSearchAccesstion] = useState('')
  const [searchModality, setSearchModality] = useState('')
  const [searchDescription, setSearchDescription] = useState('')
  const [filteredData, setFilteredData] = useState([])
  const [pdfBlobData, setPdfBlobData] = useState(null)
  const [openPrintStudy, setOpenPrintStudy] = useState(false)
  const userData = JSON.parse(localStorage.getItem('sharedUserData'))
  const location = useLocation()
  useEffect(() => {
    const fetchSharedStudies = async () => {
      const userData = JSON.parse(localStorage.getItem('sharedUserData'))
      if (!userData || !userData.token) {
        setTableData([])
        setTotalStudies(0)
        return
      }
      try {
        sessionStorage.setItem('sharedStudy', true)
        const studylist = await axios.get(
          `${process.env.REACT_APP_API_URL}/studyShare/${userData.token}/getStudyList`,
          {
            params: {
              limit: rowsPerPage,
              since: currentPage,
            },
          }
        )
        const list = studylist?.data
        const rows = Array.isArray(list)
          ? list
          : list !== null && list !== undefined
            ? [list]
            : []
        setTableData(rows)
        setTotalStudies(
          Array.isArray(list)
            ? list.length
            : list !== null && list !== undefined
              ? 1
              : 0
        )
      } catch (err) {
        setTableData([])
        setTotalStudies(0)
      }
    }
    fetchSharedStudies()
  }, [])

  // ** Table data to render
  const dataToRender = () => {
    if (
      searchName.length ||
      searchID.length ||
      searchAccesstion.length ||
      searchModality.length ||
      searchDescription.length ||
      Picker.length
    ) {
      return filteredData
    } else {
      return data
    }
  }

  // ** Function to handle name filter
  const handleNameFilter = (e) => {
    const value = e.target.value
    let updatedData = []
    const dataToFilter = () => {
      if (
        searchAccesstion.length ||
        searchID.length ||
        searchModality.length ||
        searchDescription.length ||
        Picker.length
      ) {
        return filteredData
      } else {
        return data
      }
    }

    setSearchName(value)
    if (value.length) {
      updatedData = dataToFilter().filter((item) => {
        const startsWith = item.PatientName.toLowerCase().startsWith(
          value.toLowerCase()
        )

        const includes = item.PatientName.toLowerCase().includes(
          value.toLowerCase()
        )

        if (startsWith) {
          return startsWith
        } else if (!startsWith && includes) {
          return includes
        } else return null
      })
      setFilteredData([...updatedData])
      setSearchName(value)
    }
  }

  // ** Function to handle email filter
  const handleAccesstionFilter = (e) => {
    const value = e.target.value
    let updatedData = []
    const dataToFilter = () => {
      if (
        searchName.length ||
        searchID.length ||
        searchModality.length ||
        searchDescription.length ||
        Picker.length
      ) {
        return filteredData
      } else {
        return data
      }
    }

    setSearchAccesstion(value)
    if (value.length) {
      updatedData = dataToFilter().filter((item) => {
        const startsWith = item.AccessionNumber.toLowerCase().startsWith(
          value.toLowerCase()
        )

        const includes = item.AccessionNumber.toLowerCase().includes(
          value.toLowerCase()
        )

        if (startsWith) {
          return startsWith
        } else if (!startsWith && includes) {
          return includes
        } else return null
      })
      setFilteredData([...updatedData])
      setSearchAccesstion(value)
    }
  }

  // ** Function to handle post filter
  const handleIDFilter = (e) => {
    const value = e.target.value
    let updatedData = []
    const dataToFilter = () => {
      if (
        searchAccesstion.length ||
        searchName.length ||
        searchModality.length ||
        searchDescription.length ||
        Picker.length
      ) {
        return filteredData
      } else {
        return data
      }
    }

    setSearchID(value)
    if (value.length) {
      updatedData = dataToFilter().filter((item) => {
        const startsWith = item.PatientID.toLowerCase().startsWith(
          value.toLowerCase()
        )

        const includes = item.PatientID.toLowerCase().includes(
          value.toLowerCase()
        )

        if (startsWith) {
          return startsWith
        } else if (!startsWith && includes) {
          return includes
        } else return null
      })
      setFilteredData([...updatedData])
      setSearchID(value)
    }
  }

  const previewReportHandler = (id) => {
    window.open(`${location.pathname}?id=${id._id}&mode=preview`, '_blank')
  }

  const handlePrintReport = async (id) => {
    showLoadingAlert()
    await axios
      .get(`${process.env.REACT_APP_API_URL}/report/download/${id}`)
      .then((res) => {
        const blob = new Blob([new Uint8Array(res.data.pdf.data).buffer], {
          type: 'application/pdf',
        })
        const url = URL.createObjectURL(blob)
        setPdfBlobData(url)
        hideLoadingAlert()
        setOpenPrintStudy(true)
      })
      .catch((err) => {
        console.log('err', err)
        hideLoadingAlert()
      })
  }

  // ** Function to handle city filter
  const handleModalityFilter = (e) => {
    const value = e.target.value
    let updatedData = []
    const dataToFilter = () => {
      if (
        searchAccesstion.length ||
        searchName.length ||
        searchID.length ||
        searchDescription.length ||
        Picker.length
      ) {
        return filteredData
      } else {
        return data
      }
    }

    setSearchModality(value)
    if (value.length) {
      updatedData = dataToFilter().filter((item) => {
        const startsWith = item.Modality[0]
          .toLowerCase()
          .startsWith(value.toLowerCase())

        const includes = item.Modality[0]
          .toLowerCase()
          .includes(value.toLowerCase())

        if (startsWith) {
          return startsWith
        } else if (!startsWith && includes) {
          return includes
        } else return null
      })
      setFilteredData([...updatedData])
      setSearchModality(value)
    }
  }

  // ** Function to handle salary filter
  const handleDescriptionFilter = (e) => {
    const value = e.target.value
    let updatedData = []
    const dataToFilter = () => {
      if (
        searchAccesstion.length ||
        searchName.length ||
        searchID.length ||
        searchModality.length ||
        Picker.length
      ) {
        return filteredData
      } else {
        return data
      }
    }

    setSearchDescription(value)
    if (value.length) {
      updatedData = dataToFilter().filter((item) => {
        const startsWith = item.Description.toLowerCase().startsWith(
          value.toLowerCase()
        )

        const includes = item.Description.toLowerCase().includes(
          value.toLowerCase()
        )

        if (startsWith) {
          return startsWith
        } else if (!startsWith && includes) {
          return includes
        } else return null
      })
      setFilteredData([...updatedData])
      setSearchDescription(value)
    }
  }

  // ** Function to handle date filter
  const handleDateFilter = (range) => {
    const arr = []
    let updatedData = []
    const dataToFilter = () => {
      if (
        searchAccesstion.length ||
        searchName.length ||
        searchID.length ||
        searchModality.length ||
        searchDescription.length
      ) {
        return filteredData
      } else {
        return data
      }
    }

    range.map((i) => {
      const date = new Date(i)

      const year = date.getFullYear()

      let month = (1 + date.getMonth()).toString()
      month = month.length > 1 ? month : `0${month}`

      let day = date.getDate().toString()
      day = day.length > 1 ? day : `0${day}`

      arr.push(`${month}/${day}/${year}`)
      return true
    })

    setPicker(range)

    if (range.length) {
      updatedData = dataToFilter().filter((item) => {
        return (
          new Date(item.start_date).getTime() >= new Date(arr[0]).getTime() &&
          new Date(item.start_date).getTime() <= new Date(arr[1]).getTime()
        )
      })
      setFilteredData([...updatedData])
      setPicker(range)
    }
  }

  const handleClick = (e) => {
    const viewer_url = `${process.env.REACT_APP_VIEWER_URL}/viewer?StudyInstanceUIDs=${e.StudyInstanceUID}&accessToken=${localStorage.getItem('sharedaccessToken')?.replace(/"/g, '')}&dateFormat=${userData?.dateFormats?.dateFormat || 'MM/DD/YYYY'}&id=${e._id}&mode=create&renderFrom=sharedStudy`
    window.open(
      viewer_url,
      JSON.parse(localStorage.getItem('sharedUserData'))?.viewerPreference
    )
  }

  const studyDownloadHanlder = async (studyId) => {
    const userId = userData?._id
    if (!userId) {
      showErrorAlert('Session expired. Please log in again.')
      return
    }
    const orthancStudyId =
      studyId !== null && studyId !== undefined ? String(studyId).trim() : ''
    if (!orthancStudyId) {
      showErrorAlert('Study is not available for download.')
      return
    }

    const eventName = `studyDownloadReady_${userId}`
    socket.off(eventName)

    showBackgroundLoader('Preparing study download...')

    let jobId = null
    let timeoutId = null
    let resolved = false

    const finish = () => {
      if (resolved) return
      resolved = true
      hideBackgroundLoader()
      socket.off(eventName, onReady)
      if (timeoutId) clearTimeout(timeoutId)
    }

    const showDownloadError = (
      errOrMessage,
      fallback = 'Study download failed. Please try again.'
    ) => {
      const msg =
        typeof errOrMessage === 'string'
          ? errOrMessage
          : getErrorMessage(errOrMessage, fallback)
      showErrorAlert(msg)
    }

    const serializeErrForLog = (err) => {
      if (!err) return null
      try {
        return {
          message: err?.message,
          code: err?.code,
          isNetworkError: err?.isNetworkError,
          responseStatus: err?.response?.status,
          configUrl: err?.config?.url,
        }
      } catch (e) {
        return { message: String(err) }
      }
    }

    const LOG = '[StudyDownload-Shared]'
    const onReady = async (payloadStr) => {
      try {
        const payload =
          typeof payloadStr === 'string' ? JSON.parse(payloadStr) : payloadStr
        console.log(LOG, 'Socket event', {
          jobId: payload?.jobId,
          success: payload?.success,
        })
        if (payload.jobId !== jobId) return
        finish()
        if (!payload.success) {
          console.warn(LOG, 'Prepare failed (socket)', {
            message: payload?.message,
          })
          showDownloadError(
            payload.message || 'Failed to prepare study download.'
          )
          return
        }
        if (!payload.downloadToken) {
          console.warn(LOG, 'Socket success but no downloadToken')
          showDownloadError('Download link not ready. Please try again.')
          return
        }
        const downloadUrl = `${process.env.REACT_APP_API_URL}/orthanc/study/download-by-token/${payload.jobId}?token=${encodeURIComponent(payload.downloadToken)}`
        console.log(LOG, 'Opening download URL (browser handles file)', {
          jobId: payload.jobId,
        })
        const link = document.createElement('a')
        link.setAttribute('href', downloadUrl)
        link.setAttribute(
          'download',
          payload.filename || `study_${orthancStudyId}.zip`
        )
        link.setAttribute('target', '_blank')
        link.setAttribute('rel', 'noopener noreferrer')
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        showToastSuccess(
          'Study download started. If the file does not open, check your browser downloads.'
        )
      } catch (err) {
        console.error(
          LOG,
          'GET download error (in-depth)',
          serializeErrForLog(err),
          err
        )
        if (err?.stack) console.error(LOG, 'GET download error stack', err.stack)
        showDownloadError(err)
      }
    }

    try {
      console.log(LOG, 'POST prepare', { orthancStudyId })
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/orthanc/study/${orthancStudyId}/download/prepare`,
        {},
        { timeout: 30000, __skipGlobalNetworkAlert: true }
      )
      jobId = data?.jobId
      console.log(LOG, 'POST prepare response', { jobId: jobId ?? null })
      if (!jobId) {
        finish()
        console.warn(LOG, 'Prepare returned no jobId', { data })
        showDownloadError('Server did not start download. Please try again.')
        return
      }
      timeoutId = setTimeout(
        () => {
          finish()
          console.warn(LOG, 'Timeout waiting for socket', { jobId })
          showDownloadError(
            'Study download is taking too long. Please try again.'
          )
        },
        10 * 60 * 1000
      )
      socket.once(eventName, onReady)
    } catch (error) {
      finish()
      console.error(
        LOG,
        'POST prepare error (in-depth)',
        serializeErrForLog(error),
        error
      )
      if (error?.stack) console.error(LOG, 'POST prepare error stack', error.stack)
      showDownloadError(error)
    }
  }

  // ** Table Columns
  const column = [
    {
      name: 'Patient Name',
      selector: (row) => (row['PatientName'] ? row['PatientName'] : '-'),
      sortable: true,
      reorder: true,

      id: 'PatientName',
      minWidth: '200px',
    },
    {
      name: 'Patient Id',
      selector: (row) => (row['PatientID'] ? row['PatientID'] : '-'),
      sortable: true,
      reorder: true,

      id: 'PatientID',
      minWidth: '150px',
    },
    {
      name: 'Accession',
      selector: (row) =>
        row['AccessionNumber'] ? row['AccessionNumber'] : '-',
      sortable: true,
      reorder: true,

      id: 'AccessionNumber',
      minWidth: '150px',
    },
    {
      name: 'Study Date',
      selector: (row) => (row['startTimeStamp'] ? row['startTimeStamp'] : '-'),
      sortable: true,
      reorder: true,

      id: 'startTimeStamp',
      minWidth: '200px',
    },
    {
      name: 'Modality',
      selector: (row) => (row['Modality'] ? row['Modality'] : '-'),
      sortable: true,
      reorder: true,

      id: 'Modality',
      minWidth: '150px',
    },
    {
      name: 'Description',
      selector: (row) => (row['Description'] ? row['Description'] : '-'),
      sortable: true,
      reorder: true,

      id: 'Description',
      minWidth: '200px',
    },
    {
      name: '#Series',
      selector: (row) => (row['SeriesNumber'] ? row['SeriesNumber'] : '-'),
      sortable: false,
      reorder: true,

      id: 'SeriesNumber',
      minWidth: '100px',
    },
    {
      name: '#Images',
      selector: (row) => (row['ImagesNumber'] ? row['ImagesNumber'] : '-'),
      sortable: false,
      reorder: true,

      id: 'ImagesNumber',
      minWidth: '100px',
    },
    {
      name: 'Actions',
      allowOverflow: true,
      sortable: false,
      reorder: false,

      style: {
        position: 'sticky',
        right: '0',
        'border-left': '1px dotted #6e6b7b',
      },
      minWidth: '80px',
      cell: (row) => {
        return (
          <div className="d-flex align-items-center">
            <a
              href={`${process.env.REACT_APP_VIEWER_URL}/viewer?StudyInstanceUIDs=${row.StudyInstanceUID}&accessToken=${localStorage.getItem('sharedaccessToken')?.replace(/"/g, '')}&dateFormat=${userData?.dateFormats?.dateFormat || 'MM/DD/YYYY'}&id=${row._id}&mode=create&renderFrom=sharedStudy`}
              style={{ color: '#000' }}
              target={
                JSON.parse(localStorage.getItem('sharedUserData'))
                  ?.viewerPreference
              }
            >
              <Eye
                size={15}
                id="view"
                className="mr-50"
                style={{ cursor: 'pointer' }}
              />
            </a>
            <UncontrolledTooltip className="tooltip-react-strap" target="view">
              Click to view study
            </UncontrolledTooltip>
            {userData?.role === ROLES.SharedDoctor && (
              <>
                <Download
                  size={15}
                  id="download"
                  className="mr-50"
                  style={{ cursor: 'pointer' }}
                  onClick={() => studyDownloadHanlder(row.ID)}
                />

                <UncontrolledTooltip
                  target="download"
                  className="tooltip-react-strap"
                >
                  Click to download study
                </UncontrolledTooltip>
              </>
            )}
            {}
            {row.Status === STUDYSTATUS.Final &&
              (userData?.role === ROLES.SharedDoctor ||
                userData?.role === ROLES.SharedPatient) && (
                <>
                  <FontAwesomeIcon
                    icon="fa fa-print"
                    id={`preview_pdf-${row.ID}`}
                    className="mr-50"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      if (checkForOtherOperationDm(row, 1)) {
                        return false
                      }
                      handlePrintReport(row.ID)
                    }}
                  />

                  <UncontrolledTooltip
                    target={`preview_pdf-${row.ID}`}
                    className="tooltip-react-strap"
                  >
                    Print & Download Report
                  </UncontrolledTooltip>
                </>
              )}
          </div>
        )
      },
    },
  ]

  return (
    <>
      {}
      <DataTable
        noHeader
        pagination
        columns={column}
        paginationPerPage={7}
        className="react-dataTable shared-react-dataTable"
        sortIcon={<ChevronDown size={10} />}
        paginationDefaultPage={currentPage + 1}
        data={dataToRender()}
        onRowDoubleClicked={handleClick}
      />

      {}
      <Modal
        isOpen={openPrintStudy}
        toggle={() => setOpenPrintStudy(!openPrintStudy)}
        size="lg"
      >
        <ModalHeader
          className="mb-2"
          close={
            <X
              className="cursor-pointer"
              size={15}
              onClick={() => {
                setOpenPrintStudy(false)
              }}
            />
          }
          tag="div"
        >
          <h5 className="noteModelHeader">Study Report</h5>
        </ModalHeader>
        <ModalBody className="flex-grow-1">
          <iframe
            src={pdfBlobData}
            width="100%"
            style={{ height: '80vh' }}
            title="Report preview"
          />
        </ModalBody>
      </Modal>
    </>
  )
}

export default SharedStudyTable
