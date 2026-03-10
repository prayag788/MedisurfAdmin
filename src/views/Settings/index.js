import { Fragment } from 'react'
import {
  Row,
  Col,
  Card,
  CardBody,
  Breadcrumb,
  BreadcrumbItem,
} from 'reactstrap'
import { Link } from 'react-router-dom'

export default () => {
  const restartOrthanc = () => {
    console.log('restarting...')
  }
  return (
    <Fragment>
      <div className="content-header-left col-md-9 col-12 mb-2">
        <div className="row breadcrumbs-top">
          <div className="col-12">
            <h2 className="content-header-title float-left mb-0">Settings</h2>
            <div className="breadcrumb-wrapper vs-breadcrumbs d-sm-block d-none col-12">
              <Breadcrumb>
                <BreadcrumbItem tag="li" active>
                  Home
                </BreadcrumbItem>
              </Breadcrumb>
            </div>
          </div>
        </div>
      </div>
      <Row className="text-center">
        <Col md={{ size: 6, offset: 3 }} lg="6">
          <Card className="text-center">
            <CardBody>
              <Link to="/settings/terms-and-conditions">
                <a className="d-block mb-1">Terms and Conditions</a>
              </Link>
              <Link to="/settings/privacy-policy">
                <a className="d-block mb-1">Privacy policy</a>
              </Link>
              <Link to="/settings/cookie-policy">
                <a className="d-block mb-1">Cookie Policy</a>
              </Link>
              <Link to="/settings/add_modality">
                <a className="d-block mb-1">Add Modality</a>
              </Link>
              <Link to="/settings/modality_listing">
                <a className="d-block mb-1">Modality List</a>
              </Link>
              <Link to="/settings/edit_orthanc">
                <a className="d-block mb-1">Edit Orthanc</a>
              </Link>
              <span onClick={restartOrthanc}>Restart Orthanc</span>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Fragment>
  )
}
