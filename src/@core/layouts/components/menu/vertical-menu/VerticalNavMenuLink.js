// ** React Imports
import { useEffect } from 'react'
import { NavLink, useLocation, matchPath } from 'react-router-dom'

// ** Third Party Components
import { Badge, UncontrolledTooltip } from 'reactstrap'
import classnames from 'classnames'
import { FormattedMessage } from 'react-intl'

// ** Vertical Menu Array Of Items
import navigation from '@src/navigation/vertical'

// ** Utils
import { search, getAllParents } from '@layouts/utils'

const VerticalNavMenuLink = ({
  item,
  groupActive,
  setGroupActive,
  activeItem,
  setActiveItem,
  groupOpen,
  setGroupOpen,
  toggleActiveGroup,
  parentItem,
  routerProps,
  currentActiveItem,
}) => {
  // ** Conditional Link Tag, if item has newTab or externalLink props use <a> tag else use NavLink
  const LinkTag = item.externalLink ? 'a' : NavLink

  // ** URL Vars
  const location = useLocation()
  const currentURL = location.pathname

  // ** To match path
  const match = matchPath(`${item.navLink}/:param`, currentURL)

  // ** Search for current item parents
  const searchParents = (navigation, currentURL) => {
    const parents = search(navigation, currentURL, routerProps) // Search for parent object
    const allParents = getAllParents(parents, 'id') // Parents Object to Parents Array
    return allParents
  }

  // ** URL Vars
  const resetActiveGroup = navLink => {
    const parents = search(navigation, navLink, match)
    toggleActiveGroup(item.id, parents)
  }

  // ** Reset Active & Open Group Arrays
  const resetActiveAndOpenGroups = () => {
    setGroupActive([])
    setGroupOpen([])
  }

  // ** Checks url & updates active item
  useEffect(() => {
    if (currentActiveItem !== null) {
      setActiveItem(currentActiveItem)
      const arr = searchParents(navigation, currentURL)
      setGroupActive([...arr])
    }
  }, [location])

  return (
    <li
      className={classnames({
        'nav-item': !item.children,
        disabled: item.disabled,
        active: item.navLink === activeItem,
      })}
    >
      {item.externalLink ? (
        <a
          className="d-flex align-items-center"
          id={`${item.id}Target`}
          target={item.newTab ? '_blank' : undefined}
          href={item.navLink || '/'}
          onClick={e => {
            if (!item.navLink.length) {
              e.preventDefault()
            }
            parentItem ? resetActiveGroup(item.navLink) : resetActiveAndOpenGroups()
          }}
          rel="noreferrer"
        >
          {item.icon}
          <span className="menu-item text-truncate">
            <FormattedMessage id={item.title} defaultMessage={item.title} />
          </span>

          {item.badge && item.badgeText ? (
            <Badge className="ml-auto mr-1" color={item.badge} pill>
              {item.badgeText}
            </Badge>
          ) : null}
        </a>
      ) : (
        <NavLink
          className="d-flex align-items-center"
          id={`${item.id}Target`}
          target={item.newTab ? '_blank' : undefined}
          to={item.navLink || '/'}
          isActive={(match, location) => {
            if (!match) {
              return false
            }

            if (match.pathname && match.pathname !== '' && match.pathname === item.navLink) {
              currentActiveItem = item.navLink
              return true
            }
            return false
          }}
          onClick={e => {
            if (!item.navLink.length) {
              e.preventDefault()
            }
            parentItem ? resetActiveGroup(item.navLink) : resetActiveAndOpenGroups()
          }}
        >
          {item.icon}
          <span className="menu-item text-truncate">
            <FormattedMessage id={item.title} defaultMessage={item.title} />
          </span>

          {item.badge && item.badgeText ? (
            <Badge className="ml-auto mr-1" color={item.badge} pill>
              {item.badgeText}
            </Badge>
          ) : null}
        </NavLink>
      )}
      <UncontrolledTooltip target={`${item.id}Target`} className="tooltip-react-strap">
        {item.title}
      </UncontrolledTooltip>
    </li>
  )
}

export default VerticalNavMenuLink
