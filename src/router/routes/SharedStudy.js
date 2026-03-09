import { lazy } from 'react'

const SharedStudy = [
  {
    path: '/shared-study/:token',
    component: lazy(() => import('../../views/shared-study')),
    layout: 'BlankLayout',
    meta: {
      publicRoute: true,
    },
  },
]

export default SharedStudy
