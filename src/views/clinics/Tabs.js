import { Nav, NavItem, NavLink } from 'reactstrap'
import { Info, CreditCard } from 'react-feather'

const Tabs = ({ activeTab }) => {
  return (
    <Nav className="nav-left mt-1" pills>
      <NavItem className="clinic-progress-nav">
        <NavLink className="ml-1 cursor-default" active={activeTab === '1'}>
          <Info size={18} className="mr-1" />
          <span className="font-weight-bold">Information</span>
        </NavLink>
        <NavLink className="cursor-default" active={activeTab === '2'}>
          <CreditCard size={18} className="mr-1" />
          <span className="font-weight-bold">License</span>
        </NavLink>
      </NavItem>
    </Nav>
  )
}

export default Tabs
