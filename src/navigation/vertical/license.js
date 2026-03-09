import { CreditCard } from 'react-feather'

export default [
  {
    id: 'license',
    title: 'License',
    icon: <CreditCard size={20} />,
    badge: 'light-warning',
    navLink: '/license',
    action: 'manage',
    resource: 'license',
  },
  {
    id: 'unauthorized',
    title: 'Un-Authorized Request',
    icon: <CreditCard size={20} />,
    badge: 'light-warning',
    navLink: '/unauthorized',
    action: 'manage',
    resource: 'license',
  },
]
