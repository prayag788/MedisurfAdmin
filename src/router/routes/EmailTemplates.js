import { lazy } from 'react'

const EmailTemplate = [
  {
    path: '/email-template',
    exact: true,
    component: lazy(() => import('../../views/email-template')),
    meta: {
      action: 'manage',
      resource: 'report-template',
    },
  },
  {
    path: '/email-template/:id/edit',
    exact: true,
    component: lazy(() => import('../../views/email-template/edit')),
    meta: {
      action: 'manage',
      resource: 'report-template',
    },
  },
]

export default EmailTemplate
