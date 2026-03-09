import { lazy } from 'react'

const TechnicianUser = [
  {
    path: '/technician-user',
    component: lazy(() => import('../../views/technician-user')),
    meta: {
      action: 'manage',
      resource: 'technician',
    },
  },
]

export default TechnicianUser
