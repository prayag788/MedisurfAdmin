import { lazy } from 'react'

const ReportTemplateRoute = [
  {
    path: '/report-template',
    exact: true,
    component: lazy(() => import('../../views/report-template')),
    meta: {
      action: 'manage',
      resource: 'report-template',
    },
  },
  {
    path: '/report-template/new',
    exact: true,
    component: lazy(() => import('../../views/report-template/addNew')),
    meta: {
      action: 'manage',
      resource: 'report-template',
    },
  },
  {
    path: '/report-template/:id/edit',
    exact: true,
    component: lazy(() => import('../../views/report-template/edit')),
    meta: {
      action: 'manage',
      resource: 'report-template',
    },
  },
]

export default ReportTemplateRoute
