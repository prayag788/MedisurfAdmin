import { Settings } from 'react-feather'

export default [
  {
    id: 'AccountSettings',
    title: 'Account Settings',
    icon: <Settings size={20} />,
    badge: 'light-warning',
    navLink: '/pages/account-settings',
    action: 'manage',
    resource: 'account-settings',
  },
]
