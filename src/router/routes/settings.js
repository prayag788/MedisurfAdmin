import { lazy } from 'react'

const Settings = [
  {
    path: '/settings',
    exact: true,
    component: lazy(() => import('../../views/Settings')),
  },
  {
    path: '/settings/terms-and-conditions',
    exact: true,
    component: lazy(
      () => import('../../views/Settings/pages/TermsAndConditions')
    ),
    meta: {
      action: 'manage',
      resource: 't&c',
    },
  },
  {
    path: '/settings/privacy-policy',
    exact: true,
    component: lazy(() => import('../../views/Settings/pages/PrivacyPolicy')),
    meta: {
      action: 'manage',
      resource: 'privacy-policy',
    },
  },
  {
    path: '/settings/cookie-policy',
    exact: true,
    component: lazy(() => import('../../views/Settings/pages/CookiePolicy')),
    meta: {
      action: 'manage',
      resource: 'cookie-policy',
    },
  },
  {
    path: '/settings/add_modality',
    exact: true,
    component: lazy(() => import('../../views/Settings/pages/AddModality')),
    meta: {
      action: 'manage',
      resource: 'add_modality',
    },
  },
  {
    path: '/settings/edit_modality',
    exact: true,
    component: lazy(() => import('../../views/Settings/pages/EditModality')),
    meta: {
      action: 'manage',
      resource: 'edit_modality',
    },
  },
  {
    path: '/settings/modality_listing',
    exact: true,
    component: lazy(() => import('../../views/Settings/pages/ModalityList')),
    meta: {
      action: 'manage',
      resource: 'modality',
    },
  },
  {
    path: '/settings/edit_orthanc',
    exact: true,
    component: lazy(
      () => import('../../views/Settings/pages/EditOrthancDetails')
    ),
    meta: {
      action: 'manage',
      resource: 'orthanc',
    },
  },
]

export default Settings
