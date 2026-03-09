import moment from 'moment'
import maleIcon from './../../assets/images/icons/male-gender.png'
import femaleIcon from './../../assets/images/icons/female.png'
import otherGenderIcon from './../../assets/images/icons/transgender.png'
import { isUserLoggedIn } from '@utils'

const userData = JSON.parse(isUserLoggedIn())

const studyDateSort = (rowA, rowB) => {
  const a = changeDateFormat(rowA['startTimeStamp'])
  const b = changeDateFormat(rowB['startTimeStamp'])
  if (a > b) {
    return 1
  }
  if (b > a) {
    return -1
  }
  return 0
}

export const columns = {
  patients: [
    {
      name: 'Patient ID',
      selector: row => (row['PatientID'] ? row['PatientID'] : '-'),
      sortable: false,
      reorder: true,

      id: 'PatientID',
      minWidth: '150px',
    },
    {
      name: 'Patient Name',
      selector: row => (row['PatientName'] ? row['PatientName'] : '-'),
      sortable: false,
      reorder: true,

      id: 'PatientName',
      minWidth: '150px',
    },
    {
      name: 'Patient Birth Date',
      selector: row => (row['PatientBirthDate'] ? row['PatientBirthDate'] : '-'),
      sortable: false,
      reorder: true,

      id: 'PatientBirthDate',
      minWidth: '205px',
      sortFunction: studyDateSort,
      cell: row => {
        return moment(row['PatientBirthDate']).format(userData?.dateFormats?.dateFormat)
      },
    },
    {
      name: 'Sex',
      selector: row =>
        row['PatientSex'] === 'M' ? (
          <img src={maleIcon} width={25} alt="Player" />
        ) : row['PatientSex'] === 'F' ? (
          <img src={femaleIcon} width={20} alt="Player" />
        ) : row['PatientSex'] === 'O' ? (
          <img src={otherGenderIcon} width={28} alt="Player" />
        ) : (
          '-'
        ),
      sortable: false,
      reorder: true,

      id: 'PatientSex',
      minWidth: '150px',
      maxWidth: '150px',
    },
  ],
  studies: [
    {
      name: 'Patient Name',
      selector: row => (row['PatientName'] ? row['PatientName'] : '-'),
      sortable: false,
      reorder: true,

      id: 'PatientName',
      minWidth: '150px',
    },
    {
      name: 'Study Description',
      selector: row => (row['StudyDescription'] ? row['StudyDescription'] : '-'),
      sortable: false,
      reorder: true,

      id: 'StudyDescription',
      minWidth: '200px',
    },
    {
      name: 'Patient Birth Date',
      selector: row => (row['PatientBirthDate'] ? row['PatientBirthDate'] : '-'),
      sortable: false,
      reorder: true,

      id: 'PatientBirthDate',
      minWidth: '205px',
      sortFunction: studyDateSort,
      cell: row => {
        return moment(row['PatientBirthDate']).format(userData?.dateFormats?.dateTimeFormat)
      },
    },
    {
      name: 'Patient ID',
      selector: row => (row['PatientID'] ? row['PatientID'] : '-'),
      sortable: false,
      reorder: true,

      id: 'PatientID',
      minWidth: '150px',
    },
    {
      name: 'Sex',
      selector: row =>
        row['PatientSex'] === 'M' ? (
          <img src={maleIcon} width={25} alt="Player" />
        ) : row['PatientSex'] === 'F' ? (
          <img src={femaleIcon} width={20} alt="Player" />
        ) : row['PatientSex'] === 'O' ? (
          <img src={otherGenderIcon} width={28} alt="Player" />
        ) : (
          '-'
        ),
      sortable: false,
      reorder: true,

      id: 'PatientSex',
      minWidth: '150px',
      maxWidth: '150px',
    },
    {
      name: 'Accession Number',
      selector: row => (row['AccessionNumber'] ? row['AccessionNumber'] : '-'),
      sortable: false,
      reorder: true,

      id: 'AccessionNumber',
      minWidth: '225px',
    },
    {
      name: 'Institution Name',
      selector: row => (row['InstitutionName'] ? row['InstitutionName'] : '-'),
      sortable: false,
      reorder: true,

      id: 'InstitutionName',
      minWidth: '175px',
    },
    {
      name: 'Referring Physician Name',
      selector: row => (row['ReferringPhysicianName'] ? row['ReferringPhysicianName'] : '-'),
      sortable: false,
      reorder: true,

      id: 'ReferringPhysicianName',
      minWidth: '200px',
    },
    {
      name: 'Study Date',
      selector: row => (row['StudyDate'] ? row['StudyDate'] : '-'),
      sortable: false,
      reorder: true,

      id: 'StudyDate',
      minWidth: '150px',
      sortFunction: studyDateSort,
      cell: row => {
        return moment(row['StudyDate']).format(userData?.dateFormats?.dateFormat)
      },
    },
    {
      name: 'Study ID',
      selector: row => (row['StudyID'] ? row['StudyID'] : '-'),
      sortable: false,
      reorder: true,

      id: 'StudyID',
      minWidth: '150px',
    },
    {
      name: 'Study Instance UID',
      selector: row => (row['StudyInstanceUID'] ? row['StudyInstanceUID'] : '-'),
      sortable: false,
      reorder: true,

      id: 'StudyInstanceUID',
      minWidth: '150px',
    },
  ],
  series: [
    {
      name: 'Status',
      selector: row => (row['Status'] ? row['Status'] : '-'),
      sortable: false,
      reorder: true,

      id: 'Status',
      minWidth: '150px',
    },
    {
      name: 'Body Part Examined',
      selector: row => (row['BodyPartExamined'] ? row['BodyPartExamined'] : '-'),
      sortable: false,
      reorder: true,

      id: 'BodyPartExamined',
      minWidth: '150px',
    },
    {
      name: 'Modality',
      selector: row => (row['Modality'] ? row['Modality'] : '-'),
      sortable: false,
      reorder: true,

      id: 'Modality',
      minWidth: '150px',
    },
    {
      name: 'Operators Name',
      selector: row => (row['OperatorsName'] ? row['OperatorsName'] : '-'),
      sortable: false,
      reorder: true,

      id: 'OperatorsName',
      minWidth: '150px',
    },
    {
      name: 'SeriesInstance UID',
      selector: row => (row['SeriesInstanceUID'] ? row['SeriesInstanceUID'] : '-'),
      sortable: false,
      reorder: true,

      id: 'SeriesInstanceUID',
      minWidth: '150px',
    },
    {
      name: 'Series Number',
      selector: row => (row['SeriesNumber'] ? row['SeriesNumber'] : '-'),
      sortable: false,
      reorder: true,

      id: 'SeriesNumber',
      minWidth: '150px',
    },
    {
      name: 'Series Description',
      selector: row => (row['SeriesDescription'] ? row['SeriesDescription'] : '-'),
      sortable: false,
      reorder: true,

      id: 'SeriesDescription',
      minWidth: '150px',
    },
  ],
  instances: [
    {
      name: 'Index In Series',
      selector: row => (row['IndexInSeries'] ? row['IndexInSeries'] : '-'),
      sortable: false,
      reorder: true,

      id: 'IndexInSeries',
      minWidth: '75px',
      maxWidth: '175px',
    },
    {
      name: 'Image Comments',
      selector: row => (row['ImageComments'] ? row['ImageComments'] : '-'),
      sortable: false,
      reorder: true,

      id: 'ImageComments',
      minWidth: '150px',
    },
    {
      name: 'SOP Instance UID',
      selector: row => (row['SOPInstanceUID'] ? row['SOPInstanceUID'] : '-'),
      sortable: false,
      reorder: true,

      id: 'SOPInstanceUID',
      minWidth: '150px',
    },
    {
      name: 'Number Of Frames',
      selector: row => (row['NumberOfFrames'] ? row['NumberOfFrames'] : '-'),
      sortable: false,
      reorder: true,

      id: 'NumberOfFrames',
      minWidth: '150px',
      maxWidth: '225px',
    },
  ],
}
