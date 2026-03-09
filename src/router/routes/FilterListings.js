import { lazy } from 'react'

const FilterListingsRoute = [
  {
    path: '/settings/filter_listings',
    component: lazy(() => import('../../views/filter-listings')),
    meta: {
      action: 'manage',
      resource: 'filter-listings',
    },
  },
]

export default FilterListingsRoute
