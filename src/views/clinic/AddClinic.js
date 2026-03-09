import { useState } from 'react'
import Tabs from './Tabs'
import { Row, Col, TabContent, TabPane, Card, CardBody, CardHeader, CardTitle } from 'reactstrap'

import Information from './Information'
import License from './License'

const AddClinic = ({ AddNewModal, toEdit }) => {
  const [activeTab, setActiveTab] = useState('1')
  const [allData, setAllData] = useState({})

  const toggleTab = (tab, dataPass) => {
    setActiveTab(tab)
    setAllData(dataPass)
  }

  const redirectList = data => {
    AddNewModal(data)
  }

  return (
    <Card>
      <CardHeader className="flex-md-row flex-column align-md-items-center align-items-center border-bottom">
        <CardTitle tag="h4">Clinic details</CardTitle>
      </CardHeader>
      <Row className="d-flex flex-column">
        <Col className="mb-2 mb-md-0" md="3">
          <Tabs activeTab={activeTab} />
        </Col>
        <Col md="12">
          <Card>
            <CardBody>
              <TabContent activeTab={activeTab}>
                <TabPane tabId="1">
                  {toEdit ? (
                    <Information
                      toggleTab={toggleTab}
                      redirectList={redirectList}
                      toEdit={toEdit.information}
                    />
                  ) : (
                    <Information toggleTab={toggleTab} redirectList={redirectList} />
                  )}
                </TabPane>
              </TabContent>

              <TabContent activeTab={activeTab}>
                <TabPane tabId="2">
                  {toEdit ? (
                    <License
                      toggleTab={toggleTab}
                      infoData={allData}
                      redirectList={redirectList}
                      toEdit={toEdit.license}
                      toEditId={toEdit._id}
                    />
                  ) : (
                    <License toggleTab={toggleTab} infoData={allData} redirectList={redirectList} />
                  )}
                </TabPane>
              </TabContent>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Card>
  )
}

export default AddClinic
