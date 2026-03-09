import { lazy } from 'react'

const SharedStudy = [
  {
    path: '/viewer/:studyId',
    component: lazy(() => import('../../views/viewer')),
    layout: 'BlankLayout',
    meta: {
      action: 'manage',
      resource: 'viewer',
    },
  },
]

export default SharedStudy
