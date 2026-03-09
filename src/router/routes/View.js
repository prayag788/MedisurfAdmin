import { lazy } from 'react'

const SharedStudy = [
  {
    path: '/view/:StudyInstanceUID',
    component: lazy(() => import('../../views/view')),
    layout: 'BlankLayout',
    meta: {
      action: 'manage',
      resource: 'viewer',
    },
  },
]

export default SharedStudy
