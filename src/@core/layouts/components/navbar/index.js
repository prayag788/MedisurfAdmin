// ** React Imports
import { Fragment } from 'react'

// ** Custom Components
import NavbarUser from './NavbarUser'
import NavbarBookmarks from './NavbarBookmarks'
import NavbarToggler from './NavbarToggler'

const ThemeNavbar = (props) => {
  // ** Props
  const { skin, setSkin, setMenuVisibility, setMenuCollapsed } = props

  return (
    <Fragment>
      <div className="bookmark-wrapper d-flex align-items-center">
        <NavbarBookmarks setMenuVisibility={setMenuVisibility} />
      </div>
      <div className="bookmark-wrapper d-flex align-items-center">
        <NavbarToggler setMenuCollapsed={setMenuCollapsed} />
      </div>
      <NavbarUser skin={skin} setSkin={setSkin} />
    </Fragment>
  )
}

export default ThemeNavbar
