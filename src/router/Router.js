// ** React Imports
import { Suspense, useContext, lazy, useEffect } from 'react'

// ** Utils
import { isUserLoggedIn } from '@utils'
import { useLayout } from '@hooks/useLayout'
import { AbilityContext } from '@src/utility/context/Can'
import { useRouterTransition } from '@hooks/useRouterTransition'

// ** Custom Components

import LayoutWrapper from '@layouts/components/layout-wrapper'

import navigation from '@src/navigation/vertical'
// ** Router Components
import { BrowserRouter as AppRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom'

// ** Routes & Default Routes
import { DefaultRoute, Routes as AppRoutes } from './routes'

// ** Layouts
import BlankLayout from '@layouts/BlankLayout'
import VerticalLayout from '@src/layouts/VerticalLayout'
import HorizontalLayout from '@src/layouts/HorizontalLayout'

// ** Store & Actions
import { handleFallbackRoute } from '@store/actions/layout'
import { useDispatch } from 'react-redux'

// ** Import table css
import '@styles/react/libs/tables/react-dataTable-component.scss'
import ROLES from '@configs/roles'

const Router = () => {
  // ** Hooks
  const [layout, setLayout] = useLayout()
  const [transition, setTransition] = useRouterTransition()
  const dispatch = useDispatch()

  useEffect(() => {
    try {
      const userDataString = localStorage.getItem('userData')
      const userData = userDataString ? JSON.parse(userDataString) : null
      if (userData && userData.fallbackRoute) {
        dispatch(handleFallbackRoute(userData.fallbackRoute))
      }
    } catch {
      // Ignore parsing errors
    }
  }, [])

  // ** ACL Ability Context
  const ability = useContext(AbilityContext)
  // ** Default Layout
  const DefaultLayout = layout === 'horizontal' ? 'HorizontalLayout' : 'VerticalLayout'

  // ** All of the available layouts
  const Layouts = { BlankLayout, VerticalLayout, HorizontalLayout }

  // ** Current Active Item
  const currentActiveItem = null

  // ** Return Filtered Array of Routes & Paths
  const LayoutRoutesAndPaths = layout => {
    const LayoutRoutes = []
    const LayoutPaths = []

    if (AppRoutes) {
      AppRoutes.filter(route => {
        // ** Checks if Route layout or Default layout matches current layout
        if (route.layout === layout || (route.layout === undefined && DefaultLayout === layout)) {
          LayoutRoutes.push(route)
          LayoutPaths.push(route.path)
        }
      })
    }

    return { LayoutRoutes, LayoutPaths }
  }

  const NotAuthorized = lazy(() => import('@src/views/pages/misc/NotAuthorized'))

  // ** Init Error Component
  const Error = lazy(() => import('@src/views/pages/misc/Error'))

  function findNavLink(navigationList, subject) {
    for (const item of navigationList) {
      if (!!item.children && !!item.children.length) {
        return findNavLink(item.children, subject)
      } else if (item.resource === subject) {
        return item.navLink
      }
    }
    return ''
  }

  /**
   ** Final Route Component Checks for Login & User Role and then redirects to the route
   */
  const FinalRoute = props => {
    const route = props.route
    const location = useLocation()
    let action, resource

    // ** Assign vars based on route meta
    if (route.meta) {
      action = route.meta.action ? route.meta.action : null
      resource = route.meta.resource ? route.meta.resource : null
    }

    const userDetails = (() => {
      try {
        const userDataString = localStorage.getItem('userData')
        return userDataString ? JSON.parse(userDataString) : null
      } catch {
        return null
      }
    })()

    // ** Check if this is a shared study route first
    if (/\/shared-study\//.test(location.pathname)) {
      return <route.component {...props} />
    }

    if (
      (!isUserLoggedIn() && route.meta === undefined) ||
      (!isUserLoggedIn() && route.meta && !route.meta.authRoute && !route.meta.publicRoute)
    ) {
      /**
       ** If user is not Logged in & route meta is undefined
       ** OR
       ** If user is not Logged in & route.meta.authRoute, !route.meta.publicRoute are undefined
       ** Then redirect user to login
       */
      return <Navigate to="/login" replace />
    } else if (
      route.path !== '/activation-key' &&
      userDetails &&
      userDetails.role === ROLES.ClinicAdmin &&
      userDetails?.hasLicense !== true
    ) {
      return <Navigate to="/activation-key" replace />
    } else if (
      route.path !== '/activation-key' &&
      route.path !== '/pages/account-settings' &&
      userDetails &&
      (userDetails.pwdCng === false ||
        (userDetails.role === ROLES.ClinicAdmin && !userDetails.dateCng))
    ) {
      // ** If User password is not changed
      return <Navigate to="/pages/account-settings" replace />
    } else if (
      route.meta &&
      route.meta.authRoute &&
      !route.meta.activationKeyRoute &&
      isUserLoggedIn()
    ) {
      // ** If route has meta and authRole and user is Logged in then redirect user to home page (DefaultRoute)
      return <Navigate to="/" replace />
    } else if (
      route.path !== '/activation-key' &&
      route.path !== '/pages/account-settings' &&
      userDetails &&
      userDetails.mailCng === false
    ) {
      // ** If User email is not changed
      return <Navigate to="/pages/account-settings?mailCng=true" replace />
    } else if (
      route.meta &&
      route.meta.authRoute &&
      !route.meta.activationKeyRoute &&
      isUserLoggedIn()
    ) {
      // ** If route has meta and authRole and user is Logged in then redirect user to home page (DefaultRoute)
      return <Navigate to="/" replace />
    } else if (isUserLoggedIn() && route.meta && !ability?.can(action || 'read', resource)) {
      // ** If user is Logged in and doesn't have ability to visit the page redirect the user to Not Authorized
      const userAbilities = (() => {
        try {
          const userDataString = isUserLoggedIn()
          return userDataString ? JSON.parse(userDataString).access || [] : []
        } catch {
          return []
        }
      })()
      if (location.search === '?initial' && userAbilities.length) {
        const firstAccess = userAbilities[0]
        const firstRoute = findNavLink(navigation.slice(), firstAccess.subject)
        dispatch(handleFallbackRoute(firstRoute))
        return <Navigate to={firstRoute} replace />
      } else {
        return <Navigate to="/misc/not-authorized" replace />
      }
    } else {
      // ** If none of the above render component
      return <route.component {...props} />
    }
  }

  // ** Return Route to Render
  const ResolveRoutes = () => {
    return Object.keys(Layouts).map((layout, index) => {
      // ** Convert Layout parameter to Layout Component

      const LayoutTag = Layouts[layout]

      // ** Get Routes and Paths of the Layout
      const { LayoutRoutes, LayoutPaths } = LayoutRoutesAndPaths(layout)

      // ** We have freedom to display different layout for different route
      // ** We have made LayoutTag dynamic based on layout, we can also replace it with the only layout component,
      // ** that we want to implement like VerticalLayout or HorizontalLayout
      // ** We segregated all the routes based on the layouts and Resolved all those routes inside layouts

      // ** RouterProps to pass them to Layouts
      const routerProps = {}

      return LayoutRoutes.map(route => {
        return (
          <Route
            key={route.path}
            path={route.path}
            element={
              <LayoutTag
                routerProps={routerProps}
                layout={layout}
                setLayout={setLayout}
                transition={transition}
                setTransition={setTransition}
                currentActiveItem={currentActiveItem}
              >
                <Suspense fallback={null}>
                  <LayoutWrapper
                    layout={DefaultLayout}
                    transition={transition}
                    setTransition={setTransition}
                    {...(route.appLayout
                      ? {
                          appLayout: route.appLayout,
                        }
                      : {})}
                    {...(route.meta
                      ? {
                          routeMeta: route.meta,
                        }
                      : {})}
                    {...(route.className
                      ? {
                          wrapperClass: route.className,
                        }
                      : {})}
                  >
                    <FinalRoute route={route} />
                  </LayoutWrapper>
                </Suspense>
              </LayoutTag>
            }
          />
        )
      })
    })
  }

  return (
    <AppRouter basename={process.env.REACT_APP_BASENAME}>
      <Routes>
        <Route
          path="/"
          element={
            isUserLoggedIn() ? (
              <Navigate to={`${DefaultRoute}?initial`} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        {/* Not Auth Route */}
        <Route
          path="/misc/not-authorized"
          element={
            <Layouts.BlankLayout>
              <NotAuthorized />
            </Layouts.BlankLayout>
          }
        />
        {ResolveRoutes()}
        <Route path="*" element={<Error />} />
      </Routes>
    </AppRouter>
  )
}

export default Router
