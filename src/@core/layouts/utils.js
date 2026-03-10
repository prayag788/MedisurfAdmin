// ** React Imports
import { useContext } from 'react'
import { AbilityContext } from '@src/utility/context/Can'

/**
 * Return which component to render based on it's data/context
 * @param {Object} item nav menu item
 */
export const resolveVerticalNavMenuItemComponent = (item) => {
  if (item.header) return 'VerticalNavMenuSectionHeader'
  if (item.children) return 'VerticalNavMenuGroup'
  return 'VerticalNavMenuLink'
}

/**
 * Return which component to render based on it's data/context
 * @param {Object} item nav menu item
 */
export const resolveHorizontalNavMenuItemComponent = (item) => {
  if (item.children) return 'HorizontalNavMenuGroup'
  return 'HorizontalNavMenuLink'
}

/**
 * Check if nav-link is active
 * @param {Object} link nav-link object
 */

//   )
// }

export const isNavLinkActive = (link, currentURL, routerProps) => {
  return (
    currentURL === link ||
    (routerProps &&
      routerProps.meta &&
      routerProps.meta.navLink &&
      routerProps.meta.navLink === link)
  )
}

/**
 * Check if nav group is
 * @param {Array} children Group children
 */

//     }

//   })
// }
export const isNavGroupActive = (children, currentURL, routerProps) => {
  return children.some((child) => {
    // If child have children => It's group => Go deeper(recursive)
    if (child.children) {
      return isNavGroupActive(child.children, currentURL, routerProps)
    }

    return isNavLinkActive(child.navLink, currentURL, routerProps)
  })
}

/**
 * Search for parent object
 * @param {Array} navigation Group children
 * @param {string} currentURL current URL
 */

//       })
//     }

//       })
//     }
//   })

// }

export const search = (navigation, currentURL, routerProps) => {
  let result
  navigation.some((child) => {
    let children
    // If child have children => It's group => Go deeper(recursive)
    if (
      child.children &&
      (children = search(child.children, currentURL, routerProps))
    ) {
      return (result = {
        id: child.id,
        children,
      })
    }

    if (isNavLinkActive(child.navLink, currentURL, routerProps)) {
      return (result = {
        id: child.id,
      })
    }
  })
  return result
}

/**
 * Loop through nested object
 * @param {object} obj nested object
 */
export const getAllParents = (obj, match) => {
  const res = []
  const recurse = (obj, current) => {
    for (const key in obj) {
      const value = obj[key]
      if (value !== undefined) {
        if (value && typeof value === 'object') {
          recurse(value, key)
        } else {
          if (key === match) {
            res.push(value)
          }
        }
      }
    }
  }
  recurse(obj)
  return res
}

export const canViewMenuGroup = (item) => {
  const ability = useContext(AbilityContext)

  const hasAnyVisibleChild =
    item.children &&
    item.children.some((i) => {
      if (i.children) {
        return i.children.some((ia) => ability.can(ia.action, ia.resource))
      }
      return ability?.can(i.action, i.resource)
    })

  // ** If resource and action is defined in item => Return based on children visibility (Hide group if no child is visible)
  // ** Else check for ability using provided resource and action along with checking if has any visible child
  if (!(item.action && item.resource)) {
    return hasAnyVisibleChild
  }
  return ability?.can(item.action, item.resource) && hasAnyVisibleChild
}

export const canViewMenuItem = (item) => {
  const ability = useContext(AbilityContext)
  return ability?.can(item.action, item.resource)
}
