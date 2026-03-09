import { lazy } from 'react'

const ClinicAdminToolsHome = lazy(() => import('../../views/clinic-admin-tools/ClinicAdminToolsHome'))
const ClinicAdminLogs = lazy(() => import('../../views/clinic-admin-tools/ClinicAdminLogs'))
const ClinicAdminApiTools = lazy(() => import('../../views/clinic-admin-tools/ClinicAdminApiTools'))

const ClinicAdminToolsRoutes = [
  {
    path: '/clinic-admin/api-tools',
    component: ClinicAdminToolsHome,
  },
  {
    path: '/clinic-admin/api-tools/logs',
    component: ClinicAdminLogs,
  },
  {
    path: '/clinic-admin/api-tools/sync-studies',
    component: ClinicAdminApiTools,
  },
]

export default ClinicAdminToolsRoutes

