import { lazy } from 'react'

const License = [
  // License
  {
    path: '/license',
    component: lazy(() => import('../../views/license')),
    meta: {
      action: 'manage',
      resource: 'license',
    },
  },
  {
    path: '/unauthorized',
    component: lazy(() => import('../../views/license/unauthorized')),
    meta: {
      action: 'manage',
      resource: 'license',
    },
  },
]

export default License
