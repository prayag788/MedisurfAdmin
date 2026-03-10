import { lazy } from 'react'

const PagesRoutes = [
  {
    path: '/login',
    component: lazy(() => import('../../views/pages/authentication/NewLogin')),
    layout: 'BlankLayout',
    meta: {
      authRoute: true,
    },
  },
  {
    path: '/activation-key',
    component: lazy(
      () => import('../../views/pages/authentication/ActivationKey')
    ),
    layout: 'BlankLayout',
    meta: {
      authRoute: true,
      activationKeyRoute: true,
      action: 'manage',
      resource: 'activation-key',
    },
  },
  {
    path: '/pages/account-settings',
    component: lazy(() => import('../../views/pages/account-settings')),
  },
  {
    path: '/forgot-password',
    component: lazy(
      () => import('../../views/pages/authentication/ForgotPassword')
    ),
    layout: 'BlankLayout',
    meta: {
      authRoute: true,
    },
  },
  {
    path: '/forgotPassword/:token',
    component: lazy(
      () => import('../../views/pages/authentication/ForgotPasswordV1')
    ),
    layout: 'BlankLayout',
    meta: {
      authRoute: true,
    },
  },
  {
    path: '/misc/not-authorized',
    component: lazy(() => import('../../views/pages/misc/NotAuthorized')),
    layout: 'BlankLayout',
    meta: {
      publicRoute: true,
    },
  },
  {
    path: '/misc/expiredLink',
    component: lazy(() => import('../../views/pages/misc/ExpiredLink')),
    layout: 'BlankLayout',
    meta: {
      publicRoute: true,
    },
  },
  {
    path: '/misc/error',
    component: lazy(() => import('../../views/pages/misc/Error')),
    layout: 'BlankLayout',
    meta: {
      publicRoute: true,
    },
  },
]

export default PagesRoutes
