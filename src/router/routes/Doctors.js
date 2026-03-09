import { lazy } from 'react'

const DoctorsRoutes = [
  {
    path: '/doctors',
    component: lazy(() => import('../../views/doctors')),
    meta: {
      action: 'manage',
      resource: 'doctor',
    },
  },
]

export default DoctorsRoutes
