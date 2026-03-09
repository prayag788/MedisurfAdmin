import { Activity } from 'react-feather'

export default [
  {
    id: 'doctors',
    title: 'Doctors',
    icon: <Activity size={20} />,
    badge: 'light-warning',
    navLink: '/doctors',
    action: 'manage',
    resource: 'doctor',
  },
]
