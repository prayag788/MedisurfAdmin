import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'

library.add(fas)

export default [
  {
    id: 'reportTemplate',
    title: 'Report Template',
    icon: <FontAwesomeIcon icon="fas fa-file-pen" />,
    badge: 'light-warning',
    navLink: '/report-template',
    action: 'manage',
    resource: 'report-template',
  },
]
