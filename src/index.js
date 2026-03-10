// ** React Imports
import { Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'

// ** Redux Imports
import { Provider } from 'react-redux'
import { store } from './redux/storeConfig/store'

// ** Intl, CASL & ThemeColors Context
import { ToastContainer } from 'react-toastify'
import { IntlProviderWrapper } from './utility/context/Internationalization'
import { ThemeContext } from './utility/context/ThemeColors'

// ** CUSTOM CSS/JS INDEX.HTML
import './assets/custom/bootstrap.min.css'
import './assets/custom/font-awesome/font-awesome.min.css'
import './assets/custom/fonts/fonts_googleapis_com_css_family_montserrat_ital.css'
import './assets/custom/leaflet/leaflet.css'
import './assets/custom/npm_sweetalert'
import './assets/custom/tinymce.min'

// ** Spinner (Splash Screen)
import Spinner from './@core/components/spinner/Fallback-spinner'

// ** Axios Global
import './utils/axios-global'

// ** Ripple Button
import './@core/components/ripple-button'

// ** Fake Database
import './@fake-db'

// ** PrismJS
import 'prismjs'
import 'prismjs/components/prism-jsx.min'
import 'prismjs/themes/prism-tomorrow.css'

// ** React Perfect Scrollbar
import 'react-perfect-scrollbar/dist/css/styles.css'

// ** React Toastify
import '@styles/react/libs/toastify/toastify.scss'

// ** Core styles
import './@core/assets/fonts/feather/iconfont.css'
import './@core/scss/core.scss'
import './assets/scss/style.scss'
import './assets/scss/print.scss'

// ** Service Worker
import * as serviceWorker from './serviceWorker'

// ** Suppress ResizeObserver errors
const resizeObserverErrorHandler = (e) => {
  if (
    e.message ===
    'ResizeObserver loop completed with undelivered notifications.'
  ) {
    const resizeObserverErrDiv = document.getElementById(
      'webpack-dev-server-client-overlay-div'
    )
    const resizeObserverErr = document.getElementById(
      'webpack-dev-server-client-overlay'
    )
    if (resizeObserverErr) {
      resizeObserverErr.setAttribute('style', 'display: none')
    }
    if (resizeObserverErrDiv) {
      resizeObserverErrDiv.setAttribute('style', 'display: none')
    }
  }
}
window.addEventListener('error', resizeObserverErrorHandler)

// ** Lazy load app
const LazyApp = lazy(() => import('./App'))

// ** Error Boundary
import ErrorBoundary from './components/ErrorBoundary'
// Removed in favor of alert-based network error handling

const container = document.getElementById('root')
const root = createRoot(container)

root.render(
  <ErrorBoundary>
    <Provider store={store}>
      <Suspense fallback={<Spinner />}>
        <ThemeContext>
          <IntlProviderWrapper>
            <LazyApp />
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss={false}
              draggable={false}
              pauseOnHover={false}
              limit={5}
              stacked
            />
          </IntlProviderWrapper>
        </ThemeContext>
      </Suspense>
    </Provider>
  </ErrorBoundary>
)

// If you want your app to work offline and load faster, you can change

// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
