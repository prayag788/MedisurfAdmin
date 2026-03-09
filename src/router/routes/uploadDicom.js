import { lazy } from 'react'

const UpdloadDiacom = [
  // Dashboards
  {
    path: '/upload-dicom',
    component: lazy(() => import('../../views/upload-dicom/index.js')),
    meta: {
      action: 'manage',
      resource: 'upload-dicom',
    },
  },
]

export default UpdloadDiacom
