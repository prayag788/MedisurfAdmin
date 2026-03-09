import { Nav, NavItem, NavLink } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { List } from 'react-feather'

const Tabs = ({ activeTab, toggleTab }) => {
  return (
    <Nav className="nav-left mt-1" pills>
      <NavItem className="clinic-progress-nav">
        <NavLink
          className="ml-1 cursor-default"
          active={activeTab === '1'}
          onClick={() => toggleTab('1')}
        >
          <FontAwesomeIcon icon="far fa-clipboard" />
          <span className="font-weight-bold">Templates</span>
        </NavLink>
        <NavLink
          className="cursor-default"
          active={activeTab === '2'}
          onClick={() => toggleTab('2')}
        >
          <List size={15} />
          <span className="font-weight-bold">Modality</span>
        </NavLink>
      </NavItem>
    </Nav>
  )
}

export default Tabs
