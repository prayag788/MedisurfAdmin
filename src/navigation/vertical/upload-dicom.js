import { Upload } from 'react-feather'

export default [
  {
    id: 'uploadDicom',
    title: 'Upload Dicom Image',
    icon: <Upload size={20} />,
    badge: 'light-warning',
    navLink: '/upload-dicom',
    action: 'manage',
    resource: 'upload-dicom',
  },
]
