// ** Routes Imports
import PagesRoutes from './Pages'
import DoctorsRoutes from './Doctors'
import PowerUser from './PowerUser'
import ClinicUser from './ClinicUser'
import UploadDicom from './uploadDicom'
import Settings from './settings'
import DataAnalyticsRoutes from './DataAnalytics'
import StudyList from './StudyList'
import SharedStudy from './SharedStudy'
import AllUsersRoutes from './AllUsers'
import ViewerRoute from './Viewer'
import Explorer from './Explorer'
import ViewRoute from './View'
import PrintQRcode from './printQRcode'
import License from './License'
import Clinic from './Clinic'
import TechnicianUser from './TechnicianUser'
import RadiologistUser from './RadiologistUser'
import ReportPreview from './ReportPreview'
import CreateReport from './CreateReport'
import DiagnosisRoute from './DiagnosisRoute'
import ReportTemplateRoute from './ReportTemplateRoute'
import EmailTemplates from './EmailTemplates'

import ReferringDoctor from './ReferringDoctor'
import InstitutionClinics from './Clinics'
import Physician from './Physician'
import FilterListingsRoute from './FilterListings'
import ClinicAdminToolsRoutes from './ClinicAdminTools'
// ** Document title
const TemplateTitle = '%s - Vuexy React Admin Template'

// ** Default Route
const DefaultRoute = '/study-list'
const userData = JSON.parse(localStorage.getItem('userData'))
// ** Merge Routes
const Routes = [
  ...PagesRoutes,
  ...DoctorsRoutes,
  ...PowerUser,
  ...ClinicUser,
  ...Settings,
  ...UploadDicom,
  ...DiagnosisRoute,
  ...ReportTemplateRoute,
  ...DataAnalyticsRoutes,
  ...AllUsersRoutes,
  ...StudyList,
  ...SharedStudy,
  ...ViewerRoute,
  ...Explorer,
  ...PrintQRcode,
  ...License,
  ...ViewRoute,
  ...Clinic,
  ...InstitutionClinics,
  ...TechnicianUser,
  ...RadiologistUser,
  ...ReportPreview,
  ...EmailTemplates,
  ...CreateReport,

  ...ReferringDoctor,
  ...Physician,
  ...FilterListingsRoute,
  ...ClinicAdminToolsRoutes,
]
export { DefaultRoute, TemplateTitle, Routes }
