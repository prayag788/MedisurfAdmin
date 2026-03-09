import { lazy } from 'react'

const Routes = [
  {
    path: '/explorer',
    exact: true,
    component: lazy(() => import('../../views/explorer/Home')),
  },
  {
    path: '/explorer/all-patients',
    exact: true,
    component: lazy(() => import('../../views/explorer/AllDetails')),
  },
  {
    path: '/explorer/all-studies',
    exact: true,
    component: lazy(() => import('../../views/explorer/AllDetails')),
  },
  {
    path: '/explorer/query-retrieve',
    exact: true,
    component: lazy(() => import('../../views/explorer/Query-Retrieve')),
  },
  {
    path: '/explorer/explore',
    exact: true,
    component: lazy(() => import('../../views/explorer/Explorer')),
    layout: 'BlankLayout',
  },
  {
    path: '/explorer/viewer',
    exact: true,
    component: lazy(() => import('../../views/explorer/viewer')),
    layout: 'BlankLayout',
  },
  {
    path: '/explorer/view/:StudyInstanceUID',
    exact: true,
    component: lazy(() => import('../../views/explorer/view')),
    layout: 'BlankLayout',
  },
  {
    path: '/explorer/dicom-web',
    exact: true,
    component: lazy(() => import('../../views/explorer/dicomweb')),
  },
  {
    path: '/explorer/jobs',
    exact: true,
    component: lazy(() => import('../../views/explorer/jobs')),
  },
]

export default Routes
