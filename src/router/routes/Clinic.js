import { lazy } from 'react'

const License = [
  // License
  {
    path: '/clinic',
    component: lazy(() => import('../../views/clinic')),
    meta: {
      action: 'manage',
      resource: 'clinic',
    },
  },
]

export default License
