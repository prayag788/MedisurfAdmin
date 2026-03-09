// ** Navigation sections imports
import uploadDicom from './upload-dicom'
import settings from './settings'
import dataAnalytics from './data-analytics'
import studyList from './study-list'
import explorer from './explorer'
import license from './license'
import clinic from './clinic'
import accountSettings from './account-settings'
import diagnosis from './Diagnosis'
import reportTemplate from './report-template'
import emailTemplate from './email-template'

// ** Merge & Export
export default [
  ...studyList,
  ...uploadDicom,
  ...diagnosis,
  ...settings,
  ...reportTemplate,
  ...dataAnalytics,
  ...explorer,
  ...license,
  ...clinic,
  ...emailTemplate,
  ...accountSettings,
]
