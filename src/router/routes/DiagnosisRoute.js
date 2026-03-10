import { lazy } from 'react'

const DiagnosisRoute = [
  {
    path: '/diagnosis',
    exact: true,
    component: lazy(() => import('../../views/Diagnosis')),
    meta: {
      action: 'manage',
      resource: 'diagnosis',
    },
  },
  {
    path: '/diagnosis/new',
    exact: true,
    component: lazy(() => import('../../views/Diagnosis/addNew')),
    meta: {
      action: 'manage',
      resource: 'diagnosis',
    },
  },
  {
    path: '/diagnosis/:id/edit',
    exact: true,
    component: lazy(() => import('../../views/Diagnosis/edit')),
    meta: {
      action: 'manage',
      resource: 'diagnosis',
    },
  },
  {
    path: '/diagnosis-modality/add',
    exact: true,
    component: lazy(
      () => import('../../views/Diagnosis/diagnosis-modality/addNew')
    ),
    meta: {
      action: 'manage',
      resource: 'diagnosis',
    },
  },
  {
    path: '/diagnosis-modality/:id/edit',
    exact: true,
    component: lazy(
      () => import('../../views/Diagnosis/diagnosis-modality/edit')
    ),
    meta: {
      action: 'manage',
      resource: 'diagnosis',
    },
  },
]

export default DiagnosisRoute
