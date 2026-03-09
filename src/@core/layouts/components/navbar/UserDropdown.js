// ** React Imports
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Utils
import { isUserLoggedIn, handleAutoLogout } from '@utils'

// ** Store & Actions
import { useDispatch, useSelector } from 'react-redux'
import { handleLogout } from '@store/actions/auth'

// ** Third Party Components
import { UncontrolledDropdown, DropdownMenu, DropdownToggle, DropdownItem } from 'reactstrap'
import { Settings, Power } from 'react-feather'

import ROLES from '@configs/roles'

import axios from 'axios'

// ** Default Avatar Image
import defaultAvatar from '@src/assets/images/portrait/small/avatar-s-11.jpg'
import ROLES_NAME from '@configs/roles_name'

/** Resolve avatar to a valid img src: full URLs and data URIs as-is; /static/ is same-origin (app assets); other relative paths use API public base */
function resolveAvatarSrc(avatar) {
  if (!avatar || typeof avatar !== 'string') return null
  const trimmed = avatar.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed
  }
  // App-bundled avatars (webpack) are at same origin, e.g. /static/media/...
  if (trimmed.startsWith('/static/')) {
    return trimmed
  }
  const base = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '')
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return base ? `${base}/public${path}` : trimmed
}

const UserDropdown = () => {
  // ** Store Vars
  const dispatch = useDispatch()
  const navigate = useNavigate()
  // ** State
  const [userData, setUserData] = useState(null)
  const [userRole, setUserRole] = useState('')

  const userDetails = JSON.parse(localStorage.getItem('userData'))
  const miliseconds = isNaN(parseInt(userDetails?.logoutMinutes))
    ? 100000
    : parseInt(userDetails.logoutMinutes) * 60 * 1000

  //** ComponentDidMount
  useEffect(() => {
    if (isUserLoggedIn() !== null) {
      setUserData(userDetails)
      document.body.addEventListener('click', handleAutoLogout)
      document.body.addEventListener('mouseover', handleAutoLogout)
      document.body.addEventListener('mouseout', handleAutoLogout)
      document.body.addEventListener('keydown', handleAutoLogout)
      handleAutoLogout()
    }

    return () => {
      document.body.removeEventListener('click', handleAutoLogout)
      document.body.removeEventListener('mouseover', handleAutoLogout)
      document.body.removeEventListener('mouseout', handleAutoLogout)
      document.body.removeEventListener('keydown', handleAutoLogout)
    }
  }, [miliseconds])

  useEffect(() => {
    if (userDetails?.role) {
      setUserRole(ROLES_NAME[userDetails?.role] || 'User')
    }
  }, [userDetails])

  //** Vars
  const navbar = useSelector(state => state.navbar)
  const rawAvatar = (navbar && navbar.avatar) || userDetails?.avatar || null
  const userAvatar = resolveAvatarSrc(rawAvatar) || defaultAvatar

  return (
    <UncontrolledDropdown tag="li" className="dropdown-user nav-item">
      <DropdownToggle
        href="/"
        tag="a"
        className="nav-link dropdown-user-link"
        onClick={e => e.preventDefault()}
      >
        <div className="user-nav d-sm-flex d-none">
          <span className="user-name font-weight-bold">
            {userData && userData.role === ROLES.ClinicAdmin
              ? (userData && userData['hospital']) || 'Medisruf Clinic Admin'
              : (userData && `${userData.fname || 'Physician'} ${userData.lname || ''}`) ||
                'John Doe'}
          </span>
          <span className="user-status">{userRole}</span>
        </div>
        <Avatar img={userAvatar} imgHeight="40" imgWidth="40" status="online" />
      </DropdownToggle>
      <DropdownMenu right>
        <DropdownItem tag={Link} to="/pages/account-settings">
          <Settings size={14} className="mr-75" />
          <span className="align-middle">Settings</span>
        </DropdownItem>
        <DropdownItem
          tag={Link}
          to={localStorage.getItem('sharedUrl') ? localStorage.getItem('sharedUrl') : '/login'}
          onClick={async () => {
            await axios.get(`${process.env.REACT_APP_API_URL}/user/logout`).then(data => {
              dispatch(handleLogout())
              navigate('/login')
            })
          }}
        >
          <Power size={14} className="mr-75" />
          <span className="align-middle">Logout</span>
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
  )
}

export default UserDropdown
