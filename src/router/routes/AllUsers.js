import { lazy } from 'react'

const AllUsersRoutes = [
  {
    path: '/all-users',
    component: lazy(() => import('../../views/users')),
  },
]

export default AllUsersRoutes
