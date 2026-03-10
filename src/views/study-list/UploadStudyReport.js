// ** React Imports
import { Fragment, useState } from 'react'

// ** Configs
import { useSkin } from '@hooks/useSkin'

// ** MUI Imports
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import { toast } from 'react-toastify'

import { Button } from 'reactstrap'
import axios from 'axios'
import { MySwalSuccess } from '../components/MySwalAlert'

// ** Icon Imports
import { FileText, Upload, X } from 'react-feather'

// ** Third Party Components
import { useDropzone } from 'react-dropzone'

function UploadStudyReport({
  selectRowForUploadStudy,
  setOpenStudyUpload,
  setRefresh,
}) {
  // ** State
  const [files, setFiles] = useState([])
  const [skin, setSkin] = useSkin()

  // ** Hooks
  const { getRootProps, getInputProps } = useDropzone({
    maxFiles: 1,
    maxSize: 5000000,
    acceptedFiles: '.pdf',
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length === 1) {
        const acceptedFile = acceptedFiles.filter((file) => {
          return file.type.startsWith('application/pdf')
        })
        if (!acceptedFile.length) {
          toast.error('You can only upload PDF format.', {
            duration: 2000,
          })
        } else {
          setFiles(acceptedFile)
        }
      } else if (acceptedFiles.length !== 0) {
        toast.error('You can only upload 1 file', {
          duration: 2000,
        })
      }
    },
    onDropRejected: () => {
      toast.error('You can only upload 1 PDF file & maximum size of 5 MB.', {
        duration: 2000,
      })
    },
  })

  const renderFilePreview = (file) => {
    if (file?.type?.startsWith('application/pdf')) {
      return <FileText size={30} />
    }
  }

  const handleRemoveFile = (file) => {
    const uploadedFiles = files
    const filtered = uploadedFiles.filter((i) => i.name !== file.name)
    setFiles([...filtered])
  }

  const fileList = files.map((file) => (
    <ListItem key={file.name} className="pdfListing">
      <div className="file-details">
        <div className="file-preview">{renderFilePreview(file)}</div>
        <div>
          <Typography className="file-name">{file.name}</Typography>
          <Typography className="file-size" variant="body2">
            {Math.round(file.size / 100) / 10 > 1000
              ? `${(Math.round(file.size / 100) / 10000).toFixed(1)} mb`
              : `${(Math.round(file.size / 100) / 10).toFixed(1)} kb`}
          </Typography>
        </div>
      </div>
      <IconButton onClick={() => handleRemoveFile(file)}>
        <X size={20} />
      </IconButton>
    </ListItem>
  ))

  const handleRemoveAllFiles = () => {
    setFiles([])
  }

  const handleUploadFile = async () => {
    const formData = new FormData()
    formData.append('reportFile', files[0])

    await axios
      .post(
        `${process.env.REACT_APP_API_URL}/report/technicianReportUpload/${selectRowForUploadStudy}`,
        formData,
        {
          headers: {
            // IMPORTANT: Must override axios global 'Content-Type: application/json'
            // Setting undefined lets the browser auto-set 'multipart/form-data' with the
            // correct boundary string that multer needs to parse the uploaded file.
            'Content-Type': undefined,
          },
        }
      )
      .then((res) => {
        MySwalSuccess(res?.data?.message || 'Report uploaded Successfully')
        setOpenStudyUpload(false)
        setRefresh(Math.random())
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Something went wrong', {
          duration: 2000,
        })
      })
  }

  return (
    <Fragment>
      <div className="dropzoneDiv p-2">
        <div {...getRootProps({ className: 'dropzone' })}>
          <input {...getInputProps()} />
          <Box
            sx={{
              display: 'flex',
              textAlign: 'center',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                mb: 3.75,
                width: 48,
                height: 48,
                display: 'flex',
                borderRadius: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: `${skin === 'light' ? 'rgba(47, 43, 61, 0.08)' : 'rgba(208, 212, 241, 0.08);'}`,
              }}
            >
              <Upload size={20} />
            </Box>
            <Typography variant="h4" sx={{ mb: 2.5 }}>
              Drop files here or click to upload.
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              Allowed *.pdf
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              Max 1 files and max size of 5 MB
            </Typography>
          </Box>
        </div>
        {files.length ? (
          <Fragment>
            <List>{fileList}</List>
            <div className="buttons">
              <Button
                className="ml-1"
                color="outline-danger"
                onClick={handleRemoveAllFiles}
              >
                Remove
              </Button>
              <Button
                className="ml-1"
                color="primary"
                onClick={handleUploadFile}
              >
                Upload Files
              </Button>
            </div>
          </Fragment>
        ) : null}
      </div>
    </Fragment>
  )
}

export default UploadStudyReport
