import { Nav, NavItem, NavLink } from 'reactstrap'
import { Settings, Lock, Info, Mail, Users } from 'react-feather'
import ROLES from '@configs/roles'

const Tabs = ({ activeTab, toggleTab }) => {
  const userData = JSON.parse(localStorage.getItem('userData'))
  return (
    <Nav className="nav-left" pills vertical>
      <NavItem>
        <NavLink active={activeTab === '1'} onClick={() => toggleTab('1')}>
          <Lock size={18} className="mr-1" />
          <span className="font-weight-bold">Change Password</span>
        </NavLink>
      </NavItem>

      {userData.pwdCng === true &&
        (userData.role !== ROLES.ClinicAdmin || userData.dateCng === true) && (
          <NavItem>
            <NavLink active={activeTab === '2'} onClick={() => toggleTab('2')}>
              <Settings size={18} className="mr-1" />
              <span className="font-weight-bold">Preferences</span>
            </NavLink>
          </NavItem>
        )}

      {userData.pwdCng === true && userData.role === ROLES.ClinicAdmin && (
        <NavItem>
          <NavLink active={activeTab === '3'} onClick={() => toggleTab('3')}>
            <Info size={18} className="mr-1" />
            <span className="font-weight-bold">License</span>
          </NavLink>
        </NavItem>
      )}

      {userData.pwdCng === true &&
        (userData.role === ROLES.ClinicAdmin ||
          userData.role === ROLES.SuperAdmin) &&
        (userData.role !== ROLES.ClinicAdmin || userData.dateCng === true) && (
          <NavItem>
            <NavLink active={activeTab === '4'} onClick={() => toggleTab('4')}>
              <Mail size={18} className="mr-1" />
              <span className="font-weight-bold">Email configuration</span>
            </NavLink>
          </NavItem>
        )}

      {userData.pwdCng === true &&
        userData.role !== ROLES.SuperAdmin &&
        (userData.role !== ROLES.ClinicAdmin || userData.dateCng === true) && (
          <NavItem>
            <NavLink active={activeTab === '6'} onClick={() => toggleTab('6')}>
              <Users size={18} className="mr-1" />
              <span className="font-weight-bold">Avatars</span>
            </NavLink>
          </NavItem>
        )}
    </Nav>
  )
}

export default Tabs
