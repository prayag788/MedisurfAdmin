import { PieChart } from 'react-feather'

export default [
  {
    id: 'jobs',
    title: 'Jobs',
    icon: <PieChart size={20} />,
    badge: 'light-warning',
    navLink: '/jobs',
    action: 'manage',
    resource: 'jobs',
  },
]
