import { Edit } from 'react-feather'

export default [
  {
    id: 'diagnosis',
    title: 'Diagnosis Templates',
    icon: <Edit size={20} />,
    badge: 'light-warning',
    navLink: '/diagnosis',
    action: 'manage',
    resource: 'diagnosis',
  },
]
