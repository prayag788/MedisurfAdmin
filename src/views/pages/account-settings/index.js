import { Fragment, useState, useEffect } from 'react'
import Tabs from './Tabs'
import axios from 'axios'
import PasswordTabContent from './PasswordTabContent'
import PreferenceTabContent from './PreferenceTabContent'
import EmailConfigurationTabContent from './EmailConfigurationTabContent'
import AvatarTabContent from './AvatarTabContent'
import LicenseTabContent from './LicenseTabContent'
import {
  Row,
  Col,
  TabContent,
  TabPane,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from 'reactstrap'
import ROLES from '@configs/roles'
import { useLocation } from 'react-router-dom'
import ListTabContent from './ListTabContent'

import '@styles/react/libs/flatpickr/flatpickr.scss'
import '@styles/react/pages/page-account-settings.scss'

const AccountSettings = () => {
  const userData = JSON.parse(localStorage.getItem('userData'))
  const [activeTab, setActiveTab] = useState('1'),
    [data, setData] = useState(null),
    [isLoaded, setIsLoaded] = useState(false)

  const location = useLocation()

  useEffect(() => {
    const isMailCng = location?.search
    if (userData.pwdCng === false) {
      // First-time user needs to change password
      setActiveTab('1')
    } else if (
      userData.role === ROLES.ClinicAdmin &&
      userData.pwdCng === true &&
      userData.dateCng === false
    ) {
      setActiveTab('3')
    } else if (isMailCng.includes('mailCng=true') && userData.pwdCng === true) {
      setActiveTab('4')
    }
  }, [location])

  const toggleTab = (tab) => {
    setActiveTab(tab)
  }

  useEffect(() => {
    axios
      .get('/account-setting/data')
      .then((response) => setData(response.data))
  }, [])

  return (
    <Fragment>
      <Card>
        <CardHeader className="flex-md-row flex-column align-md-items-center align-items-center">
          <CardTitle tag="h4">Account Settings</CardTitle>
        </CardHeader>
      </Card>
      {data !== null ? (
        <Row>
          <Col className="mb-2 mb-md-0" md="3">
            <Tabs activeTab={activeTab} toggleTab={toggleTab} />
          </Col>
          <Col md="9">
            <Card>
              <CardBody>
                <TabContent activeTab={activeTab}>
                  <TabPane tabId="1">
                    <PasswordTabContent />
                  </TabPane>
                </TabContent>

                <TabContent activeTab={activeTab}>
                  <TabPane tabId="2">
                    <PreferenceTabContent />
                  </TabPane>
                </TabContent>

                {userData.role === ROLES.ClinicAdmin && (
                  <>
                    <TabContent activeTab={activeTab}>
                      <TabPane tabId="3">
                        <LicenseTabContent />
                      </TabPane>
                    </TabContent>
                  </>
                )}

                {(userData.role === ROLES.ClinicAdmin ||
                  userData.role === ROLES.SuperAdmin) && (
                  <TabContent activeTab={activeTab}>
                    <TabPane tabId="4">
                      <EmailConfigurationTabContent
                        key="email-config-tab"
                        activeTab={activeTab}
                      />
                    </TabPane>
                  </TabContent>
                )}

                <TabContent activeTab={activeTab}>
                  <TabPane tabId="5">
                    <ListTabContent />
                  </TabPane>
                </TabContent>

                <TabContent activeTab={activeTab}>
                  <TabPane tabId="6">
                    <AvatarTabContent />
                  </TabPane>
                </TabContent>
              </CardBody>
            </Card>
          </Col>
        </Row>
      ) : null}
    </Fragment>
  )
}

export default AccountSettings
