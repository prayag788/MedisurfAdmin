// ** React Imports
import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'

// ** Third Party Components
import { Disc, Circle } from 'react-feather'

// ** Config
import themeConfig from '@configs/themeConfig'

const VerticalMenuHeader = props => {
  // ** Props
  const { menuCollapsed, setMenuCollapsed, setMenuVisibility, setGroupOpen, menuHover } = props

  // ** Reset open group
  useEffect(() => {
    if (!menuHover && menuCollapsed) setGroupOpen([])
  }, [menuHover, menuCollapsed])

  // ** Menu toggler component
  const Toggler = () => {
    if (!menuCollapsed) {
      return (
        <Disc
          size={20}
          data-tour="toggle-icon"
          className="text-primary toggle-icon d-none d-xl-block"
          onClick={() => setMenuCollapsed(true)}
        />
      )
    } else {
      return (
        <Circle
          size={20}
          data-tour="toggle-icon"
          className="text-primary toggle-icon d-none d-xl-block"
          onClick={() => setMenuCollapsed(false)}
        />
      )
    }
  }

  return (
    <div className="navbar-header">
      <ul className="nav navbar-nav flex-row">
        <li className="nav-item mr-auto">
          <NavLink to="/" className="navbar-brand">
            <span className="brand-logo">
              <img className="full-logo" src={themeConfig.app.appLogoImage} alt="logo" />
              <img className="icon-logo" src={themeConfig.app.appLogoIcon} alt="logo" />
            </span>
          </NavLink>
        </li>
        <li className="nav-item nav-toggle"></li>
      </ul>
    </div>
  )
}

export default VerticalMenuHeader
