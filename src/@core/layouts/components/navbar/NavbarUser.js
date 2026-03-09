// ** React hooks
import { useState } from 'react'

// ** Dropdowns Imports
import UserDropdown from './UserDropdown'

// ** Third Party Components
import { Sun, Moon } from 'react-feather'

const NavbarUser = props => {
  // ** Props
  const { skin, setSkin } = props

  const [updateState, setUpdateState] = useState(true)

  // ** Function to toggle Theme (Light/Dark)
  const ThemeToggler = () => {
    if (skin === 'dark') {
      return <Sun className="ficon cursor-pointer" onClick={() => setSkin('light')} />
    } else {
      return <Moon className="ficon cursor-pointer" onClick={() => setSkin('dark')} />
    }
  }

  //     <>

  //       >

  //      </>
  //     )

  //       <>

  //           Offline

  //       </>
  //     )
  //   }
  // }

  // }

  // }

  return (
    <ul className="nav navbar-nav align-items-center ml-auto">
      {}
      <ThemeToggler />
      <UserDropdown />
    </ul>
  )
}
export default NavbarUser
