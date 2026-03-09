import { lazy } from 'react'

const PowerUser = [
  {
    path: '/power-user',
    component: lazy(() => import('../../views/power-user')),
    meta: {
      action: 'manage',
      resource: 'power-user',
    },
  },
]

export default PowerUser
