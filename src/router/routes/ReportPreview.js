import { lazy } from 'react'

const ReportPreview = [
  {
    path: '/report/preview',
    component: lazy(() => import('../../views/report/PreviewReport')),
  },
]

export default ReportPreview
