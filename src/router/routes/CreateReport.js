import { lazy } from 'react'

const CreateReport = [
  {
    path: '/report/create',
    component: lazy(() => import('../../views/report/PreviewReport')),
  },
]

export default CreateReport
