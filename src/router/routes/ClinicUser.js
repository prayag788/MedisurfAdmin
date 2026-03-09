import { lazy } from 'react'

const ClinicUser = [
  {
    path: '/clinic-user',
    component: lazy(() => import('../../views/clinic-user')),
    meta: {
      action: 'manage',
      resource: 'clinic-user',
    },
  },
]

export default ClinicUser
