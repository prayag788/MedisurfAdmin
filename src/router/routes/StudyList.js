import { lazy } from 'react'

const StudyList = [
  {
    path: '/study-list',
    component: lazy(() => import('../../views/study-list')),
    meta: {
      action: 'manage',
      resource: 'study-list',
    },
  },
]

export default StudyList
