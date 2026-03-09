import { lazy } from 'react'

const InstitutionClinics = [
  // License
  {
    path: '/institution-clinics',
    component: lazy(() => import('../../views/clinics')),
    meta: {
      action: 'manage',
      resource: 'institution-clinics',
    },
  },
]

export default InstitutionClinics
