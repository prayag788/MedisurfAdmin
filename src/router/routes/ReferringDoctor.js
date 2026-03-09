import { lazy } from 'react'

const DoctorsRoutes = [
  {
    path: '/referring-doctor',
    component: lazy(() => import('../../views/referring-doctor')),
    meta: {
      action: 'manage',
      resource: 'referring-doctor',
    },
  },
]

export default DoctorsRoutes
