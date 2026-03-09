import { lazy } from 'react'

const JobsRoutes = [
  {
    path: '/jobs',
    component: lazy(() => import('../../views/jobs')),
  },
]

export default JobsRoutes
