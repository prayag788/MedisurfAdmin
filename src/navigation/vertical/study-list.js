import worklistIcon from '../../assets/images/icons/worklist.png'
import { File } from 'react-feather'
export default [
  {
    id: 'StudyList',
    title: 'Study List',
    icon: <File size={20} />,
    badge: 'light-warning',
    navLink: '/study-list',
    action: 'manage',
    resource: 'study-list',
  },
]
