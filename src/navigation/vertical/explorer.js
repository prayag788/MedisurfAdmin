import { Server, Search, User, BookOpen, PieChart } from 'react-feather'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'

library.add(fas)

export default [
  {
    id: 'explore',
    title: 'Server',
    icon: <Server size={20} />,
    badge: 'light-warning',
    navLink: '',
    children: [
      {
        id: 'home',
        title: 'Lookup',
        icon: <Search size={20} />,
        navLink: '/explorer',
        action: 'manage',
        resource: 'explorer',
      },
      {
        id: 'query-retrieve',
        title: 'Query/Retrieve',
        icon: <FontAwesomeIcon icon="fas fa-list-ul" />,
        navLink: '/explorer/query-retrieve',
        action: 'manage',
        resource: 'query-retrieve',
      },
      {
        id: 'all_patients',
        title: 'All Patients',
        icon: <User size={20} />,
        navLink: '/explorer/all-patients',
        action: 'manage',
        resource: 'all-patients',
      },
      {
        id: 'all_studies',
        title: 'All Studies',
        icon: <BookOpen size={20} />,
        navLink: '/explorer/all-studies',
        action: 'manage',
        resource: 'all-studies',
      },
      {
        id: 'DICOMweb',
        title: 'DICOMweb',
        icon: <PieChart size={20} />,
        badge: 'light-warning',
        navLink: '/explorer/dicom-web',
        action: 'manage',
        resource: 'dicom-web',
      },
      {
        id: 'jobs',
        title: 'Jobs',
        icon: <FontAwesomeIcon icon="fa-solid fa-list-check" />,
        badge: 'light-warning',
        navLink: '/explorer/jobs',
        action: 'manage',
        resource: 'jobs',
      },
    ],
  },
]
