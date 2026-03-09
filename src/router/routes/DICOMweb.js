import { lazy } from 'react'

const DICOMweb = [
  {
    path: '/dicom-web',
    component: lazy(() => import('../../views/dicomweb')),
    meta: {
      action: 'manage',
      resource: 'dicom-web',
    },
  },
]

export default DICOMweb
