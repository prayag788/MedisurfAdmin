import { lazy } from 'react'

const Physician = [
  {
    path: '/physician',
    component: lazy(() => import('../../views/physician')),
    meta: {
      action: 'manage',
      resource: 'physician',
    },
  },
]

export default Physician
