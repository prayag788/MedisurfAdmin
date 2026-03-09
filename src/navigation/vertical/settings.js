import { Circle, Settings, Users, List, Edit, Shield } from 'react-feather'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'

library.add(fas, far)

const SettingsRoute = [
  {
    id: 'settings',
    title: 'Settings',
    icon: <Settings size={20} />,
    badge: 'light-warning',
    navLink: '',
    children: [
      {
        id: 'AllUsers',
        title: 'Users',
        icon: <Users size={12} />,
        navLink: '',
        children: [
          {
            id: 'doctors',
            title: 'Doctors',
            icon: <FontAwesomeIcon icon="fas fa-user-md" size="lg" />,
            badge: 'light-warning',
            navLink: '/doctors',
            action: 'manage',
            resource: 'doctor',
          },
          {
            id: 'referringDoctor',
            title: 'Referring Doctors',
            icon: <FontAwesomeIcon icon="fas fa-user-md" size="lg" />,
            badge: 'light-warning',
            navLink: '/referring-doctor',
            action: 'manage',
            resource: 'referring-doctor',
          },

          {
            id: 'powerUser',
            title: 'Power User',
            icon: <Circle size={20} />,
            badge: 'light-warning',
            navLink: '/power-user',
            action: 'manage',
            resource: 'power-user',
          },

          {
            id: 'technicianUser',
            title: 'Technologist User',
            icon: <FontAwesomeIcon icon="fa-solid fa-wrench" size="lg" />,
            badge: 'light-warning',
            navLink: '/technician-user',
            action: 'manage',
            resource: 'technician',
          },
          {
            id: 'radiologistUser',
            title: 'Radiologist User',
            icon: <FontAwesomeIcon icon="fa-solid fa-x-ray" size="lg" />,
            badge: 'light-warning',
            navLink: '/radiologist-user',
            action: 'manage',
            resource: 'radiologist',
          },
        ],
      },
      {
        id: 'AllInstitutionClinics',
        title: 'Institution Clinics',
        icon: <Users size={12} />,
        navLink: '',
        action: 'manage',
        resource: 'clinic-admin-only',
        children: [
          {
            id: 'clinicUser',
            title: 'Clinic User',
            icon: <FontAwesomeIcon icon="fas fa-user-md" size="lg" />,
            badge: 'light-warning',
            navLink: '/clinic-user',
            action: 'manage',
            resource: 'clinic-user',
          },
          {
            id: 'institution-clinics',
            title: 'Add/Edit Clinics',
            icon: <FontAwesomeIcon icon="fas fa-user-md" size="lg" />,
            badge: 'light-warning',
            navLink: '/institution-clinics',
            action: 'manage',
            resource: 'institution-clinics',
          },
          {
            id: 'physician',
            title: 'Add/Edit Physician',
            icon: <FontAwesomeIcon icon="fas fa-user-md" size="lg" />,
            badge: 'light-warning',
            navLink: '/physician',
            action: 'manage',
            resource: 'physician',
          },
        ],
      },
      {
        id: 'filterListings',
        title: 'Filter Listings',
        icon: <List size={12} />,
        navLink: '/settings/filter_listings',
        action: 'manage',
        resource: 'filter-listings',
      },
      {
        id: 'Modality',
        title: 'DICOM Nodes',
        icon: <List size={12} />,
        navLink: '/settings/modality_listing',
        action: 'manage',
        resource: 'modality',
      },
      {
        id: 'TermsAndCondition',
        title: 'Terms and Conditions',
        icon: <FontAwesomeIcon icon="far fa-clipboard" />,
        navLink: '/settings/terms-and-conditions',
        action: 'manage',
        resource: 't&c',
      },
      {
        id: 'Privacypolicy',
        title: 'Privacy policy',
        icon: <Shield size={12} />,
        navLink: '/settings/privacy-policy',
        action: 'manage',
        resource: 'privacy-policy',
      },
      {
        id: 'CookiePolicy',
        title: 'Cookie Policy',
        icon: <FontAwesomeIcon icon="fas fa-file-shield" />,
        navLink: '/settings/cookie-policy',
        action: 'manage',
        resource: 'cookie-policy',
      },
      {
        id: 'OrthancDetail',
        title: 'Edit Server Detail',
        icon: <Edit size={12} />,
        navLink: '/settings/edit_orthanc',
        action: 'manage',
        resource: 'orthanc-detail',
      },
    ],
  },
]

//     SettingObject.children.push()

//     SettingsRoute = SettingsRoute.map((item) => {

//         }

//     })
// }

export default SettingsRoute
