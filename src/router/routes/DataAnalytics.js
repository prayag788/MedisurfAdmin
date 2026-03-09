import { lazy } from 'react'

const DataAnalytics = [
  {
    path: '/data-analytics',
    component: lazy(() => import('../../views/data-analytics')),
    meta: {
      action: 'manage',
      resource: 'data-analytics',
    },
  },
]

export default DataAnalytics
