import { Nav, NavItem, NavLink } from 'reactstrap'
import { FileText, File } from 'react-feather'

const Tabs = ({
  activeTab,
  setActiveTab,
  userData,
  studyId,
  worksheetDataLength,
  isFinalReportEditable,
}) => {
  const toggle = tab => {
    if (activeTab !== tab) setActiveTab(tab)
  }

  return (
    <Nav tabs className="mb-3">
      <NavItem>
        <NavLink
          active={activeTab === '1'}
          onClick={() => toggle('1')}
          className="d-flex align-items-center"
        >
          <FileText size={16} className="me-1" />
          Report
        </NavLink>
      </NavItem>
      {(userData?.role === 'RDU' || userData?.role === 'TCU') && (
        <NavItem>
          <NavLink
            active={activeTab === '2'}
            onClick={() => toggle('2')}
            className="d-flex align-items-center"
          >
            <File size={16} className="me-1" />
            Worksheets {worksheetDataLength > 0 && `(${worksheetDataLength})`}
          </NavLink>
        </NavItem>
      )}
    </Nav>
  )
}

export default Tabs
