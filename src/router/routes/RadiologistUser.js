import { lazy } from 'react'

const RadiologistUser = [
  {
    path: '/radiologist-user',
    component: lazy(() => import('../../views/radiologist-user')),
    meta: {
      action: 'manage',
      resource: 'radiologist',
    },
  },
]

export default RadiologistUser
