export const OrthancLevels = {
  patients: {
    capital: 'Patient',
    regular: 'patients',
    nonPlural: 'patient',
    childDicomTag: 'Studies',
    child: 'studies',
    nameTag: 'PatientName',
  },
  studies: {
    capital: 'Study',
    regular: 'studies',
    nonPlural: 'study',
    parentDicomTag: 'ParentPatient',
    childDicomTag: 'Series',
    parent: 'patients',
    child: 'series',
    nameTag: 'StudyDescription',
  },
  series: {
    capital: 'Series',
    regular: 'series',
    nonPlural: 'series',
    parentDicomTag: 'ParentStudy',
    childDicomTag: 'Instances',
    parent: 'studies',
    child: 'instances',
    nameTag: 'SeriesDescription',
  },
  instances: {
    capital: 'Instance',
    regular: 'instances',
    nonPlural: 'instance',
    parentDicomTag: 'ParentSeries',
    parent: 'series',
    nameTag: 'InstanceNumber',
  },
}

export const keepFieldsInAnonymous = {
  keep: ['SeriesDescription', 'StudyDescription'],
}
